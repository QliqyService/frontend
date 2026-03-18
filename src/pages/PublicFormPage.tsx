import { FormEvent, useEffect, useState } from "react";
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
    <div className="public-shell">
      <section className="public-card hero-card">
        <div className="eyebrow">Public contact page</div>
        <h1>{form.title}</h1>
        <p>{form.description || "Leave a message for the owner of this page."}</p>
        <img className="public-qr" src={qrCodeSrc} alt={`QR code for ${form.title}`} />
      </section>

      <section className="public-card">
        <div className="eyebrow">Send a message</div>
        <h2>Comment form</h2>

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
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional" />
          </label>

          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={128} required />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1024}
              rows={6}
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}
          {isSent ? <p className="success-text">Message sent.</p> : null}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
        </form>
      </section>
    </div>
  );
}
