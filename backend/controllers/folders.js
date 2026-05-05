import pool from "../db/index.js";

async function getFolderById(id) {
  const result = await pool.query(
    "SELECT * FROM folders WHERE id = $1 LIMIT 1",
    [id],
  );

  return result.rows[0];
}

async function userOwnsWorkspace(userId, workspaceId) {
  const result = await pool.query(
    "SELECT id FROM workspaces WHERE id = $1 AND owner_id = $2 LIMIT 1",
    [workspaceId, userId],
  );

  return Boolean(result.rows[0]);
}

function buildFolderPath(parentPath, name) {
  return parentPath ? `${parentPath} / ${name}` : name;
}

export const createFolder = async (req, res) => {
  const { workspace_id, parent_id, name, color, position = 0 } = req.body;

  if (!workspace_id || !name) {
    return res.status(400).json({
      message: "workspace_id and name are required",
    });
  }

  try {
    const ownsWorkspace = await userOwnsWorkspace(req.user.userId, workspace_id);

    if (!ownsWorkspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    let parentFolder = null;

    if (parent_id) {
      parentFolder = await getFolderById(parent_id);

      if (!parentFolder) {
        return res.status(404).json({
          message: "Folder not found",
        });
      }

      if (parentFolder.workspace_id !== workspace_id) {
        return res.status(400).json({
          message: "Parent folder must be in same workspace",
        });
      }
    }

    const path = buildFolderPath(parentFolder?.path, name);

    const result = await pool.query(
      "INSERT INTO folders (workspace_id, parent_id, name, path, color, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [workspace_id, parent_id || null, name, path, color || null, position],
    );

    const folder = result.rows[0];

    res.status(200).json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkspaceFolders = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const result = await pool.query(
      "SELECT folders.* FROM folders INNER JOIN workspaces ON folders.workspace_id = workspaces.id WHERE folders.workspace_id = $1 AND workspaces.owner_id = $2 ORDER BY folders.position ASC, folders.created_at ASC",
      [workspaceId, req.user.userId],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    const result = await pool.query(
      "DELETE FROM folders USING workspaces WHERE folders.id = $1 AND folders.workspace_id = workspaces.id AND workspaces.owner_id = $2 RETURNING folders.*",
      [folderId, req.user.userId],
    );

    const folder = result.rows[0];

    if (!folder) {
      return res.status(404).json({
        message: "Folder not found",
      });
    }

    res.json({
      message: "Folder deleted",
      folder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
