import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useProjectsStore } from "../../store/projectsStore";
import { Trash } from "lucide-react";
import "./projects-page.css";
import Modal from "../../components/modal/Modal";
import ProjectsSidebar from "../../components/projectsSidebar/ProjectsSidebar";
import ProjectTree from "../../components/projectTree/ProjectTree";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import ProjectsContent from "../../components/projectsContent/ProjectsContent";

export type ModalType = "workspace" | "folder" | "note" | "delete" | null;

export type DeleteTarget =
  | { kind: "workspace"; id: string; name: string }
  | { kind: "folder"; id: string; name: string }
  | { kind: "note"; id: string; name: string };

export type ModalState =
  | { type: "workspace" }
  | { type: "folder"; parentId: string | null }
  | { type: "note"; parentId: string | null }
  | { type: "delete"; target: DeleteTarget }
  | null;

export default function ProjectsPage() {
  const {
    workspaces,
    getWorkspaces,
    openWorkspace,
    selectedWorkspaceId,
    error,
  } = useProjectsStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [modal, setModal] = useState<ModalState>(null);

  const selectedWorkspace =
    workspaces.find((item) => item.id === selectedWorkspaceId) ?? null;
  useEffect(() => {
    getWorkspaces().catch(() => undefined);
  }, [getWorkspaces]);

  const openModal = (
    type: "workspace" | "folder" | "note",
    parentId: string | null = null,
  ) => {
    if (type === "workspace") {
      setModal({ type: "workspace" });
      return;
    }

    setModal({
      type,
      parentId,
    });
  };

  const openDeleteModal = (target: DeleteTarget) => {
    setModal({
      type: "delete",
      target,
    });
  };

  const closeModal = () => {
    setModal(null);
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

  return (
    <Layout>
      <div className="projects-layout">
        <aside className="projects-sidebar">
          <section className="projects-sidebar__panel">
            <ProjectsSidebar
              openModal={openModal}
              selectedWorkspaceId={selectedWorkspaceId}
            />

            <div className="projects-sidebar__header">
              <h2 className="projects-sidebar__heading">Projects</h2>
              <span>{workspaces.length}</span>
            </div>

            <nav className="workspaces-nav" aria-label="Workspaces">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  className={
                    workspace.id === selectedWorkspaceId
                      ? "workspaces-nav__item workspaces-nav__item--active"
                      : "workspaces-nav__item"
                  }
                  onClick={() => {
                    setExpandedFolders(new Set());
                    openWorkspace(workspace.id);
                  }}
                >
                  <span className="workspaces-nav__icon">
                    {workspace.icon || "W"}
                  </span>
                  <span>
                    <strong>{workspace.name}</strong>
                    {workspace.description && (
                      <small>{workspace.description}</small>
                    )}
                  </span>
                  <span className="workspaces-nav__icon">
                    <Trash
                      size={16}
                      onClick={(event) => {
                        event.stopPropagation();
                        openDeleteModal({
                          kind: "workspace",
                          id: workspace.id,
                          name: workspace.name,
                        });
                      }}
                    />
                  </span>
                </button>
              ))}
            </nav>
            <div className="projects-sidebar__divider" />
            {selectedWorkspace ? (
              <ProjectTree
                selectedWorkspace={selectedWorkspace}
                expandedFolders={expandedFolders}
                openModal={openModal}
                openDeleteModal={openDeleteModal}
                onToggleFolder={toggleFolder}
              />
            ) : (
              <p className="project-tree__empty">
                Create a workspace to start.
              </p>
            )}
          </section>
        </aside>

        <main className="projects-main">
          <Breadcrumb />

          {error && <div className="projects-alert">{error}</div>}

          <ProjectsContent openModal={openModal} />
        </main>
      </div>

      {modal && (
        <Modal
          modal={modal}
          closeModal={closeModal}
          setExpandedFolders={setExpandedFolders}
        />
      )}
    </Layout>
  );
}
