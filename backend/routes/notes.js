import express from "express";
import auth from "../middlewares/auth.js";
import {
  createNote,
  getWorksapceNotes,
  deleteNote,
  updateNote,
} from "../controllers/notes.js";

const router = express.Router();

router.post("/", auth, createNote);
router.get("/:workspaceId", auth, getWorksapceNotes);
router.delete("/:noteId", auth, deleteNote);
router.patch("/:noteId", auth, updateNote);

export default router;
