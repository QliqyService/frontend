import { Link } from "react-router-dom";


export function EmptyState() {
  return (
    <section className="panel empty-state">
      <div className="eyebrow">No forms yet</div>
      <h2>Create the first contact entry</h2>
      <p>Start with a title and short description. Qliqy will expose a public page and generate a QR code for it.</p>
      <Link to="/forms/new" className="primary-button">
        Create form
      </Link>
    </section>
  );
}
