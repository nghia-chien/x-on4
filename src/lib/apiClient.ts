/**
 * Browser fetch helper for session auth via HttpOnly cookie.
 * Always sends credentials; never attaches Bearer tokens from localStorage.
 */
export function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  // Strip any client-supplied Authorization — cookie is the sole session source
  headers.delete("Authorization");

  return fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
}
