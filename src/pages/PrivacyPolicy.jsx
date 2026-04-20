import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

function ChathouseLogo({ height = 40 }) {
  return (
    <svg height={height} viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <g transform="translate(24, 16) scale(0.84)">
        <polygon points="54,0 108,46 96,46 96,108 12,108 12,46 0,46" fill="#1A6FE8"/>
        <rect x="38" y="72" width="32" height="36" rx="4" fill="white"/>
        <rect x="58" y="18" width="36" height="28" rx="7" fill="white"/>
        <polygon points="62,46 74,46 66,54" fill="white"/>
        <circle cx="67" cy="32" r="3" fill="#1A6FE8"/>
        <circle cx="76" cy="32" r="3" fill="#1A6FE8"/>
        <circle cx="85" cy="32" r="3" fill="#1A6FE8"/>
      </g>
      <text x="120" y="84" fontFamily="Arial, Helvetica, sans-serif" fontSize="58" letterSpacing="-2">
        <tspan fontWeight="800" fill="#0F1F3D">chat</tspan>
        <tspan fontWeight="400" fill="#1A6FE8" letterSpacing="-2">house</tspan>
      </text>
      <text x="120" y="112" fontFamily="Arial, Helvetica, sans-serif" fontWeight="400" fontSize="13" fill="#8A94A6" letterSpacing="1.5">FIND. TALK. MOVE.</text>
    </svg>
  )
}

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <header style={styles.topbar}>
        <div style={styles.topbarInner}>
          <Link to="/" style={styles.logo}>
            <ChathouseLogo height={40} />
          </Link>
          <Link to="/" style={styles.backLink}>← Back to home</Link>
        </div>
      </header>

      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <span style={styles.eyebrow}>Legal</span>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.sub}>Last updated: April 20, 2026</p>
        </div>
      </section>

      <main style={styles.main}>
        <div style={styles.content}>

          <Section title="1. Introduction">
            <P>Chathouse ("we," "our," or "us") operates chathouselive.com (the "Platform"). This Privacy Policy explains how we collect, use, disclose, and protect information about you when you use our Platform.</P>
            <P>By creating an account or using Chathouse, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the Platform.</P>
          </Section>

          <Section title="2. Information We Collect">
            <SubTitle>2.1 Information You Provide Directly</SubTitle>
            <ul style={styles.list}>
              <Li><strong>Account information:</strong> Name, email address, password, and account type (buyer, renter, neighbor, agent, or broker).</Li>
              <Li><strong>Profile information:</strong> Profile photo, bio, and for licensed professionals, your real estate license number.</Li>
              <Li><strong>Identity verification:</strong> Documents or information you submit to verify your role (e.g., past tenant, current resident, licensed agent). We collect only what is necessary to confirm your status.</Li>
              <Li><strong>Content you post:</strong> Comments, reviews, listing information, and any other content you submit to the Platform.</Li>
              <Li><strong>Communications:</strong> Messages you send through the Platform's messaging features, and emails you send to us directly.</Li>
              <Li><strong>Waitlist and contact forms:</strong> Email address and any information you submit before creating a full account.</Li>
            </ul>

            <SubTitle>2.2 Information Collected Automatically</SubTitle>
            <ul style={styles.list}>
              <Li><strong>Usage data:</strong> Pages visited, features used, time spent, search queries, and interactions with listings and comments.</Li>
              <Li><strong>Device and browser information:</strong> IP address, browser type, operating system, and device identifiers.</Li>
              <Li><strong>Cookies and similar technologies:</strong> We use cookies to maintain your session, remember preferences, and analyze Platform usage. See Section 7 for details.</Li>
            </ul>

            <SubTitle>2.3 Information from Third Parties</SubTitle>
            <ul style={styles.list}>
              <Li><strong>Authentication providers:</strong> If you sign in via a third-party service (e.g., Google), we receive basic profile information from that provider.</Li>
              <Li><strong>Payment processors:</strong> For paid features, payment is handled by third-party processors (e.g., Stripe). We do not store full payment card details.</Li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <P>We use the information we collect to:</P>
            <ul style={styles.list}>
              <Li>Create and manage your account and provide Platform features.</Li>
              <Li>Verify your identity and role to display appropriate badges (e.g., "Verified Tenant," "Licensed Agent").</Li>
              <Li>Enable community features including comments, ratings, and listing transparency.</Li>
              <Li>Send you notifications about activity relevant to you (replies to your comments, new activity on listings you follow).</Li>
              <Li>Send transactional emails (account confirmation, password reset, billing receipts).</Li>
              <Li>Provide customer support and respond to inquiries.</Li>
              <Li>Detect, investigate, and prevent fraud, abuse, and violations of our Terms of Service.</Li>
              <Li>Improve the Platform through analytics and user research.</Li>
              <Li>Comply with legal obligations.</Li>
            </ul>
            <P>We do not sell your personal information to third parties. We do not allow advertisers to pay to have their products promoted in your interactions on the Platform.</P>
          </Section>

          <Section title="4. Public Content and Community Transparency">
            <P>Chathouse is designed to be a transparent community platform. Please be aware of the following:</P>
            <ul style={styles.list}>
              <Li><strong>Comments and reviews are public.</strong> When you post a comment or review, it is visible to all users of the Platform. Your verified role badge (e.g., "Past Tenant") is displayed alongside your comment, but your full name is not displayed publicly unless you choose to include it.</Li>
              <Li><strong>Agent and broker profiles are public.</strong> If you register as a licensed real estate professional, your profile — including your license number and professional activity on the Platform — is publicly visible.</Li>
              <Li><strong>Buyer and renter profiles are private by default.</strong> We do not display your budget, search history, or financial information on any public profile.</Li>
              <Li><strong>Think before you post.</strong> Content you submit may be difficult to fully remove if it has been viewed or indexed by others.</Li>
            </ul>
          </Section>

          <Section title="5. How We Share Your Information">
            <P>We do not sell your personal information. We may share information in the following limited circumstances:</P>
            <ul style={styles.list}>
              <Li><strong>Service providers:</strong> We share information with vendors who help us operate the Platform (e.g., Supabase for database hosting, Vercel for hosting, Stripe for payments, email delivery providers). These providers are contractually bound to use your data only to provide services to us.</Li>
              <Li><strong>Legal requirements:</strong> We may disclose information if required by law, court order, or government authority, or if we believe disclosure is necessary to protect the rights, safety, or property of Chathouse, our users, or the public.</Li>
              <Li><strong>Business transfers:</strong> If Chathouse is acquired or merges with another company, your information may be transferred as part of that transaction. We will notify you before your information is transferred and becomes subject to a different privacy policy.</Li>
              <Li><strong>With your consent:</strong> We may share information for any other purpose with your explicit consent.</Li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <P>We retain your account information and content for as long as your account is active or as needed to provide the Platform. If you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal purposes or where content you posted has been incorporated into community records that others rely on.</P>
            <P>Anonymized or aggregated data that cannot identify you may be retained indefinitely for analytics and improvement purposes.</P>
          </Section>

          <Section title="7. Cookies">
            <P>We use the following types of cookies:</P>
            <ul style={styles.list}>
              <Li><strong>Essential cookies:</strong> Required for the Platform to function (e.g., maintaining your login session). These cannot be disabled.</Li>
              <Li><strong>Analytics cookies:</strong> Help us understand how the Platform is used so we can improve it. You may opt out of analytics tracking in your account settings.</Li>
            </ul>
            <P>We do not use advertising cookies or sell cookie data to third parties.</P>
          </Section>

          <Section title="8. Security">
            <P>We use industry-standard security measures including encryption in transit (HTTPS/TLS), encrypted storage via Supabase, and access controls to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</P>
            <P>If you believe your account has been compromised, please contact us immediately at <a href="mailto:security@chathouselive.com" style={styles.link}>security@chathouselive.com</a>.</P>
          </Section>

          <Section title="9. Your Rights and Choices">
            <P>Depending on your location, you may have the following rights regarding your personal information:</P>
            <ul style={styles.list}>
              <Li><strong>Access:</strong> Request a copy of the personal information we hold about you.</Li>
              <Li><strong>Correction:</strong> Request that we correct inaccurate or incomplete information.</Li>
              <Li><strong>Deletion:</strong> Request that we delete your personal information, subject to certain exceptions.</Li>
              <Li><strong>Portability:</strong> Request your data in a portable format.</Li>
              <Li><strong>Opt-out of marketing:</strong> Unsubscribe from marketing emails at any time via the unsubscribe link in any email we send.</Li>
            </ul>
            <P>To exercise any of these rights, contact us at <a href="mailto:privacy@chathouselive.com" style={styles.link}>privacy@chathouselive.com</a>. We will respond within 30 days.</P>
          </Section>

          <Section title="10. Children's Privacy">
            <P>Chathouse is not directed to children under the age of 18. We do not knowingly collect personal information from anyone under 18. If we become aware that we have collected personal information from a child under 18, we will delete that information promptly. If you believe we have collected information from a minor, please contact us at <a href="mailto:privacy@chathouselive.com" style={styles.link}>privacy@chathouselive.com</a>.</P>
          </Section>

          <Section title="11. Changes to This Policy">
            <P>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page with a new "Last updated" date, and by sending an email to the address associated with your account. Your continued use of the Platform after changes become effective constitutes your acceptance of the revised policy.</P>
          </Section>

          <Section title="12. Contact Us">
            <P>If you have questions about this Privacy Policy or our data practices, contact us at:</P>
            <div style={styles.contactBox}>
              <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Chathouse</p>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>Email: <a href="mailto:privacy@chathouselive.com" style={styles.link}>privacy@chathouselive.com</a></p>
              <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 14 }}>Website: <a href="https://chathouselive.com" style={styles.link}>chathouselive.com</a></p>
            </div>
          </Section>

        </div>
      </main>
      <Footer />
    </div>
  )
}

