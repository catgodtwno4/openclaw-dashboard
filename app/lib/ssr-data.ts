/**
 * SSR data fetching utility.
 * Used by Next.js Server Components to fetch dashboard data
 * directly from the Gateway API at request time (no client-side fetch delay).
 */
import { cookies } from 'next/headers';

const GATEWAY_URL = 'http://127.0.0.1:8090';

export async function fetchDashboardData() {
  const cookieStore = await cookies();
  const cfAuth = cookieStore.get('CF_Authorization');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward Cloudflare Access token if present
  if (cfAuth?.value) {
    headers['Cf-Access-Authenticated-User-Email'] = 'system@localhost';
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/api/data`, {
      headers,
      next: { revalidate: 60 }, // ISR: cache for 60 seconds
    });

    if (!res.ok) {
      throw new Error(`Gateway responded ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('[SSR] Failed to fetch dashboard data:', err);
    return null;
  }
}

export async function fetchMemoryFiles() {
  const cookieStore = await cookies();
  const cfAuth = cookieStore.get('CF_Authorization');

  const headers: Record<string, string> = {};
  if (cfAuth?.value) {
    headers['Cf-Access-Authenticated-User-Email'] = 'system@localhost';
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/api/memory/files`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchMemoryFile(path: string) {
  const cookieStore = await cookies();
  const cfAuth = cookieStore.get('CF_Authorization');

  const headers: Record<string, string> = {};
  if (cfAuth?.value) {
    headers['Cf-Access-Authenticated-User-Email'] = 'system@localhost';
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/api/memory/file?path=${encodeURIComponent(path)}`, {
      headers,
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
