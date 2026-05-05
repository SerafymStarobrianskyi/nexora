import pkg from "pg";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .query("SELECT 1")
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error:", err));

export default pool;
