"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHome from "../dashboard-home";
import AuthGate from "../components/auth-gate";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!t) {
      router.push("/login");
      return;
    }
    setIsLoaded(true);
  }, [router]);

  if (!isLoaded) return null;

  return (
    <>
      <AuthGate />
      <DashboardHome />
    </>
  );
}
