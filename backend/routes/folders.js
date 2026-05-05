import express from "express";
import auth from "../middlewares/auth.js";
import {
  createFolder,
  getWorkspaceFolders,
  deleteFolder,
} from "../controllers/folders.js";

const router = express.Router();

router.post("/", auth, createFolder);
router.get("/:workspaceId", auth, getWorkspaceFolders);
router.delete("/:folderId", auth, deleteFolder);

export default router;
