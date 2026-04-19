const express = require("express");
const { registerUser, loginUser, checkProfile } = require("../controllers/auth");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile",auth, checkProfile);


module.exports = router;