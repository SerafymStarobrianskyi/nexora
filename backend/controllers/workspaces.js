const pool = require("../db");

const createWorkspace = async (req, res) => {
  const { name, icon, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name required" });
  }

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: "User not found in token" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO workspaces (owner_id, name, icon, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.userId, name, icon || null, description || null],
    );
    const workspace = result.rows[0];
    res.status(201).json({
      message: "Workspace added",
      workspace: workspace,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyWorkspaces = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, owner_id, name, icon, description FROM workspaces WHERE owner_id = $1 ORDER BY created_at DESC",
      [req.user.userId],
    );
    const workspaces = result.rows;
    res.status(200).json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const result = await pool.query(
      "DELETE FROM workspaces WHERE id = $1 RETURNING *",
      [workspaceId],
    );
    const workspace = result.rows[0];
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }
    res.json({
        message:"Workspace deleted",
        workspace
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createWorkspace, getMyWorkspaces, deleteWorkspace };
