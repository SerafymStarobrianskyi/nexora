import {
  ArrowRight,
  Braces,
  FileText,
  FolderTree,
  Link2,
  Network,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import "./home-page.css";

const quickStart = [
  {
    icon: FolderTree,
    title: "Create a workspace",
    text: "Keep one workspace for one topic, course, product, or research area.",
  },
  {
    icon: FileText,
    title: "Write small files",
    text: "One file should capture one useful idea, decision, recipe, or reference.",
  },
  {
    icon: Link2,
    title: "Link related ideas",
    text: "Use note titles or slugs in links so Nexora can connect files into a graph.",
  },
  {
    icon: Network,
    title: "Open the graph",
    text: "Use Graph in Projects to see folders, files, and links in the current workspace.",
  },
];

const markdownTips = [
  { syntax: "# Title", label: "Main heading" },
  { syntax: "## Section", label: "Section heading" },
  { syntax: "**bold**", label: "Strong emphasis" },
  { syntax: "*italic*", label: "Soft emphasis" },
  { syntax: "- Item", label: "Bullet list" },
  { syntax: "> Quote", label: "Callout or quote" },
  { syntax: "`code`", label: "Inline code" },
  { syntax: "```js", label: "Code block" },
];

export default function HomePage() {
  return (
    <Layout>
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero__copy">
            <span className="home-kicker">
              <Sparkles size={15} />
              Nexora workspace guide
            </span>
            <h1>Write notes that can find each other later.</h1>
            <p>
              Nexora works best when files are short, linked, and easy to
              revisit. Use Projects for your knowledge base, Markdown for
              structure, and Graph to see how ideas connect.
            </p>
          </div>

          <Link className="home-hero__button" to="/projects">
            Open Projects
            <ArrowRight size={16} />
          </Link>
        </section>

        <section
          className="home-grid home-grid--steps"
          aria-label="Quick start"
        >
          {quickStart.map((item) => {
            const Icon = item.icon;

            return (
              <article className="home-card" key={item.title}>
                <span className="home-card__icon">
                  <Icon size={18} />
                </span>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            );
          })}
        </section>

        <section className="home-panel">
          <div className="home-panel__header">
            <div>
              <span className="home-kicker">
                <Braces size={15} />
                Markdown basics
              </span>
              <h2>Use simple marks to give notes structure.</h2>
            </div>
          </div>

          <div className="home-markdown-list">
            {markdownTips.map((item) => (
              <div className="home-markdown-row" key={item.syntax}>
                <code>{item.syntax}</code>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
