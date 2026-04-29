const express = require("express");
const auth = require("../middlewares/auth");
const { createNote, getWorksapceNotes,deleteNote } = require("../controllers/notes");
const router = express.Router();

router.post("/",auth, createNote);
router.get("/:workspaceId",auth, getWorksapceNotes);
router.delete("/:noteId", auth, deleteNote);

module.exports = router;
