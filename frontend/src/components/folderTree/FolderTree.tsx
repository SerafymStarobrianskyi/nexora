import {
  ChevronDown,
  ChevronRight,
  FilePlus2,
  FileText,
  Folder,
  FolderPlus,
  Trash,
} from "lucide-react";
import type { Note, Folder as ProgectFolder } from "../../api/projects";

type FolderTreeProps = {
  folder: ProgectFolder;
  folders: ProgectFolder[];
  notes: Note[];
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  expandedFolders: Set<string>;
  onOpenFolder: (folderId: string) => void;
  onOpenNote: (noteId: string) => void;
  onCreateFolder: (parentId: string) => void;
  onCreateNote: (folderId: string) => void;
  onDeleteFolder: (deleteFolder: ProgectFolder) => void;
  onDeleteNote: (deleteNote: Note) => void;
  onToggleFolder: (folderId: string) => void;
};

export default function FolderTree({
  folder,
  folders,
  notes,
  selectedFolderId,
  selectedNoteId,
  expandedFolders,
  onOpenFolder,
  onOpenNote,
  onCreateFolder,
  onCreateNote,
  onDeleteFolder,
  onDeleteNote,
  onToggleFolder,
}: FolderTreeProps) {
  const folderColor = folder.color || "#8b85ff";
  const isExpanded = expandedFolders.has(folder.id);
  const childFolders = folders.filter((item) => item.parent_id === folder.id);
  const childNotes = notes.filter((item) => item.folder_id === folder.id);
  return (
    <li className="project-tree__node">
      <div
        className={
          selectedFolderId === folder.id && !selectedNoteId
            ? "project-tree__row project-tree__row--active"
            : "project-tree__row"
        }
      >
        <button
          className="project-tree__toggle"
          type="button"
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          onClick={() => onToggleFolder(folder.id)}
        >
          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
        <button
          className="project-tree__label"
          type="button"
          onClick={() => onOpenFolder(folder.id)}
          style={
            {
              "--folder-color": folderColor,
            } as React.CSSProperties
          }
        >
          <span className="project-tree__folder-dot" />
          <Folder size={15}  style={{color: folderColor}}/>
          <span>{folder.name}</span>
        </button>
        <button
          className="project-tree__action"
          type="button"
          aria-label="Create folder"
          onClick={() => onCreateFolder(folder.id)}
        >
          <FolderPlus size={14} />
        </button>
        <button
          className="project-tree__action"
          type="button"
          aria-label="Create note"
          onClick={() => onCreateNote(folder.id)}
        >
          <FilePlus2 size={14} />
        </button>
        <button
          className="project-tree__action"
          type="button"
          aria-label="Delete folder"
          onClick={() => onDeleteFolder(folder)}
        >
          <Trash size={14} />
        </button>
      </div>

      {isExpanded && (
        <ul className="project-tree project-tree--nested">
          {childFolders.map((child) => (
            <FolderTree
              key={child.id}
              folder={child}
              folders={folders}
              notes={notes}
              expandedFolders={expandedFolders}
              selectedFolderId={selectedFolderId}
              selectedNoteId={selectedNoteId}
              onOpenFolder={onOpenFolder}
              onOpenNote={onOpenNote}
              onCreateFolder={onCreateFolder}
              onCreateNote={onCreateNote}
              onDeleteFolder={onDeleteFolder}
              onDeleteNote={onDeleteNote}
              onToggleFolder={onToggleFolder}
            />
          ))}

          {childNotes.map((note) => (
            <li key={note.id} className="project-tree__node">
              <div
                className={
                  selectedNoteId === note.id
                    ? "project-tree__note project-tree__note--active"
                    : "project-tree__note"
                }
              >
                <button
                  className="project-tree__note-label"
                  type="button"
                  onClick={() => onOpenNote(note.id)}
                >
                  <FileText size={15} />
                  <span>{note.title}</span>
                </button>
                <button
                  className="project-tree__action"
                  type="button"
                  aria-label="Delete note"
                  onClick={() => onDeleteNote(note)}
                >
                  <Trash size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
