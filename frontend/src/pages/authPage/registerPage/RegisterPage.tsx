import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../../../api/auth";
import "../auth-page.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        full_name: trimmedName,
        email: trimmedEmail,
        password,
      });

      setFullName("");
      setEmail("");
      setPassword("");

      navigate("/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page auth-page--register">
      <div className="auth-page__card">
        <h1 className="auth-page__title">Register</h1>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label className="auth-page__field">
            <span className="auth-page__label">Full name</span>
            <input
              className="auth-page__input"
              type="text"
              placeholder="Your full name"
              value={fullName}
              autoComplete="name"
              disabled={loading}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label className="auth-page__field">
            <span className="auth-page__label">Email</span>
            <input
              className="auth-page__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              autoComplete="email"
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-page__field">
            <span className="auth-page__label">Password</span>
            <input
              className="auth-page__input"
              type="password"
              placeholder="Create a password"
              value={password}
              autoComplete="new-password"
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button className="auth-page__submit" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Create account"}
          </button>

          {error && <p className="auth-page__error">{error}</p>}
        </form>

        <p className="auth-page__footer">
          Already have an account?{" "}
          <Link className="auth-page__link" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
