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
    res.status(201).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyWorkspaces = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM workspaces WHERE owner_id = $1 ORDER BY created_at DESC",
      [req.user.userId],
    );
    const workspaces = result.rows[0];
    res.status(200).json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createWorkspace, getMyWorkspaces };
