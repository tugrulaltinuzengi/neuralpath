// Deletes the local SQLite database so the app re-seeds from scratch on next
// launch. Run with: npm run db:reset
//
// Resolves the same userData directory Electron uses by default:
//   Windows : %APPDATA%/<name>
//   macOS   : ~/Library/Application Support/<name>
//   Linux   : ~/.config/<name>
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const APP_NAME = "neuralpath"; // matches package.json "name"

function userDataDir() {
  const home = os.homedir();
  switch (process.platform) {
    case "win32":
      return path.join(process.env.APPDATA || path.join(home, "AppData", "Roaming"), APP_NAME);
    case "darwin":
      return path.join(home, "Library", "Application Support", APP_NAME);
    default:
      return path.join(process.env.XDG_CONFIG_HOME || path.join(home, ".config"), APP_NAME);
  }
}

const dir = userDataDir();
let removed = 0;
for (const f of ["neuralpath.db", "neuralpath.db-wal", "neuralpath.db-shm"]) {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    fs.rmSync(p);
    console.log("removed", p);
    removed++;
  }
}
console.log(removed ? `Database reset (${removed} file(s) removed).` : `No database found in ${dir}.`);
