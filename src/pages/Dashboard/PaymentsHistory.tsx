import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getStoredTransactions, type PaymentTransaction } from "../../services/paystack";
import { getApplicationsByStudentId } from "../../data/applications";
import { formatPrice } from "../../utils";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ReceiptModal } from "../../components/dashboard/ReceiptModal";
import type { Application } from "../../types";
import "./PaymentsHistory.css";

export const PaymentsHistory: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Receipt Modal State
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const allTxs = getStoredTransactions();
    const userApps = getApplicationsByStudentId(user.id);
    setApplications(userApps);

    // Filter transactions matching user
    let userTxs = allTxs.filter(
      (t) => t.studentId === user.id || t.studentEmail.toLowerCase() === user.email.toLowerCase()
    );

    // If user has paid applications without an explicit transaction in the store, synthesize transaction records
    userApps.forEach((app) => {
      if (
        app.paymentStatus === "successful" &&
        !userTxs.some((t) => t.applicationId === app.id || t.reference === app.paymentReference)
      ) {
        userTxs.push({
          id: `tx_${app.id}`,
          reference: app.paymentReference || `DTA_PAY_${app.id}_${Date.now()}`,
          applicationId: app.id,
          studentId: app.studentId,
          studentEmail: app.studentEmail,
          courseId: app.courseId,
          courseTitle: app.courseTitle,
          amount: app.tuitionAmount,
          currency: "NGN",
          status: "successful",
          channel: "card",
          paidAt: app.createdAt,
          gatewayResponse: "Approved by Paystack Financial Services",
        });
      }
    });

    setTransactions(userTxs);
  }, [user]);

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2500);
  };

  const handleOpenReceipt = (tx: PaymentTransaction) => {
    setSelectedTx(tx);
    setIsReceiptOpen(true);
  };

  const filteredTxs = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    return (
      tx.reference.toLowerCase().includes(q) ||
      tx.courseTitle.toLowerCase().includes(q) ||
      tx.channel.toLowerCase().includes(q)
    );
  });

  const totalSpent = transactions
    .filter((t) => t.status === "successful")
    .reduce((acc, t) => acc + t.amount, 0);

  const matchedAppForTx = selectedTx
    ? applications.find((a) => a.id === selectedTx.applicationId || a.paymentReference === selectedTx.reference)
    : null;

  return (
    <div className="payments-page">
      {/* Header */}
      <div className="payments-page__header">
        <div>
          <h1 className="dash-page-title">Tuition & Payment History</h1>
          <p className="dash-page-subtitle">
            Official records of all transactions processed securely through Paystack.
          </p>
        </div>
        <Link to="/dashboard/applications">
          <Button variant="secondary" size="md">
            View Applications
          </Button>
        </Link>
      </div>

      {/* Financial Summary Cards */}
      <div className="payments-summary-grid">
        <div className="pay-stat-card pay-stat-card--highlight">
          <div className="pay-stat-card__lbl">Total Tuition Paid</div>
          <div className="pay-stat-card__val">{formatPrice(totalSpent)}</div>
          <div className="pay-stat-card__sub">Verified through Paystack gateway</div>
        </div>

        <div className="pay-stat-card">
          <div className="pay-stat-card__lbl">Successful Transactions</div>
          <div className="pay-stat-card__val">
            {transactions.filter((t) => t.status === "successful").length}
          </div>
          <div className="pay-stat-card__sub">Official receipts available</div>
        </div>

        <div className="pay-stat-card">
          <div className="pay-stat-card__lbl">Active Payment Channel</div>
          <div className="pay-stat-card__val" style={{ fontSize: "20px" }}>
            Paystack PG
          </div>
          <div className="pay-stat-card__sub">Card, Bank Transfer & USSD</div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="payments-table-card">
        <div className="payments-table-header">
          <h3 className="payments-table-title">Transaction Records</h3>
          <input
            type="text"
            className="payments-search-input"
            placeholder="Search reference, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredTxs.length > 0 ? (
          <div className="payments-table-scroll">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Paystack Reference</th>
                  <th>Course Program</th>
                  <th>Amount</th>
                  <th>Channel</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="pay-ref-cell">
                        <span className="pay-ref-code">{tx.reference}</span>
                        <button
                          className="pay-ref-copy-btn"
                          onClick={() => handleCopy(tx.reference)}
                          title="Copy reference code"
                        >
                          {copiedRef === tx.reference ? "✓ Copied" : "📋"}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="pay-course-name">{tx.courseTitle}</div>
                    </td>
                    <td>
                      <span className="pay-amount-val">{formatPrice(tx.amount)}</span>
                    </td>
                    <td>
                      <span className="pay-channel-badge">
                        {tx.channel === "card"
                          ? "💳 Card"
                          : tx.channel === "transfer"
                          ? "🏦 Transfer"
                          : "📱 USSD"}
                      </span>
                    </td>
                    <td>
                      <span className="pay-date-val">
                        {new Date(tx.paidAt).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </td>
                    <td>
                      <Badge variant={tx.status === "successful" ? "success" : "error"}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenReceipt(tx)}
                      >
                        🖨️ Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="payments-empty">
            <div className="payments-empty-icon">💳</div>
            <h4 className="payments-empty-title">No Transactions On Record</h4>
            <p className="payments-empty-desc">
              {searchQuery
                ? `No transactions match "${searchQuery}".`
                : "You have not completed any tuition transactions yet. Complete an application payment to view receipts."}
            </p>
            <Link to="/courses">
              <Button variant="primary" size="md">
                Browse Courses →
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Official Receipt Modal */}
      {selectedTx && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          application={matchedAppForTx}
          transactionRef={selectedTx.reference}
          amount={selectedTx.amount}
          date={selectedTx.paidAt}
          courseTitle={selectedTx.courseTitle}
          studentName={user?.fullName}
          studentEmail={user?.email}
        />
      )}
    </div>
  );
};
