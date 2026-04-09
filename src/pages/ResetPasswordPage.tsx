import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../lib/api";


export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";

  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTokenPrefilled = useMemo(() => Boolean(tokenFromQuery), [tokenFromQuery]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.resetPassword(token.trim(), password);
      setSuccess("Password updated. You can sign in with the new password now.");
      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel auth-copy">
        <div className="eyebrow">Password reset</div>
        <h1>Set a new password and get back into Qliqy.</h1>
        <p>Paste the reset token from your email and choose a new password for your account.</p>
      </section>

      <section className="auth-panel">
        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <div className="eyebrow">Reset password</div>
            <h2>Create a new password</h2>
          </div>

          <label className="field">
            <span>Reset token</span>
            <textarea
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste the token from your email"
              rows={4}
              readOnly={isTokenPrefilled}
              required
            />
          </label>

          <label className="field">
            <span>New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          <label className="field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat the new password"
              minLength={6}
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Reset password"}
          </button>

          <p className="auth-footnote">
            Back to <Link className="text-link" to="/login">sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
