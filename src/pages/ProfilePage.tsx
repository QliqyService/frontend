import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { formatDate, normalizePhone } from "../lib/format";

const TELEGRAM_BOT_URL = import.meta.env.VITE_TELEGRAM_BOT_URL || "https://t.me/ErnestoThoughtsBot";


export function ProfilePage() {
  const { token, user, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [tgNotifyEnabled, setTgNotifyEnabled] = useState(false);
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
    setTgNotifyEnabled(user?.tg_notify_enabled ?? false);
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
        tg_notify_enabled: tgNotifyEnabled,
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

  const isTelegramLinked = Boolean(user?.tg_account);
  const telegramTarget = user?.tg_username ? `@${user.tg_username}` : user?.tg_account;

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

            <section className="profile-notify-card">
              <div>
                <div className="eyebrow">Notifications</div>
                <h3>Telegram notifications</h3>
                <p className="muted">
                  Get instant alerts in Telegram when somebody leaves a new comment on your form.
                </p>
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={tgNotifyEnabled}
                  onChange={(event) => setTgNotifyEnabled(event.target.checked)}
                  disabled={!isTelegramLinked}
                />
                <span>{isTelegramLinked ? "Enable Telegram notifications" : "Link Telegram first"}</span>
              </label>
            </section>

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
            {isTelegramLinked ? (
              <>
                <p className="profile-linked">
                  <span className="profile-checkmark">✓</span>
                  Linked
                </p>
                <p className="muted">
                  {tgNotifyEnabled
                    ? `Enabled for ${telegramTarget || "your linked Telegram account"}.`
                    : `Disabled for ${telegramTarget || "your linked Telegram account"}.`}
                </p>
              </>
            ) : (
              <>
                <p className="muted">
                  Not linked yet. Open the bot, choose Link accounts, and send the code shown below.
                </p>
                <div className="profile-steps">
                  <span>1. Open the Telegram bot</span>
                  <span>2. Press “Link accounts”</span>
                  <span>3. Send your personal code</span>
                </div>
              </>
            )}
            <a className="secondary-button" href={TELEGRAM_BOT_URL} target="_blank" rel="noreferrer">
              Open @ErnestoThoughtsBot
            </a>
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
            <strong>Telegram linking code</strong>
            <p className="profile-code">{user?.usercode || "-"}</p>
            <p className="muted">
              Use this code in @ErnestoThoughtsBot to link your Qliqy profile with Telegram.
            </p>
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
              <dt>Email verified</dt>
              <dd>{user?.is_verified ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
