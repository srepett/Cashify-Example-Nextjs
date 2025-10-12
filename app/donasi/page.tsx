"use client";

import { Suspense } from "react";
import DonasiPageClient from "./DonasiPageClient";

export default function DonasiPage() {
  return (
    <Suspense fallback={<div>Memuat halaman donasi...</div>}>
      <DonasiPageClient />
    </Suspense>
  );
}