function Section({ title, children }) {
  return <section style={{ marginBottom: 40 }}><h2 style={styles.sectionTitle}>{title}</h2>{children}</section>
}
function SubTitle({ children }) {
  return <h3 style={styles.subTitle}>{children}</h3>
}
function P({ children }) {
  return <p style={styles.p}>{children}</p>
}
function Li({ children }) {
  return <li style={styles.li}>{children}</li>
}

const styles = {
  topbar: { background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40 },
  topbarInner: { maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
  backLink: { fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 600 },
  hero: { background: 'linear-gradient(135deg, #e8f0fe 0%, #fff 60%)', padding: '60px 20px 48px', textAlign: 'center' },
  heroInner: { maxWidth: 700, margin: '0 auto' },
  eyebrow: { display: 'inline-block', padding: '4px 12px', background: 'rgba(26,108,245,0.1)', color: '#1a6cf5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, borderRadius: 100, marginBottom: 16 },
  title: { fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 800, color: '#0f172a', marginBottom: 10, lineHeight: 1.1 },
  sub: { fontSize: 13, color: '#94a3b8', fontWeight: 500 },
  main: { padding: '56px 20px 80px' },
  content: { maxWidth: 720, margin: '0 auto' },
  sectionTitle: { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 12, marginTop: 0, paddingBottom: 10, borderBottom: '1.5px solid #e2e8f0' },
  subTitle: { fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 8, marginTop: 20 },
  p: { fontSize: 15, color: '#475569', lineHeight: 1.75, marginBottom: 14, marginTop: 0 },
  list: { paddingLeft: 20, marginBottom: 14, marginTop: 0 },
  li: { fontSize: 15, color: '#475569', lineHeight: 1.75, marginBottom: 8 },
  link: { color: '#1a6cf5', textDecoration: 'none', fontWeight: 600 },
  contactBox: { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', marginTop: 16 },
}
