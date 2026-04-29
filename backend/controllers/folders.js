const pool = require("../db");

async function getFolderById(id) {
  const result = await pool.query("SELECT * FROM folders WHERE id = $1 LIMIT 1", [id]);

  return result.rows[0];
}

function buildFolderPath(parentPath, name) {
  return parentPath ? `${parentPath} / ${name}` : name;
}

const createFolder = async (req, res) => {
  const { workspace_id, parent_id, name, color, position=0 } = req.body;

  if (!workspace_id || !name) {
    return res.status(400).json({
      message: "workspace_id and name are required",
    });
  }

  try {
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
      "INSERT INTO folders (workspace_id, parent_id, name ,path, color, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [workspace_id, parent_id || null, name, path, color || null || null, position],
    );

    const folder = result.rows[0];
    res.status(200).json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getWorkspaceFolders = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const result = await pool.query(
      "SELECT * FROM folders WHERE workspace_id = $1 ORDER BY position ASC, created_at ASC",
      [workspaceId],
    );
    const folders = result.rows;
    res.status(200).json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    const result = await pool.query(
      "DELETE FROM folders WHERE id = $1 RETURNING *",
      [folderId],
    );
    const folder = result.rows[0];
    if (!folder) {
      return res.status(404).json({
        message: "Folder not found",
      });
    }
    res.json({
        message:"Folder deleted",
        folder
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createFolder, getWorkspaceFolders, deleteFolder };
