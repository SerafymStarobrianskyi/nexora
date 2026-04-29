import { useMemo } from "react";
import type { Workspace } from "../../api/projects";
import { useProjectsStore } from "../../store/projectsStore";
import FolderTree from "../folderTree/FolderTree";
import type { DeleteTarget } from "../../pages/projectsPage/ProjectsPage";
import { FileText, Trash } from "lucide-react";
import { useSelectedProjectData } from "../../store/projectsSelector";

type ProjectTreeProps = {
  selectedWorkspace: Workspace;
  expandedFolders: Set<string>;
  openModal: (
    type: "workspace" | "folder" | "note",
    parentId?: string | null,
  ) => void;
  openDeleteModal: (target: DeleteTarget) => void;
  onToggleFolder: (folderId: string) => void;
};

export default function ProjectTree({
  selectedWorkspace,
  expandedFolders,
  openModal,
  openDeleteModal,
  onToggleFolder,
}: ProjectTreeProps) {
  const {
    selectedFolderId,
    selectedNoteId,
    isLoading,
    openFolder,
    openNote,
  } = useProjectsStore();

  const { folders, notes } = useSelectedProjectData();
  const rootFolders = useMemo(
    () => folders.filter((folder) => !folder.parent_id),
    [folders],
  );
  const rootNotes = useMemo(
    () => notes.filter((note) => !note.folder_id),
    [notes],
  );
  return (
    <div className="project-tree-wrap">
      <div className="project-tree-wrap__title">
        <span>{selectedWorkspace.name}</span>
      </div>
      <ul className="project-tree">
        {rootFolders.map((folder) => (
          <FolderTree
            key={folder.id}
            folder={folder}
            folders={folders}
            notes={notes}
            selectedFolderId={selectedFolderId}
            selectedNoteId={selectedNoteId}
            expandedFolders={expandedFolders}
            onOpenFolder={openFolder}
            onOpenNote={openNote}
            onCreateFolder={(parentId) => openModal("folder", parentId)}
            onCreateNote={(folderId) => openModal("note", folderId)}
            onDeleteFolder={(deleteFolder) =>
              openDeleteModal({
                kind: "folder",
                id: deleteFolder.id,
                name: deleteFolder.name,
              })
            }
            onDeleteNote={(deleteNote) =>
              openDeleteModal({
                kind: "note",
                id: deleteNote.id,
                name: deleteNote.title,
              })
            }
            onToggleFolder={onToggleFolder}
          />
        ))}

        {rootNotes.map((note) => (
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
                onClick={() => openNote(note.id)}
              >
                <FileText size={15} />
                <span>{note.title}</span>
              </button>
              <button
                className="project-tree__action"
                type="button"
                aria-label="Delete note"
                onClick={() =>
                  openDeleteModal({
                    kind: "note",
                    id: note.id,
                    name: note.title,
                  })
                }
              >
                <Trash size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!folders.length && !notes.length && !isLoading && (
        <p className="project-tree__empty">No folders or files yet.</p>
      )}
    </div>
  );
}
