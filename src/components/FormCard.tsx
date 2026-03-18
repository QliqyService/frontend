import { Link } from "react-router-dom";

import type { UserForm } from "../types/api";
import { formatDate } from "../lib/format";


export function FormCard({ form }: { form: UserForm }) {
  return (
    <article className="panel form-card">
      <div className="form-card-head">
        <div>
          <div className="eyebrow">{form.is_enabled ? "Active" : "Disabled"}</div>
          <h3>{form.title}</h3>
        </div>
        <Link to={`/forms/${form.id}`} className="text-link">
          Open
        </Link>
      </div>

      <p>{form.description || "No description"}</p>

      <dl className="meta-grid">
        <div>
          <dt>Created</dt>
          <dd>{formatDate(form.created_at)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDate(form.updated_at)}</dd>
        </div>
      </dl>
    </article>
  );
}
