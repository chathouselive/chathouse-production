import { Link } from 'react-router-dom'
import { useRiskReport } from '../lib/useRiskReport'
import { useAuth } from '../lib/AuthContext'

/* ============================================================
   Inline SVG icons
   ============================================================ */
const Icon = {
  Shield: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Sparkle: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
    </svg>
  ),
  AlertTriangle: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Users: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Eye: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  HelpCircle: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Print: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  ),
}

/* ============================================================
   Main component
   ============================================================ */
export default function RiskReportSection({ listing }) {
  const { user } = useAuth()
  const { report, loading, generating, error, isCached, generations, generate } =
    useRiskReport(listing)

  // Hide entirely until initial cache check is done
  if (loading) return null

  // Not signed in — show signup gate
  if (!user) {
    return <SignedOutGate />
  }

  // Beta limit reached and no existing report
  const limitReached = generations.used >= generations.limit && !report

  // Has report — render it
  if (report) {
    return <ReportDisplay report={report} isCached={isCached} listing={listing} />
  }

  // No report yet — show generation CTA
  return (
    <GenerateCTA
      onGenerate={generate}
      generating={generating}
      error={error}
      generations={generations}
      limitReached={limitReached}
    />
  )
}

/* ============================================================
   Sub-components
   ============================================================ */

function SignedOutGate() {
  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <Icon.Shield size={18} />
        <span style={styles.headerTitle}>AI Risk Report</span>
        <span style={styles.betaBadge}>BETA · FREE</span>
      </div>
      <p style={styles.gateDescription}>
        Get an AI-powered risk analysis for this property. Includes listing red flags,
        community insights, and questions to ask your home inspector.
      </p>
      <div style={styles.gateButtons}>
        <Link to="/signup" style={styles.gateSignUp}>
          Sign up free →
        </Link>
        <Link to="/signin" style={styles.gateSignIn}>
          Sign in
        </Link>
      </div>
    </div>
  )
}

function GenerateCTA({ onGenerate, generating, error, generations, limitReached }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <Icon.Shield size={18} />
        <span style={styles.headerTitle}>AI Risk Report</span>
        <span style={styles.betaBadge}>BETA · FREE</span>
      </div>

      <p style={styles.ctaDescription}>
        Get an AI-powered analysis of this listing — red flags, things to inspect, and
        questions to ask before signing anything.
      </p>

      <div style={styles.disclaimerBox}>
        <Icon.AlertTriangle size={14} />
        <span style={styles.disclaimerText}>
          This report does <strong>not</strong> replace a professional home inspection.
          Print it and bring it to your inspector.
        </span>
      </div>

      {error && (
        <div style={styles.errorBox}>{error}</div>
      )}

      {limitReached ? (
        <div style={styles.limitBox}>
          You've used all {generations.limit} free reports during beta.
        </div>
      ) : (
        <button
          onClick={onGenerate}
          disabled={generating}
          style={{
            ...styles.generateBtn,
            opacity: generating ? 0.6 : 1,
            cursor: generating ? 'wait' : 'pointer',
          }}
        >
          <Icon.Sparkle size={14} />
          {generating ? 'Analyzing property...' : 'Generate Risk Report'}
        </button>
      )}

      <div style={styles.quotaText}>
        {generations.used} of {generations.limit} free reports used during beta
      </div>
    </div>
  )
}

