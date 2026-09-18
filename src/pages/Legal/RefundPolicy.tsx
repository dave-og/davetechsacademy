import React from "react";
import { useSEO } from "../../hooks/useSEO";
import { LegalLayout } from "./LegalLayout";

const REFUND_SECTIONS = [
  { id: "overview", title: "1. Policy Overview & Philosophy" },
  { id: "matrix", title: "2. Pre-Cohort Refund Matrix" },
  { id: "post-commencement", title: "3. Post-Commencement Policy" },
  { id: "deferrals", title: "4. Free Cohort Deferral Alternative" },
  { id: "academy-cancellation", title: "5. Academy Cancellation Guarantee" },
  { id: "procedure", title: "6. Refund Request Procedure & Timeline" },
  { id: "contact", title: "7. Contact Admissions Support" },
];

export const RefundPolicy: React.FC = () => {
  useSEO({
    title: "Refund & Cancellation Policy — Dave Techs Academy",
    description:
      "Understand Dave Techs Academy's transparent refund policy, cohort cancellation rules, pre-kickoff refund eligibility timelines, and deferral options.",
  });

  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      badge="Financial Terms"
      sections={REFUND_SECTIONS}
      activeDoc="refund"
    >
      {/* 1. Overview */}
      <section id="overview" className="legal-section">
        <h2 className="legal-section__title">1. Policy Overview & Philosophy</h2>
        <p>
          At Dave Techs Academy, we are committed to delivering practical, high-impact technology education.
          Because our physical lab workstations (Abeokuta, Victoria Island, Ikeja, Ibadan) and virtual live
          cohorts have strictly capped seat capacities to ensure small mentor-to-student ratios, late cancellations
          directly impact cohort scheduling and mentor allocation.
        </p>
        <p>
          This Refund Policy transparently explains our terms regarding cancellations, partial refunds, cohort
          deferrals, and payment reversals.
        </p>
      </section>

      {/* 2. Matrix */}
      <section id="matrix" className="legal-section">
        <h2 className="legal-section__title">2. Pre-Cohort Refund Eligibility Matrix</h2>
        <p>
          If you wish to cancel your course enrollment prior to the official cohort kickoff date, the following
          eligibility criteria apply based on the date your written request is received by our admissions team:
        </p>

        <table className="legal-table">
          <thead>
            <tr>
              <th>Cancellation Request Timing</th>
              <th>Refund Percentage</th>
              <th>Deductions / Conditions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>7 or More Calendar Days</strong>
                <br />
                Before scheduled cohort start date
              </td>
              <td style={{ color: "#10b981", fontWeight: 700 }}>100% Full Refund</td>
              <td>Minus nominal payment gateway processing fee (approx. 1.5% - 2.5% charged by Paystack).</td>
            </tr>
            <tr>
              <td>
                <strong>1 to 6 Calendar Days</strong>
                <br />
                Before scheduled cohort start date
              </td>
              <td style={{ color: "var(--color-gold)", fontWeight: 700 }}>50% Partial Refund</td>
              <td>Workstation reservation & curriculum license preparation fee retained.</td>
            </tr>
            <tr>
              <td>
                <strong>On or After Cohort Kickoff Date</strong>
                <br />
                (Day 1 of classes onwards)
              </td>
              <td style={{ color: "#f87171", fontWeight: 700 }}>0% (Non-Refundable)</td>
              <td>Workstations, software seats, and mentor hours have been fully dedicated.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 3. Post Commencement */}
      <section id="post-commencement" className="legal-section">
        <h2 className="legal-section__title">3. Post-Commencement Policy</h2>
        <p>
          Once a training cohort officially commences (the first scheduled class date arrives), tuition payments
          become <strong>100% non-refundable</strong>.
        </p>
        <div className="legal-callout">
          <p>
            <strong>Why is tuition non-refundable after kickoff?</strong>
            <br />
            Our instructors are contracted and physical workstations, high-speed lab bandwidth, and cloud compute
            resources are permanently reserved for you for the entire program duration.
          </p>
        </div>
        <p>
          Non-attendance or absence from scheduled classes does not qualify for a refund. However, students who
          encounter emergency medical or personal situations may apply for a <strong>Cohort Deferral</strong> as
          detailed below.
        </p>
      </section>

      {/* 4. Deferrals */}
      <section id="deferrals" className="legal-section">
        <h2 className="legal-section__title">4. Free Cohort Deferral Alternative</h2>
        <p>
          If you are unable to participate in your enrolled cohort due to work, university examinations, or
          personal circumstances, you may request to <strong>defer your admission</strong> to a future cohort rather
          than forfeit your tuition:
        </p>
        <ul>
          <li>
            <strong>100% Free Deferral:</strong> You may defer your enrollment once at zero additional charge.
          </li>
          <li>
            <strong>6-Month Validity:</strong> Your tuition credit remains valid for any cohort starting within six (6)
            months of your original enrollment date.
          </li>
          <li>
            <strong>Mode / Campus Switching:</strong> You may also request to transfer your enrollment between
            Physical Campus and Online Live batches during the deferral process.
          </li>
        </ul>
      </section>

      {/* 5. Academy Cancellation */}
      <section id="academy-cancellation" className="legal-section">
        <h2 className="legal-section__title">5. Academy Cancellation Guarantee</h2>
        <p>
          If Dave Techs Academy cancels or indefinitely postpones a scheduled cohort for reasons within our control
          (such as facility emergency or mentor illness), enrolled students are guaranteed:
        </p>
        <ul>
          <li>
            An immediate <strong>100% full refund</strong> with zero administrative deductions; OR
          </li>
          <li>
            A priority seat transfer to the next available batch with a complimentary supplementary masterclass pass.
          </li>
        </ul>
      </section>

      {/* 6. Procedure */}
      <section id="procedure" className="legal-section">
        <h2 className="legal-section__title">6. Refund Request Procedure & Timeline</h2>
        <p>To initiate an official refund request:</p>
        <ol>
          <li>
            Send an email to <strong>refunds@davetechs.ng</strong> or <strong>admissions@davetechs.ng</strong> with the
            subject line: <em>Refund Request: [Your Application Number]</em>.
          </li>
          <li>
            Include your full legal name, registered email address, course title, and Paystack payment reference.
          </li>
          <li>
            Briefly state the reason for cancellation.
          </li>
        </ol>
        <div className="legal-callout">
          <p>
            <strong>Processing Timeline:</strong> Approved refunds are credited directly back to the original funding
            bank card or bank account via Paystack within <strong>5 to 10 business days</strong>.
          </p>
        </div>
      </section>

      {/* 7. Contact */}
      <section id="contact" className="legal-section">
        <h2 className="legal-section__title">7. Contact Admissions & Support</h2>
        <p>
          For any questions concerning tuition payments, deferrals, or refund requests, please reach out to our
          student advisory desk:
        </p>
        <ul>
          <li>Email: <a href="mailto:refunds@davetechs.ng" style={{ color: "var(--color-gold)" }}>refunds@davetechs.ng</a></li>
          <li>Phone / WhatsApp: 09070925508, 08110913672</li>
          <li>Campus Helpdesk: Monday – Saturday: 8:00 AM – 6:00 PM WAT</li>
        </ul>
      </section>
    </LegalLayout>
  );
};
