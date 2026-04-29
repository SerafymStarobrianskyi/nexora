import { useSelectedProjectData } from "../../store/projectsSelector";

export default function Breadcrumb() {
  const { selectedWorkspace, selectedFolder, selectedNote } =
    useSelectedProjectData();

  return (
    <header className="projects-main__breadcrumbs">
      <span>{selectedWorkspace?.name ?? "Projects"}</span>
      {selectedFolder && (
        <>
          <span>/</span>
          <span>{selectedFolder.path}</span>
        </>
      )}
      {selectedNote && (
        <>
          <span>/</span>
          <span className="projects-main__current">{selectedNote.title}</span>
        </>
      )}
    </header>
  );
}
