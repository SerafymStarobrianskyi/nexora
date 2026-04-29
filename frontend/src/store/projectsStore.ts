import { create } from "zustand";
import {
  addFolder,
  addNote,
  addWorkspace,
  deleteFolder,
  deleteNote,
  deleteWorkspace,
  getWorkspaceFolders,
  getWorkspaceNotes,
  getWorkspaces,
  type AddFolderPayload,
  type AddNotePayload,
  type AddWorkspacePayload,
  type Folder,
  type Note,
  type Workspace,
} from "../api/projects";

type ProjectsStore = {
  workspaces: Workspace[];
  foldersByWorkspace: Record<string, Folder[]>;
  notesByWorkspace: Record<string, Note[]>;
  selectedWorkspaceId: string | null;
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  getWorkspaces: () => Promise<void>;
  openWorkspace: (workspaceId: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  openFolder: (folderId: string) => void;
  openNote: (noteId: string) => void;
  createWorkspace: (payload: AddWorkspacePayload) => Promise<Workspace>;
  createFolder: (payload: AddFolderPayload) => Promise<Folder>;
  createNote: (payload: AddNotePayload) => Promise<Note>;
  deleteFolder: (folderId: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
};

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  workspaces: [],
  foldersByWorkspace: {},
  notesByWorkspace: {},
  selectedWorkspaceId: null,
  selectedFolderId: null,
  selectedNoteId: null,
  isLoading: false,
  isSaving: false,
  error: null,

  getWorkspaces: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await getWorkspaces();
      const selectedWorkspaceId =
        get().selectedWorkspaceId ?? data[0]?.id ?? null;

      set({
        workspaces: data,
        selectedWorkspaceId,
      });

      if (selectedWorkspaceId) {
        await get().openWorkspace(selectedWorkspaceId);
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load projects",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteWorkspace: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteWorkspace(workspaceId);

      const state = get();

      const updatedWorkspaces = state.workspaces.filter(
        (workspace) => workspace.id !== workspaceId,
      );

      const { [workspaceId]: removedFolders, ...foldersByWorkspace } =
        state.foldersByWorkspace;

      const { [workspaceId]: removedNotes, ...notesByWorkspace } =
        state.notesByWorkspace;

      const wasSelected = state.selectedWorkspaceId === workspaceId;
      const nextWorkspaceId = wasSelected
        ? (updatedWorkspaces[0]?.id ?? null)
        : state.selectedWorkspaceId;

      set({
        workspaces: updatedWorkspaces,
        foldersByWorkspace,
        notesByWorkspace,
        selectedWorkspaceId: nextWorkspaceId,
        selectedFolderId: wasSelected ? null : state.selectedFolderId,
        selectedNoteId: wasSelected ? null : state.selectedNoteId,
      });

      if (wasSelected && nextWorkspaceId) {
        await get().openWorkspace(nextWorkspaceId);
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete workspace",
      });

      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  openWorkspace: async (workspaceId) => {
    set({
      selectedWorkspaceId: workspaceId,
      selectedFolderId: null,
      selectedNoteId: null,
      isLoading: true,
      error: null,
    });

    try {
      const [folders, notes] = await Promise.all([
        getWorkspaceFolders(workspaceId),
        getWorkspaceNotes(workspaceId),
      ]);

      set((state) => ({
        foldersByWorkspace: {
          ...state.foldersByWorkspace,
          [workspaceId]: folders,
        },
        notesByWorkspace: {
          ...state.notesByWorkspace,
          [workspaceId]: notes,
        },
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to open workspace",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  openFolder: (folderId) => {
    set({
      selectedFolderId: folderId,
      selectedNoteId: null,
    });
  },

  openNote: (noteId) => {
    const selectedWorkspaceId = get().selectedWorkspaceId;
    const note = selectedWorkspaceId
      ? get().notesByWorkspace[selectedWorkspaceId]?.find(
          (item) => item.id === noteId,
        )
      : null;

    set({
      selectedNoteId: noteId,
      selectedFolderId: note?.folder_id ?? null,
    });
  },

  createWorkspace: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const data = await addWorkspace(payload);

      set((state) => ({
        workspaces: [data.workspace, ...state.workspaces],
        selectedWorkspaceId: data.workspace.id,
        selectedFolderId: null,
        selectedNoteId: null,
      }));

      await get().openWorkspace(data.workspace.id);
      return data.workspace;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create workspace",
      });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  createFolder: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const folder = await addFolder(payload);

      set((state) => ({
        foldersByWorkspace: {
          ...state.foldersByWorkspace,
          [payload.workspace_id]: [
            ...(state.foldersByWorkspace[payload.workspace_id] ?? []),
            folder,
          ],
        },
        selectedWorkspaceId: payload.workspace_id,
        selectedFolderId: folder.id,
        selectedNoteId: null,
      }));

      return folder;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create folder",
      });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  createNote: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const note = await addNote(payload);

      set((state) => ({
        notesByWorkspace: {
          ...state.notesByWorkspace,
          [payload.workspace_id]: [
            note,
            ...(state.notesByWorkspace[payload.workspace_id] ?? []),
          ],
        },
        selectedWorkspaceId: payload.workspace_id,
        selectedFolderId: payload.folder_id,
        selectedNoteId: note.id,
      }));

      return note;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create note",
      });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  deleteFolder: async (folderId) => {
    set({ isSaving: true, error: null });

    try {
      const state = get();
      const workspaceId = state.selectedWorkspaceId;
      if (!workspaceId) return;

      await deleteFolder(folderId);

      set((state) => ({
        foldersByWorkspace: {
          ...state.foldersByWorkspace,
          [workspaceId]: (state.foldersByWorkspace[workspaceId] ?? []).filter(
            (folder) => folder.id !== folderId,
          ),
        },
        selectedFolderId:
          state.selectedFolderId === folderId ? null : state.selectedFolderId,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete folder",
      });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  deleteNote: async (noteId) => {
    set({ isSaving: true, error: null });

    try {
      const state = get();
      const workspaceId = state.selectedWorkspaceId;

      if (!workspaceId) return;

      await deleteNote(noteId);

      set((state) => ({
        notesByWorkspace: {
          ...state.notesByWorkspace,
          [workspaceId]: (state.notesByWorkspace[workspaceId] ?? []).filter(
            (note) => note.id !== noteId,
          ),
        },
        selectedNoteId:
          state.selectedNoteId === noteId ? null : state.selectedNoteId,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete note",
      });

      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
}));
