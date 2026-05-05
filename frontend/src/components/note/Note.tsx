import { useMemo, useRef, useState } from "react";
import { useSelectedProjectData } from "../../store/projectsSelector";
import { useProjectsStore } from "../../store/projectsStore";
import { Columns2, Eye, PenLine, Redo2, Save, Undo2 } from "lucide-react";
import MarkdownEditor, {
  type MarkdownEditorHandle,
} from "../markdownEditor/MarkdownEditor";
import { renderMarkdown } from "./NotePreview";
import type { Folder, Note as ProjectNote } from "../../api/projects";

type NoteMode = "split" | "edit" | "preview";

export default function Note() {
  const { selectedFolder, selectedNote, notes } = useSelectedProjectData();

  if (!selectedNote) return null;

  return (
    <NoteEditor
      key={selectedNote.id}
      selectedFolder={selectedFolder}
      selectedNote={selectedNote}
      notes={notes}
    />
  );
}

type NoteEditorProps = {
  selectedFolder: Folder | null;
  selectedNote: ProjectNote;
  notes: ProjectNote[];
};

function NoteEditor({ selectedFolder, selectedNote, notes }: NoteEditorProps) {
  const { isSaving, updateNoteContent, openNote } = useProjectsStore();
  const selectedNoteContent = selectedNote.content;
  const [draft, setDraft] = useState(selectedNoteContent);
  const [mode, setMode] = useState<NoteMode>(
    selectedNoteContent ? "preview" : "split",
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [historyState, setHistoryState] = useState({
    canUndo: false,
    canRedo: false,
  });

  const editorRef = useRef<MarkdownEditorHandle | null>(null);
  const preview = useMemo(
    () => renderMarkdown(draft, notes, openNote),
    [draft, notes, openNote],
  );

  const isDirty = selectedNote ? draft !== selectedNote.content : false;

  const modeButtonClass = (buttonMode: NoteMode) =>
    mode === buttonMode
      ? "note__mode-btn note__mode-btn--active"
      : "note__mode-btn";

  const saveNote = async () => {
    await updateNoteContent(selectedNote.id, draft);
    setLastSavedAt(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  };

  return (
    <article className={`note note--${mode}`}>
      <header className="note__header">
        <div className="note__meta">
          <span className="note__tag">note</span>
          {selectedFolder && (
            <span className="note__source">{selectedFolder.path}</span>
          )}
          <span className="note__status">
            {isDirty
              ? "Unsaved changes"
              : lastSavedAt
                ? `Saved ${lastSavedAt}`
                : "Saved"}
          </span>
        </div>

        <div className="note__actions" aria-label="Note view mode">
          <button
            className={modeButtonClass("edit")}
            type="button"
            title="Edit"
            aria-label="Edit"
            onClick={() => setMode("edit")}
          >
            <PenLine size={16} />
          </button>
          <button
            className={modeButtonClass("split")}
            type="button"
            title="Split"
            aria-label="Split"
            onClick={() => setMode("split")}
          >
            <Columns2 size={16} />
          </button>
          <button
            className={modeButtonClass("preview")}
            type="button"
            title="Preview"
            aria-label="Preview"
            onClick={() => setMode("preview")}
          >
            <Eye size={16} />
          </button>
          <button
            className="note__save-btn"
            type="button"
            disabled={!isDirty || isSaving}
            onClick={saveNote}
          >
            <Save size={16} />
            {isSaving ? "Saving" : "Save"}
          </button>
        </div>
      </header>

      <h1 className="note__title">{selectedNote.title}</h1>

      <div className="note__workspace">
        {mode !== "preview" && (
          <section className="note__editor">
            <div className="note__editor-markdown">
              <span>Markdown</span>
              <div className="note__editor-history" aria-label="Editor history">
                <button
                  className="note__history-btn"
                  type="button"
                  title="Undo"
                  aria-label="Undo"
                  disabled={!historyState.canUndo}
                  onClick={() => editorRef.current?.undo()}
                >
                  <Undo2 size={16} />
                </button>
                <button
                  className="note__history-btn"
                  type="button"
                  title="Redo"
                  aria-label="Redo"
                  disabled={!historyState.canRedo}
                  onClick={() => editorRef.current?.redo()}
                >
                  <Redo2 size={16} />
                </button>
              </div>
            </div>

            <MarkdownEditor
              ref={editorRef}
              value={draft}
              onChange={setDraft}
              onHistoryChange={setHistoryState}
            />
          </section>
        )}

        {mode !== "edit" && (
          <section className="note__preview note-preview" aria-label="Preview">
            {draft.trim() ? (
              preview
            ) : (
              <p className="note-preview__empty">This note is empty.</p>
            )}
          </section>
        )}
      </div>
    </article>
  );
}
