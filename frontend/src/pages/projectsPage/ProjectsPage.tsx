import Layout from "../../components/layout/Layout";
import { FileText, Plus, Search } from "lucide-react";
import "./projects-page.css";

const noteGroups = [
  "Clippings",
  "Daily",
  "Ideas",
  "Meta",
  "Projects",
  "References",
];

const notes = [
  "Evergreen notes turn ideas into objects",
  "Calmness is a superpower",
  "Travel",
  "Creativity is combinatory uniqueness",
  "Emergence",
  "Recipes",
  "Books",
  "Health",
];

export default function ProjectsPage() {
  return (
    <Layout>
      <div className="projects-layout">
        <aside className="projects-sidebar">
          <section className="projects-sidebar__panel">
            <div className="projects-sidebar__actions">
              <button className="projects-action-btn" aria-label="Open note">
                <FileText size={16} />
              </button>
              <button className="projects-action-btn" aria-label="Create note">
                <Plus size={16} />
              </button>
              <button className="projects-action-btn" aria-label="Search">
                <Search size={16} />
              </button>
            </div>

            <h2 className="projects-sidebar__heading">Notes</h2>

            <nav className="projects-groups" aria-label="Folders">
              {noteGroups.map((group) => (
                <button key={group} className="projects-groups__item">
                  <span className="projects-groups__chevron">{">"}</span>
                  {group}
                </button>
              ))}
            </nav>

            <div className="projects-sidebar__divider" />

            <ul className="projects-notes">
              {notes.map((note, index) => (
                <li
                  key={note}
                  className={
                    index === 1
                      ? "projects-notes__item projects-notes__item--active"
                      : "projects-notes__item"
                  }
                >
                  {note}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="projects-main">
          <header className="projects-main__breadcrumbs">
            <span>Ideas</span>
            <span className="projects-main__separator">/</span>
            <span className="projects-main__current">Writing is telepathy</span>
          </header>

          <section className="projects-main__content">
            <article className="note">
              <h1 className="note__title">Writing is telepathy</h1>

              <div className="note__meta">
                <span className="note__tag">#evergreen</span>
                <span className="note__source">From On Writing</span>
              </div>

              <h2 className="note__subtitle">
                Ideas can travel through time and space
              </h2>

              <p>
                Ideas can travel through time and space without being uttered
                out loud. The process of telepathy requires two places: a
                sending place and a receiving place.
              </p>

              <ul>
                <li>
                  A sending place where writer shapes thought into language.
                </li>
                <li>
                  A receiving place where the reader reconstructs that idea.
                </li>
              </ul>

              <blockquote className="note__quote">
                The most powerful notes are simple, linked, and revisitable.
              </blockquote>
            </article>
          </section>
        </main>
      </div>
    </Layout>
  );
}