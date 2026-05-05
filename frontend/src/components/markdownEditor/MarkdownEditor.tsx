import {
  autocompletion,
  CompletionContext,
  startCompletion,
  type Completion,
} from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  redo,
  redoDepth,
  undo,
  undoDepth,
} from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import {
  defaultHighlightStyle,
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import {
  crosshairCursor,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useSelectedProjectData } from "../../store/projectsSelector";
import { useProjectsStore } from "../../store/projectsStore";
import type { Note } from "../../api/projects";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
};

export type MarkdownEditorHandle = {
  undo: () => void;
  redo: () => void;
  focus: () => void;
};

function renderNoteLinkOption(note: Note) {
  const option = document.createElement("div");
  option.className = "note-link-suggest";

  const title = document.createElement("strong");
  title.textContent = note.title;

  const slug = document.createElement("small");
  slug.textContent = note.slug;

  option.append(title, slug);
  return option;
}

function renderNoteLinkInfo(text: string) {
  const option = document.createElement("div");
  option.className = "note-link-suggest note-link-suggest--empty";
  option.textContent = text;

  return option;
}

function shouldOpenNoteLinkSuggest(view: EditorView) {
  const selection = view.state.selection.main;

  if (!selection.empty) {
    return false;
  }

  const line = view.state.doc.lineAt(selection.head);
  const beforeCursor = line.text.slice(0, selection.head - line.from);

  return /\[\[[^\][]*$/.test(beforeCursor);
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  ({ value, onChange, onHistoryChange }, ref) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);
    const { notes } = useSelectedProjectData();
    const { selectedNoteId } = useProjectsStore();

    useImperativeHandle(ref, () => ({
      undo() {
        if (viewRef.current) {
          undo(viewRef.current);
          viewRef.current.focus();
        }
      },
      redo() {
        if (viewRef.current) {
          redo(viewRef.current);
          viewRef.current.focus();
        }
      },
      focus() {
        viewRef.current?.focus();
      },
    }));

    const noteLinkCompletions = useMemo(() => {
      const linkableNotes = notes.filter((note) => note.id !== selectedNoteId);

      return (context: CompletionContext) => {
        const match = context.matchBefore(/\[\[[^\][]*/);

        if (!match) {
          return null;
        }

        const query = match.text.slice(2).toLocaleLowerCase();
        const matches = linkableNotes
          .filter((note) => note.title.toLocaleLowerCase().includes(query))
          .map<Completion>((note) => ({
            label: note.title,
            apply(view, completion, from, to) {
              const insert = `[[${completion.label}]]`;

              view.dispatch({
                changes: { from, to, insert },
                selection: { anchor: from + insert.length },
              });
            },
            render: () => renderNoteLinkOption(note),
          }));

        const options = matches.length
          ? matches
          : [
              {
                label: linkableNotes.length
                  ? "No matching notes"
                  : "No notes to link",
                apply: "",
                render: () =>
                  renderNoteLinkInfo(
                    linkableNotes.length
                      ? "No matching notes"
                      : "No notes to link",
                  ),
              },
            ];

        return {
          from: match.from,
          to: context.pos,
          options,
          filter: false,
          validFor: /^\[\[[^\][]*$/,
        };
      };
    }, [notes, selectedNoteId]);

    useEffect(() => {
      if (!editorRef.current) return undefined;

      const view = new EditorView({
        parent: editorRef.current,
        state: EditorState.create({
          doc: value,
          extensions: [
            lineNumbers(),
            foldGutter(),
            highlightActiveLineGutter(),
            highlightActiveLine(),
            highlightSpecialChars(),
            dropCursor(),
            crosshairCursor(),
            history(),
            indentOnInput(),
            rectangularSelection(),
            markdown(),
            autocompletion({
              activateOnTyping: true,
              icons: false,
              override: [noteLinkCompletions],
            }),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
            EditorView.lineWrapping,
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                onChange(update.state.doc.toString());
              }

              onHistoryChange?.({
                canUndo: undoDepth(update.state) > 0,
                canRedo: redoDepth(update.state) > 0,
              });

              if (
                (update.docChanged || update.selectionSet) &&
                shouldOpenNoteLinkSuggest(update.view)
              ) {
                window.requestAnimationFrame(() => {
                  startCompletion(update.view);
                });
              }
            }),
          ],
        }),
      });

      onHistoryChange?.({
        canUndo: undoDepth(view.state) > 0,
        canRedo: redoDepth(view.state) > 0,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }, []);

    return <div className="note__code-editor" ref={editorRef} />;
  },
);

export default MarkdownEditor;
