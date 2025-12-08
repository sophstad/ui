import { execSync } from "child_process";

/**
 *
 */
async function globalTeardown() {
  try {
    execSync("yarn evg-db-ops --clean-up");
  } catch (e) {
    console.error(e);
  }
}

export default globalTeardown;
