# NeuralPath — Quick Start

## What's in this package

```
NeuralPath_Project/
├── CLAUDE.md                          ← Full project spec (feed to Claude Code)
├── README_QUICKSTART.md               ← This file
└── papers/                            ← Research papers that align the curriculum
    ├── paper_deepjscc_wireless_image_transmission.pdf     (arXiv:1809.01733)
    ├── paper_communicate_to_learn_at_edge.pdf             (arXiv:2009.13269)
    ├── paper_ml_wireless_edge_dsgd_over_the_air.pdf       (arXiv:1901.00844)
    ├── paper_time_correlated_sparsification_FL.pdf        (arXiv:2101.08837)
    └── paper_hierarchical_FL_cellular_networks.pdf        (arXiv:1909.02362)
```

## How to build the app

### Prerequisites
- Node.js 20+
- Python 3.11+
- Anthropic API key (get one at console.anthropic.com)

### Step 1 — Feed to Claude Code
```bash
# Create a new empty folder and put CLAUDE.md inside it
mkdir neuralpath && cd neuralpath
cp /path/to/CLAUDE.md .

# Open Claude Code
claude
```

### Step 2 — In Claude Code, run:
```
Read CLAUDE.md and build the full application following
the implementation order in Section 13. Start with Phase A.
```

### Step 3 — Once built, install and run:
```bash
npm install
pip install -r python/requirements.txt
npm run dev
```

### Step 4 — Build .exe:
```bash
npm run build
# Installer will be in /dist folder
```

## Research Papers (Section 17)
The 5 papers in /papers/ are from Prof. Deniz Gündüz (Imperial College London)
and Emre Ozfatura. They define the research vision that the curriculum is aligned
with. Each paper maps to specific curriculum weeks — see Section 17 in CLAUDE.md
for full details.

Reading order: Paper 2 → Paper 1 → Paper 3 → Paper 4 → Paper 5

## Curriculum overview
21 weeks | 6 phases | 1 project/week | Daily quiz + lesson

| Phase | Weeks | Domain |
|-------|-------|--------|
| 0 | 1-3 | Math, Python, SQL |
| 1 | 4-6 | Classical ML |
| 2 | 7-9 | Deep Learning |
| 3 | 10-14 | Computer Vision (weighted) |
| 4 | 15-17 | NLP & LLMs |
| 5 | 18-21 | Advanced & Research |
