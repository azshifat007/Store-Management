"use client";

import { Suspense } from "react";
import DashboardContent from "./content";
import { DashboardSkeleton } from "./skeleton";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
