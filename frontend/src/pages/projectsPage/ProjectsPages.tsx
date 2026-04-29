import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ChevronDown,
  ChevronRight,
  FilePlus2,
  FileText,
  Folder,
  FolderPlus,
  Plus,
  Search,
  X,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { useProjectsStore } from "../../store/projectsStore";
import type { Folder as ProjectFolder, Note } from "../../api/projects";
import "./projects-page.css";

type ModalType = "workspace" | "folder" | "note" | null;

type FolderTreeProps = {
  folder: ProjectFolder;
  folders: ProjectFolder[];
  notes: Note[];
  expandedFolders: Set<string>;
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  onToggleFolder: (folderId: string) => void;
  onOpenFolder: (folderId: string) => void;
  onOpenNote: (noteId: string) => void;
  onCreateFolder: (parentId: string) => void;
  onCreateNote: (folderId: string) => void;
};

function FolderTree({
  folder,
  folders,
  notes,
  expandedFolders,
  selectedFolderId,
  selectedNoteId,
  onToggleFolder,
  onOpenFolder,
  onOpenNote,
  onCreateFolder,
  onCreateNote,
}: FolderTreeProps) {
  const childFolders = folders.filter((item) => item.parent_id === folder.id);
  const childNotes = notes.filter((item) => item.folder_id === folder.id);
  const isExpanded = expandedFolders.has(folder.id);

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
        >
          <Folder size={15} />
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
              onToggleFolder={onToggleFolder}
              onOpenFolder={onOpenFolder}
              onOpenNote={onOpenNote}
              onCreateFolder={onCreateFolder}
              onCreateNote={onCreateNote}
            />
          ))}

          {childNotes.map((note) => (
            <li key={note.id} className="project-tree__node">
              <button
                className={
                  selectedNoteId === note.id
                    ? "project-tree__note project-tree__note--active"
                    : "project-tree__note"
                }
                type="button"
                onClick={() => onOpenNote(note.id)}
              >
                <FileText size={15} />
                <span>{note.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ProjectsPage() {
  const {
    workspaces,
    foldersByWorkspace,
    notesByWorkspace,
    selectedWorkspaceId,
    selectedFolderId,
    selectedNoteId,
    isLoading,
    isSaving,
    error,
    getWorkspaces,
    openWorkspace,
    openFolder,
    openNote,
    createWorkspace,
    createFolder,
    createNote,
  } = useProjectsStore();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const selectedWorkspace = workspaces.find((item) => item.id === selectedWorkspaceId) ?? null;
  const folders = useMemo(
    () => (selectedWorkspaceId ? foldersByWorkspace[selectedWorkspaceId] ?? [] : []),
    [foldersByWorkspace, selectedWorkspaceId],
  );
  const notes = useMemo(
    () => (selectedWorkspaceId ? notesByWorkspace[selectedWorkspaceId] ?? [] : []),
    [notesByWorkspace, selectedWorkspaceId],
  );
  const selectedFolder = folders.find((item) => item.id === selectedFolderId) ?? null;
  const selectedNote = notes.find((item) => item.id === selectedNoteId) ?? null;

  const rootFolders = useMemo(
    () => folders.filter((folder) => !folder.parent_id),
    [folders],
  );

  const rootNotes = useMemo(
    () => notes.filter((note) => !note.folder_id),
    [notes],
  );

  useEffect(() => {
    getWorkspaces().catch(() => undefined);
  }, [getWorkspaces]);

  const openModal = (type: ModalType, parentId: string | null = null) => {
    setModalType(type);
    setModalParentId(parentId);
  };

  const closeModal = () => {
    setModalType(null);
    setModalParentId(null);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((current) => {
      const next = new Set(current);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

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
    if (!selectedWorkspaceId) return;

    const formData = new FormData(event.currentTarget);
    const folder = await createFolder({
      workspace_id: selectedWorkspaceId,
      parent_id: modalParentId,
      name: String(formData.get("name") ?? "").trim(),
      color: String(formData.get("color") ?? "").trim() || null,
    });

    setExpandedFolders((current) => new Set([...current, folder.id]));
    closeModal();
  };

  const handleNoteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWorkspaceId) return;

    const formData = new FormData(event.currentTarget);
    await createNote({
      workspace_id: selectedWorkspaceId,
      folder_id: modalParentId,
      title: String(formData.get("title") ?? "").trim(),
      content: String(formData.get("content") ?? "").trim(),
    });

    closeModal();
  };

  const modalTitle =
    modalType === "workspace"
      ? "New workspace"
      : modalType === "folder"
        ? "New folder"
        : "New file";

  return (
    <Layout>
      <div className="projects-layout">
        <aside className="projects-sidebar">
          <section className="projects-sidebar__panel">
            <div className="projects-sidebar__actions">
              <button
                className="projects-action-btn"
                type="button"
                aria-label="Create workspace"
                onClick={() => openModal("workspace")}
              >
                <Plus size={16} />
              </button>
              <button
                className="projects-action-btn"
                type="button"
                aria-label="Create folder"
                disabled={!selectedWorkspaceId}
                onClick={() => openModal("folder", selectedFolderId)}
              >
                <FolderPlus size={16} />
              </button>
              <button
                className="projects-action-btn"
                type="button"
                aria-label="Create file"
                disabled={!selectedWorkspaceId}
                onClick={() => openModal("note", selectedFolderId)}
              >
                <FilePlus2 size={16} />
              </button>
              <button className="projects-action-btn" type="button" aria-label="Search">
                <Search size={16} />
              </button>
            </div>

            <div className="projects-sidebar__header">
              <h2 className="projects-sidebar__heading">Projects</h2>
              <span>{workspaces.length}</span>
            </div>

            <nav className="workspaces-nav" aria-label="Workspaces">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  className={
                    workspace.id === selectedWorkspaceId
                      ? "workspaces-nav__item workspaces-nav__item--active"
                      : "workspaces-nav__item"
                  }
                  type="button"
                  onClick={() => {
                    setExpandedFolders(new Set());
                    openWorkspace(workspace.id).catch(() => undefined);
                  }}
                >
                  <span className="workspaces-nav__icon">{workspace.icon || "W"}</span>
                  <span>
                    <strong>{workspace.name}</strong>
                    {workspace.description && <small>{workspace.description}</small>}
                  </span>
                </button>
              ))}
            </nav>

            <div className="projects-sidebar__divider" />

            {selectedWorkspace ? (
              <div className="project-tree-wrap">
                <div className="project-tree-wrap__title">
                  <span>{selectedWorkspace.name}</span>
                  <button
                    className="project-tree__action project-tree__action--visible"
                    type="button"
                    aria-label="Create root folder"
                    onClick={() => openModal("folder", null)}
                  >
                    <FolderPlus size={14} />
                  </button>
                </div>

                <ul className="project-tree">
                  {rootFolders.map((folder) => (
                    <FolderTree
                      key={folder.id}
                      folder={folder}
                      folders={folders}
                      notes={notes}
                      expandedFolders={expandedFolders}
                      selectedFolderId={selectedFolderId}
                      selectedNoteId={selectedNoteId}
                      onToggleFolder={toggleFolder}
                      onOpenFolder={openFolder}
                      onOpenNote={openNote}
                      onCreateFolder={(parentId) => openModal("folder", parentId)}
                      onCreateNote={(folderId) => openModal("note", folderId)}
                    />
                  ))}

                  {rootNotes.map((note) => (
                    <li key={note.id} className="project-tree__node">
                      <button
                        className={
                          selectedNoteId === note.id
                            ? "project-tree__note project-tree__note--active"
                            : "project-tree__note"
                        }
                        type="button"
                        onClick={() => openNote(note.id)}
                      >
                        <FileText size={15} />
                        <span>{note.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {!folders.length && !notes.length && !isLoading && (
                  <p className="project-tree__empty">No folders or files yet.</p>
                )}
              </div>
            ) : (
              <p className="project-tree__empty">Create a workspace to start.</p>
            )}
          </section>
        </aside>

        <main className="projects-main">
          <header className="projects-main__breadcrumbs">
            <span>{selectedWorkspace?.name ?? "Projects"}</span>
            {selectedFolder && (
              <>
                <span className="projects-main__separator">/</span>
                <span>{selectedFolder.name}</span>
              </>
            )}
            {selectedNote && (
              <>
                <span className="projects-main__separator">/</span>
                <span className="projects-main__current">{selectedNote.title}</span>
              </>
            )}
          </header>

          {error && <div className="projects-alert">{error}</div>}

          <section className="projects-main__content">
            {selectedNote ? (
              <article className="note">
                <div className="note__meta">
                  <span className="note__tag">file</span>
                  {selectedFolder && <span className="note__source">{selectedFolder.path}</span>}
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
                  <button type="button" onClick={() => openModal("folder", selectedFolder.id)}>
                    <FolderPlus size={16} />
                    Folder
                  </button>
                  <button type="button" onClick={() => openModal("note", selectedFolder.id)}>
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
                <p>Create a workspace to organize folders and files.</p>
              </section>
            )}
          </section>
        </main>
      </div>

      {modalType && (
        <div className="projects-modal" role="dialog" aria-modal="true" aria-label={modalTitle}>
          <div className="projects-modal__panel">
            <div className="projects-modal__header">
              <h2>{modalTitle}</h2>
              <button type="button" aria-label="Close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            {modalType === "workspace" && (
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
                <button type="submit" disabled={isSaving}>Create workspace</button>
              </form>
            )}

            {modalType === "folder" && (
              <form className="projects-form" onSubmit={handleFolderSubmit}>
                <label>
                  Name
                  <input name="name" required autoFocus />
                </label>
                <label>
                  Color
                  <input name="color" placeholder="#8b85ff" />
                </label>
                <button type="submit" disabled={isSaving}>Create folder</button>
              </form>
            )}

            {modalType === "note" && (
              <form className="projects-form" onSubmit={handleNoteSubmit}>
                <label>
                  Title
                  <input name="title" required autoFocus />
                </label>
                <label>
                  Content
                  <textarea name="content" rows={8} />
                </label>
                <button type="submit" disabled={isSaving}>Create file</button>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
