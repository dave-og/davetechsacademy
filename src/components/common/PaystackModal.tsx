import React, { useState, useEffect } from "react";
import { formatPrice } from "../../utils";
import "./PaystackModal.css";

interface PaystackModalProps {
  isOpen: boolean;
  amount: number;
  email: string;
  reference: string;
  courseTitle: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  onFail?: () => void;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({
  isOpen,
  amount,
  email,
  reference,
  courseTitle,
  onSuccess,
  onClose,
  onFail,
}) => {
  const [activeChannel, setActiveChannel] = useState<"card" | "transfer" | "ussd">("card");
  const [cardNumber, setCardNumber] = useState("4084 0840 8408 4084");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("408");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate transaction processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    onSuccess(reference);
  };

  const handleSimulateFailure = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsProcessing(false);
    if (onFail) onFail();
  };

  return (
    <div
      className="paystack-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Paystack Secure Checkout"
    >
      <div className="paystack-checkout">
        {/* Header */}
        <div className="paystack-checkout__header">
          <div className="paystack-checkout__brand">
            <div className="paystack-checkout__logo-badge">DT</div>
            <div>
              <h3 className="paystack-checkout__title">Dave Techs Academy</h3>
              <p className="paystack-checkout__email">{email}</p>
            </div>
          </div>
          <button
            className="paystack-checkout__close"
            onClick={onClose}
            aria-label="Cancel and close payment checkout"
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>

        {/* Amount Bar */}
        <div className="paystack-checkout__amount-bar">
          <div>
            <div className="paystack-checkout__amount-label">Pay Tuition For</div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{courseTitle}</div>
          </div>
          <div className="paystack-checkout__amount-val">{formatPrice(amount)}</div>
        </div>

        {/* Channels Tabs */}
        <div className="paystack-channels">
          <button
            type="button"
            className={`paystack-channel-tab ${activeChannel === "card" ? "paystack-channel-tab--active" : ""}`}
            onClick={() => setActiveChannel("card")}
          >
            💳 Card
          </button>
          <button
            type="button"
            className={`paystack-channel-tab ${activeChannel === "transfer" ? "paystack-channel-tab--active" : ""}`}
            onClick={() => setActiveChannel("transfer")}
          >
            🏦 Bank Transfer
          </button>
          <button
            type="button"
            className={`paystack-channel-tab ${activeChannel === "ussd" ? "paystack-channel-tab--active" : ""}`}
            onClick={() => setActiveChannel("ussd")}
          >
            📱 USSD
          </button>
        </div>

        {/* Body Form */}
        <div className="paystack-checkout__body">
          {/* Test Mode Notification */}
          <div className="paystack-sim-bar">
            <span>⚡ Paystack Test Mode Active</span>
            <button
              type="button"
              className="paystack-sim-fail-btn"
              onClick={handleSimulateFailure}
              disabled={isProcessing}
            >
              Test Fail
            </button>
          </div>

          {activeChannel === "card" && (
            <form onSubmit={handlePay}>
              <div className="paystack-input-group">
                <label className="paystack-label">Card Number</label>
                <input
                  type="text"
                  className="paystack-input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  required
                />
              </div>

              <div className="paystack-input-row">
                <div className="paystack-input-group">
                  <label className="paystack-label">Card Expiry</label>
                  <input
                    type="text"
                    className="paystack-input"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="paystack-input-group">
                  <label className="paystack-label">CVV</label>
                  <input
                    type="password"
                    className="paystack-input"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="paystack-pay-btn"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing Secure Payment..." : `Pay ${formatPrice(amount)}`}
              </button>
            </form>
          )}

          {activeChannel === "transfer" && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
                Transfer exactly <strong>{formatPrice(amount)}</strong> to the temporary Paystack checkout account:
              </p>
              <div
                style={{
                  background: "#f1f5f9",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                <div>Bank: <strong>Wema Bank / Paystack</strong></div>
                <div style={{ fontSize: "16px", fontWeight: 700, margin: "4px 0", color: "#011b33" }}>
                  990 482 1029
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Expires in 30 minutes</div>
              </div>
              <button
                type="button"
                className="paystack-pay-btn"
                onClick={handlePay}
                disabled={isProcessing}
              >
                {isProcessing ? "Verifying Transfer..." : "I Have Sent The Money"}
              </button>
            </div>
          )}

          {activeChannel === "ussd" && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
                Dial the USSD string on your registered phone number:
              </p>
              <div
                style={{
                  background: "#f1f5f9",
                  padding: "14px",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#011b33",
                  marginBottom: "16px",
                  letterSpacing: "1px",
                }}
              >
                *737*50*46000*124#
              </div>
              <button
                type="button"
                className="paystack-pay-btn"
                onClick={handlePay}
                disabled={isProcessing}
              >
                {isProcessing ? "Confirming USSD..." : "I Have Authorized USSD"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="paystack-checkout__footer">
          <span>🔒 Secured by</span>
          <span className="paystack-badge">paystack</span>
        </div>
      </div>
    </div>
  );
};
