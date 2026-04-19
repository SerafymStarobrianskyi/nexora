import Layout from "../../components/layout/Layout";
import "./home-page.css";

export default function HomePage(){
  return (
    <Layout>
      <section className="home-page">
        <article className="note">
          <h1 className="note__title">Writing is telepathy</h1>

          <div className="note__meta">
            <span className="note__tag">#evergreen</span>
            <span className="note__source">From On Writing</span>
          </div>

          <h2 className="note__subtitle">Ideas can travel through time and space</h2>

          <p>
            Ideas can travel through time and space without being uttered out loud.
            The process of telepathy requires two places: a sending place and a receiving place.
          </p>

          <ul>
            <li>A sending place where writer shapes thought into language.</li>
            <li>A receiving place where the reader reconstructs that idea.</li>
          </ul>

          <blockquote className="note__quote">
            The most powerful notes are simple, linked, and revisitable.
          </blockquote>
        </article>
      </section>
    </Layout>
  )
}
