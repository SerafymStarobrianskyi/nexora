const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const workspaceRoutes = require("./routes/workspaces");
const notesRoutes = require("./routes/notes");
const foldersRoutes = require("./routes/folders");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/notes", notesRoutes);
app.use("/folders", foldersRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
