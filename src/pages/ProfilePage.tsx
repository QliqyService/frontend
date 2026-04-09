import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { formatDate, normalizePhone } from "../lib/format";

const TELEGRAM_BOT_URL = import.meta.env.VITE_TELEGRAM_BOT_URL || "https://t.me/ErnestoThoughtsBot";
const AVATAR_CACHE_PREFIX = "qliqy.avatar.";

function getAvatarCacheKey(avatarKey: string): string {
  return `${AVATAR_CACHE_PREFIX}${avatarKey}`;
}

function readCachedAvatar(avatarKey: string): string | null {
  try {
    return localStorage.getItem(getAvatarCacheKey(avatarKey));
  } catch {
    return null;
  }
}

function writeCachedAvatar(avatarKey: string, dataUrl: string) {
  try {
    localStorage.setItem(getAvatarCacheKey(avatarKey), dataUrl);
  } catch {
    // Ignore cache write failures caused by storage limits or privacy settings.
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      reject(new Error("Failed to read avatar"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read avatar"));
    reader.readAsDataURL(blob);
  });
}


export function ProfilePage() {
  const { token, user, refreshUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  useEffect(() => {
    setEmail(user?.email ?? "");
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
    setPhone(user?.phone ? String(user.phone) : "");
    setTgNotifyEnabled(user?.tg_notify_enabled ?? false);
    setNotifyEmailEnabled(user?.notify_email_enabled ?? false);
    setNotifyEmail(user?.notify_email ?? "");
  }, [user]);

  useEffect(() => {
    if (!token || !user?.avatar_key) {
      setAvatarUrl(null);
      return;
    }

    let cancelled = false;
    const cachedAvatarUrl = readCachedAvatar(user.avatar_key);
    if (cachedAvatarUrl) {
      setAvatarUrl(cachedAvatarUrl);
    }

    async function loadAvatar() {
      setIsAvatarLoading(true);
      try {
        const avatarBlob = await api.getMyAvatar(token);
        if (!avatarBlob || cancelled) {
          if (!cancelled) {
            setAvatarUrl(null);
          }
          return;
        }

        const nextAvatarUrl = await blobToDataUrl(avatarBlob);
        if (!cancelled) {
          setAvatarUrl(nextAvatarUrl);
        }
        writeCachedAvatar(user.avatar_key, nextAvatarUrl);
      } catch {
        if (!cancelled) {
          setAvatarUrl(cachedAvatarUrl ?? null);
        }
      } finally {
        if (!cancelled) {
          setIsAvatarLoading(false);
        }
      }
    }

    void loadAvatar();

    return () => {
      cancelled = true;
    };
  }, [token, user?.avatar_key]);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile || !token) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsAvatarUploading(true);

    try {
      setAvatarUrl(await blobToDataUrl(nextFile));
      await api.uploadMyAvatar(token, nextFile);
      await refreshUser();
      setSuccess("Avatar updated.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload avatar");
    } finally {
      setIsAvatarUploading(false);
      event.target.value = "";
    }
  }

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
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim() || email.charAt(0) || "Q";
  const telegramLinkUrl = user?.usercode
    ? `${TELEGRAM_BOT_URL}?start=${encodeURIComponent(user.usercode)}`
    : TELEGRAM_BOT_URL;

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
            <section className="profile-avatar-card">
              <div className="profile-avatar-wrap">
                {avatarUrl ? (
                  <img className="profile-avatar-image" src={avatarUrl} alt="Profile avatar" />
                ) : (
                  <div className="profile-avatar-fallback" aria-hidden="true">
                    {initials.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="stack">
                <div>
                  <h3>Profile photo</h3>
                  <p className="muted">
                    Upload a square image to personalize your account. JPG, PNG, WEBP and similar formats work best.
                  </p>
                </div>

                <div className="actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isAvatarUploading}
                  >
                    {isAvatarUploading ? "Uploading..." : "Upload photo"}
                  </button>
                  {isAvatarLoading ? <span className="muted">Loading current photo...</span> : null}
                </div>

                <input
                  ref={avatarInputRef}
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
            </section>

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
                  Not linked yet. Open Telegram from this button and the bot will link your account automatically.
                </p>
                <div className="profile-steps">
                  <span>1. Open the Telegram bot</span>
                  <span>2. Press Start in Telegram</span>
                  <span>3. Wait for the confirmation message</span>
                </div>
              </>
            )}
            <a className="secondary-button" href={telegramLinkUrl} target="_blank" rel="noreferrer">
              {isTelegramLinked ? "Open @ErnestoThoughtsBot" : "Link Telegram automatically"}
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
              Manual fallback only. If automatic linking does not work, send this code to @ErnestoThoughtsBot.
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
