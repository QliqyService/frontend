import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../lib/api";


export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await api.forgotPassword(email);
      setSuccess("Reset instructions were requested. Check your email for the token.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to request password reset");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel auth-copy">
        <div className="eyebrow">Password recovery</div>
        <h1>Request a password reset token.</h1>
        <p>Enter your email and Qliqy will send the information needed to restore access.</p>
      </section>

      <section className="auth-panel">
        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <div className="eyebrow">Forgot password</div>
            <h2>Recover your account</h2>
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

          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Requesting..." : "Send reset instructions"}
          </button>

          <p className="auth-footnote">
            Remembered your password? <Link className="text-link" to="/login">Back to sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
