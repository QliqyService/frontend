import { Link } from "react-router-dom";


export function NotFoundPage() {
  return (
    <section className="page-shell">
      <div className="panel stack">
        <div className="eyebrow">404</div>
        <h1>Page not found</h1>
        <p>The route does not exist in this frontend.</p>
        <Link to="/forms" className="primary-button">
          Go to dashboard
        </Link>
      </div>
    </section>
  );
}
