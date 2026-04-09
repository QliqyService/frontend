import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { api } from "../lib/api";
import { useAuth } from "../lib/auth";


export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/forms";

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/forms" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === "register") {
      if (firstName.trim().length < 2) {
        setError("First name must be at least 2 characters.");
        return;
      }

      if (lastName.trim() && lastName.trim().length < 2) {
        setError("Last name must be at least 2 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await api.register({
          email,
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          password,
        });
      }

      await login(email, password);
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === "register"
            ? "Sign up failed"
            : "Login failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel auth-copy">
        <div className="eyebrow">Qliqy frontend</div>
        <h1>Private contact pages with a proper frontend this time.</h1>
        <p>
          Manage forms, share a public page, collect comments, and keep personal contacts out of public view.
        </p>
      </section>

      <section className="auth-panel">
        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <div className="eyebrow">{mode === "register" ? "Sign up" : "Sign in"}</div>
            <h2>{mode === "register" ? "Create your Qliqy account" : "Access your forms"}</h2>
          </div>

          <div className="auth-switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === "login" ? "primary-button" : "secondary-button"}
              onClick={() => {
                setMode("login");
                setError(null);
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "register" ? "primary-button" : "secondary-button"}
              onClick={() => {
                setMode("register");
                setError(null);
              }}
            >
              Sign up
            </button>
          </div>

          {mode === "register" ? (
            <div className="split-fields">
              <label className="field">
                <span>First name</span>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="John"
                  minLength={2}
                  maxLength={20}
                  required
                />
              </label>

              <label className="field">
                <span>Last name</span>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Doe"
                  maxLength={20}
                />
              </label>
            </div>
          ) : null}

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

          <label className="field">
            <span>{mode === "register" ? "Create password" : "Password"}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
              required
            />
          </label>

          {mode === "register" ? (
            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                required
              />
            </label>
          ) : null}

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "register"
                ? "Creating account..."
                : "Signing in..."
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </button>

          {mode === "login" ? (
            <p className="auth-footnote">
              Forgot your password? <Link className="text-link" to="/forgot-password">Reset it</Link>
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
