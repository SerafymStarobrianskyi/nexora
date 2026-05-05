import express from "express";
import auth from "../middlewares/auth.js";
import {
  createWorkspace,
  getMyWorkspaces,
  deleteWorkspace,
} from "../controllers/workspaces.js";

const router = express.Router();

router.post("/", auth, createWorkspace);
router.get("/", auth, getMyWorkspaces);
router.delete("/:workspaceId", auth, deleteWorkspace);

export default router;
