import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../lib/api";


export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? searchParams.get("code") ?? "";
  const emailFromQuery = searchParams.get("email") ?? "";

  const [token, setToken] = useState(tokenFromQuery);
  const [email, setEmail] = useState(emailFromQuery);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const isTokenPrefilled = useMemo(() => Boolean(tokenFromQuery), [tokenFromQuery]);

  useEffect(() => {
    if (!tokenFromQuery) {
      return;
    }

    let cancelled = false;

    async function verifyEmail() {
      setError(null);
      setSuccess(null);
      setIsSubmitting(true);

      try {
        await api.verifyToken(tokenFromQuery);
        if (!cancelled) {
          setSuccess("Email verified. You can sign in normally now.");
        }
      } catch (submitError) {
        if (!cancelled) {
          setError(submitError instanceof Error ? submitError.message : "Failed to verify email");
        }
      } finally {
        if (!cancelled) {
          setIsSubmitting(false);
        }
      }
    }

    void verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [tokenFromQuery]);

  async function handleManualVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token.trim()) {
      setError("Verification token is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.verifyToken(token.trim());
      setSuccess("Email verified. You can sign in normally now.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to verify email");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Email is required to resend the verification link.");
      return;
    }

    setIsRequesting(true);

    try {
      await api.requestVerifyToken(email.trim());
      setSuccess("Verification email requested. Check your inbox for a fresh link.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to request verification email");
    } finally {
      setIsRequesting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel auth-copy">
        <div className="eyebrow">Email verification</div>
        <h1>Confirm your email address to keep your account active.</h1>
        <p>Open the verification link from your inbox or paste the token manually if needed.</p>
      </section>

      <section className="auth-panel">
        <div className="stack-lg">
          <form className="stack" onSubmit={handleManualVerify}>
            <div>
              <div className="eyebrow">Verify email</div>
              <h2>Confirm your account</h2>
            </div>

            <label className="field">
              <span>Verification token</span>
              <textarea
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste the token from your email"
                rows={4}
                readOnly={isTokenPrefilled}
                required
              />
            </label>

            {error ? <p className="error-text">{error}</p> : null}
            {success ? <p className="success-text">{success}</p> : null}

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <form className="stack" onSubmit={handleResendVerification}>
            <div>
              <div className="eyebrow">Need a new link?</div>
              <h2>Resend verification email</h2>
            </div>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>

            <button type="submit" className="secondary-button" disabled={isRequesting}>
              {isRequesting ? "Requesting..." : "Resend verification email"}
            </button>
          </form>

          <p className="auth-footnote">
            Back to <Link className="text-link" to="/login">sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
