// donasi/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Heart } from "lucide-react";
import QRCodeCard from "@/components/QRCodeCard";

function classNames(...s: (string | false | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

type StoredPayment = {
  qrString: string;
  transactionId: string;
  totalAmount: number;
  expiredAt: string;
  status: string;
  savedAt: number;
};

const LOCAL_PREFIX = "maelyn:payment:";

export default function DonasiPageClient() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const [amount, setAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [qrString, setQrString] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [status, setStatus] = useState<"pending" | "paid" | string>("");
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [expiredAt, setExpiredAt] = useState("");

  // keep a ref to avoid race conditions in polling
  const transactionRef = useRef<string | null>(null);

  const finalAmount = useMemo(() => {
    const v = Number(customAmount || amount);
    return Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
  }, [amount, customAmount]);

  const presets = [10000, 25000, 50000, 100000];

  /* --- Local storage helpers --- */
  function saveToLocal(id: string, data: Omit<StoredPayment, "savedAt">) {
    try {
      const payload: StoredPayment = { ...data, savedAt: Date.now() };
      localStorage.setItem(LOCAL_PREFIX + id, JSON.stringify(payload));
    } catch (e) {
      // ignore storage errors
      console.warn("localStorage save failed", e);
    }
  }

  function loadFromLocal(id: string): StoredPayment | null {
    try {
      const raw = localStorage.getItem(LOCAL_PREFIX + id);
      if (!raw) return null;
      return JSON.parse(raw) as StoredPayment;
    } catch {
      return null;
    }
  }

  function removeFromLocal(id: string) {
    try {
      localStorage.removeItem(LOCAL_PREFIX + id);
    } catch { }
  }

  function updateUrlPaymentId(id?: string) {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      if (id) {
        url.searchParams.set("paymentId", id);
      } else {
        url.searchParams.delete("paymentId");
      }
      // important: replaceState doesn't trigger navigation / remount
      window.history.replaceState({}, "", url.toString());
    } catch (e) {
      // ignore
    }
  }

  /* --- Load when there's a paymentId in URL --- */
  useEffect(() => {
    if (!paymentId) return;

    let mounted = true;
    const local = loadFromLocal(paymentId);
    if (local) {
      // set immediate state from localStorage to avoid flicker
      setQrString(local.qrString);
      setTransactionId(local.transactionId);
      transactionRef.current = local.transactionId;
      setTotalAmount(local.totalAmount);
      setExpiredAt(local.expiredAt);
      setStatus(local.status as any);
    }

    // Now fetch fresh data from server and override if needed
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: paymentId }),
        });
        const data = await res.json();
        if (!mounted) return;
        if (data?.data) {
          const d = data.data;
          setQrString(d.qr_string || (local && local.qrString) || "");
          setTransactionId(paymentId);
          transactionRef.current = paymentId;
          setTotalAmount(d.totalAmount ?? d.originalAmount ?? (local && local.totalAmount) ?? 0);
          setExpiredAt(d.expiredAt || (local && local.expiredAt) || new Date(Date.now() + 10 * 60 * 1000).toISOString());
          setStatus(d.status || (local && local.status) || "pending");

          // keep localStorage in sync
          saveToLocal(paymentId, {
            qrString: d.qr_string || (local && local.qrString) || "",
            transactionId: paymentId,
            totalAmount: d.totalAmount ?? d.originalAmount ?? (local && local.totalAmount) ?? 0,
            expiredAt: d.expiredAt || (local && local.expiredAt) || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            status: d.status || (local && local.status) || "pending",
          });
        } else {
          // If server returned nothing and no local, clear UI
          if (!local) {
            setQrString("");
            setTransactionId("");
            setTotalAmount(0);
            setExpiredAt("");
            setStatus("");
          }
        }
      } catch (e) {
        console.error("Failed to fetch check-status", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  /* --- Generate QR --- */
  const handleGenerate = async () => {
    if (!finalAmount) return;
    setLoading(true);
    try {
      const res = await fetch("/api/qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: process.env.ID_QRIS,
          amount: finalAmount,
          useUniqueCode: true,
          packageIds: ["id.dana"],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Gagal membuat QRIS");
      }

      const data = await res.json();
      const newPaymentId = data.data.transactionId;

      // update UI immediately
      setQrString(data.data.qr_string);
      setTransactionId(newPaymentId);
      transactionRef.current = newPaymentId;
      setTotalAmount(data.data.totalAmount ?? finalAmount);
      setExpiredAt(
        data.data.expiredAt || new Date(Date.now() + 10 * 60 * 1000).toISOString()
      );
      setStatus("pending");

      // persist to localStorage so refresh is instant
      saveToLocal(newPaymentId, {
        qrString: data.data.qr_string,
        transactionId: newPaymentId,
        totalAmount: data.data.totalAmount ?? finalAmount,
        expiredAt: data.data.expiredAt || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        status: "pending",
      });

      // update URL WITHOUT navigation (no remount)
      updateUrlPaymentId(newPaymentId);
    } catch (e: any) {
      alert(e?.message || "Gagal membuat QRIS. Periksa koneksi atau API.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* --- Polling status --- */
  useEffect(() => {
    if (!transactionId) return;
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch("/api/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId }),
        });
        const data = await res.json();
        if (!mounted) return;
        if (data?.data) {
          setStatus(data.data.status);
          // sync local
          saveToLocal(transactionId, {
            qrString: data.data.qr_string || qrString,
            transactionId,
            totalAmount: data.data.totalAmount ?? totalAmount,
            expiredAt: data.data.expiredAt || expiredAt,
            status: data.data.status,
          });
        }
      } catch {
        // ignore polling errors
      }
    };

    // initial immediate poll + interval
    poll();
    const id = setInterval(poll, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  /* --- Reset flow (remove query & local) --- */
  const handleReset = () => {
    if (transactionId) {
      removeFromLocal(transactionId);
    }
    setQrString("");
    setTransactionId("");
    setStatus("");
    setTotalAmount(0);
    setExpiredAt("");
    // remove paymentId from URL (without navigation)
    updateUrlPaymentId(undefined);
  };

  return (
    <main className="min-h-screen bg-black text-slate-100 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMzMzMyIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center text-slate-400 hover:text-sky-400 transition"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </a>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <p className="mt-3 text-slate-400 text-sm">Memuat informasi pembayaran...</p>
          </div>
        ) : !qrString ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 shadow-xl"
          >
            {/* Background Image */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/thumb2.jpg')" }}></div>
            </div>

            <div className="relative z-10 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Heart className="h-7 w-7 text-slate-400" />
                <h2 className="text-xl font-medium text-white">
                  Pilih Nominal Donasi
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {presets.map((p) => (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAmount(p);
                      setCustomAmount("");
                    }}
                    className={classNames(
                      amount === p && !customAmount
                        ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg"
                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-800/70 border border-slate-700/50",
                      "w-full rounded-xl px-4 py-5 text-sm font-semibold transition-all"
                    )}
                  >
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0
                    }).format(p)}
                  </motion.button>
                ))}
              </div>

              <div className="mt-8">
                <label className="block text-sm font-medium text-slate-300 mb-3">Jumlah Custom</label>
                <input
                  type="number"
                  min={1000}
                  placeholder="Contoh: 75000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-5 py-4 text-slate-100 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-900/40 outline-none transition"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={loading || !finalAmount}
                className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Membuat QR..." : "Buat QRIS Sekarang"}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <QRCodeCard
              qrString={qrString}
              transactionId={transactionId}
              totalAmount={totalAmount}
              expiredAt={expiredAt}
              status={status}
            />

            <div className="flex items-center justify-between bg-slate-900/30 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-800/50">
              <div className="text-sm text-slate-300">
                Status:{" "}
                <span className={classNames(
                  status === "paid" ? "text-emerald-400" :
                    status === "pending" ? "text-amber-400" : "text-rose-400",
                  "font-semibold"
                )}>
                  {status}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="rounded-xl bg-slate-800/50 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800/70 border border-slate-700/50 transition"
              >
                Buat QR Baru
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
            <span>Powered by</span>
            <a
              href="https://maelyn.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 font-medium hover:text-slate-600 transition"
            >
              Maelyn Group
            </a>
            <span className="hidden sm:inline text-slate-800">•</span>
            <span>Payment Gateway by</span>
            <a
              href="https://cashify.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 font-medium hover:text-slate-600 transition"
            >
              Cashify
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}