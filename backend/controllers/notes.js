import pool from "../db/index.js";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractNoteLinks(content = "") {
  const links = new Set();
  const matches = content.matchAll(/\[\[([^\]]+)\]\]/g);

  for (const match of matches) {
    const rawTarget = match[1].trim();

    if (rawTarget) {
      links.add(rawTarget);
    }
  }

  return [...links];
}

async function syncNoteLinks(client, note) {
  const rawTargets = extractNoteLinks(note.content);

  await client.query("DELETE FROM note_links WHERE source_note_id = $1", [
    note.id,
  ]);

  for (const rawTarget of rawTargets) {
    const targetResult = await client.query(
      "SELECT id FROM notes WHERE workspace_id = $1 AND deleted_at IS NULL AND (LOWER(title) = LOWER($2) OR LOWER(slug) = LOWER($3)) LIMIT 1",
      [note.workspace_id, rawTarget, slugify(rawTarget)],
    );

    const targetNote = targetResult.rows[0];

    if (!targetNote || targetNote.id === note.id) {
      continue;
    }

    await client.query(
      "INSERT INTO note_links (workspace_id, source_note_id, target_note_id, raw_target_text) VALUES ($1, $2, $3, $4)",
      [note.workspace_id, note.id, targetNote.id, rawTarget],
    );
  }
}

async function userOwnsWorkspace(client, userId, workspaceId) {
  const result = await client.query(
    "SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2 LIMIT 1",
    [workspaceId, userId],
  );

  return Boolean(result.rows[0]);
}

export const createNote = async (req, res) => {
  const { workspace_id, folder_id, title, content } = req.body;

  if (!workspace_id || !title) {
    return res.status(400).json({
      message: "workspace_id and title are required",
    });
  }

  const slug = slugify(title);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ownsWorkspace = await userOwnsWorkspace(
      client,
      req.user.userId,
      workspace_id,
    );

    if (!ownsWorkspace) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (folder_id) {
      const folderResult = await client.query(
        "SELECT id FROM folders WHERE id = $1 AND workspace_id = $2 LIMIT 1",
        [folder_id, workspace_id],
      );

      if (!folderResult.rows[0]) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Folder not found" });
      }
    }

    const result = await client.query(
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

    await syncNoteLinks(client, note);
    await client.query("COMMIT");

    res.status(200).json(note);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

export const getWorksapceNotes = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const result = await pool.query(
      "SELECT notes.* FROM notes INNER JOIN workspaces ON notes.workspace_id = workspaces.id WHERE notes.workspace_id = $1 AND workspaces.owner_id = $2 AND notes.deleted_at IS NULL ORDER BY notes.updated_at DESC",
      [workspaceId, req.user.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const result = await pool.query(
      "DELETE FROM notes USING workspaces WHERE notes.id = $1 AND notes.workspace_id = workspaces.id AND workspaces.owner_id = $2 RETURNING notes.*",
      [noteId, req.user.userId],
    );

    const note = result.rows[0];

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json({
      message: "Note deleted",
      note,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateNote = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { noteId } = req.params;
    const { content } = req.body;

    const result = await client.query(
      "UPDATE notes SET content = COALESCE($1, notes.content), updated_at = NOW() FROM workspaces WHERE notes.id = $2 AND notes.workspace_id = workspaces.id AND workspaces.owner_id = $3 RETURNING notes.*",
      [content, noteId, req.user.userId],
    );

    const note = result.rows[0];

    if (!note) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Note not found",
      });
    }

    await syncNoteLinks(client, note);
    await client.query("COMMIT");

    res.json({
      message: "Note content updated",
      note,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};
