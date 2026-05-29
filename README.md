# NeuralPath

**NeuralPath** is a local, self-paced AI/ML bootcamp delivered as a Windows desktop app. It walks you from mathematical foundations to research-level topics over a 21-week curriculum, pairing daily theory lessons with adaptive quizzes, one medium-sized project per week, and full progress tracking — streaks, mastery scores, weaknesses, and time spent. The end goal is a **Portfolio Export** you can present to companies and researchers.

The app runs entirely **offline** for lessons and projects. It uses the **Claude API** only for three things: generating quiz questions, grading short answers, and reviewing your project submissions. Your API key is stored locally and never leaves your machine except in calls to Anthropic.

---

## Prerequisites

- **Node.js 20 LTS** (recommended) — see the toolchain note below before using newer majors
- **Python 3.11+** (for running ML project code locally)
- An **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)

### Windows native-build toolchain (required)

NeuralPath uses **better-sqlite3**, which is a native C++ addon. On `npm install` it loads a prebuilt binary if one exists for your Node version, otherwise it compiles from source — and compiling needs a C++ toolchain. Two ways to satisfy this:

1. **Use Node 20 LTS.** It has prebuilt better-sqlite3 binaries, so `npm install` works with no compiler.
2. **Or install the C++ build tools** (needed for very new Node majors like 22/24, which may lack prebuilts): install **Visual Studio Build Tools** with the *"Desktop development with C++"* workload, then re-run `npm install`.

Symptom of a missing toolchain: `npm install` fails with `gyp ERR! find VS ... could not find a version of Visual Studio`. Because this is an Electron app, the addon is also automatically rebuilt against Electron's ABI during `npm run build` once a compiler is present — no manual `electron-rebuild` step needed.

## Setup

```bash
npm install
pip install -r python/requirements.txt
python assets/datasets/prepare_datasets.py   # generates iris.csv, wine.csv, ecommerce.db
npm run dev
```

Add your API key during the in-app onboarding wizard (or copy `.env.example` to `.env` and fill in `ANTHROPIC_API_KEY`). It is saved to your user data directory, never hardcoded.

## Build a Windows installer (.exe)

```bash
node scripts/genIcon.mjs   # regenerate assets/icon.png if missing
npm run build
```

The NSIS installer is written to `dist/`.

## Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Launch Vite + Electron in development |
| `npm run build` | Produce the Windows `.exe` installer |
| `npm run db:reset` | Delete the local SQLite DB so it re-seeds on next launch |

---

## Curriculum Overview

| Phase | Title | Weeks | Domain |
|---|---|---|---|
| Phase 0 | Foundations | 3 weeks (Math, Python, **SQL & Databases**) | foundations |
| Phase 1 | Classical ML | 3 weeks (Supervised, Trees, Unsupervised) | classical_ml |
| Phase 2 | Deep Learning | 3 weeks (MLP, PyTorch, CNN Foundations) | deep_learning |
| Phase 3 | Computer Vision | 5 weeks (Architectures, Detection, Segmentation, Advanced, Capstone) | cv |
| Phase 4 | NLP & LLMs | 3 weeks (Foundations, Transformers, RAG) | nlp |
| Phase 5 | Advanced & Research | 4 weeks (Generative, RL, MLOps, AI Bias) | advanced |
| **Total** | | **21 weeks** | |

Heavy weeks that need a GPU (CNNs, object detection, segmentation, LoRA, GANs, RL) integrate with **Google Colab**: NeuralPath generates a ready-to-run notebook, you train on a free T4 GPU, then import a `results.json` back into the app so progress tracking stays intact. See the in-app **Colab Guide**.

### Research alignment

Phases 4–5 are framed around the communication-aware ML research program of **Prof. Deniz Gündüz** and **Emre Ozfatura** (Imperial College London). Relevant weeks surface a "Research Extension" panel and optional research-track challenges; your Portfolio collects the papers you engaged with as PhD-trajectory work. Source papers are in `papers/`.

---

## Architecture

- **Electron** shell + **React 18 / Vite** renderer, styled with **Tailwind** and a custom dark design system.
- **better-sqlite3** for all local state (topics, sessions, quizzes, projects, streaks, goals).
- **Anthropic SDK** runs only in the Electron main process; the API key is never exposed to the renderer.
- A bundled **Python** runner (`python/runner.py`) executes project code via `child_process`.

```
electron/   main process, preload bridge, SQLite, Claude, notebook generator
src/        React app — pages, components, Zustand store, curriculum
python/     project runner + requirements
assets/     app icon + datasets
scripts/    db reset + icon generation
```

## Screenshots

_Dashboard, Lesson, Quiz, Project, Progress, and Portfolio screenshots go here._

## License

MIT
