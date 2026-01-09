/**
 * API utility with automatic token expiry handling
 */

function getBackendUrl(): string {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

/**
 * Handles token expiry by redirecting to login
 */
function handleTokenExpiry(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("orgId");
    window.location.href = "/login";
  }
}

/**
 * Makes an API call with automatic token injection and expiry handling
 * Redirects to login if token is expired (401) or invalid
 */
export async function apiCall<T = unknown>(
  path: string,
  opts?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {};
  
  // Copy existing headers
  if (opts?.headers) {
    const h = new Headers(opts.headers);
    h.forEach((v, k) => { headers[k] = v; });
  }
  
  // Inject token
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  const url = path.startsWith("http") ? path : `${getBackendUrl()}${path}`;
  const response = await fetch(url, { ...opts, headers });
  
  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    handleTokenExpiry();
    throw new Error("Authentication expired. Redirecting to login...");
  }
  
  const text = await response.text();
  
  if (!response.ok) {
    try {
      const json = JSON.parse(text);
      throw new Error((json.detail && JSON.stringify(json.detail)) || text || `HTTP ${response.status}`);
    } catch (e) {
      if (e instanceof Error && e.message.includes("Authentication expired")) {
        throw e;
      }
      throw new Error(text || `HTTP ${response.status}`);
    }
  }
  
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * Verifies if the current token is still valid
 * Returns true if valid, false if expired/invalid
 */
export async function verifyToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 401) {
      handleTokenExpiry();
      return false;
    }
    
    return response.ok;
  } catch {
    return false;
  }
}
