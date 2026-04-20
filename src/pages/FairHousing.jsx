import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function FairHousing() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* Top bar */}
      <header style={styles.topbar}>
        <div style={styles.topbarInner}>
          <Link to="/" style={styles.logo}>
            <span style={{ fontSize: 22 }}>🏠</span>
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 20 }}>Chathouse</span>
          </Link>
          <Link to="/" style={styles.backLink}>← Back to home</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <span style={styles.eyebrow}>Fair Housing</span>
          <h1 style={styles.title}>Fair Housing Statement</h1>
          <p style={styles.sub}>Chathouse is committed to equal opportunity in housing for all people.</p>
        </div>
      </section>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.content}>

          {/* Equal Housing Opportunity badge */}
          <div style={styles.ehoCard}>
            <div style={styles.ehoIcon}>⚖️</div>
            <div>
              <div style={styles.ehoTitle}>Equal Housing Opportunity</div>
              <div style={styles.ehoText}>
                We are pledged to the letter and spirit of U.S. policy for the achievement of equal housing opportunity throughout the nation. We encourage and support an affirmative advertising and marketing program in which there are no barriers to obtaining housing because of race, color, religion, sex, handicap, familial status, or national origin.
              </div>
            </div>
          </div>

          <Section title="Our Commitment">
            <P>Chathouse is committed to full compliance with the Fair Housing Act (42 U.S.C. § 3601 et seq.), the Americans with Disabilities Act, and all applicable state and local fair housing laws.</P>
            <P>We believe that every person has the right to find housing without facing discrimination. Our Platform is designed to increase transparency and community information — never to enable or facilitate housing discrimination of any kind.</P>
          </Section>

          <Section title="What the Fair Housing Act Prohibits">
            <P>Under the Fair Housing Act, it is unlawful to:</P>
            <ul style={styles.list}>
              <Li>Refuse to sell or rent to, or negotiate with, any person because of race, color, religion, sex, national origin, disability, or familial status.</Li>
              <Li>Make housing unavailable to a person because of their membership in a protected class.</Li>
              <Li>Set different terms, conditions, or privileges in the sale or rental of a home based on protected characteristics.</Li>
              <Li>Provide different housing services or facilities based on protected characteristics.</Li>
              <Li>Falsely deny that housing is available for inspection, sale, or rent.</Li>
              <Li>Make, print, or publish any notice, statement, or advertisement regarding the sale or rental of a dwelling that indicates a preference, limitation, or discrimination based on a protected characteristic.</Li>
              <Li>Engage in blockbusting — attempting to persuade homeowners to sell based on the notion that people of a particular protected class are moving into the neighborhood.</Li>
              <Li>Deny access to, or membership in, any MLS or other real estate service organization based on a protected characteristic.</Li>
            </ul>
          </Section>

          <Section title="Protected Classes">
            <P>Federal law protects the following classes from housing discrimination:</P>
            <div style={styles.classGrid}>
              {[
                { icon: '🌍', label: 'Race' },
                { icon: '🎨', label: 'Color' },
                { icon: '⛪', label: 'Religion' },
                { icon: '⚧', label: 'Sex' },
                { icon: '🗺️', label: 'National Origin' },
                { icon: '♿', label: 'Disability' },
                { icon: '👨‍👩‍👧', label: 'Familial Status' },
              ].map(c => (
                <div key={c.label} style={styles.classCard}>
                  <span style={styles.classIcon}>{c.icon}</span>
                  <span style={styles.classLabel}>{c.label}</span>
                </div>
              ))}
            </div>
            <P>Many states and localities also protect additional classes including sexual orientation, gender identity, source of income, military status, age, and more. Chathouse complies with all applicable laws in the jurisdictions where we operate.</P>
          </Section>

          <Section title="How Chathouse Upholds Fair Housing">
            <ul style={styles.list}>
              <Li><strong>Content moderation:</strong> We actively review and remove any content that discriminates against or expresses a preference related to any protected class.</Li>
              <Li><strong>Community standards:</strong> Our Terms of Service explicitly prohibit discriminatory content. Users who post discriminatory content will be suspended or permanently banned.</Li>
              <Li><strong>Neutral presentation:</strong> Listings and community information on Chathouse are presented neutrally. We do not allow filtering, sorting, or categorization by protected characteristics.</Li>
              <Li><strong>IDX listings:</strong> All MLS listing data displayed through IDX on Chathouse is subject to the same fair housing requirements. Listing data is displayed as provided by the MLS and affiliated brokers who are independently bound by fair housing obligations.</Li>
              <Li><strong>Reporting tools:</strong> Users can report potentially discriminatory content through the flag/report feature on any listing or comment.</Li>
            </ul>
          </Section>

          <Section title="Report a Violation">
            <P>If you believe you have experienced housing discrimination or have seen content on Chathouse that violates fair housing laws, please:</P>
            <ul style={styles.list}>
              <Li>Report the content directly using the flag feature on the listing or comment.</Li>
              <Li>Contact us at <a href="mailto:fairhousing@chathouselive.com" style={styles.link}>fairhousing@chathouselive.com</a> with details of the potential violation.</Li>
              <Li>File a complaint with the U.S. Department of Housing and Urban Development (HUD) at <a href="https://www.hud.gov/fairhousing" target="_blank" rel="noopener noreferrer" style={styles.link}>hud.gov/fairhousing</a> or by calling 1-800-669-9777.</Li>
              <Li>Contact your local or state fair housing agency or a HUD-approved housing counseling agency.</Li>
            </ul>
          </Section>

          <Section title="Resources">
            <div style={styles.resourceGrid}>
              <ResourceCard
                title="HUD Fair Housing"
                desc="Official U.S. Department of Housing and Urban Development fair housing resources and complaint portal."
                href="https://www.hud.gov/fairhousing"
              />
              <ResourceCard
                title="NJ Division on Civil Rights"
                desc="New Jersey's state agency handling fair housing complaints and enforcement."
                href="https://www.njoag.gov/about/divisions-and-offices/division-on-civil-rights-home/"
              />
              <ResourceCard
                title="National Fair Housing Alliance"
                desc="Consortium of more than 200 private, non-profit fair housing organizations."
                href="https://nationalfairhousing.org"
              />
            </div>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function ResourceCard({ title, desc, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={styles.resourceCard}>
      <div style={styles.resourceTitle}>{title} →</div>
      <div style={styles.resourceDesc}>{desc}</div>
    </a>
  )
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  )
}

