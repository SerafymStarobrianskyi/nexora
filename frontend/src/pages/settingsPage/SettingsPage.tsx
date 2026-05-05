import { LogOut, Mail, UserRound } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { useAuthStore } from "../../store/authStore";
import "./settings-page.css";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "NX";
  return (
    <Layout>
      <main className="settings-page">
        <section className="settings-hero">
          <span className="settings-kicker">Account settings</span>
        </section>

        <section className="settings-grid">
          <article className="settings-panel settings-panel--profile">
            <div className="settings-profile">
              <div className="settings-profile__avatar">{initials}</div>
              <div>
                <span>Signed in as</span>
                <h2>{user?.full_name || "Nexora user"}</h2>
              </div>
            </div>

            <div className="settings-detail-list">
              <div className="settings-detail">
                <span className="settings-detail__icon">
                  <Mail size={17} />
                </span>
                <div>
                  <span>Email</span>
                  <strong>{user?.email || "No email loaded"}</strong>
                </div>
              </div>
              <div className="settings-detail">
                <span className="settings-detail__icon">
                  <UserRound size={17} />
                </span>
                <div>
                  <span>User id</span>
                  <strong>{user?.id || "Unavailable"}</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="settings-panel settings-panel--danger">
            <span className="settings-kicker">Session</span>
            <h2>Leave this device</h2>
            <p>
              Sign out when you are finished on a shared computer. Your local
              token will be removed and protected pages will require login
              again.
            </p>
            <button type="button" onClick={() => logout()}>
              <LogOut size={17} />
              Logout
            </button>
          </article>
        </section>
      </main>
    </Layout>
  );
}
