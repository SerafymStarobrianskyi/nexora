const pool = require("../db");

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const createNote = async (req, res) => {
  const { workspace_id, folder_id, title, content } = req.body;

  if (!workspace_id || !title) {
    return res.status(400).json({
      message: "workspace_id and title are required",
    });
  }

  const slug = slugify(title);

  try {
    const result = await pool.query(
      "INSERT INTO notes (workspace_id, folder_id, author_id, title, slug, content) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        workspace_id,
        folder_id || null,
        req.user.userId,
        title,
        slug,
        content || "",
      ],
    );
    const note = result.rows[0];
    res.status(200).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getWorksapceNotes = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const result = await pool.query(
      "SELECT * FROM notes WHERE workspace_id = $1   AND deleted_at IS NULL ORDER BY updated_at DESC",
      [workspaceId],
    );
    const notes = result.rows;
    console.log(notes)
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createNote, getWorksapceNotes };
