// ============================================================================
// scripts/import-nces-schools.mjs
//
// One-time import: NCES Common Core of Data → schools table
// Filters national CSV to NJ public schools, geocodes each address via Google,
// and upserts into Supabase. Safe to re-run (idempotent on nces_school_id).
//
// Usage:
//   node scripts/import-nces-schools.mjs
//
// Requires .env.scripts with:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   GOOGLE_GEOCODING_API_KEY
// ============================================================================

import { readFileSync, createWriteStream, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

// Load admin secrets from .env.scripts (NOT .env.local — different file).
dotenv.config({ path: join(REPO_ROOT, '.env.scripts') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;

// Hard fail if any required env var is missing.
const missing = [];
if (!SUPABASE_URL) missing.push('SUPABASE_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
if (!GOOGLE_GEOCODING_API_KEY) missing.push('GOOGLE_GEOCODING_API_KEY');
if (missing.length > 0) {
  console.error(`Missing env vars in .env.scripts: ${missing.join(', ')}`);
  process.exit(1);
}

// File paths.
const CSV_PATH = join(
  REPO_ROOT,
  'data/nces/2025046 Preliminary Data Release CCD Nonfiscal_0/ccd_sch_029_2425_w_0a_051425.csv'
);
const LOG_DIR = join(REPO_ROOT, 'logs');
const LOG_FILE = join(LOG_DIR, `import-nces-${new Date().toISOString().slice(0, 10)}.log`);

// Filter target.
const TARGET_STATE = 'NJ';

// Rate limit: 5 requests per second to Google Geocoding (200ms between calls).
const GEOCODE_DELAY_MS = 200;

// Database batch size — Supabase handles 500-row upserts well.
const BATCH_SIZE = 500;

// ----------------------------------------------------------------------------
// Logging
// ----------------------------------------------------------------------------

if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

const logStream = createWriteStream(LOG_FILE, { flags: 'a' });

function log(level, message) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;
  console.log(line);
  logStream.write(line + '\n');
}

function logInfo(msg) { log('INFO', msg); }
function logWarn(msg) { log('WARN', msg); }
function logError(msg) { log('ERROR', msg); }

// ----------------------------------------------------------------------------
// Graceful shutdown
// ----------------------------------------------------------------------------

let shuttingDown = false;
process.on('SIGINT', () => {
  if (shuttingDown) return;
  shuttingDown = true;
  logWarn('Received SIGINT, finishing current batch then exiting...');
});

// ----------------------------------------------------------------------------
// Supabase client (service role — bypasses RLS)
// ----------------------------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// ----------------------------------------------------------------------------
// CSV parsing
// ----------------------------------------------------------------------------

function readAndFilterCsv() {
  logInfo(`Reading CSV from ${CSV_PATH}`);

  let raw;
  try {
    raw = readFileSync(CSV_PATH, 'utf-8');
  } catch (err) {
    logError(`Failed to read CSV: ${err.message}`);
    process.exit(1);
  }

  let rows;
  try {
    rows = parse(raw, {
      columns: true,           // first line is headers
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,      // NCES occasionally has unescaped quotes
      relax_column_count: true // and occasionally trailing empty columns
    });
  } catch (err) {
    logError(`Failed to parse CSV: ${err.message}`);
    process.exit(1);
  }

  logInfo(`Parsed ${rows.length} total rows from CSV`);

  // Filter: NJ only, school open, name present.
  const filtered = rows.filter(row => {
    if (row.ST !== TARGET_STATE) return false;
    if (!row.SCH_NAME || row.SCH_NAME.trim() === '') return false;
    // SY_STATUS_TEXT values include "Open", "Closed", "New", etc.
    // We keep anything that isn't explicitly closed.
    if (row.SY_STATUS_TEXT && row.SY_STATUS_TEXT.toLowerCase().includes('closed')) return false;
    return true;
  });

  logInfo(`Filtered to ${filtered.length} NJ public schools`);
  return filtered;
}

// ----------------------------------------------------------------------------
// School type derivation
// LEVEL values per NCES: 1=Elementary, 2=Middle, 3=High, 4=Other, 5=Ungraded
// Falls back to grade range if LEVEL is missing or unusual.
// ----------------------------------------------------------------------------

function deriveSchoolType(row) {
  const level = String(row.LEVEL || '').trim();

  if (level === '1') return 'elementary';
  if (level === '2') return 'middle';
  if (level === '3') return 'high';

  // Fallback: derive from grade range.
  const low = String(row.GSLO || '').trim().toUpperCase();
  const high = String(row.GSHI || '').trim().toUpperCase();

  // Map grade codes to numeric for comparison. PK=-1, KG=0, 01..12=1..12.
  const toNum = (g) => {
    if (g === 'PK') return -1;
    if (g === 'KG') return 0;
    const n = parseInt(g, 10);
    return isNaN(n) ? null : n;
  };

  const lowN = toNum(low);
  const highN = toNum(high);

  if (lowN === null || highN === null) return 'other';

  // K–5, K–6, 1–5, 1–6 etc → elementary
  if (highN <= 6) return 'elementary';
  // 5–8, 6–8, 7–8 → middle
  if (lowN >= 5 && highN <= 8) return 'middle';
  // 9–12, 10–12 → high
  if (lowN >= 9) return 'high';
  // K–8, K–12, anything else → other (preserves actual range in grade_low/high)
  return 'other';
}

// ----------------------------------------------------------------------------
// Row mapping: NCES row → our schools schema
// ----------------------------------------------------------------------------

function mapRow(row) {
  return {
    nces_school_id:   row.NCESSCH,
    name:             row.SCH_NAME.trim(),
    school_type:      deriveSchoolType(row),
    grade_low:        row.GSLO ? row.GSLO.trim() : null,
    grade_high:       row.GSHI ? row.GSHI.trim() : null,
    street_address:   row.LSTREET1 ? row.LSTREET1.trim() : null,
    city:             row.LCITY ? row.LCITY.trim() : null,
    state:            row.LSTATE ? row.LSTATE.trim() : TARGET_STATE,
    zip:              row.LZIP ? row.LZIP.trim() : null,
    lat:              null, // filled in by geocoding step
    lng:              null, // filled in by geocoding step
    district_name:    row.LEA_NAME ? row.LEA_NAME.trim() : null,
    district_nces_id: row.LEAID || null,
    enrollment:       null, // not in preliminary release
    student_teacher_ratio: null, // not in preliminary release
    charter:          (row.CHARTER_TEXT || '').trim().toLowerCase() === 'yes'
  };
}

// ----------------------------------------------------------------------------
// Geocoding
// ----------------------------------------------------------------------------

function buildGeocodeQuery(school) {
  const parts = [
    school.street_address,
    school.city,
    school.state,
    school.zip
  ].filter(Boolean);
  return parts.join(', ');
}

async function geocodeSchool(school) {
  const query = buildGeocodeQuery(school);
  if (!query) {
    return { lat: null, lng: null, error: 'no address fields' };
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', query);
  url.searchParams.set('key', GOOGLE_GEOCODING_API_KEY);

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    return { lat: null, lng: null, error: `fetch failed: ${err.message}` };
  }

  if (!response.ok) {
    return { lat: null, lng: null, error: `HTTP ${response.status}` };
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    return { lat: null, lng: null, error: `JSON parse failed: ${err.message}` };
  }

  if (data.status === 'OVER_QUERY_LIMIT') {
    return { lat: null, lng: null, error: 'OVER_QUERY_LIMIT — rate limit hit' };
  }

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    return { lat: null, lng: null, error: `geocode status ${data.status}` };
  }

  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng, error: null };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeAll(schools) {
  logInfo(`Geocoding ${schools.length} schools at ~${1000 / GEOCODE_DELAY_MS}/sec`);

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < schools.length; i++) {
    if (shuttingDown) {
      logWarn(`Geocoding halted at ${i}/${schools.length} due to shutdown signal`);
      break;
    }

    const school = schools[i];
    const result = await geocodeSchool(school);

    if (result.error) {
      logWarn(`Geocode failed [${school.name}]: ${result.error}`);
      failureCount++;
    } else {
      school.lat = result.lat;
      school.lng = result.lng;
      successCount++;
    }

    if ((i + 1) % 100 === 0) {
      logInfo(`Geocoded ${i + 1}/${schools.length} (${successCount} ok, ${failureCount} failed)`);
    }

    await sleep(GEOCODE_DELAY_MS);
  }

  logInfo(`Geocoding complete: ${successCount} ok, ${failureCount} failed`);
  return { successCount, failureCount };
}

// ----------------------------------------------------------------------------
// Database upsert (batched)
// ----------------------------------------------------------------------------

async function upsertBatch(batch) {
  const { error } = await supabase
    .from('schools')
    .upsert(batch, { onConflict: 'nces_school_id' });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
}

async function upsertAll(schools) {
  logInfo(`Upserting ${schools.length} schools in batches of ${BATCH_SIZE}`);

  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < schools.length; i += BATCH_SIZE) {
    if (shuttingDown) {
      logWarn(`Upsert halted at ${i}/${schools.length} due to shutdown signal`);
      break;
    }

    const batch = schools.slice(i, i + BATCH_SIZE);
    try {
      await upsertBatch(batch);
      inserted += batch.length;
      logInfo(`Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${inserted}/${schools.length}`);
    } catch (err) {
      logError(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${err.message}`);
      failed += batch.length;
    }
  }

  logInfo(`Upsert complete: ${inserted} ok, ${failed} failed`);
  return { inserted, failed };
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
  const startedAt = Date.now();
  logInfo('=== NCES schools import starting ===');
  logInfo(`Log file: ${LOG_FILE}`);

  // Step 1: read and filter CSV.
  const rawRows = readAndFilterCsv();

  // Step 2: map to our schema.
  const schools = rawRows.map(mapRow);
  logInfo(`Mapped ${schools.length} rows to schools schema`);

  // Step 3: geocode (slowest step).
  const geocodeStats = await geocodeAll(schools);

  // Step 4: upsert to Supabase.
  // We upsert all rows, including those that failed geocoding (lat/lng = null).
  // Failed geocodes can be re-tried later by re-running the script — upsert
  // will update existing rows with new lat/lng values.
  const upsertStats = await upsertAll(schools);

  const elapsedSec = Math.round((Date.now() - startedAt) / 1000);

  logInfo('=== NCES schools import complete ===');
  logInfo(`Schools imported:     ${upsertStats.inserted}`);
  logInfo(`Geocode failures:     ${geocodeStats.failureCount}`);
  logInfo(`Upsert failures:      ${upsertStats.failed}`);
  logInfo(`Elapsed time:         ${elapsedSec}s (${Math.round(elapsedSec / 60)}m)`);
  logInfo(`Log file:             ${LOG_FILE}`);

  logStream.end();

  if (upsertStats.failed > 0 || geocodeStats.failureCount > 0) {
    // Non-fatal — most schools imported. Exit 0 but flag warnings in log.
    logWarn('Run completed with some failures — review log file.');
  }

  process.exit(0);
}

main().catch(err => {
  logError(`Fatal error: ${err.message}`);
  logError(err.stack || '');
  logStream.end();
  process.exit(1);
});