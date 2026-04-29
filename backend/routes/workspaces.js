const express = require("express");
const auth = require("../middlewares/auth");
const { createWorkspace, getMyWorkspaces, deleteWorkspace } = require("../controllers/workspaces");
const router = express.Router();

router.post("/",auth, createWorkspace);
router.get("/",auth, getMyWorkspaces);
router.delete("/:workspaceId", auth, deleteWorkspace);

module.exports = router;