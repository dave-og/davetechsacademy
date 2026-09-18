import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { verifyPayment, type PaymentTransaction } from "../../services/paystack";
import { formatPrice } from "../../utils";

import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import type { Application } from "../../types";
import "./PaymentCallback.css";

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";
  const appId = searchParams.get("appId") || "";

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    if (!reference || !appId) {
      setIsLoading(false);
      setErrorMessage("No valid payment reference or application ID was provided.");
      return;
    }

    const runVerification = async () => {
      setIsLoading(true);
      const res = await verifyPayment(reference, appId);
      setIsLoading(false);

      if (res.success && res.application) {
        setIsSuccess(true);
        setApplication(res.application);
        if (res.transaction) setTransaction(res.transaction);
      } else {
        setIsSuccess(false);
        setErrorMessage(res.message || "Payment verification failed.");
      }
    };

    runVerification();
  }, [reference, appId]);

  const handlePrintReceipt = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="payment-callback-page">
        <div className="container">
          <div className="payment-card">
            <div className="btn__spinner" style={{ width: "48px", height: "48px", margin: "var(--sp-8) auto", borderWidth: "3px" }} />
            <h2 className="payment-card__title">Verifying Payment with Paystack...</h2>
            <p className="payment-card__subtitle">
              Please wait while we confirm your transaction and finalize your course enrollment records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-callback-page">
      <div className="container">
        <div className="payment-card">
          {isSuccess && application ? (
            <>
              <div className="payment-card__icon-badge payment-card__icon-badge--success">
                ✓
              </div>
              <h1 className="payment-card__title">Payment Successful!</h1>
              <p className="payment-card__subtitle">
                Congratulations, <strong>{application.studentName}</strong>! Your admission for <strong>{application.courseTitle}</strong> is now officially paid and confirmed.
              </p>

              {/* Printable Official Receipt Sheet */}
              <div className="receipt-sheet" id="receipt">
                <div className="receipt-sheet__header">
                  <div>
                    <h3 className="receipt-sheet__brand-title">DAVE TECHS ACADEMY</h3>
                    <p className="receipt-sheet__brand-sub">Official Tuition Payment Receipt</p>
                  </div>
                  <Badge variant="success">PAID & VERIFIED</Badge>
                </div>

                <div className="receipt-sheet__grid">
                  <div className="receipt-item">
                    <label>Application ID</label>
                    <span>{application.applicationNumber}</span>
                  </div>
                  <div className="receipt-item">
                    <label>Paystack Reference</label>
                    <span>{reference}</span>
                  </div>
                  <div className="receipt-item">
                    <label>Student Name</label>
                    <span>{application.studentName}</span>
                  </div>
                  <div className="receipt-item">
                    <label>Student Email</label>
                    <span>{application.studentEmail}</span>
                  </div>
                  <div className="receipt-item">
                    <label>Enrolled Course</label>
                    <span>{application.courseTitle}</span>
                  </div>
                  <div className="receipt-item">
                    <label>Learning Mode</label>
                    <span>{application.learningMode === "online" ? "🌐 Online Live Training" : "🏫 Hands-on Physical Class"}</span>
                  </div>
                  {application.branchName && (
                    <div className="receipt-item">
                      <label>Campus Location</label>
                      <span>{application.branchName}</span>
                    </div>
                  )}
                  <div className="receipt-item">
                    <label>Cohort Batch</label>
                    <span>{application.cohort}</span>
                  </div>
                  <div className="receipt-item">
                    <label>Date & Time</label>
                    <span>{new Date(transaction?.paidAt || Date.now()).toLocaleString("en-NG")}</span>
                  </div>
                  <div className="receipt-item">
                    <label>Payment Gateway</label>
                    <span>Paystack Financial Services</span>
                  </div>
                </div>

                <div className="receipt-sheet__total">
                  <span className="receipt-sheet__total-lbl">Total Amount Paid</span>
                  <span className="receipt-sheet__total-val">{formatPrice(application.tuitionAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="payment-card__actions">
                <Button variant="secondary" size="md" onClick={handlePrintReceipt}>
                  🖨️ Print / Save Receipt
                </Button>
                <Link to="/dashboard">
                  <Button variant="primary" size="md">
                    Go to Student Dashboard →
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="payment-card__icon-badge payment-card__icon-badge--failed">
                ✕
              </div>
              <h1 className="payment-card__title">Payment Verification Failed</h1>
              <p className="payment-card__subtitle">
                {errorMessage || "We were unable to verify this transaction with Paystack. Your card has not been charged."}
              </p>

              <div className="payment-card__actions">
                <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
                  ← Return & Retry
                </Button>
                <Link to="/contact">
                  <Button variant="primary" size="md">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
