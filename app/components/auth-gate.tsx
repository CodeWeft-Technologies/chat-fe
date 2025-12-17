"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const open = pathname === "/login" || pathname === "/register" || pathname?.startsWith("/embed");
      if (!t && !open) {
        router.push("/login");
      }
    } catch {}
  }, [pathname, router]);
  return null;
}
