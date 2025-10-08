// QRCodeCard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  qrString: string;
  transactionId: string;
  totalAmount: number;
  expiredAt: string; // ISO string
  status: "pending" | "paid" | string;
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function QRCodeCard({ qrString, transactionId, totalAmount, expiredAt, status }: Props) {
  const qrUrl = useMemo(
    () =>
      `https://larabert-qrgen.hf.space/v1/create-qr-code?size=480x480&style=2&color=0ea5e9&data=${encodeURIComponent(qrString)}`,
    [qrString]
  );

  const [remainingMs, setRemainingMs] = useState(() => {
    try {
      return new Date(expiredAt).getTime() - Date.now();
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    setRemainingMs(new Date(expiredAt).getTime() - Date.now());
    const t = setInterval(() => {
      setRemainingMs(new Date(expiredAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [expiredAt]);

  const isExpired = remainingMs <= 0 && status !== "paid";
  const mm = Math.max(0, Math.floor(remainingMs / 60000));
  const ss = Math.max(0, Math.floor((remainingMs % 60000) / 1000));

  const progress = Math.max(0, Math.min(100, (remainingMs / (10 * 60 * 1000)) * 100));

  const statusColor = status === "paid" 
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
    : isExpired 
      ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
      : "bg-amber-500/20 text-amber-400 border-amber-500/30";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full overflow-hidden rounded-3xl bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 shadow-xl"
    >
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-cover bg-center bg-no-repeat" 
             style={{ backgroundImage: "url('/thumb.jpg')" }}></div>
      </div>
      
      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Scan QRIS untuk Donasi</h2>
            <p className="mt-1 text-sm text-slate-400">Gunakan aplikasi bank atau e-wallet untuk menyelesaikan pembayaran.</p>
          </div>

          <span className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold border ${statusColor}`}>
            {isExpired ? "Expired" : status === "paid" ? "Lunas" : "Menunggu"}
          </span>
        </div>

        {/* QR Code */}
        <div className="flex justify-center my-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
            <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4 shadow-2xl">
              <img src={qrUrl} alt="QR Code" width={280} height={280} className="block" />
            </div>
          </motion.div>
        </div>

        {/* Details */}
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-800/30 p-5 border border-slate-700/50 backdrop-blur-sm">
              <dt className="text-xs uppercase tracking-wider text-slate-500 mb-1">Transaction ID</dt>
              <dd className="text-sm font-mono text-slate-200 break-all">{transactionId}</dd>
            </div>

            <div className="rounded-2xl bg-slate-800/30 p-5 border border-slate-700/50 backdrop-blur-sm">
              <dt className="text-xs uppercase tracking-wider text-slate-500 mb-1">Total Donasi</dt>
              <dd className="text-xl font-bold text-sky-400">{formatCurrency(totalAmount)}</dd>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-800/30 p-5 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <dt className="text-xs uppercase tracking-wider text-slate-500">Waktu Tersisa</dt>
              <dd className={`text-lg font-semibold ${isExpired ? "text-rose-400" : "text-white"}`}>
                {isExpired ? "Habis" : `${mm}m ${ss}s`}
              </dd>
            </div>
            
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-slate-700/50 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isExpired ? "bg-rose-500" : "bg-gradient-to-r from-sky-500 to-indigo-500"}`} 
                  style={{ width: `${isExpired ? 0 : progress}%` }} 
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Kedaluwarsa pada: {new Date(expiredAt).toLocaleString("id-ID", { 
                  dateStyle: "short", 
                  timeStyle: "medium" 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}