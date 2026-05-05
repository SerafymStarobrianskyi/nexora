import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspaces.js";
import notesRoutes from "./routes/notes.js";
import foldersRoutes from "./routes/folders.js";

const app = express();

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:5174",
  ].filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  }),
);
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/notes", notesRoutes);
app.use("/folders", foldersRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
