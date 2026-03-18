import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../lib/auth";
import { api } from "../lib/api";


export function FormEditPage() {
  const { formId = "" } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const form = await api.getForm(authToken, formId);
        if (!cancelled) {
          setTitle(form.title);
          setDescription(form.description || "");
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (token === null) {
      return;
    }
    const authToken: string = token;

    setError(null);
    setIsSubmitting(true);

    try {
      await api.updateForm(authToken, formId, { title, description });
      navigate(`/forms/${formId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update form");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <section className="page-shell">Loading form...</section>;
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">Edit</div>
          <h1>Update form</h1>
        </div>
        <Link to={`/forms/${formId}`} className="secondary-button">
          Cancel
        </Link>
      </div>

      <form className="panel stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={128} required />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={256}
            rows={5}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="actions">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
