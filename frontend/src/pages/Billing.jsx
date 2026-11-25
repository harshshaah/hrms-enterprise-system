import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Check,
  Loader2,
  AlertCircle,
  Building2,
  FileText,
} from "lucide-react";
import {
  getMySubscription,
  upgradeSubscription,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/organizationService";

export default function Billing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upgrading, setUpgrading] = useState(false);
  const [invoice, setInvoice] = useState(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMySubscription();
      setData(res?.data || null);
    } catch (err) {
      console.error("Failed to load subscription:", err);
      setError(err?.message || "Failed to load subscription information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    try {
      setUpgrading(true);
      setError("");

      // 1. Create order on backend
      const orderRes = await createRazorpayOrder({
        plan: selectedPlanForCheckout.id,
        billingCycle,
      });

      const orderData = orderRes?.data;

      // 2. Load Razorpay script if not already present
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay && orderData?.keyId && !orderData.keyId.includes("mock")) {
        // Real Razorpay popup
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: "INR",
          name: orderData.companyName || "Zimyo SaaS HRMS",
          description: `${selectedPlanForCheckout.name} Plan (${billingCycle})`,
          order_id: orderData.orderId,
          prefill: {
            name: orderData.companyName || "",
          },
          handler: async function (response) {
            try {
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlanForCheckout.id,
                billingCycle,
              });

              setInvoice(verifyRes?.invoice || null);
              setSuccess(`Workspace successfully upgraded to ${selectedPlanForCheckout.name} Plan!`);
              setSelectedPlanForCheckout(null);
              await fetchSubscription();
            } catch (vErr) {
              setError(vErr.message || "Payment verification failed.");
            }
          },
          theme: { color: "#2563eb" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setUpgrading(false);
        return;
      }

      // Fast simulation fallback (for demo/test environments)
      const res = await verifyRazorpayPayment({
        razorpay_order_id: orderData?.orderId || `order_${Date.now()}`,
        razorpay_payment_id: `pay_${Date.now()}`,
        plan: selectedPlanForCheckout.id,
        billingCycle,
      });

      setInvoice(res?.invoice || null);
      setSuccess(`Workspace successfully upgraded to ${selectedPlanForCheckout.name} Plan!`);
      setSelectedPlanForCheckout(null);
      await fetchSubscription();
    } catch (err) {
      console.error("Upgrade error:", err);
      setError(err?.message || "Failed to complete plan upgrade.");
    } finally {
      setUpgrading(false);
    }
  };

  const currentPlanId = data?.subscription?.plan || "free";
  const usage = data?.usage || { activeEmployees: 0, maxEmployees: 15, percentageUsed: 0 };
  const plans = data?.plans || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="text-blue-600" size={26} />
          Plans & Subscription Billing
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Scale your workspace capacity, view employee slots usage, and unlock enterprise HR capabilities.
        </p>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess("")} className="font-bold">&times;</button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="font-bold">&times;</button>
        </div>
      )}

      {/* Current Active Plan Status Banner */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Plan Info */}
            <div className="space-y-2 lg:border-r lg:border-slate-100 lg:pr-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Active Tier
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-extrabold text-slate-900 uppercase">
                  {currentPlanId} Plan
                </h3>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 capitalize">
                  {data?.subscription?.status || "active"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Organization: <strong>{data?.organization?.name || "Your Company"}</strong>
              </p>
            </div>

            {/* Employee Slot Usage Meter */}
            <div className="space-y-2 lg:border-r lg:border-slate-100 lg:pr-6">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">
                  Employee Slots Usage
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {usage.activeEmployees} / {usage.maxEmployees} Slots ({usage.percentageUsed}%)
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usage.percentageUsed >= 90
                      ? "bg-rose-500"
                      : usage.percentageUsed >= 70
                      ? "bg-amber-500"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(100, usage.percentageUsed)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {usage.maxEmployees - usage.activeEmployees} employee slots remaining before limit cap.
              </p>
            </div>

            {/* Trial or Renewal Countdown */}
            <div className="flex flex-col justify-center space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {data?.subscription?.status === "trial" ? "Trial Period" : "Renewal Cycle"}
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Clock size={16} className="text-blue-600" />
                {usage.daysRemaining !== null
                  ? `${usage.daysRemaining} days remaining`
                  : "Active subscription"}
              </div>
              <p className="text-xs text-slate-500">
                Automatic renewal with zero downtime guarantee.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Billing Cycle Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Choose Your Subscription Tier</h2>
          <p className="text-xs text-gray-500 mt-0.5">Simple, transparent pricing for teams of every scale.</p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
              billingCycle === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition ${
              billingCycle === "yearly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Annual Billing
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-extrabold text-emerald-800">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans
          .filter((p) => p.id !== "free")
          .map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const isPopular = plan.badge === "Most Popular";

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border bg-white p-8 flex flex-col justify-between transition-all duration-200 ${
                  isPopular
                    ? "border-blue-600 shadow-xl shadow-blue-500/10 ring-2 ring-blue-600"
                    : "border-gray-200 shadow-sm hover:shadow-md"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                      Up to {plan.maxEmployees} Staff
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500 leading-relaxed min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="mt-6 border-y border-gray-100 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-mono text-gray-900">
                        {formatCurrency(price)}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">
                        /{billingCycle === "yearly" ? "year" : "month"}
                      </span>
                    </div>
                    {billingCycle === "yearly" && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        Equivalent to {formatCurrency(Math.round(price / 12))}/month (Billed annually)
                      </p>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-gray-600">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl bg-gray-100 py-3 text-xs font-bold text-gray-400 cursor-not-allowed"
                    >
                      Active Current Plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForCheckout(plan)}
                      className={`w-full rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isPopular
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      Upgrade to {plan.name}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Simulated Checkout & Activation Modal */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Checkout & Activate {selectedPlanForCheckout.name} Plan
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Simulate instant payment gateway integration (Razorpay / Stripe simulation).
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Order Summary */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <strong className="text-gray-900">{selectedPlanForCheckout.name} ({billingCycle.toUpperCase()})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-mono">
                    {formatCurrency(
                      billingCycle === "yearly"
                        ? selectedPlanForCheckout.yearlyPrice
                        : selectedPlanForCheckout.monthlyPrice
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="font-mono">
                    {formatCurrency(
                      Math.round(
                        (billingCycle === "yearly"
                          ? selectedPlanForCheckout.yearlyPrice
                          : selectedPlanForCheckout.monthlyPrice) * 0.18
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-sm text-gray-900">
                  <span>Total Amount Payable:</span>
                  <span className="font-mono text-blue-700">
                    {formatCurrency(
                      Math.round(
                        (billingCycle === "yearly"
                          ? selectedPlanForCheckout.yearlyPrice
                          : selectedPlanForCheckout.monthlyPrice) * 1.18
                      )
                    )}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "upi", label: "UPI (GPay/PhonePe)" },
                    { id: "card", label: "Credit/Debit Card" },
                    { id: "netbanking", label: "Netbanking" },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`rounded-lg p-2.5 text-center text-xs font-semibold border transition ${
                        paymentMethod === m.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                <span>256-Bit SSL Encrypted &bull; 100% Secure Simulated Transaction</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForCheckout(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upgrading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {upgrading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={14} />}
                  Pay & Activate Plan Instantly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Your workspace has been upgraded with instant plan activation.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-semibold text-gray-900">{invoice.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plan Activated:</span>
                <span className="font-bold text-blue-700 uppercase">{invoice.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-mono font-bold text-gray-900">{formatCurrency(invoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billing Cycle:</span>
                <span className="capitalize text-gray-700">{invoice.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <span className="font-bold text-emerald-600">{invoice.status}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInvoice(null)}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
            >
              Continue to Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

