const express = require("express");
const auth = require("../middlewares/auth");
const { createNote, getWorksapceNotes } = require("../controllers/notes");
const router = express.Router();

router.post("/",auth, createNote);
router.get("/",auth, getWorksapceNotes);

module.exports = router;