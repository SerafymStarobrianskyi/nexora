const express = require("express");
const auth = require("../middlewares/auth");
const { createWorkspace, getMyWorkspaces } = require("../controllers/workspaces");
const router = express.Router();

router.post("/",auth, createWorkspace);
router.get("/",auth, getMyWorkspaces);

module.exports = router;