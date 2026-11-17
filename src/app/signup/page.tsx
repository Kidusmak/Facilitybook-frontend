"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { ArrowLeft, Building2, LockKeyhole, Mail, UserRound } from "lucide-react";

import api from "@/services/api";

interface ApiError {
  message?: string;
  fieldErrors?: Record<string, string>;
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      setSubmitted(true);
    } catch (error: unknown) {
      let errorMessage = "Could not create your account. Please try again.";

      if (axios.isAxiosError<ApiError>(error)) {
        if (!error.response) {
          errorMessage =
            "Cannot connect to the server. Please check that the backend is running.";
        } else {
          errorMessage =
            error.response.data?.message ??
            Object.values(error.response.data?.fieldErrors ?? {})[0] ??
            `${errorMessage} (HTTP ${error.response.status}).`;
        }
      }

      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#edf5f0] p-4">
        <section className="w-full max-w-lg rounded-3xl border border-white bg-white p-8 text-center shadow-[0_25px_80px_rgba(3,48,31,0.12)] sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#08784d]">
            <Building2 size={29} />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-[#14251b]">
            Request submitted
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Your account request for <strong>{email.trim()}</strong> is pending
            administrator approval. You can sign in once your account is
            approved.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#08784d] px-6 text-sm font-bold text-white transition hover:bg-[#065f3c]"
          >
            Return to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf5f0] p-4 sm:p-6">
      <section className="w-full max-w-lg rounded-3xl border border-white bg-white p-7 shadow-[0_25px_80px_rgba(3,48,31,0.12)] sm:p-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#078052] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#08784d] text-white">
            <Building2 size={27} />
          </div>
          <span className="text-2xl font-extrabold text-[#10271b]">
            Facility<span className="text-[#08784d]">Book</span>
          </span>
        </div>

        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[2px] text-[#078052]">
            Create an account
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#14251b]">
            Request access
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            New accounts are assigned the Employee role and require
            administrator approval before sign-in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="full-name"
              className="mb-2 block text-sm font-semibold text-[#25352c]"
            >
              Full name
            </label>
            <div className="relative">
              <UserRound
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                required
                maxLength={150}
                autoComplete="name"
                className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8faf9] pl-12 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#078052] focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#25352c]"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
                maxLength={255}
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8faf9] pl-12 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#078052] focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#25352c]"
            >
              Password
            </label>
            <div className="relative">
              <LockKeyhole
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                maxLength={100}
                autoComplete="new-password"
                className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8faf9] pl-12 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#078052] focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-semibold text-[#25352c]"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8faf9] px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#078052] focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
          </div>

          {message && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#08784d] to-[#079765] font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:from-[#065f3c] hover:to-[#08784d] focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting request..." : "Request an account"}
          </button>
        </form>
      </section>
    </main>
  );
}
