import { FilePlus2, FolderPlus } from "lucide-react";
import { useSelectedProjectData } from "../../store/projectsSelector";

type ProjectsContentProps = {
  openModal: (
    type: "workspace" | "folder" | "note",
    parentId?: string | null,
  ) => void;
};

export default function ProjectsContent({ openModal }: ProjectsContentProps) {
  const { selectedNote, selectedFolder, selectedWorkspace, folders, notes } =
    useSelectedProjectData();
  return (
    <section className="projects-main__content">
      {selectedNote ? (
        <article className="note">
          <div className="note__meta">
            <span className="note__tag">file</span>
            {selectedFolder && (
              <span className="note__source">{selectedFolder.path}</span>
            )}
          </div>
          <h1 className="note__title">{selectedNote.title}</h1>
          <p>{selectedNote.content || "This file is empty."}</p>
        </article>
      ) : selectedFolder ? (
        <section className="folder-view">
          <div>
            <span className="folder-view__eyebrow">Folder</span>
            <h1>{selectedFolder.name}</h1>
            <p>{selectedFolder.path}</p>
          </div>
          <div className="folder-view__actions">
            <button
              type="button"
              onClick={() => openModal("folder", selectedFolder.id)}
            >
              <FolderPlus size={16} />
              Folder
            </button>
            <button
              type="button"
              onClick={() => openModal("note", selectedFolder.id)}
            >
              <FilePlus2 size={16} />
              File
            </button>
          </div>
        </section>
      ) : selectedWorkspace ? (
        <section className="workspace-view">
          <span className="folder-view__eyebrow">Workspace</span>
          <h1>{selectedWorkspace.name}</h1>
          <p>{selectedWorkspace.description || "No description yet."}</p>
          <div className="workspace-view__stats">
            <span>{folders.length} folders</span>
            <span>{notes.length} files</span>
          </div>
        </section>
      ) : (
        <section className="workspace-view">
          <span className="folder-view__eyebrow">Projects</span>
          <h1>No workspace selected</h1>
          <p>Create a workspace to orginaze folders and files</p>
        </section>
      )}
    </section>
  );
}
