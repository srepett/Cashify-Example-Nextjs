"use client";

import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-slate-100 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMzMzMyIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />

      {/* Content */}
      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:px-8 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-3xl bg-slate-900/30 backdrop-blur-sm border border-slate-800/50"
        >
          {/* Mobile Background */}
          <div className="md:hidden absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90 z-10"></div>
            <div className="absolute inset-0 mix-blend-soft-light opacity-30">
              <div className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/thumb.jpg')" }}></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 relative z-20">
            {/* Left Section */}
            <div className="flex flex-col justify-center p-12 md:p-16">
              <div className="flex items-center space-x-3 mb-8">
                <Heart className="h-7 w-7 text-slate-400" />
                <h1 className="text-xl font-medium text-white">
                  Donasi untuk Kebaikan
                </h1>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white mb-6">
                Satu Sentuhan, Ribuan Harapan
              </h2>

              <p className="text-slate-400 leading-relaxed mb-8">
                Sistem QRIS kami yang cepat dan aman memungkinkan Anda berbagi kebaikan
                hanya dalam hitungan detik. Donasi Anda menciptakan perubahan nyata bagi banyak orang.
              </p>

              <motion.a
                href="/donasi"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-white text-black px-6 py-3 text-sm font-medium transition hover:bg-slate-200"
              >
                Mulai Donasi Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>

              <p className="mt-4 text-xs text-slate-600">
                Aman, cepat, dan transparan melalui sistem QRIS nasional.
              </p>
            </div>

            {/* Right Visual Section - Desktop */}
            <div className="relative hidden md:flex items-center justify-center bg-slate-900/20 rounded-l-none rounded-3xl overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
              <div className="relative z-10 text-center p-12 w-full h-full flex flex-col items-center justify-end">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-xs"
                >
                  <p className="text-sm text-slate-300 mb-2">
                    Donasi Anda membantu mereka yang membutuhkan
                  </p>
                  <div className="h-px bg-slate-700 w-16 mx-auto mb-3"></div>
                  <p className="text-xs text-slate-500">
                    Scan QRIS untuk memberikan donasi
                  </p>
                </motion.div>
              </div>

              {/* Gambar dengan efek menyatu */}
              <div className="absolute inset-0">
                <div className="relative w-full h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent z-0"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent z-0"></div>

                  {/* Gambar dengan efek blend dan opacity */}
                  <div className="absolute inset-0 mix-blend-soft-light opacity-70">
                    <div className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: "url('/thumb.jpg')" }}></div>
                  </div>

                  {/* Layer tambahan untuk efek depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Call-to-Action */}
          <div className="md:hidden relative z-20 px-12 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 pt-8 border-t border-slate-800/50"
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <div className="h-6 w-6 rounded bg-gradient-to-br from-slate-700 to-slate-800"></div>
                </div>
                <p className="text-sm text-slate-400">
                  Scan QRIS untuk memberikan donasi
                </p>
              </div>
              <p className="text-center text-xs text-slate-600">
                Donasi Anda membantu mereka yang membutuhkan
              </p>
            </motion.div>
          </div>
        </motion.section>

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