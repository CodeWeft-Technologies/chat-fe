"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { verifyToken } from "../lib/api";

export default function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const verifyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const isPublicRoute = pathname === "/login" || pathname === "/register" || pathname?.startsWith("/embed");
    
    // Initial check
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!t && !isPublicRoute) {
        router.push("/login");
        return;
      }
    } catch {}
    
    // Periodic token validation for protected routes
    if (!isPublicRoute) {
      // Verify token immediately
      verifyToken().catch(() => {
        // Token is invalid, redirect handled by verifyToken
      });
      
      // Set up periodic verification (every 5 minutes)
      verifyIntervalRef.current = setInterval(() => {
        verifyToken().catch(() => {
          // Token is invalid, redirect handled by verifyToken
        });
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    // Cleanup interval on unmount or route change
    return () => {
      if (verifyIntervalRef.current) {
        clearInterval(verifyIntervalRef.current);
        verifyIntervalRef.current = null;
      }
    };
  }, [pathname, router]);
  
  return null;
}
