import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../lib/auth";
import { userDisplayName } from "../lib/format";


export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/forms" className="brand">
          <span className="brand-mark">Q</span>
          <div>
            <strong>Qliqy</strong>
            <p>Private contact forms</p>
          </div>
        </Link>

        <nav className="nav">
          <NavLink to="/forms">My forms</NavLink>
          <NavLink to="/forms/new">Create form</NavLink>
        </nav>

        <div className="sidebar-card">
          <div className="eyebrow">Signed in</div>
          <strong>{userDisplayName(user?.first_name, user?.last_name, user?.email)}</strong>
          <p>{user?.email}</p>
          <button type="button" className="secondary-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
