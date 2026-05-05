import type { ReactNode } from "react";
import type { Note } from "../../api/projects";

function renderInline(
  text: string,
  notes: Note[],
  onOpenNote: (noteId: string) => void,
): ReactNode[] {
  const parts = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("[[") && part.endsWith("]]")) {
      const targetTitle = part.slice(2, -2).trim();
      const targetNote = notes.find(
        (note) =>
          note.title.toLocaleLowerCase() === targetTitle.toLocaleLowerCase(),
      );

      if (!targetNote) {
        return (
          <span
            className="note-preview__link note-preview__link--missing"
            key={`${part}-${index}`}
          >
            {targetTitle}
          </span>
        );
      }

      return (
        <button
          className="note-preview__link"
          key={`${part}-${index}`}
          onClick={() => onOpenNote(targetNote.id)}
        >
          {targetNote.title}
        </button>
      );
    }

    if (part.startsWith("[") && part.endsWith("]")) {
      let url = part.slice(1, -1);

      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          key={`${part}-${index}`}
          className="note-preview__link-normal"
        >
          {part.slice(1, -1)}
        </a>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return part;
  });
}

export function renderMarkdown(
  markdown: string,
  notes: Note[],
  onOpenNote: (noteId: string) => void,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const codeLines: string[] = [];
  let isCodeBlock = false;
  let key = 0;

  const pushCodeBlock = () => {
    nodes.push(
      <pre className="note-preview__code" key={`code-${key}`}>
        <code>{codeLines.join("\n")}</code>
      </pre>,
    );
    codeLines.length = 0;
    key += 1;
  };

  markdown.split(/\r?\n/).forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (isCodeBlock) {
        pushCodeBlock();
      }

      isCodeBlock = !isCodeBlock;
      return;
    }
    if (isCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      nodes.push(
        <div
          className="note-preview__space"
          aria-hidden="true"
          key={`space-${key}`}
        />,
      );
      key += 1;
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const content = renderInline(heading[2], notes, onOpenNote);
      const HeadingTag = `h${level + 1}` as "h2" | "h3" | "h4";

      nodes.push(<HeadingTag key={`heading-${key}`}>{content}</HeadingTag>);
      key += 1;
      return;
    }

    if (line.startsWith("> ")) {
      nodes.push(
        <blockquote key={`quote-${key}`}>
          {renderInline(line.slice(2), notes, onOpenNote)}
        </blockquote>,
      );
      key += 1;
      return;
    }

    if (line.startsWith("- ")) {
      nodes.push(
        <p className="note-preview__list-item" key={`list-${key}`}>
          <span aria-hidden="true" />
          {renderInline(line.slice(2), notes, onOpenNote)}
        </p>,
      );
      key += 1;
      return;
    }

    nodes.push(
      <p key={`paragraph-${key}`}>{renderInline(line, notes, onOpenNote)}</p>,
    );
    key += 1;
  });
  if (isCodeBlock) {
    pushCodeBlock();
  }

  return nodes;
}
