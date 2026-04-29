import { apiFetch } from "../lib/api";

export interface AddWorkspacePayload {
  name: string;
  icon: string | null;
  description: string | null;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

export interface Folder {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  name: string;
  path: string;
  color: string | null;
  position: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: string;
  workspace_id: string;
  folder_id: string | null;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface AddWorkspaceResponse {
  message: string;
  workspace: Workspace;
}

export interface AddFolderPayload {
  workspace_id: string;
  parent_id: string | null;
  name: string;
  color: string | null;
  position?: number | null;
}

export interface AddNotePayload {
  workspace_id: string;
  folder_id: string | null;
  title: string;
  content: string;
}

export interface DeleteWorkspaceResponse{
  message: string;
  workspace: Workspace;
}

export interface DeleteFolderResponse {
  message: string;
  folder: Folder;
}

export interface DeleteNoteResponse {
  message: string;
  folder: Note;
}

export type GetWorkspacesResponse = Workspace[];
export type GetFoldersResponse = Folder[];
export type GetNotesResponse = Note[];

export function addWorkspace(payload: AddWorkspacePayload) {
  return apiFetch<AddWorkspaceResponse>("/workspaces", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getWorkspaces() {
  return apiFetch<GetWorkspacesResponse>("/workspaces", {
    method: "GET",
  });
}

export function addFolder(payload: AddFolderPayload) {
  return apiFetch<Folder>("/folders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getWorkspaceFolders(workspaceId: string) {
  return apiFetch<GetFoldersResponse>(`/folders/${workspaceId}`, {
    method: "GET",
  });
}

export function addNote(payload: AddNotePayload) {
  return apiFetch<Note>("/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getWorkspaceNotes(workspaceId: string) {
  return apiFetch<GetNotesResponse>(`/notes/${workspaceId}`, {
    method: "GET",
  });
}

export function deleteWorkspace(workspaceId: string) {
  return apiFetch<DeleteWorkspaceResponse>(`/workspaces/${workspaceId}`,{
    method: "DELETE",
  })
}

export function deleteFolder(folderId: string) {
  return apiFetch<DeleteFolderResponse>(`/folders/${folderId}`, {
    method: "DELETE",
  });
}

export function deleteNote(noteId: string) {
  return apiFetch<DeleteNoteResponse>(`/notes/${noteId}`, {
    method: "DELETE",
  });
}