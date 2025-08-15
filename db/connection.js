import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres"; // Use the correct adapter
import "dotenv/config";

// Destructure Pool from pg
const { Pool } = pkg;

// Create a connection pool
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: 5432, // default port
  ssl: {
    rejectUnauthorized: true,
  },
});

// Initialize Drizzle with the Postgres connection pool
const db = drizzle(pool);

// Instead of using .execute() for raw SQL, use Drizzle's methods or pool.query()
// Retry logic
const MAX_RETRIES = 5; // Maximum number of retries
const RETRY_DELAY = 2000; // Delay between retries in milliseconds

async function connectWithRetry(attempt = 1) {
  try {
    await pool.query("SELECT 1");
    console.log("\nNeon Db Connected!\n");
  } catch (err) {
    console.error(`Attempt ${attempt} - Error connecting to database:`, err);

    if (attempt < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(attempt + 1);
    } else {
      console.error("Max retries reached. Could not connect to the database.");
      process.exit(1); // Exit the process if all retries fail
    }
  }
}
connectWithRetry();

export { db, pool };
