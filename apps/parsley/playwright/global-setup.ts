import { execSync } from "child_process";

/**
 *
 */
async function globalSetup() {
  try {
    // Create a dump of the database state before running tests
    // The script handles reseeding, this creates the snapshot to restore from
    execSync("pnpm evg-db-ops --dump");
  } catch (e) {
    console.error(e);
  }
}

export default globalSetup;
