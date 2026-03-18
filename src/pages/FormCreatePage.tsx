import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../lib/auth";
import { api } from "../lib/api";


export function FormCreatePage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const created = await api.createForm(token, { title, description });
      navigate(`/forms/${created.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create form");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">Create</div>
          <h1>New contact form</h1>
        </div>
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
            {isSubmitting ? "Creating..." : "Create form"}
          </button>
        </div>
      </form>
    </section>
  );
}
