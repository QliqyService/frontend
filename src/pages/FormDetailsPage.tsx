import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";
import type { Comment, UserForm } from "../types/api";


export function FormDetailsPage() {
  const { formId = "" } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<UserForm | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const publicUrl = useMemo(() => `${window.location.origin}/public/forms/${formId}`, [formId]);

  useEffect(() => {
    if (token === null) {
      return;
    }
    const authToken: string = token;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [loadedForm, loadedComments] = await Promise.all([
          api.getForm(authToken, formId),
          api.getComments(authToken, formId),
        ]);

        if (!cancelled) {
          setForm(loadedForm);
          setComments(loadedComments);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load form");
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
  }, [token, formId]);

  async function handleDelete() {
    if (token === null || !form || isDeleting) {
      return;
    }
    const authToken: string = token;

    const confirmed = window.confirm(`Disable "${form.title}"?`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteForm(authToken, form.id);
      navigate("/forms");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to disable form");
      setIsDeleting(false);
    }
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
  }

  if (isLoading) {
    return <section className="page-shell">Loading details...</section>;
  }

  if (error) {
    return <section className="page-shell error-text">{error}</section>;
  }

  if (!form) {
    return <section className="page-shell">Form not found.</section>;
  }

  const qrCodeSrc = api.publicQrCodeDataUrl(form.qrcode) ?? api.publicQrCodeUrl(form.id);

  return (
    <section className="page-shell stack-lg">
      <header className="page-header">
        <div>
          <div className="eyebrow">Form details</div>
          <h1>{form.title}</h1>
        </div>
        <div className="actions">
          <Link to={`/forms/${form.id}/edit`} className="secondary-button">
            Edit
          </Link>
          <button type="button" className="ghost-button danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Disabling..." : "Disable"}
          </button>
        </div>
      </header>

      <div className="details-grid">
        <section className="panel stack">
          <div className="eyebrow">{form.is_enabled ? "Active" : "Disabled"}</div>
          <p className="lead">{form.description || "No description provided."}</p>

          <dl className="meta-grid">
            <div>
              <dt>Created</dt>
              <dd>{formatDate(form.created_at)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(form.updated_at)}</dd>
            </div>
            <div>
              <dt>Public page</dt>
              <dd>
                <a href={publicUrl} className="text-link" target="_blank" rel="noreferrer">
                  Open public page
                </a>
              </dd>
            </div>
          </dl>

          <div className="inline-bar">
            <code>{publicUrl}</code>
            <button type="button" className="secondary-button" onClick={() => void handleCopy(publicUrl)}>
              Copy link
            </button>
          </div>
        </section>

        <section className="panel stack">
          <div className="eyebrow">QR code</div>
          <img className="qr-image" src={qrCodeSrc} alt={`QR code for ${form.title}`} />
          <a href={qrCodeSrc} target="_blank" rel="noreferrer" className="text-link">
            Open QR image
          </a>
        </section>
      </div>

      <section className="panel stack">
        <div className="page-header compact">
          <div>
            <div className="eyebrow">Responses</div>
            <h2>Comments</h2>
          </div>
          <span className="pill">{comments.length}</span>
        </div>

        {comments.length === 0 ? <p>No comments yet.</p> : null}

        <div className="comments-list">
          {comments.map((comment) => (
            <article key={comment.id} className="comment-card">
              <header>
                <h3>{comment.title}</h3>
                <span>{formatDate(comment.created_at)}</span>
              </header>
              <p>{comment.description}</p>
              <dl className="comment-meta">
                <div>
                  <dt>Name</dt>
                  <dd>{[comment.first_name, comment.last_name].filter(Boolean).join(" ") || "-"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{comment.phone || "-"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
