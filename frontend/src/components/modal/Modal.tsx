import { X } from "lucide-react";
import { useProjectsStore } from "../../store/projectsStore";
import type { Dispatch, SetStateAction, FormEvent } from "react";
import type { ModalState } from "../../pages/projectsPage/ProjectsPage";

type ModalProps = {
  modal: NonNullable<ModalState>;
  closeModal: () => void;
  setExpandedFolders: Dispatch<SetStateAction<Set<string>>>;
};

export default function Modal({
  modal,
  closeModal,
  setExpandedFolders,
}: ModalProps) {
  const {
    isSaving,
    createWorkspace,
    createFolder,
    createNote,
    selectedWorkspaceId,
    deleteWorkspace,
    deleteFolder,
    deleteNote,
  } = useProjectsStore();

  const handleWorkspaceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await createWorkspace({
      name: String(formData.get("name") ?? "").trim(),
      icon: String(formData.get("icon") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
    });

    closeModal();
  };

  const handleFolderSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWorkspaceId || modal.type !== "folder") return;

    const formData = new FormData(event.currentTarget);
    const folder = await createFolder({
      workspace_id: selectedWorkspaceId,
      parent_id: modal.parentId,
      name: String(formData.get("name") ?? "").trim(),
      color: String(formData.get("color") ?? "").trim() || null,
    });

    setExpandedFolders((current) => new Set([...current, folder.id]));
    closeModal();
  };

  const handleNoteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWorkspaceId || modal.type !== "note") return;

    const formData = new FormData(event.currentTarget);
    await createNote({
      workspace_id: selectedWorkspaceId,
      folder_id: modal.parentId,
      title: String(formData.get("title") ?? "").trim(),
      content: String(formData.get("content") ?? "").trim(),
    });

    closeModal();
  };

  const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (modal.type !== "delete") return;

    if (modal.target.kind === "workspace") {
      await deleteWorkspace(modal.target.id);
    }

    if (modal.target.kind === "folder") {
      await deleteFolder(modal.target.id);
    }

    if (modal.target.kind === "note") {
      await deleteNote(modal.target.id);
    }

    closeModal();
  };

  const modalTitle =
    modal.type === "workspace"
      ? "New workspace"
      : modal.type === "folder"
        ? "New folder"
        : modal.type === "note"
          ? "New file"
          : `Delete ${modal.target.kind}`;

  return (
    <div
      className="projects-modal"
      role="dialog"
      aria-modal="true"
      aria-label={modalTitle}
    >
      <div className="projects-modal__panel">
        <div className="projects-modal__header">
          <h2>{modalTitle}</h2>
          <button type="button" aria-label="Close" onClick={closeModal}>
            <X size={18} />
          </button>
        </div>

        {modal.type === "workspace" && (
          <form className="projects-form" onSubmit={handleWorkspaceSubmit}>
            <label>
              Name
              <input name="name" required autoFocus />
            </label>
            <label>
              Icon
              <input name="icon" maxLength={2} placeholder="N" />
            </label>
            <label>
              Description
              <textarea name="description" rows={3} />
            </label>
            <button type="submit" disabled={isSaving}>
              Create workspace
            </button>
          </form>
        )}

        {modal.type === "folder" && (
          <form className="projects-form" onSubmit={handleFolderSubmit}>
            <label>
              Name
              <input name="name" required autoFocus />
            </label>
            <label>
              Color
              <div className="projects-color-field">
                <input name="color" type="color" defaultValue="#8b85ff" />
                <span>Folder accent</span>
              </div>
            </label>
            <button type="submit" disabled={isSaving}>
              Create folder
            </button>
          </form>
        )}

        {modal.type === "note" && (
          <form className="projects-form" onSubmit={handleNoteSubmit}>
            <label>
              Title
              <input name="title" required autoFocus />
            </label>
            <label>
              Content
              <textarea name="content" rows={8} />
            </label>
            <button type="submit" disabled={isSaving}>
              Create file
            </button>
          </form>
        )}

        {modal.type === "delete" && (
          <form className="projects-form" onSubmit={handleDelete}>
            <p>
              Are you sure you want to delete {modal.target.kind}{" "}
              <strong>{modal.target.name}</strong>?
            </p>
            <button type="submit" disabled={isSaving}>
              Delete
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