function P({ children }) {
  return <p style={styles.p}>{children}</p>
}

function Li({ children }) {
  return <li style={styles.li}>{children}</li>
}

const styles = {
  topbar: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky', top: 0, zIndex: 40,
  },
  topbarInner: {
    maxWidth: 1100, margin: '0 auto',
    padding: '14px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    textDecoration: 'none', color: '#0f172a',
  },
  backLink: {
    fontSize: 13, color: '#64748b',
    textDecoration: 'none', fontWeight: 600,
  },
  hero: {
    background: 'linear-gradient(135deg, #e8f0fe 0%, #fff 60%)',
    padding: '60px 20px 48px',
    textAlign: 'center',
  },
  heroInner: { maxWidth: 700, margin: '0 auto' },
  eyebrow: {
    display: 'inline-block', padding: '4px 12px',
    background: 'rgba(26,108,245,0.1)', color: '#1a6cf5',
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 1, borderRadius: 100, marginBottom: 16,
  },
  title: {
    fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 800,
    color: '#0f172a', marginBottom: 10, lineHeight: 1.1,
  },
  sub: { fontSize: 15, color: '#64748b', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' },
  main: { padding: '56px 20px 80px' },
  content: { maxWidth: 720, margin: '0 auto' },

  ehoCard: {
    display: 'flex', gap: 20, alignItems: 'flex-start',
    background: 'linear-gradient(135deg, #e8f0fe, #fff3e8)',
    border: '1.5px solid #bfdbfe',
    borderRadius: 16, padding: '24px 28px', marginBottom: 48,
  },
  ehoIcon: { fontSize: 36, flexShrink: 0 },
  ehoTitle: {
    fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700,
    color: '#0f172a', marginBottom: 8,
  },
  ehoText: {
    fontSize: 14, color: '#475569', lineHeight: 1.7,
  },

  sectionTitle: {
    fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700,
    color: '#0f172a', marginBottom: 12, marginTop: 0,
    paddingBottom: 10, borderBottom: '1.5px solid #e2e8f0',
  },
  p: {
    fontSize: 15, color: '#475569', lineHeight: 1.75,
    marginBottom: 14, marginTop: 0,
  },
  list: { paddingLeft: 20, marginBottom: 14, marginTop: 0 },
  li: {
    fontSize: 15, color: '#475569', lineHeight: 1.75, marginBottom: 8,
  },
  link: { color: '#1a6cf5', textDecoration: 'none', fontWeight: 600 },

  classGrid: {
    display: 'flex', flexWrap: 'wrap', gap: 10,
    marginBottom: 20,
  },
  classCard: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 10, padding: '8px 16px',
  },
  classIcon: { fontSize: 18 },
  classLabel: { fontSize: 13, fontWeight: 700, color: '#334155' },

  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16, marginTop: 8,
  },
  resourceCard: {
    display: 'block', textDecoration: 'none',
    background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 12, padding: '18px 20px',
  },
  resourceTitle: {
    fontSize: 14, fontWeight: 700, color: '#1a6cf5',
    marginBottom: 6,
  },
  resourceDesc: {
    fontSize: 12, color: '#64748b', lineHeight: 1.6,
  },
}
