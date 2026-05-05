import { useShallow } from "zustand/react/shallow";
import { useProjectsStore } from "./projectsStore";
import type { Folder, Note } from "../api/projects";

const EMPTY_FOLDERS: Folder[] = [];
const EMPTY_NOTES: Note[] = [];

export const useSelectedProjectData = () =>
  useProjectsStore(
    useShallow((state) => {
      const workspaceId = state.selectedWorkspaceId;

      const folders = workspaceId
        ? (state.foldersByWorkspace[workspaceId] ?? EMPTY_FOLDERS)
        : EMPTY_FOLDERS;

      const notes = workspaceId
        ? (state.notesByWorkspace[workspaceId] ?? EMPTY_NOTES)
        : EMPTY_NOTES;

      const selectedWorkspace =
        state.workspaces.find((item) => item.id === workspaceId) ?? null;

      const selectedFolder =
        folders.find((item) => item.id === state.selectedFolderId) ?? null;

      const selectedNote =
        notes.find((item) => item.id === state.selectedNoteId) ?? null;

      return {
        folders,
        notes,
        selectedWorkspace,
        selectedFolder,
        selectedNote,
      };
    }),
  );