function ReportDisplay({ report, isCached, listing }) {
  const handlePrint = () => window.print()

  return (
    <div style={styles.wrap} id="risk-report-content">
      <div style={styles.headerRow}>
        <Icon.Shield size={18} />
        <span style={styles.headerTitle}>AI Risk Report</span>
        <span style={styles.betaBadge}>BETA · FREE</span>
      </div>

      {/* Print-only address header */}
      <div style={styles.printOnlyHeader} className="print-only">
        <h1 style={styles.printAddress}>{listing.address}</h1>
        <p style={styles.printSub}>
          AI Risk Report · Generated {new Date().toLocaleDateString()}
        </p>
      </div>

      <div style={styles.disclaimerBox}>
        <Icon.AlertTriangle size={14} />
        <span style={styles.disclaimerText}>
          {report.disclaimer ||
            'This report is informational only and does not replace a licensed home inspection.'}
        </span>
      </div>

      {/* Summary */}
      {report.summary && (
        <div style={styles.summarySection}>
          <p style={styles.summaryText}>{report.summary}</p>
        </div>
      )}

      {/* Listing Red Flags */}
      <ReportSection
        icon={<Icon.Eye size={14} />}
        title="Listing Red Flags"
        subtitle="Things that are missing, vague, or worth verifying in the listing itself"
        items={report.listing_red_flags}
      />

      {/* Community Insights */}
      <ReportSection
        icon={<Icon.Users size={14} />}
        title="Community Insights"
        subtitle="What residents and neighbors have shared about this building"
        items={report.community_insights}
        emptyText="No community comments yet. Be the first to share what you know."
      />

      {/* Inspector Watchlist */}
      <ReportSection
        icon={<Icon.AlertTriangle size={14} />}
        title="Inspector Watchlist"
        subtitle="Items your home inspector should examine for this property type"
        items={report.inspector_watchlist}
      />

      {/* Questions to Ask */}
      {report.questions_to_ask && report.questions_to_ask.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Icon.HelpCircle size={14} />
            <div>
              <div style={styles.sectionTitle}>Questions to Ask</div>
              <div style={styles.sectionSubtitle}>
                Practical questions for the seller, landlord, or agent
              </div>
            </div>
          </div>
          <ul style={styles.questionList}>
            {report.questions_to_ask.map((q, i) => (
              <li key={i} style={styles.questionItem}>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footerSection}>
        <p style={styles.footerText}>
          <strong>Next steps:</strong> Print this report and bring it to your home
          inspection. Your inspector will check what really matters: roof, electrical,
          plumbing, foundation, HVAC, and dozens of items no AI can see from a listing.
          Chathouse does not perform inspections — we connect buyers and renters with the
          information they should have before signing anything.
        </p>

        <div style={styles.actionRow}>
          <button onClick={handlePrint} style={styles.printBtn}>
            <Icon.Print size={13} /> Print Report
          </button>
          {isCached && (
            <span style={styles.cachedNote}>
              Cached report · regenerated every 30 days
            </span>
          )}
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media screen { .print-only { display: none; } }
        @media print {
          body { background: white; }
          #risk-report-content { box-shadow: none; border: none; }
          .print-only { display: block; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function ReportSection({ icon, title, subtitle, items, emptyText }) {
  if (!items || items.length === 0) {
    if (!emptyText) return null
    return (
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          {icon}
          <div>
            <div style={styles.sectionTitle}>{title}</div>
            <div style={styles.sectionSubtitle}>{subtitle}</div>
          </div>
        </div>
        <p style={styles.emptyText}>{emptyText}</p>
      </div>
    )
  }

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        {icon}
        <div>
          <div style={styles.sectionTitle}>{title}</div>
          <div style={styles.sectionSubtitle}>{subtitle}</div>
        </div>
      </div>
      <div style={styles.itemList}>
        {items.map((item, i) => (
          <div key={i} style={styles.item}>
            <div style={styles.itemConcern}>{item.concern}</div>
            <div style={styles.itemDetail}>{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   Styles
   ============================================================ */

const styles = {
  wrap: {
    padding: 24,
    background: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    marginBottom: 12,
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    color: '#1a6cf5',
  },
  headerTitle: {
    fontFamily: 'var(--serif)',
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    flex: 1,
  },
  betaBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    padding: '3px 8px',
    borderRadius: 100,
    background: '#e8f0fe',
    color: '#1a6cf5',
  },

  /* Generate CTA / signed-out states */
  ctaDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 1.6,
    marginBottom: 12,
  },
  gateDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  gateButtons: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  gateSignUp: {
    padding: '10px 20px',
    background: '#1a6cf5',
    color: '#fff',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(26,108,245,0.3)',
  },
  gateSignIn: {
    padding: '10px 20px',
    background: '#f1f5f9',
    color: '#475569',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
  },

  disclaimerBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    background: '#fffbeb',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: '#f59e0b',
    marginBottom: 14,
    color: '#92400e',
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 1.5,
  },

  errorBox: {
    padding: 10,
    background: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: '#ef4444',
    color: '#991b1b',
    fontSize: 12,
    marginBottom: 12,
  },

  limitBox: {
    padding: 14,
    background: '#f8fafc',
    borderRadius: 10,
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 8,
  },

  generateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 22px',
    background: '#1a6cf5',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(26,108,245,0.3)',
  },

  quotaText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 10,
    textAlign: 'center',
  },

  /* Report display */
  printOnlyHeader: {
    marginBottom: 16,
  },
  printAddress: {
    fontFamily: 'var(--serif)',
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 4px',
  },
  printSub: {
    fontSize: 12,
    color: '#64748b',
    margin: 0,
  },

  summarySection: {
    padding: 14,
    background: '#f8fafc',
    borderRadius: 10,
    marginBottom: 18,
  },
  summaryText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 1.6,
    margin: 0,
  },

  section: {
    marginBottom: 22,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#f1f5f9',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
    color: '#1a6cf5',
  },
  sectionTitle: {
    fontFamily: 'var(--serif)',
    fontSize: 15,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 500,
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  item: {
    padding: '10px 12px',
    background: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftStyle: 'solid',
    borderLeftColor: '#1a6cf5',
  },
  itemConcern: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 3,
  },
  itemDetail: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 1.5,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    margin: 0,
  },
  questionList: {
    listStyle: 'disc',
    paddingLeft: 22,
    margin: 0,
  },
  questionItem: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: 6,
  },

  footerSection: {
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: 14,
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  printBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cachedNote: {
    fontSize: 11,
    color: '#94a3b8',
  },
}