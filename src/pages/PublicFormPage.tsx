import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../lib/api";
import { normalizePhone } from "../lib/format";
import type { UserForm } from "../types/api";


export function PublicFormPage() {
  const { formId = "" } = useParams();

  const [form, setForm] = useState<UserForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const publicUrl = useMemo(() => `${window.location.origin}/public/forms/${formId}`, [formId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await api.getPublicForm(formId);
        if (!cancelled) {
          setForm(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load public form");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [formId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setIsSent(false);

    try {
      await api.createComment(formId, {
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        title,
        description,
        phone: normalizePhone(phone),
      });
      setFirstName("");
      setLastName("");
      setTitle("");
      setDescription("");
      setPhone("");
      setIsSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to send comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1600);
  }

  if (isLoading) {
    return <section className="public-shell">Loading public form...</section>;
  }

  if (error && !form) {
    return <section className="public-shell error-text">{error}</section>;
  }

  if (!form) {
    return <section className="public-shell">Form not found.</section>;
  }

  const qrCodeSrc = api.publicQrCodeDataUrl(form.qrcode) ?? api.publicQrCodeUrl(form.id);

  return (
    <div className="public-page">
      <div className="public-page-glow public-page-glow-left" />
      <div className="public-page-glow public-page-glow-right" />

      <div className="public-shell public-shell-enhanced">
        <section className="public-hero">
          <div className="public-brand">
            <span className="public-brand-mark">Q</span>
            <div>
              <strong>Qliqy</strong>
              <p>Private contact page</p>
            </div>
          </div>

          <div className="public-badge">Open for replies</div>
          <h1>{form.title}</h1>
          <p className="public-hero-text">{form.description || "Leave a message for the owner of this page."}</p>

          <div className="public-stat-grid">
            <article className="public-stat-card">
              <span>Response format</span>
              <strong>Private message</strong>
              <p>Your comment goes directly to the form owner.</p>
            </article>
            <article className="public-stat-card">
              <span>Share</span>
              <strong>QR ready</strong>
              <p>Open on mobile or scan the code from another device.</p>
            </article>
          </div>

          <div className="public-qr-card">
            <div>
              <div className="eyebrow">Quick access</div>
              <h2>Scan or copy the page link</h2>
            </div>

            <img className="public-qr public-qr-large" src={qrCodeSrc} alt={`QR code for ${form.title}`} />

            <div className="public-link-box">
              <code>{publicUrl}</code>
              <button type="button" className="secondary-button" onClick={() => void handleCopyLink()}>
                {isCopied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        </section>

        <section className="public-form-card">
          <div className="eyebrow">Send a message</div>
          <h2>Write to the owner</h2>
          <p className="public-form-intro">
            Leave your contact details and a short note. The message will be attached to this form.
          </p>

          <form className="stack" onSubmit={handleSubmit}>
            <div className="split-fields">
              <label className="field">
                <span>First name</span>
                <input value={firstName} onChange={(event) => setFirstName(event.target.value)} maxLength={32} />
              </label>
              <label className="field">
                <span>Last name</span>
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} maxLength={64} />
              </label>
            </div>

            <label className="field">
              <span>Phone</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 555 123 4567" />
            </label>

            <label className="field">
              <span>Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={128}
                placeholder="Short subject"
                required
              />
            </label>

            <label className="field">
              <span>Message</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={1024}
                rows={7}
                placeholder="Tell the owner why you are reaching out."
                required
              />
            </label>

            {error ? <p className="error-text public-feedback">{error}</p> : null}
            {isSent ? <p className="success-text public-feedback">Message sent. You can leave another one if needed.</p> : null}

            <button type="submit" className="primary-button public-submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send message"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
