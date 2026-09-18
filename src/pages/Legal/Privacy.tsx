import React from "react";
import { useSEO } from "../../hooks/useSEO";
import { LegalLayout } from "./LegalLayout";

const PRIVACY_SECTIONS = [
  { id: "overview", title: "1. Privacy Overview & NDPR" },
  { id: "collection", title: "2. Information We Collect" },
  { id: "purpose", title: "3. How We Use Your Data" },
  { id: "consent", title: "4. Marketing & Communications Consent" },
  { id: "processors", title: "5. Third-Party Processors & Gateways" },
  { id: "security", title: "6. Data Security & Storage" },
  { id: "cookies", title: "7. Cookies & Local Storage Telemetry" },
  { id: "rights", title: "8. Your Data Subject Rights" },
  { id: "contact", title: "9. Contact Data Protection Officer" },
];

export const Privacy: React.FC = () => {
  useSEO({
    title: "Privacy Policy & Data Protection — Dave Techs Academy",
    description:
      "Read our NDPR-compliant privacy policy detailing how Dave Techs Academy collects, protects, processes, and respects student personal data across our online and physical training platforms.",
  });

  return (
    <LegalLayout
      title="Privacy Policy & Data Protection"
      badge="Data Privacy"
      sections={PRIVACY_SECTIONS}
      activeDoc="privacy"
    >
      {/* 1. Overview */}
      <section id="overview" className="legal-section">
        <h2 className="legal-section__title">1. Privacy Overview & NDPR Compliance</h2>
        <p>
          Dave Techs Academy ("we", "our", or "us") is dedicated to safeguarding the privacy and personal data
          of our students, website visitors, and applicants. This Privacy Policy outlines our data handling practices
          in full compliance with the <strong>Nigeria Data Protection Regulation (NDPR)</strong>, the Nigeria Data
          Protection Act (NDPA), and international privacy standards (including GDPR principles where applicable).
        </p>
        <p>
          This policy applies to all information collected through our official website (
          <strong>davetechs.academy</strong>), student learning portals, admissions application workflows, and our
          physical campuses located in Abeokuta, Victoria Island Lagos, Ikeja, and Ibadan.
        </p>
      </section>

      {/* 2. Collection */}
      <section id="collection" className="legal-section">
        <h2 className="legal-section__title">2. Information We Collect</h2>
        <p>We collect only the data necessary to provide practical tech education and process admissions:</p>
        <ul>
          <li>
            <strong>Account & Identity Information:</strong> Full legal name, email address, mobile phone number,
            country, state/region, and student profile preferences.
          </li>
          <li>
            <strong>Admissions & Academic Data:</strong> Selected course program, learning mode (online or physical),
            preferred physical campus branch, chosen cohort schedule, and educational background.
          </li>
          <li>
            <strong>Payment & Financial Audit Records:</strong> Paystack transaction references, amounts paid, payment
            dates, and payment methods. (<em>Note: We never store complete credit card numbers or banking PINs; all
            card data is handled directly by PCI-DSS certified gateway Paystack</em>).
          </li>
          <li>
            <strong>Inquiries & Correspondence:</strong> Messages submitted via contact forms, syllabus download
            requests, and WhatsApp admissions chat inquiries.
          </li>
          <li>
            <strong>Technical Telemetry:</strong> Anonymized pageviews, course search queries, device type, and
            browser platform to optimize website usability.
          </li>
        </ul>
      </section>

      {/* 3. Purpose */}
      <section id="purpose" className="legal-section">
        <h2 className="legal-section__title">3. How We Use Your Data</h2>
        <p>Your personal data is processed under legitimate legal bases for the following operational purposes:</p>
        <ul>
          <li>
            <strong>Admissions Fulfillment:</strong> Processing course registrations, verifying tuition payments,
            and allocating physical classroom workstations or virtual cohort batches.
          </li>
          <li>
            <strong>Student Support & Cohort Communication:</strong> Dispatching cohort onboarding guides, Google Meet
            links, timetable reminders, and curriculum resources.
          </li>
          <li>
            <strong>Certification:</strong> Issuing verifiable digital certificates of completion with verified
            credential IDs upon passing capstone project defense.
          </li>
          <li>
            <strong>Security & Fraud Prevention:</strong> Preventing duplicate payment processing, unauthorized account
            access, and enforcing rate limiting.
          </li>
        </ul>
      </section>

      {/* 4. Consent */}
      <section id="consent" className="legal-section">
        <h2 className="legal-section__title">4. Marketing & Communications Consent</h2>
        <p>
          Dave Techs Academy operates a permission-based communication system across Email, WhatsApp, and SMS:
        </p>
        <div className="legal-callout">
          <p>
            <strong>Your Communication Choices:</strong>
            <br />
            • <strong>Operational Notifications:</strong> (Payment receipts, application numbers, class schedule reminders)
            are essential to fulfilling your educational enrollment.
            <br />
            • <strong>Promotional Broadcasts:</strong> (New course releases, early-bird scholarships, tech workshops)
            are sent only with your consent and can be opted out of at any time with 1 click.
          </p>
        </div>
        <p>
          Every marketing email includes an instant <strong>Unsubscribe</strong> link in the footer. You may also
          manage your communication preferences directly from your Student Dashboard Profile or by emailing{" "}
          <strong>privacy@davetechs.ng</strong>.
        </p>
      </section>

      {/* 5. Processors */}
      <section id="processors" className="legal-section">
        <h2 className="legal-section__title">5. Third-Party Processors & Gateways</h2>
        <p>
          We partner with vetted, industry-standard service providers who are contractually bound to maintain strict
          data confidentiality:
        </p>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Service Category</th>
              <th>Data Shared</th>
              <th>Compliance Standard</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Paystack</strong></td>
              <td>Payment Gateway</td>
              <td>Email, Amount, Currency, Reference</td>
              <td>PCI-DSS Level 1 Certified</td>
            </tr>
            <tr>
              <td><strong>Resend / SendGrid</strong></td>
              <td>Transactional Email Delivery</td>
              <td>Name, Email, Message Content</td>
              <td>GDPR / SOC-2 Compliant</td>
            </tr>
            <tr>
              <td><strong>Termii</strong></td>
              <td>SMS Telecom Gateway</td>
              <td>Phone Number, SMS Alerts</td>
              <td>NCC & NDPR Licensed</td>
            </tr>
            <tr>
              <td><strong>Meta WhatsApp</strong></td>
              <td>Conversational Support</td>
              <td>Phone Number, Chat Inquiries</td>
              <td>End-to-End Encrypted</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 6. Security */}
      <section id="security" className="legal-section">
        <h2 className="legal-section__title">6. Data Security & Storage</h2>
        <p>
          We employ robust technical and organizational measures to protect personal data against unauthorized access,
          loss, alteration, or disclosure:
        </p>
        <ul>
          <li>
            <strong>Encryption in Transit:</strong> Full TLS/HTTPS 256-bit encryption for all data transmitted
            between your browser and our servers.
          </li>
          <li>
            <strong>Password Security:</strong> Passwords are cryptographically salted and hashed using modern hashing
            algorithms. Plain-text passwords are never stored.
          </li>
          <li>
            <strong>Secret Key Isolation:</strong> All sensitive payment provider secret keys are maintained strictly
            server-side and are barred from frontend JavaScript exposure.
          </li>
        </ul>
      </section>

      {/* 7. Cookies */}
      <section id="cookies" className="legal-section">
        <h2 className="legal-section__title">7. Cookies & Local Storage Telemetry</h2>
        <p>
          Our website uses secure local browser storage and minimal functional cookies to:
        </p>
        <ul>
          <li>Persist your dark/light theme preference.</li>
          <li>Maintain your secure student login session.</li>
          <li>Record aggregate website telemetry to improve course catalog navigation and search speeds.</li>
        </ul>
        <p>We do not use invasive third-party cross-site advertising tracking cookies.</p>
      </section>

      {/* 8. Rights */}
      <section id="rights" className="legal-section">
        <h2 className="legal-section__title">8. Your Data Subject Rights</h2>
        <p>Under the NDPR and NDPA, you hold the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Right to Access:</strong> Request a copy of all personal data held about you.</li>
          <li><strong>Right to Rectification:</strong> Update or correct inaccurate profile information via your dashboard.</li>
          <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your student account where legal retention obligations allow.</li>
          <li><strong>Right to Restrict Processing:</strong> Request suspension of promotional marketing broadcasts.</li>
          <li><strong>Right to Data Portability:</strong> Obtain your academic records and receipts in portable formats (PDF/CSV).</li>
        </ul>
      </section>

      {/* 9. Contact */}
      <section id="contact" className="legal-section">
        <h2 className="legal-section__title">9. Contact Data Protection Officer</h2>
        <p>
          If you have questions regarding this Privacy Policy, wish to exercise your data rights, or want to report
          a privacy concern, please contact our Data Protection Team:
        </p>
        <div className="legal-callout">
          <p>
            <strong>Dave Techs Academy — Data Protection Office</strong>
            <br />
            Email: <a href="mailto:privacy@davetechs.ng" style={{ color: "var(--color-gold)" }}>privacy@davetechs.ng</a>
            <br />
            General Inquiries: <a href="mailto:admissions@davetechs.ng" style={{ color: "var(--color-gold)" }}>admissions@davetechs.ng</a>
            <br />
            Phone: 09070925508, 08110913672
            <br />
            Headquarters: Dave Techs Hub, Abeokuta, Ogun State, Nigeria.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};
