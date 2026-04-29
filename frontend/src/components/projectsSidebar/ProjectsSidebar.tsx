import { FilePlus2, FolderPlus, Plus, Search } from "lucide-react";
import { useProjectsStore } from "../../store/projectsStore";

type ProjectsSidebarProps = {
  openModal: (type: "workspace" | "folder" | "note", parentId?: string | null) => void;
  selectedWorkspaceId: string | null;
};

export default function ProjectsSidebar({openModal, selectedWorkspaceId}:ProjectsSidebarProps) {
  const {selectedFolderId} = useProjectsStore();
  return (
    <div className="projects-sidebar__actions">
      <button
        className="projects-action-btn"
        type="button"
        aria-label="Create workspace"
        onClick={() => {
          openModal("workspace");
        }}
      >
        <Plus size={16} />
      </button>
      <button
        className="projects-action-btn"
        type="button"
        aria-label="Create folder"
        disabled={!selectedWorkspaceId}
        onClick={() => {
          openModal("folder", selectedFolderId);
        }}
      >
        <FolderPlus size={16} />
      </button>
      <button
        className="projects-action-btn"
        type="button"
        aria-label="Create file"
        disabled={!selectedWorkspaceId}
        onClick={() => {
          openModal("note", selectedFolderId);
        }}
      >
        <FilePlus2 size={16} />
      </button>
      <button className="projects-action-btn" type="button" aria-label="Search">
        <Search size={16} />
      </button>
    </div>
  );
}
