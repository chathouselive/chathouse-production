import { useEnrichment } from '../lib/useEnrichment'

/**
 * WalkabilityScores — displays Walk Score, Bike Score, Transit Score
 * for a listing. Pulls data via the useEnrichment hook.
 *
 * Colors match Walk Score's official tier system:
 *   90-100  Walker's Paradise (dark green)
 *   70-89   Very Walkable (green)
 *   50-69   Somewhat Walkable (yellow-green)
 *   25-49   Car-Dependent (orange)
 *   0-24    Car-Dependent (red)
 *
 * Hides individual scores that are null (e.g. transit data unavailable
 * for some areas).
 */
export default function WalkabilityScores({ listing }) {
  const { enrichment, loading, error } = useEnrichment(listing)

  // While loading, show skeleton
  if (loading) {
    return (
      <div style={styles.wrap}>
        <div style={styles.heading}>Neighborhood Scores</div>
        <div style={styles.scoreRow}>
          <SkeletonScore label="Walk Score" />
          <SkeletonScore label="Transit Score" />
          <SkeletonScore label="Bike Score" />
        </div>
      </div>
    )
  }

  // Silently hide on error (don't break the page)
  if (error) return null

  // Hide if no enrichment data at all
  if (!enrichment) return null

  // If all three scores are null, don't show the component at all
  const hasAnyScore =
    enrichment.walk_score != null ||
    enrichment.transit_score != null ||
    enrichment.bike_score != null

  if (!hasAnyScore) return null

  return (
    <div style={styles.wrap}>
      <div style={styles.headingRow}>
        <span style={styles.heading}>Neighborhood Scores</span>
        <span style={styles.poweredBy}>Powered by Walk Score®</span>
      </div>

      <div style={styles.scoreRow}>
        {enrichment.walk_score != null && (
          <ScoreCard
            label="Walk Score"
            score={enrichment.walk_score}
            description={enrichment.walk_description}
          />
        )}

        {enrichment.transit_score != null && (
          <ScoreCard
            label="Transit Score"
            score={enrichment.transit_score}
            description={enrichment.transit_description}
          />
        )}

        {enrichment.bike_score != null && (
          <ScoreCard
            label="Bike Score"
            score={enrichment.bike_score}
            description={enrichment.bike_description}
          />
        )}
      </div>
    </div>
  )
}

/* ============================================================
   Sub-components
   ============================================================ */

function ScoreCard({ label, score, description }) {
  const color = scoreColor(score)
  return (
    <div style={styles.card}>
      <div style={{ ...styles.scoreCircle, background: color }}>
        {score}
      </div>
      <div style={styles.cardLabel}>{label}</div>
      {description && <div style={styles.cardDescription}>{description}</div>}
    </div>
  )
}

function SkeletonScore({ label }) {
  return (
    <div style={styles.card}>
      <div style={styles.scoreSkeleton} />
      <div style={styles.cardLabel}>{label}</div>
    </div>
  )
}

/* ============================================================
   Color logic — matches Walk Score's official tiers
   ============================================================ */

function scoreColor(score) {
  if (score >= 90) return '#16a34a' // Dark green — Walker's Paradise
  if (score >= 70) return '#22c55e' // Green — Very Walkable
  if (score >= 50) return '#84cc16' // Lime — Somewhat Walkable
  if (score >= 25) return '#f97316' // Orange — Car-Dependent
  return '#ef4444'                  // Red — Very Car-Dependent
}

/* ============================================================
   Styles — matches the rest of the app's pattern
   ============================================================ */

const styles = {
  wrap: {
    padding: 20,
    background: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    marginBottom: 12,
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  headingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
    flexWrap: 'wrap',
  },
  heading: {
    fontFamily: 'var(--serif)',
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
  },
  poweredBy: {
    fontSize: 10,
    fontWeight: 600,
    color: '#94a3b8',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  scoreRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    flex: '1 1 110px',
    minWidth: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '12px 4px',
  },
  scoreCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: '50%',
    color: '#fff',
    fontSize: 22,
    fontWeight: 800,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  scoreSkeleton: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#f1f5f9',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
}