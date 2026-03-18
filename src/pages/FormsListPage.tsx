import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { FormCard } from "../components/FormCard";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import type { UserForm } from "../types/api";


export function FormsListPage() {
  const { token, user } = useAuth();
  const [forms, setForms] = useState<UserForm[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        const data = user?.is_superuser ? await api.getAllForms(authToken) : await api.getForms(authToken);
        if (!cancelled) {
          setForms(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load forms");
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
  }, [token, user?.is_superuser]);

  if (isLoading) {
    return <section className="page-shell">Loading forms...</section>;
  }

  if (error) {
    return <section className="page-shell error-text">{error}</section>;
  }

  return (
    <section className="page-shell stack-lg">
      <header className="page-header">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1>{user?.is_superuser ? "Forms visible for current admin scope" : "My forms"}</h1>
        </div>
        <Link to="/forms/new" className="primary-button">
          New form
        </Link>
      </header>

      {forms.length === 0 ? <EmptyState /> : null}

      <div className="grid">
        {forms.map((form) => (
          <FormCard key={form.id} form={form} />
        ))}
      </div>
    </section>
  );
}
