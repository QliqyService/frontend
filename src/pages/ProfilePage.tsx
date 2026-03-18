import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { formatDate, normalizePhone } from "../lib/format";


export function ProfilePage() {
  const { token, user, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramAccount, setTelegramAccount] = useState("");
  const [notifyEmailEnabled, setNotifyEmailEnabled] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEmail(user?.email ?? "");
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
    setPhone(user?.phone ? String(user.phone) : "");
    setTelegramAccount(user?.tg_account ?? "");
    setNotifyEmailEnabled(user?.notify_email_enabled ?? false);
    setNotifyEmail(user?.notify_email ?? "");
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await api.updateMe(token, {
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: normalizePhone(phone) ?? null,
        tg_account: telegramAccount || null,
        notify_email_enabled: notifyEmailEnabled,
        notify_email: notifyEmail || null,
      });
      await refreshUser();
      setSuccess("Profile updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page-shell stack-lg">
      <header className="page-header">
        <div>
          <div className="eyebrow">Account</div>
          <h1>Profile settings</h1>
        </div>
      </header>

      <div className="details-grid profile-grid">
        <section className="panel stack">
          <div>
            <div className="eyebrow">Identity</div>
            <h2>Personal details</h2>
          </div>

          <form className="stack" onSubmit={handleSubmit}>
            <div className="split-fields">
              <label className="field">
                <span>First name</span>
                <input value={firstName} onChange={(event) => setFirstName(event.target.value)} maxLength={64} />
              </label>

              <label className="field">
                <span>Last name</span>
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} maxLength={64} />
              </label>
            </div>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={100}
                required
              />
            </label>

            <label className="field">
              <span>Phone</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 555 123 4567"
              />
            </label>

            <label className="field">
              <span>Telegram account</span>
              <input
                value={telegramAccount}
                onChange={(event) => setTelegramAccount(event.target.value)}
                placeholder="@your_handle"
              />
            </label>

            <section className="profile-notify-card">
              <div>
                <div className="eyebrow">Notifications</div>
                <h3>Email notifications</h3>
                <p className="muted">
                  Receive email alerts when somebody leaves a new comment on your form.
                </p>
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={notifyEmailEnabled}
                  onChange={(event) => setNotifyEmailEnabled(event.target.checked)}
                />
                <span>Enable mail notifications</span>
              </label>

              <label className="field">
                <span>Notification email</span>
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(event) => setNotifyEmail(event.target.value)}
                  placeholder="Optional. Falls back to account email."
                />
              </label>
            </section>

            {error ? <p className="error-text">{error}</p> : null}
            {success ? <p className="success-text">{success}</p> : null}

            <div className="actions">
              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>
        </section>

        <aside className="panel stack">
          <div>
            <div className="eyebrow">Status</div>
            <h2>Notification channels</h2>
          </div>

          <div className="profile-channel-card">
            <strong>Telegram</strong>
            <p className="muted">
              {user?.tg_account
                ? `New comments will be sent to ${user.tg_account}.`
                : "Add your Telegram account to enable comment alerts there."}
            </p>
          </div>

          <div className="profile-channel-card">
            <strong>Email</strong>
            <p className="muted">
              {notifyEmailEnabled
                ? `Enabled for ${notifyEmail || user?.email || "your account email"}.`
                : "Disabled. Turn it on in the form to receive mail alerts."}
            </p>
          </div>

          <div className="profile-channel-card">
            <strong>Public code</strong>
            <p className="profile-code">{user?.usercode || "-"}</p>
            <p className="muted">Use this code where account linking or identity lookup is required.</p>
          </div>

          <dl className="meta-grid">
            <div>
              <dt>Created</dt>
              <dd>{formatDate(user?.created_at)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(user?.updated_at)}</dd>
            </div>
            <div>
              <dt>Verified</dt>
              <dd>{user?.is_verified ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
