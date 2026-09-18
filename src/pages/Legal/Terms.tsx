import React from "react";
import { useSEO } from "../../hooks/useSEO";
import { LegalLayout } from "./LegalLayout";

const TERMS_SECTIONS = [
  { id: "acceptance", title: "1. Acceptance & Eligibility" },
  { id: "accounts", title: "2. Account Registration & Security" },
  { id: "payment-terms", title: "3. Tuition & Payment Terms" },
  { id: "cancellations", title: "4. Course Cancellation & Deferrals" },
  { id: "physical-attendance", title: "5. Physical-Class Attendance Policy" },
  { id: "online-attendance", title: "6. Online-Class & Virtual Etiquette" },
  { id: "certificates", title: "7. Certificate Policy & Defense" },
  { id: "intellectual-property", title: "8. Intellectual Property & Materials" },
  { id: "code-of-conduct", title: "9. Code of Conduct & Integrity" },
  { id: "governing-law", title: "10. Liability & Governing Law" },
];

export const Terms: React.FC = () => {
  useSEO({
    title: "Terms & Conditions — Dave Techs Academy",
    description:
      "Read the official Terms and Conditions governing student admissions, tuition payments, physical/online class attendance policies, and certificate completion criteria at Dave Techs Academy.",
  });

  return (
    <LegalLayout
      title="Terms & Conditions of Admission"
      badge="Student Agreement"
      sections={TERMS_SECTIONS}
      activeDoc="terms"
    >
      {/* 1. Acceptance */}
      <section id="acceptance" className="legal-section">
        <h2 className="legal-section__title">1. Acceptance of Terms & Eligibility</h2>
        <p>
          Welcome to Dave Techs Academy ("Dave Techs", "we", "us", or "the Academy"). These Terms and
          Conditions ("Terms") constitute a legally binding agreement between you ("Student", "Learner",
          or "User") and Dave Techs Academy governing your access to and use of our digital platform, physical
          training campuses, virtual classrooms, and educational programs.
        </p>
        <p>
          By creating an account, submitting a course admission application, or completing a tuition payment,
          you confirm that you are at least 16 years of age (or have verified parental/guardian consent if
          under 18) and agree to be bound by these Terms and our Privacy Policy.
        </p>
      </section>

      {/* 2. Accounts */}
      <section id="accounts" className="legal-section">
        <h2 className="legal-section__title">2. Account Registration & Security</h2>
        <p>
          To apply for courses and access the student learning dashboard, you must register for an account
          with accurate, current, and complete information, including your legal full name, valid email
          address, and active phone number.
        </p>
        <ul>
          <li>
            <strong>Credential Confidentiality:</strong> You are responsible for maintaining the confidentiality
            of your portal login credentials and password.
          </li>
          <li>
            <strong>Account Non-Transferability:</strong> Student accounts, course enrollments, and portal access
            rights are personal to you and may not be shared, rented, or transferred to any third party.
          </li>
          <li>
            <strong>Security Notification:</strong> You agree to notify Dave Techs Academy immediately at{" "}
            <strong>admissions@davetechs.ng</strong> if you suspect unauthorized access to your account.
          </li>
        </ul>
      </section>

      {/* 3. Payment Terms */}
      <section id="payment-terms" className="legal-section">
        <h2 className="legal-section__title">3. Tuition Fees & Payment Terms</h2>
        <p>
          All tuition fees published on Dave Techs Academy are denominated in Nigerian Naira (NGN) and
          represent the authoritative program fee. Payments are processed securely through our authorized
          payment partner, <strong>Paystack</strong> (PCI-DSS Level 1 certified).
        </p>
        <div className="legal-callout">
          <p>
            <strong>Authoritative Pricing Guarantee:</strong> The authoritative tuition price is verified
            server-side against the official catalog. Any client-side price alterations are strictly blocked.
          </p>
        </div>
        <ul>
          <li>
            <strong>Payment Channels:</strong> Tuition can be remitted using Debit/Credit Cards (Mastercard, Visa,
            Verve), Direct Bank Transfers, USSD, and Apple Pay where supported by Paystack.
          </li>
          <li>
            <strong>Official Receipts:</strong> A verified electronic receipt containing your unique Paystack
            transaction reference and application ID is generated immediately upon successful verification and
            remains permanently accessible under your student dashboard.
          </li>
          <li>
            <strong>Seat Reservation:</strong> An admission seat in a physical lab cohort or online batch is
            only officially confirmed once tuition payment is verified in full or the initial installment is
            cleared.
          </li>
        </ul>
      </section>

      {/* 4. Cancellations & Deferrals */}
      <section id="cancellations" className="legal-section">
        <h2 className="legal-section__title">4. Course Cancellation & Deferral Rules</h2>
        <h3 className="legal-section__subtitle">Academy-Initiated Changes</h3>
        <p>
          Dave Techs Academy reserves the right to postpone or reschedule a cohort kickoff date in the event of
          unforeseen instructor unavailability, facility upgrades, or if a cohort fails to reach the minimum
          viable peer threshold. If a cohort is cancelled entirely by the Academy, enrolled students are entitled
          to a <strong>100% full refund</strong> or a priority seat transfer to the next available date.
        </p>
        <h3 className="legal-section__subtitle">Student Cohort Deferrals</h3>
        <p>
          Enrolled students who experience unavoidable schedule conflicts may request a one-time cohort deferral
          to the subsequent batch by submitting written notice to admissions at least <strong>5 calendar days</strong>{" "}
          before their registered cohort begins. Deferrals are valid for up to six (6) months from the original start date.
        </p>
      </section>

      {/* 5. Physical Attendance */}
      <section id="physical-attendance" className="legal-section">
        <h2 className="legal-section__title">5. Physical-Class Attendance Policy</h2>
        <p>
          For students enrolled in Physical Campus learning at our hubs in <strong>Abeokuta, Victoria Island Lagos,
          Ikeja, and Ibadan</strong>:
        </p>
        <ul>
          <li>
            <strong>75% Mandatory Attendance:</strong> Students must maintain a minimum physical lab attendance of
            75% of scheduled classroom sessions to remain eligible for project defense and certification.
          </li>
          <li>
            <strong>Punctuality:</strong> Intensive lab sessions begin promptly at the scheduled cohort time.
            Arrivals exceeding 20 minutes past start time without prior notice are logged as late.
          </li>
          <li>
            <strong>Workstation & Equipment Care:</strong> Students must treat all physical lab infrastructure,
            high-speed Wi-Fi network equipment, and workstations with care. Willful damage to academy hardware is
            subject to restitution and immediate disciplinary dismissal.
          </li>
          <li>
            <strong>Personal Hardware:</strong> Students are required to bring their own personal laptop (recommended
            8GB+ RAM) with working chargers for hands-on programming labs.
          </li>
        </ul>
      </section>

      {/* 6. Online Attendance */}
      <section id="online-attendance" className="legal-section">
        <h2 className="legal-section__title">6. Online-Class & Virtual Classroom Etiquette</h2>
        <p>
          For students participating in live virtual batches via Google Meet and the student learning portal:
        </p>
        <ul>
          <li>
            <strong>Live Engagement:</strong> Live virtual training is highly interactive. Students must join with a
            stable internet connection and active microphone for code-alongs and Q&A.
          </li>
          <li>
            <strong>Camera Etiquette:</strong> Webcams should remain enabled during standups, technical critiques,
            and instructor discussions to foster an engaging community atmosphere.
          </li>
          <li>
            <strong>Recording Confidentiality:</strong> Live classroom recordings provided in the student portal are
            for personal educational review only. Distribution, downloading for redistribution, or public posting
            of classroom video is strictly prohibited.
          </li>
        </ul>
      </section>

      {/* 7. Certificate Policy */}
      <section id="certificates" className="legal-section">
        <h2 className="legal-section__title">7. Certificate Policy & Project Defense</h2>
        <p>
          A verified Dave Techs Academy Certificate of Completion is an industry-recognized credential awarded
          solely on merit. Certificates are never issued merely for course purchase.
        </p>
        <div className="legal-callout">
          <p>
            <strong>Graduation Criteria:</strong>
            <br />
            1. Verified attendance of at least 75% of class modules.
            <br />
            2. Completion and submission of all weekly practical lab milestones.
            <br />
            3. Successful presentation and passing defense of the final real-world Capstone Project.
          </p>
        </div>
        <p>
          Each certificate includes a cryptographically verifiable identification code and digital badge verifiable
          by employers and partner institutions.
        </p>
      </section>

      {/* 8. Intellectual Property */}
      <section id="intellectual-property" className="legal-section">
        <h2 className="legal-section__title">8. Intellectual Property & Materials</h2>
        <p>
          All curriculum materials, lecture slides, video tutorials, code repositories, starter templates, and
          branding assets provided by Dave Techs Academy are the exclusive intellectual property of Dave Techs.
        </p>
        <p>
          Students are granted a revocable, non-exclusive, non-transferable personal license to review materials
          for personal educational purposes. All software code, applications, and portfolio projects created by the
          student during the course remain the 100% intellectual property of the student.
        </p>
      </section>

      {/* 9. Code of Conduct */}
      <section id="code-of-conduct" className="legal-section">
        <h2 className="legal-section__title">9. Code of Conduct & Academic Integrity</h2>
        <p>
          Dave Techs Academy is dedicated to providing a safe, respectful, and collaborative environment for all
          learners and instructors regardless of gender, background, or identity.
        </p>
        <ul>
          <li>
            <strong>Zero Tolerance for Harassment:</strong> Any form of harassment, discrimination, or abusive
            behavior in physical campuses, WhatsApp cohort groups, or virtual classrooms will result in immediate
            expulsion without refund.
          </li>
          <li>
            <strong>Plagiarism:</strong> While collaboration is encouraged, submitting another developer's capstone
            codebase without attribution is a violation of academic integrity.
          </li>
        </ul>
      </section>

      {/* 10. Governing Law */}
      <section id="governing-law" className="legal-section">
        <h2 className="legal-section__title">10. Limitation of Liability & Governing Law</h2>
        <p>
          These Terms and any dispute arising from your academy enrollment shall be governed by and construed in
          accordance with the <strong>Laws of the Federal Republic of Nigeria</strong>. Any legal dispute that cannot
          be amicably resolved through mediation shall be submitted to the exclusive jurisdiction of the competent
          courts in Ogun State or Lagos State, Nigeria.
        </p>
        <p>
          Inquiries regarding these terms may be directed to:{" "}
          <strong>admissions@davetechs.ng</strong> or by calling <strong>09070925508, 08110913672</strong>.
        </p>
      </section>
    </LegalLayout>
  );
};
