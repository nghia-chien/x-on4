"use client";

import { useId, useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ endpoint = "/api/newsletter" }: { endpoint?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const id = useId();
  const inputId = `${id}-email`;
  const messageId = `${id}-message`;
  const isLoading = status === "loading";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setMessage("You're on the list! Watch your inbox for new drops.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Your email address"
          value={email}
          disabled={isLoading}
          aria-invalid={status === "error"}
          aria-describedby={message ? messageId : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setMessage("");
            }
          }}
          className={`w-full flex-1 rounded-full border bg-white px-5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
            status === "error"
              ? "border-red-400"
              : status === "success"
                ? "border-emerald-400"
                : "border-[#eedad7] hover:border-[#c9a08a]"
          }`}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-black active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9776c] disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading && (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" className="opacity-25" />
              <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
            </svg>
          )}
          {isLoading ? "Subscribing" : "Subscribe"}
        </button>
      </div>

      {/* Vùng thông báo luôn có mặt để screen reader đọc được */}
      <p
        id={messageId}
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
        className={`mt-3 min-h-[1.25rem] text-xs ${
          status === "error" ? "text-red-600" : "text-emerald-700"
        }`}
      >
        {message}
      </p>
    </form>
  );
}