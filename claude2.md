# claude2.md — Continuation & Build Handoff

> **Purpose:** This file is a handoff for a fresh Claude Code session. The NeuralPath app source is **complete and the renderer build passes**. The only remaining step is producing the Windows `.exe`, which was blocked on a missing C++ toolchain. The user is installing that toolchain now. When they say it's ready, follow this runbook to finish the build.
>
> Project root: `C:\Users\altnu\Desktop\Coding\ai.camp`

---

## 0. Context — what was already done (do NOT redo)

A previous session implemented everything in CLAUDE.md Section 13. Specifically created/fixed:

- **Five missing pages** that `src/App.jsx` imports (the app could not build without them):
  `src/pages/Project.jsx`, `Progress.jsx`, `Portfolio.jsx`, `ColabGuide.jsx`, `Curriculum.jsx`
- **Python runner:** `python/runner.py` + `python/requirements.txt`
- **Packaging config:** `electron-builder.yml`
- **Scripts:** `scripts/resetDb.js` (db:reset), `scripts/genIcon.mjs` (generates `assets/icon.png`)
- **Assets:** `assets/icon.png` (valid 256×256 PNG, already generated), `assets/datasets/prepare_datasets.py`
- **Docs:** full `README.md` (incl. Windows toolchain note)
- **Bug fix:** moved the `@import "highlight.js/..."` above `@tailwind` in `src/index.css` (it was being dropped, so lesson code blocks weren't highlighted).

**Verified:** `npm run build:vite` compiled all 2850 modules with zero errors (~10s).

**Was NOT possible last session:** `npm install` failed compiling `better-sqlite3` (native C++ addon) because there was no Visual Studio C++ toolchain and Node was v24.15.0 (no prebuilt binary). `node_modules` was left partial / JS-only (installed with `--ignore-scripts`).

---

## 1. First: confirm the prerequisites the user was asked to install

The user was given these instructions (verify each before building):

1. **VS Build Tools with the "Desktop development with C++" workload** — the hard requirement for compiling `better-sqlite3`.
2. *(Optional)* Switch to **Node 20 LTS** (has prebuilt binaries; avoids compiling at all).
3. Open a **fresh terminal** after install so the compiler env vars load.

Run these checks (use the Bash or PowerShell tool):

```powershell
node -v
python --version
# Confirm a C++ compiler / VS install is discoverable:
where cl ; if ($?) { "cl found" }
Get-ChildItem "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe" -ErrorAction SilentlyContinue
& "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe" -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property displayName
```

If `vswhere` lists a VS installation **with VC tools**, the toolchain is ready. If it returns nothing, the C++ workload is still missing — stop and tell the user (point them at the `gyp ERR! find VS` symptom and CLAUDE.md / README prerequisites). Do not proceed to the build; it will just fail the same way.

---

## 2. Clean install (this compiles better-sqlite3)

The existing `node_modules` was installed with `--ignore-scripts`, so the native addon is NOT built. Do a clean, full install:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
```

Watch for success. The key proof the native build worked:

```powershell
Test-Path node_modules/better-sqlite3/build/Release/better_sqlite3.node
```

Must return `True`. If `npm install` fails with `gyp ERR!`, the toolchain check in step 1 gave a false positive — re-verify, and make sure you're in a terminal opened *after* the VS install.

---

## 3. Build the installer

```powershell
node scripts/genIcon.mjs   # ensure assets/icon.png exists
npm run build              # vite build + electron-builder --win
```

`electron-builder` will rebuild `better-sqlite3` against Electron 32's ABI automatically (needs the same C++ compiler). Expect it to download the Electron binary on first run.

---

## 4. Verify the output and report back

```powershell
Get-ChildItem dist -Recurse -Include *.exe | Select-Object FullName, Length
```

Success = an NSIS installer in `dist/` named like **`NeuralPath Setup 1.0.0.exe`**.

Report to the user:
- the absolute path to the `.exe` and its size,
- confirmation that `better_sqlite3.node` compiled,
- any warnings electron-builder emitted (code-signing warnings are expected and harmless for a local/unsigned build).

---

## 5. Optional smoke test (if the user wants runtime confirmation)

A `.exe` building is not the same as the app running. To confirm it boots:

```powershell
npm run dev
```

Then check: onboarding wizard appears on first launch → enter name + API key → Dashboard renders → sidebar nav (Dashboard / Curriculum / Quiz / Projects / Progress / Portfolio / Colab Guide) all load without a blank screen. The DB seeds on first launch (`seedTopics` in `electron/db.js`); `npm run db:reset` clears it.

---

## Definition of done

- [ ] VS C++ toolchain verified present
- [ ] `npm install` completes; `better_sqlite3.node` exists
- [ ] `npm run build` produces `dist/NeuralPath Setup *.exe`
- [ ] `.exe` path + size reported to user
- [ ] (optional) `npm run dev` boots to onboarding/Dashboard
