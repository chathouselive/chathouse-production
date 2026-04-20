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

export default function TermsOfService() {
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
          <h1 style={styles.title}>Terms of Service</h1>
          <p style={styles.sub}>Last updated: April 20, 2026</p>
        </div>
      </section>

      <main style={styles.main}>
        <div style={styles.content}>

          <Section title="1. Acceptance of Terms">
            <P>These Terms of Service ("Terms") govern your access to and use of Chathouse ("Platform"), operated by Chathouse ("we," "our," or "us") at chathouselive.com. By creating an account, accessing the Platform, or submitting any content, you agree to be bound by these Terms and our <Link to="/privacy" style={styles.link}>Privacy Policy</Link>.</P>
            <P>If you do not agree to these Terms, you may not access or use the Platform. We reserve the right to update these Terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the revised Terms.</P>
          </Section>

          <Section title="2. Eligibility">
            <P>You must be at least 18 years old to use Chathouse. By using the Platform, you represent and warrant that you are 18 or older and that your use of the Platform does not violate any applicable law or regulation.</P>
            <P>Licensed real estate professionals (agents and brokers) must provide a valid, current license number during registration. We reserve the right to verify this information and suspend or terminate accounts where license information is found to be inaccurate or expired.</P>
          </Section>

          <Section title="3. Account Registration and Security">
            <ul style={styles.list}>
              <Li>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</Li>
              <Li>You agree to provide accurate, current, and complete information during registration and to update it as necessary.</Li>
              <Li>You may not create more than one account per person, impersonate any other person, or create an account on behalf of someone else without their consent.</Li>
              <Li>You agree to notify us immediately at <a href="mailto:support@chathouselive.com" style={styles.link}>support@chathouselive.com</a> if you suspect unauthorized access to your account.</Li>
              <Li>We reserve the right to suspend or terminate accounts that violate these Terms or that we reasonably believe pose a risk to the Platform or other users.</Li>
            </ul>
          </Section>

          <Section title="4. User Roles and Verification">
            <P>Chathouse operates a multi-role community platform. Users may register as buyers, renters, neighbors, past tenants, licensed agents, or licensed brokers. Role-specific badges are displayed on all content you post.</P>
            <ul style={styles.list}>
              <Li><strong>Buyers and renters:</strong> Free access to browse listings, read community comments, and post verified reviews of properties you have lived in or toured.</Li>
              <Li><strong>Neighbors:</strong> May post comments about the neighborhood or building from a resident's perspective.</Li>
              <Li><strong>Licensed agents and brokers:</strong> Must provide a valid license number. Professional accounts are subject to additional terms and may be subject to subscription fees for premium features.</Li>
            </ul>
            <P>You agree not to misrepresent your role or relationship to a property. Falsely claiming to be a past tenant, current resident, or licensed professional is a material breach of these Terms and may result in immediate account termination.</P>
          </Section>

          <Section title="5. Community Content Standards">
            <P>You are solely responsible for any content you post on Chathouse ("User Content"). By posting User Content, you represent that you have the right to post it and that it complies with these Terms.</P>
            <SubTitle>You agree NOT to post content that:</SubTitle>
            <ul style={styles.list}>
              <Li>Is false, misleading, defamatory, or fraudulent.</Li>
              <Li>Constitutes harassment, threats, hate speech, or targeted personal attacks.</Li>
              <Li>Discriminates against or disparages individuals on the basis of race, color, religion, sex, national origin, disability, familial status, or any other protected class in violation of the Fair Housing Act or any other applicable law.</Li>
              <Li>Contains personal identifying information about others (phone numbers, addresses, financial information) without their consent.</Li>
              <Li>Violates any third party's intellectual property rights.</Li>
              <Li>Contains spam, advertising, or unsolicited commercial communications.</Li>
              <Li>Contains malicious code, links to phishing sites, or any content designed to deceive or harm users.</Li>
              <Li>Violates any applicable local, state, or federal law.</Li>
            </ul>
            <P>We reserve the right (but not the obligation) to remove any User Content that we determine, in our sole discretion, violates these standards. We are not liable for any User Content posted by users.</P>
          </Section>

          <Section title="6. Intellectual Property">
            <SubTitle>Your Content</SubTitle>
            <P>You retain ownership of User Content you post. By posting content on Chathouse, you grant us a non-exclusive, worldwide, royalty-free, sublicensable license to use, display, reproduce, and distribute your content in connection with operating and improving the Platform. This license ends when you delete your content, except where it has been shared by others or incorporated into aggregate data.</P>
            <SubTitle>Our Content</SubTitle>
            <P>The Chathouse name, logo, design, and all Platform features and content created by us are owned by Chathouse and protected by applicable intellectual property laws. You may not copy, modify, or distribute our content without our express written permission.</P>
          </Section>

          <Section title="7. Paid Features and Subscriptions">
            <P>Certain features — including agent and broker professional dashboards, premium profile features, and AI-powered neighborhood reports — require payment. Paid features are subject to the following:</P>
            <ul style={styles.list}>
              <Li>Subscriptions are billed in advance on a monthly or annual basis and are non-refundable except as required by law or as stated in a specific offer.</Li>
              <Li>We reserve the right to change pricing with 30 days' notice. Continued use after the effective date constitutes acceptance of the new pricing.</Li>
              <Li>We use Stripe for payment processing. By subscribing, you authorize us to charge your payment method on a recurring basis.</Li>
              <Li>You may cancel a subscription at any time. Cancellation takes effect at the end of the current billing period.</Li>
            </ul>
          </Section>

          <Section title="8. Fair Housing Compliance">
            <P>Chathouse is committed to full compliance with the Fair Housing Act (42 U.S.C. § 3601 et seq.) and all applicable state and local fair housing laws. The Platform may not be used to:</P>
            <ul style={styles.list}>
              <Li>Post listings or content that indicates any preference, limitation, or discrimination based on race, color, religion, sex, national origin, disability, familial status, or any other protected class.</Li>
              <Li>Make, print, or publish any statement that indicates a preference, limitation, or discrimination in the sale or rental of housing.</Li>
            </ul>
            <P>Any content found to violate fair housing laws will be removed immediately. Users who repeatedly post discriminatory content will be permanently banned and may be reported to relevant authorities. For more information, visit our <Link to="/fair-housing" style={styles.link}>Fair Housing page</Link>.</P>
          </Section>

          <Section title="9. Disclaimers">
            <P>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</P>
            <P>Community content on Chathouse is user-generated. We do not verify the accuracy of comments or reviews posted by users. Chathouse is not a substitute for professional real estate advice, legal counsel, or independent property inspection. Always conduct your own due diligence before making any real estate decision.</P>
          </Section>

          <Section title="10. Limitation of Liability">
            <P>TO THE FULLEST EXTENT PERMITTED BY LAW, CHATHOUSE AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM.</P>
            <P>OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE GREATER OF (A) $100 OR (B) THE AMOUNT YOU PAID TO CHATHOUSE IN THE 12 MONTHS PRECEDING THE CLAIM.</P>
          </Section>

          <Section title="11. Indemnification">
            <P>You agree to indemnify, defend, and hold harmless Chathouse and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with your access to or use of the Platform, your User Content, or your violation of these Terms.</P>
          </Section>

          <Section title="12. Termination">
            <P>We may suspend or terminate your access to the Platform at any time, with or without notice, for any reason, including violation of these Terms. You may delete your account at any time through your account settings or by contacting us at <a href="mailto:support@chathouselive.com" style={styles.link}>support@chathouselive.com</a>.</P>
            <P>Upon termination, your right to use the Platform ceases immediately. Sections 6, 9, 10, and 11 survive termination.</P>
          </Section>

          <Section title="13. Governing Law">
            <P>These Terms are governed by the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Platform shall be resolved exclusively in the state or federal courts located in Delaware, and you consent to personal jurisdiction in those courts.</P>
          </Section>

          <Section title="14. Contact Us">
            <P>Questions about these Terms? Contact us at:</P>
            <div style={styles.contactBox}>
              <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Chathouse</p>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>Email: <a href="mailto:legal@chathouselive.com" style={styles.link}>legal@chathouselive.com</a></p>
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
