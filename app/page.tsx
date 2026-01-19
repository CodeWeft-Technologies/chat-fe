'use client';
import { useEffect, useState } from "react";
import PublicHomepage from "./public-home";
import DashboardHome from "./dashboard-home";
import AuthGate from "./components/auth-gate";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(t);
    setIsLoaded(true);
  }, []);

  // Show public homepage if not authenticated
  if (!isLoaded) return null;
  if (!token) return <PublicHomepage />;

  // Show dashboard for authenticated users with auth verification
  return (
    <>
      <AuthGate />
      <DashboardHome />
    </>
  );
}
