import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useState } from "react";
import "../auth-page.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login error");
      }
    }
  }

  return (
    <section className="auth-page auth-page--login">
      <div className="auth-page__card">
        <h1 className="auth-page__title">Login</h1>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label className="auth-page__field">
            <span className="auth-page__label">Email</span>
            <input
              className="auth-page__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-page__field">
            <span className="auth-page__label">Password</span>
            <input
              className="auth-page__input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button className="auth-page__submit" type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </button>

          {error && <p className="auth-page__error">{error}</p>}
        </form>

        <p className="auth-page__footer">
          No account yet?{" "}
          <Link className="auth-page__link" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}
