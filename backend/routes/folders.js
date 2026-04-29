const express = require("express");
const auth = require("../middlewares/auth");
const {
  createFolder,
  getWorkspaceFolders,
  deleteFolder,
} = require("../controllers/folders");
const router = express.Router();

router.post("/", auth, createFolder);
router.get("/:workspaceId", auth, getWorkspaceFolders);
router.delete("/:folderId", auth, deleteFolder);

module.exports = router;
