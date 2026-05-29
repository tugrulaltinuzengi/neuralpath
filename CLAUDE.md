# CLAUDE.md — AI/ML Mastery Bootcamp (Desktop App)

> Feed this file to Claude Code and run: build the full application as specified.
> Do not ask clarifying questions — follow every decision made here exactly.

---

## 1. Project Overview

Build a **local desktop application** (.exe on Windows) called **"NeuralPath"** — a self-paced, PhD-trajectory AI/ML bootcamp with:

- Structured curriculum from foundations → research-level topics
- Daily theory lessons + adaptive quizzes (powered by Claude API)
- One medium-sized **weekly project** per curriculum week
- Full progress tracking: scores, streaks, weaknesses, time spent
- A **Portfolio Export** system the user can present to companies and researchers

The app runs entirely **offline for lessons/projects** and uses the **Claude API** only for quiz generation, answer grading, and project feedback.

---

## 2. Tech Stack — Final Decisions

| Layer | Technology | Reason |
|---|---|---|
| Shell | **Electron v29+** | Cross-platform, .exe packaging, Node access |
| Frontend | **React 18 + Vite** | Fast, component-based, rich UI |
| Styling | **Tailwind CSS v3** | Utility-first, no CSS file sprawl |
| Charts | **Recharts** | Progress dashboards |
| Database | **better-sqlite3** | Local SQLite, zero config, fast |
| AI Engine | **Anthropic SDK (Node)** | Quiz generation, grading, feedback |
| Python Bridge | **child_process** spawning a bundled Python 3.11 interpreter | Running ML project code |
| Packaging | **electron-builder** | Produces `.exe` installer for Windows |
| Markdown | **react-markdown + remark-gfm + rehype-highlight** | Rendering lessons |
| State | **Zustand** | Lightweight global state |
| Icons | **Lucide React** | Clean icon set |

---

## 3. Environment Setup & Configuration

### 3.1 Root Files

```
neuralpath/
├── CLAUDE.md                  ← this file
├── package.json
├── vite.config.js
├── electron/
│   ├── main.js                ← Electron main process
│   ├── preload.js             ← IPC bridge
│   └── db.js                  ← SQLite initialization & queries
├── src/
│   ├── main.jsx               ← React entry
│   ├── App.jsx
│   ├── store/
│   │   └── useStore.js        ← Zustand store
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Lesson.jsx
│   │   ├── Quiz.jsx
│   │   ├── Project.jsx
│   │   ├── Progress.jsx
│   │   └── Portfolio.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── CurriculumTree.jsx
│   │   ├── QuizCard.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ProgressRing.jsx
│   │   ├── HeatmapCalendar.jsx
│   │   ├── RadarChart.jsx
│   │   ├── StreakBadge.jsx
│   │   └── MarkdownRenderer.jsx
│   └── curriculum/
│       └── index.js           ← Full curriculum definition (see Section 6)
├── python/
│   ├── runner.py              ← Executes project starter code safely
│   └── requirements.txt
├── assets/
│   └── icon.png
└── electron-builder.yml
```

### 3.2 package.json scripts

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"electron .\"",
    "build": "vite build && electron-builder --win",
    "db:reset": "node scripts/resetDb.js"
  }
}
```

### 3.3 .env (user must create this, shown in onboarding)

```
ANTHROPIC_API_KEY=sk-ant-...
```

Stored in `app.getPath('userData')/config.json` after onboarding, never hardcoded.

---

## 4. Database Schema (SQLite via better-sqlite3)

Initialize all tables in `electron/db.js` on first launch.

```sql
-- User configuration
CREATE TABLE IF NOT EXISTS config (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- All curriculum topics
CREATE TABLE IF NOT EXISTS topics (
  id            TEXT PRIMARY KEY,   -- e.g. "p0_w1_d1"
  phase         INTEGER,
  week          INTEGER,
  day           INTEGER,
  title         TEXT,
  domain        TEXT,               -- "classical_ml" | "cv" | "nlp" | "foundations" | "advanced"
  status        TEXT DEFAULT 'locked',  -- locked | available | in_progress | completed
  mastery_score INTEGER DEFAULT 0,  -- 0-100
  last_visited  TEXT                -- ISO datetime
);

-- Daily lesson sessions
CREATE TABLE IF NOT EXISTS sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id      TEXT,
  date          TEXT,               -- ISO date
  duration_secs INTEGER,
  completed     INTEGER DEFAULT 0,
  notes         TEXT                -- user freeform notes
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id      TEXT,
  date          TEXT,
  questions_json TEXT,              -- JSON array of {question, correct_answer, user_answer, is_correct, explanation}
  score         INTEGER,            -- 0-100
  ai_feedback   TEXT
);

-- Weekly project submissions
CREATE TABLE IF NOT EXISTS projects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id       TEXT,               -- e.g. "p1_w2"
  title         TEXT,
  submitted_at  TEXT,
  code_path     TEXT,               -- path to user's submitted file
  self_notes    TEXT,
  ai_feedback   TEXT,
  score         INTEGER,
  status        TEXT DEFAULT 'pending' -- pending | submitted | graded
);

-- Streak tracking
CREATE TABLE IF NOT EXISTS streaks (
  date          TEXT PRIMARY KEY,   -- ISO date YYYY-MM-DD
  studied       INTEGER DEFAULT 0,  -- 1 if user completed at least one lesson
  quiz_done     INTEGER DEFAULT 0
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT,
  text          TEXT,
  target_date   TEXT,
  completed     INTEGER DEFAULT 0
);
```

---

## 5. Electron Main Process (`electron/main.js`)

Implement the following IPC handlers (called from renderer via `window.api`):

```
ipcMain handlers:
  - db:query       (sql, params) → rows
  - db:run         (sql, params) → { changes, lastInsertRowid }
  - claude:chat    (messages[], systemPrompt) → streamed text response
  - python:run     (scriptPath, args) → { stdout, stderr, exitCode }
  - fs:readFile    (filePath) → string
  - fs:writeFile   (filePath, content) → void
  - fs:openDialog  () → selected file path
  - config:get     (key) → value
  - config:set     (key, value) → void
  - export:pdf     (htmlContent) → saves PDF to Downloads folder
```

The `preload.js` exposes `window.api` with all above methods via `contextBridge`.

---

## 6. Curriculum Definition (`src/curriculum/index.js`)

Export a `CURRICULUM` array. Each entry is a **Phase** containing **Weeks** containing **Days**.

### 6.1 Structure Shape

```js
{
  phase: 0,
  title: "Foundations",
  weeks: [
    {
      week: 1,
      title: "Math & Python for ML",
      project: {
        title: "EDA Pipeline",
        description: "...",
        starter_code: "...",
        evaluation_criteria: [...]
      },
      days: [
        {
          day: 1,
          title: "Linear Algebra for ML",
          domain: "foundations",
          lesson_markdown: "...",   // ~800-1200 word lesson
          quiz_prompt: "...",       // instruction for Claude to generate 8 questions
          key_concepts: ["vectors", "matrix multiplication", "eigenvalues", "SVD"]
        },
        ...
      ]
    }
  ]
}
```

### 6.2 Full Curriculum Outline

Implement ALL of the following. Write full `lesson_markdown` content for every day (800–1200 words with code examples). Write `quiz_prompt` for Claude. Write full `project` spec per week.

---

#### PHASE 0 — Foundations (3 weeks)

**Week 1: Math & Python for ML**
- Day 1: Linear Algebra — vectors, matrices, dot products, matrix multiplication, transpose, inverse
- Day 2: Eigenvalues, SVD, PCA intuition from linear algebra
- Day 3: Calculus — gradients, partial derivatives, chain rule, Jacobians
- Day 4: Probability & Statistics — distributions, Bayes theorem, expectation, variance, MLE
- Day 5: NumPy & Pandas deep dive — broadcasting, vectorized operations, DataFrames

Weekly Project: **"EDA Pipeline"** — given a real CSV dataset (include UCI Iris + Wine datasets in `/assets/datasets/`), build an EDA script that: loads data, computes stats, detects outliers, produces 5 visualizations, outputs a markdown report. Evaluate: code quality, insight depth, visualization choices.

**Week 2: ML Ecosystem & Tooling**
- Day 1: Scikit-learn architecture — estimators, transformers, pipelines
- Day 2: Matplotlib & Seaborn — publication-quality plots
- Day 3: PyTorch fundamentals — tensors, autograd, computational graph
- Day 4: Training loop anatomy — forward pass, loss, backward, optimizer step
- Day 5: Experiment tracking with MLflow — logging metrics, artifacts, model registry

Weekly Project: **"PyTorch From Scratch"** — implement a 2-layer neural network in pure PyTorch (no nn.Module) that classifies the Iris dataset. Must implement forward pass, manual gradient computation, SGD update loop, and plot loss curve.

**Week 3: SQL & Databases for ML**
- Day 1: SQL Foundations — relational model, DDL vs DML, `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, data types, `NULL` semantics
- Day 2: Aggregations & Grouping — `GROUP BY`, `HAVING`, aggregate functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`), `DISTINCT`, filtering after aggregation
- Day 3: Joins & Relationships — `INNER JOIN`, `LEFT/RIGHT JOIN`, `FULL OUTER JOIN`, `CROSS JOIN`, self-joins, when to use each; foreign keys and normalization (1NF → 3NF)
- Day 4: Advanced SQL — window functions (`ROW_NUMBER`, `RANK`, `LAG`, `LEAD`, `NTILE`, `PARTITION BY`), CTEs (`WITH` clauses), subqueries vs CTEs vs joins, query execution order (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY)
- Day 5: SQL for ML Workflows — feature engineering in SQL (bucketing, one-hot with CASE WHEN, date/time features, rolling averages), indexing & query optimization (`EXPLAIN ANALYZE`), SQLite + PostgreSQL differences, pandas ↔ SQL (`pd.read_sql`, `DataFrame.to_sql`, SQLAlchemy basics)

Weekly Project: **"SQL Feature Store"** — given a raw relational e-commerce database (orders, customers, products, events tables — include as a pre-built `.sqlite` file in `/assets/datasets/ecommerce.db`), write a series of SQL queries that:
1. Profile the data (nulls, distributions, outliers) using only SQL
2. Engineer at least 10 ML features (RFM scores, purchase frequency, average basket size, days since last order, category affinity) entirely in SQL using CTEs and window functions
3. Export the feature table to pandas and train a simple churn classifier (LogisticRegression)
4. Write a `features.sql` file that can regenerate the entire feature table from raw tables in one query
Evaluation criteria: SQL correctness, feature quality, query readability (CTEs named clearly), no unnecessary subqueries where a window function suffices.

---

#### PHASE 1 — Classical ML (3 weeks)

**Week 4: Supervised Learning I**
- Day 1: Linear Regression — OLS, gradient descent, regularization (Ridge, Lasso, ElasticNet)
- Day 2: Logistic Regression — sigmoid, cross-entropy loss, decision boundary, multiclass (OvR, softmax)
- Day 3: Bias-Variance Tradeoff — underfitting/overfitting, learning curves, model complexity
- Day 4: Model Evaluation — confusion matrix, precision, recall, F1, ROC-AUC, PR curves
- Day 5: Cross-validation & Hyperparameter Tuning — k-fold, GridSearchCV, RandomizedSearchCV, Optuna intro

Weekly Project: **"Churn Predictor"** — train a logistic regression and ridge regression on a customer churn dataset. Compare models with cross-validated AUC. Produce a model card (markdown) explaining the model, data, evaluation, and limitations.

**Week 5: Tree-Based Methods**
- Day 1: Decision Trees — splitting criteria (Gini, entropy), pruning, depth control
- Day 2: Random Forests — bagging, feature importance, OOB score, hyperparameters
- Day 3: Gradient Boosting — additive modeling, XGBoost, LightGBM, CatBoost comparison
- Day 4: Ensemble Methods — voting, stacking, blending, diversity
- Day 5: SHAP values — global/local explainability, TreeSHAP, force plots

Weekly Project: **"Tabular Competition Baseline"** — using the Titanic dataset or a Kaggle-style tabular problem (include in assets), build a full pipeline: feature engineering → baseline (LR) → Random Forest → XGBoost → stacked ensemble. Report: CV score comparison table + SHAP analysis.

**Week 6: Unsupervised Learning**
- Day 1: K-Means — algorithm, inertia, elbow method, k-means++, limitations
- Day 2: Hierarchical Clustering — dendrograms, linkage methods, silhouette score
- Day 3: DBSCAN & Gaussian Mixture Models
- Day 4: PCA — variance explained, scree plot, reconstruction, limitations
- Day 5: t-SNE & UMAP — intuition, hyperparameters, visualization best practices

Weekly Project: **"Customer Segmentation"** — cluster an e-commerce dataset (RFM features), determine optimal k, visualize clusters with PCA + UMAP, write a business interpretation of each cluster segment.

---

#### PHASE 2 — Deep Learning Foundations (3 weeks)

**Week 7: Neural Network Architecture**
- Day 1: Perceptron to MLP — universal approximation theorem, depth vs width
- Day 2: Activation Functions — ReLU, GELU, Swish, dying ReLU problem, initialization
- Day 3: Backpropagation — full derivation, vanishing/exploding gradients, gradient clipping
- Day 4: Optimizers — SGD with momentum, RMSProp, Adam, AdamW, learning rate schedules
- Day 5: Regularization — L1/L2, dropout, batch normalization, layer normalization

Weekly Project: **"MLP Digit Classifier"** — build a fully connected network on MNIST using nn.Module. Implement: custom training loop, validation loop, early stopping, LR scheduler. Achieve >98% test accuracy. Analyze failure cases.

**Week 8: PyTorch Deep Dive**
- Day 1: nn.Module internals — parameters, buffers, hooks, custom layers
- Day 2: DataLoader & Dataset — custom Dataset class, transforms, augmentation
- Day 3: Loss Functions — cross-entropy, focal loss, triplet loss, when to use what
- Day 4: Mixed Precision Training — torch.cuda.amp, gradient scaling
- Day 5: Debugging neural networks — gradient flow, weight histograms, nan/inf detection

Weekly Project: **"Custom Architecture Benchmark"** — implement 3 MLP variants with different normalization strategies (BatchNorm vs LayerNorm vs no-norm) on CIFAR-10. Plot training curves, test accuracy, and gradient norms. Write analysis of what worked and why.

**Week 9: Convolutional Foundations**
- Day 1: Convolution operation — kernels, stride, padding, receptive field, feature maps
- Day 2: Pooling, channels, parameter count calculation
- Day 3: Classic architectures — LeNet, AlexNet, VGG — evolution and design choices
- Day 4: Batch Norm in CNNs, dropout placement, weight initialization (He/Xavier)
- Day 5: Transfer learning concepts — feature extraction vs fine-tuning, domain shift

Weekly Project: **"CNN from Scratch on CIFAR-10"** — implement a CNN (no pretrained weights) achieving >85% on CIFAR-10. Must include: proper weight initialization, batch norm, data augmentation pipeline, LR warmup + cosine decay schedule.

---

#### PHASE 3 — Computer Vision (5 weeks) ← WEIGHTED HEAVILY

**Week 10: Modern CNN Architectures**
- Day 1: ResNet — residual connections, identity mapping, why depth became possible
- Day 2: DenseNet, EfficientNet — compound scaling, MBConv blocks
- Day 3: Vision Transformer (ViT) — patch embedding, position encoding, attention in vision
- Day 4: Swin Transformer — shifted windows, hierarchical features
- Day 5: Model comparison — parameter count, FLOPs, accuracy, latency tradeoffs

Weekly Project: **"Transfer Learning Showdown"** — fine-tune ResNet50 vs EfficientNet-B3 on a custom image classification task (use Flowers102 or Food101 from torchvision). Compare: convergence speed, final accuracy, inference time. Freeze vs unfreeze experiments.

**Week 11: Object Detection**
- Day 1: Detection fundamentals — anchor boxes, IoU, NMS, mAP metric
- Day 2: Two-stage detectors — R-CNN family, RoI pooling, FPN
- Day 3: YOLO family history — YOLOv1 to YOLOv8 architectural evolution
- Day 4: YOLOv8 in depth — architecture, loss function, training configuration
- Day 5: Data preparation for detection — COCO format, annotation tools, augmentation for detection

Weekly Project: **"Custom Object Detector"** — train YOLOv8n on a small custom dataset (user creates a 100-image dataset of any object using their phone, annotated with Label Studio or Roboflow free tier). Achieve >0.7 mAP@50. Export to ONNX.

**Week 12: Image Segmentation**
- Day 1: Semantic vs instance vs panoptic segmentation — task definitions and metrics
- Day 2: FCN and skip connections — semantic segmentation fundamentals
- Day 3: U-Net architecture — encoder-decoder, skip connections, medical imaging origins
- Day 4: DeepLabV3+ — atrous convolutions, ASPP module
- Day 5: Mask R-CNN — combining detection + segmentation, RoIAlign

Weekly Project: **"Semantic Segmentation Pipeline"** — train U-Net on Oxford-IIIT Pet dataset (binary segmentation: pet vs background). Implement: custom Dataset, augmentations (albumentation), IoU metric, visual overlay output. Export inference as a demo script.

**Week 13: Advanced CV Topics**
- Day 1: Image generation overview — GANs, VAEs, Diffusion models at a high level
- Day 2: Self-supervised learning in CV — SimCLR, MoCo, DINO, MAE intuition
- Day 3: Grad-CAM and visual explainability — implementation from scratch
- Day 4: CV model optimization — quantization (INT8), pruning, ONNX export, TensorRT intro
- Day 5: Deployment patterns — FastAPI serving, batching, ONNX Runtime inference

Weekly Project: **"CV Inference Pipeline"** — take the trained model from Week 11, export to ONNX, wrap in a FastAPI endpoint, and build a minimal HTML demo page that accepts image upload and returns segmentation overlay. Benchmark: PyTorch vs ONNX inference latency.

**Week 14: CV Capstone**
- Day 1: Dataset curation best practices — class imbalance, data cleaning, labeling quality
- Day 2: Training at scale — DDP basics, gradient accumulation, mixed precision combined
- Day 3: Failure modes in CV — distribution shift, spurious correlations, shortcut learning
- Day 4: AI Bias in Vision — dataset bias, demographic performance gaps, audit methods
- Day 5: Research paper reading — how to read a CV paper in 1 hour (abstract→method→experiments)

Weekly Project: **"CV Audit Report"** — take any publicly available image classifier (e.g., ResNet on ImageNet or a face detection model). Write a structured bias audit: dataset analysis, demographic performance evaluation (using FairFace or similar), failure case documentation, mitigation recommendations. Output as a PDF report.

---

#### PHASE 4 — NLP & Transformers (3 weeks)

**Week 15: NLP Foundations**
- Day 1: Text preprocessing — tokenization, stemming, lemmatization, regex, cleaning pipeline
- Day 2: Bag of Words, TF-IDF, n-grams — classical text representation
- Day 3: Word embeddings — Word2Vec (CBOW, skip-gram), GloVe, FastText
- Day 4: RNNs, LSTMs, GRUs — sequence modeling, vanishing gradient in RNNs
- Day 5: Seq2Seq and the attention mechanism — the paper "Attention is All You Need" foundations

Weekly Project: **"Sentiment Analysis Pipeline"** — build a complete sentiment classifier: TF-IDF + Logistic Regression baseline → LSTM → fine-tuned DistilBERT. Compare on IMDB dataset. Write a production-style inference script.

**Week 16: Transformers & LLMs**
- Day 1: Transformer architecture from scratch — multi-head attention, positional encoding, layer norm
- Day 2: BERT — masked language modeling, NSP, fine-tuning for classification
- Day 3: GPT family — causal language modeling, in-context learning, scaling laws
- Day 4: HuggingFace ecosystem — Trainer API, datasets library, tokenizers, model hub
- Day 5: Fine-tuning strategies — full fine-tuning, LoRA, QLoRA, parameter-efficient methods

Weekly Project: **"LoRA Fine-Tuning"** — fine-tune a small LLM (Phi-3-mini or Qwen2-0.5B) on a domain-specific dataset using LoRA via HuggingFace PEFT. Tasks: text classification or instruction-following. Log metrics with MLflow. Calculate trainable parameter reduction.

**Week 17: RAG & Production NLP**
- Day 1: RAG architecture — retrieval, chunking, embedding models, vector stores
- Day 2: Vector databases — FAISS, ChromaDB, similarity search
- Day 3: Evaluation of LLMs — BLEU, ROUGE, BERTScore, human eval, LLM-as-judge
- Day 4: Prompt engineering systematically — zero/few-shot, CoT, structured output, system prompts
- Day 5: NLP Bias — stereotype propagation, toxicity, gender bias in embeddings, audit tools

Weekly Project: **"RAG Q&A System"** — build a RAG pipeline over a set of ML research papers (PDFs). Components: PDF parsing → chunking → embeddings (sentence-transformers) → FAISS index → Claude API for generation. Evaluate answer quality on 20 hand-crafted Q&A pairs.

---

#### PHASE 5 — Advanced & Research Level (4 weeks)

**Week 18: Generative Models**
- Day 1: VAE — latent space, reparameterization trick, ELBO
- Day 2: GAN fundamentals — minimax game, training instability, mode collapse
- Day 3: DCGAN, StyleGAN2 architecture highlights
- Day 4: Diffusion models — DDPM, DDIM, noise schedule, score matching intuition
- Day 5: Stable Diffusion architecture — UNet denoiser, CLIP conditioning, latent diffusion

Weekly Project: **"Conditional DCGAN"** — implement and train a conditional DCGAN on MNIST or Fashion-MNIST. Generate class-conditioned samples. Evaluate with FID score (use pytorch-fid). Document training instabilities encountered and how you resolved them.

**Week 19: Reinforcement Learning**
- Day 1: MDP formulation — states, actions, rewards, policy, value functions
- Day 2: Q-Learning and Deep Q-Network (DQN)
- Day 3: Policy Gradient methods — REINFORCE, Actor-Critic, PPO intuition
- Day 4: Reward shaping, exploration strategies, environment wrappers (Gym/Gymnasium)
- Day 5: RL in practice — sample efficiency, reward hacking, real-world deployment challenges

Weekly Project: **"DQN Cart-Pole Agent"** — implement DQN from scratch (experience replay, target network) on CartPole-v1. Must achieve consistent 500 score. Log training with MLflow. Produce a video of the trained agent (use gymnasium's render mode).

**Week 20: MLOps & Production ML**
- Day 1: ML pipelines — data versioning (DVC), feature stores, training pipelines
- Day 2: Model serving — FastAPI, Triton Inference Server basics, batching
- Day 3: Monitoring — data drift detection, model degradation, Evidently AI
- Day 4: CI/CD for ML — GitHub Actions, automated retraining triggers
- Day 5: Responsible AI frameworks — model cards, datasheets, audit trails

Weekly Project: **"End-to-End ML System"** — build a small but complete MLOps pipeline: DVC for data versioning → training script → MLflow tracking → FastAPI serving endpoint → drift monitoring stub. Write a system design document explaining each component.

**Week 21: AI Bias & Fairness**
- Day 1: Types of bias — historical, representation, measurement, aggregation, deployment bias
- Day 2: Fairness metrics — demographic parity, equalized odds, calibration, impossibility theorems
- Day 3: Bias mitigation techniques — pre-processing (resampling), in-processing (adversarial), post-processing (threshold adjustment)
- Day 4: Auditing tools — Fairlearn, AI Fairness 360, Aequitas
- Day 5: Case studies — COMPAS recidivism, facial recognition bias, hiring algorithm failures

Weekly Project: **"Bias Audit & Mitigation"** — take a hiring/credit/recidivism dataset (Adult Income or COMPAS). Train a classifier. Measure fairness metrics across demographic groups. Apply one pre-processing and one post-processing mitigation. Report: before/after fairness metric comparison + accuracy-fairness tradeoff analysis.

---

## 7. Daily Flow (UX/Logic)

Each day in the app follows this sequence:

```
1. LESSON PAGE
   - Render lesson_markdown for the current day
   - "Mark as Read" button + time tracker starts
   - User can take freeform notes (saved to sessions table)

2. QUIZ PAGE (unlocks after lesson is marked read)
   - Call Claude API with quiz_prompt + topic context
   - Claude returns 8 questions (5 MCQ + 3 short answer)
   - User answers all questions
   - Submit → Claude grades short answers, checks MCQs
   - Show: score, per-question feedback, explanations
   - Store results in quiz_attempts

3. REFLECTION (optional, shown after quiz)
   - Textarea: "What was confusing? What do you want to revisit?"
   - Saved to sessions.notes

4. UNLOCK NEXT DAY
   - Next day unlocks if quiz score ≥ 60
   - If score < 60: show "Retry Quiz" option + highlight weak areas
   - Mastery score = average of last 2 quiz attempts on this topic
```

Weekly Project flow (available from Day 1 of the week, due by Day 5):
```
1. PROJECT PAGE
   - Show project brief (title, description, objectives, evaluation criteria)
   - Show starter code in a code editor (use CodeMirror or Monaco Editor)
   - User works locally (opens in their editor via "Open in VS Code" button)
   - "Submit" → opens file picker → user selects their .py file
   - User adds self-notes in a textarea
   - Claude API reviews: reads code + self-notes, gives structured feedback
     (What's good, What's missing, Suggested improvements, Score /100)
   - Store in projects table
```

---

## 8. Claude API Integration (`electron/claude.js`)

```js
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: configGet("ANTHROPIC_API_KEY") });

// Quiz generation
export async function generateQuiz(topicTitle, keyConcepts, quizPrompt) {
  const systemPrompt = `You are an expert ML/AI educator creating exam-quality questions.
Return ONLY valid JSON — no markdown, no explanation.
Format:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 2,
      "explanation": "..."
    },
    {
      "id": 6,
      "type": "short_answer",
      "question": "...",
      "model_answer": "...",
      "grading_rubric": "..."
    }
  ]
}
Generate 5 MCQ and 3 short answer questions.`;

  const userPrompt = `Topic: ${topicTitle}
Key concepts: ${keyConcepts.join(", ")}
Additional focus: ${quizPrompt}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return JSON.parse(response.content[0].text);
}

// Short answer grading
export async function gradeShortAnswer(question, modelAnswer, rubric, userAnswer) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: `You are grading a short answer ML exam question. 
Return ONLY JSON: { "score": 0-2, "feedback": "one sentence" }
Scoring: 2=correct, 1=partially correct, 0=incorrect`,
    messages: [{
      role: "user",
      content: `Question: ${question}
Model answer: ${modelAnswer}
Rubric: ${rubric}
Student answer: ${userAnswer}`
    }],
  });
  return JSON.parse(response.content[0].text);
}

// Project feedback
export async function reviewProject(projectSpec, userCode, selfNotes) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `You are a senior ML engineer reviewing a bootcamp project submission.
Be specific, technical, and constructive. Return JSON:
{
  "score": 0-100,
  "strengths": ["...", "..."],
  "gaps": ["...", "..."],
  "improvements": ["...", "..."],
  "verdict": "one paragraph summary"
}`,
    messages: [{
      role: "user",
      content: `Project: ${projectSpec.title}
Objectives: ${projectSpec.description}
Evaluation criteria: ${JSON.stringify(projectSpec.evaluation_criteria)}

Student code:
\`\`\`python
${userCode}
\`\`\`

Student's self-notes: ${selfNotes}`
    }],
  });
  return JSON.parse(response.content[0].text);
}
```

---

## 9. Pages — Detailed Specifications

### 9.1 Dashboard (`Dashboard.jsx`)

The main home screen. Shows:

- **Today's topic card** — title, phase, domain tag, estimated time, "Start Lesson" CTA button
- **Weekly project card** — project title, days remaining, current status (not started / in progress / submitted / graded), score if graded
- **Streak widget** — current streak in days, longest streak, calendar heatmap of last 30 days (green = studied, red = missed, gray = future)
- **Phase progress** — horizontal progress bar per phase (0–5), % complete
- **Mastery Radar Chart** — 6 axes: Foundations, Classical ML, Deep Learning, Computer Vision, NLP, Advanced — scores 0-100 per domain
- **Recent quiz history** — last 5 quiz scores as a small bar chart
- **Active Goals** — list of user-created goals with checkboxes

### 9.2 Lesson Page (`Lesson.jsx`)

- Full-width markdown renderer with syntax highlighting (use highlight.js with a dark theme)
- Sticky header: topic title, phase/week/day breadcrumb, estimated read time
- Right sidebar: key concepts checklist (user ticks off as they understand each)
- Notes panel (collapsible): textarea saved to SQLite in real time (debounced 500ms)
- Bottom bar: "Mark as Read → Take Quiz" button. Only enabled after 3 minutes on page (anti-skip)
- Timer running in background (saves duration_secs to sessions)

### 9.3 Quiz Page (`Quiz.jsx`)

- Load spinner while Claude generates quiz (show "Generating personalized questions...")
- Display questions one at a time (paginated, not all at once)
- MCQ: radio buttons with A/B/C/D labels
- Short answer: textarea with word count indicator
- Progress bar: "Question 3 of 8"
- Submit all → loading state ("Grading with AI...") → Results view:
  - Score badge (e.g., 87/100)
  - Per question: green check or red X, user's answer, correct answer, explanation
  - Weak concepts summary: "You should review: backpropagation, vanishing gradients"
  - "Retry" button (regenerates new questions on same topic)
  - "Continue" button (marks topic complete, goes to next)

### 9.4 Project Page (`Project.jsx`)

- Project brief section: title, description, objectives as checklist
- Evaluation criteria as a rubric table (criteria | weight | status)
- Starter code block (syntax highlighted, copy button)
- "Open Folder in VS Code" button (spawns `code .` in the project directory)
- File submission: drag-and-drop or file picker for `.py` file
- Self-assessment textarea: "What did you build? What was hard? What would you improve?"
- "Submit & Get AI Feedback" button → loading → feedback display:
  - Score badge
  - Strengths (green bullets)
  - Gaps (orange bullets)
  - Improvement suggestions (blue bullets)
  - Verdict paragraph

### 9.5 Progress Page (`Progress.jsx`)

Four tabs:

**Overview tab:**
- Total hours studied (sum of all session durations)
- Topics completed / total topics count
- Average quiz score across all topics
- Projects submitted / total projects

**Curriculum Map tab:**
- Vertical tree showing all phases → weeks → days
- Each day node: color coded (locked=gray, available=blue, completed=green, weak=orange if mastery<70)
- Click any completed day → see quiz history for that topic

**Weaknesses tab:**
- Table: topic | mastery score | last attempted | "Re-study" button
- Sorted ascending by mastery score (worst first)
- Filter by domain

**Quiz History tab:**
- Table: date | topic | score | view details button
- Clicking "view details" shows full Q&A breakdown from that attempt

### 9.6 Portfolio Page (`Portfolio.jsx`)

This is the **"present to companies"** feature. Generates a clean, professional summary.

Sections:
1. **Header**: "AI/ML Learning Portfolio — [User Name]"
2. **Summary stats**: Total hours, weeks completed, avg quiz score, projects built
3. **Skill Radar** chart (rendered, exportable)
4. **Completed Projects** — for each graded project: title, score, AI feedback verdict, GitHub link field (user can paste)
5. **Knowledge Coverage** — checklist of all key concepts covered
6. **Learning Goals** — goals set vs achieved
7. **Export Options**:
   - "Export as PDF" (uses Electron's `printToPDF`)
   - "Copy Markdown Summary" (for GitHub README or resume)
   - "Export JSON" (full data dump for custom use)

---

## 10. UI Design Specification

**Aesthetic direction:** Dark, technical, precise — like a high-end IDE meets a research dashboard. NOT generic SaaS. Inspired by VSCode + Linear + Weights & Biases.

**Color palette (CSS variables):**
```css
--bg-base:      #0d0f14;   /* near-black background */
--bg-surface:   #13161e;   /* card/panel background */
--bg-elevated:  #1a1e2a;   /* hover states, modals */
--border:       #252a38;   /* subtle borders */
--accent:       #4f8ef7;   /* primary blue — actions, links */
--accent-green: #3ecf8e;   /* success, completed */
--accent-orange:#f59e0b;   /* warning, weak mastery */
--accent-red:   #ef4444;   /* errors, failed */
--text-primary: #e8eaf0;   /* main text */
--text-muted:   #6b7280;   /* secondary text */
--text-dim:     #3d4455;   /* disabled/placeholder */
```

**Typography:**
```css
--font-display: 'JetBrains Mono', monospace;   /* headings, labels */
--font-body:    'IBM Plex Sans', sans-serif;    /* body text */
--font-code:    'JetBrains Mono', monospace;   /* code blocks */
```
Load both from Google Fonts.

**Sidebar (left, fixed, 220px):**
- App logo: "NeuralPath" in JetBrains Mono with a small neural net icon (SVG)
- Nav items: Dashboard, Curriculum, Quiz, Projects, Progress, Portfolio
- Active state: left accent bar (4px blue) + subtle background highlight
- Bottom: API key status indicator (green dot = connected, red = not set)
- Streak counter pinned at bottom

**Cards:** Rounded-lg (12px), `--bg-surface` background, `--border` border, subtle box-shadow
**Buttons:** Primary = `--accent` bg, white text. Secondary = transparent with border. Hover = brightness(1.15)
**Code blocks:** `--bg-base` background, JetBrains Mono, line numbers, copy button top-right

---

## 11. Onboarding Flow

First launch → Onboarding wizard (3 steps):

1. **Welcome**: "Welcome to NeuralPath. Your PhD-level AI/ML training system." — Enter your name
2. **API Key**: Explain what it's used for, link to console.anthropic.com, text input, "Test Connection" button
3. **Goals**: "What do you want to achieve?" — textarea for user to write their goals, target completion date picker

After onboarding: config saved to `userData/config.json`, first topic unlocked, go to Dashboard.

---

## 12. Build & Packaging

### 12.1 electron-builder.yml

```yaml
appId: com.neuralpath.app
productName: NeuralPath
directories:
  output: dist
win:
  target:
    - target: nsis
      arch: [x64]
  icon: assets/icon.png
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  installerIcon: assets/icon.png
  uninstallerIcon: assets/icon.png
  installerHeaderIcon: assets/icon.png
  createDesktopShortcut: true
  createStartMenuShortcut: true
files:
  - dist/**/*
  - electron/**/*
  - assets/**/*
  - node_modules/**/*
  - package.json
extraResources:
  - from: python/
    to: python/
```

### 12.2 Python bundling

Bundle Python scripts in `extraResources`. In `electron/main.js`, locate Python via:

```js
const pythonPath = app.isPackaged
  ? path.join(process.resourcesPath, 'python', 'runner.py')
  : path.join(__dirname, '../python/runner.py');
```

Python runner uses a virtual environment. Include `requirements.txt`:
```
numpy
pandas
matplotlib
scikit-learn
torch --index-url https://download.pytorch.org/whl/cpu
torchvision --index-url https://download.pytorch.org/whl/cpu
mlflow
```

Note in README: user must run `pip install -r python/requirements.txt` once. Full Python bundling via PyInstaller is optional Phase 2 enhancement.

---

## 13. Implementation Order for Claude Code

Build in this exact sequence. Do not skip phases.

```
Phase A — Scaffold
  1. Initialize Electron + Vite + React project
  2. Install all dependencies
  3. Set up electron/main.js with all IPC handlers
  4. Set up preload.js with contextBridge
  5. Initialize SQLite DB with full schema
  6. Build Sidebar + routing (React Router)
  7. Apply full design system (CSS variables, fonts, global styles)

Phase B — Core Loop
  8. Build Dashboard page (mock data ok for now)
  9. Build Lesson page (markdown renderer, timer, notes)
  10. Build Quiz page (Claude API integration, MCQ + short answer)
  11. Wire quiz results to SQLite
  12. Build topic unlock logic

Phase C — Projects
  13. Build Project page (brief, starter code display, file submission)
  14. Wire Claude API project review
  15. Store project submissions in SQLite

Phase D — Progress & Portfolio
  16. Build Progress page (all 4 tabs, charts)
  17. Build Portfolio page
  18. Implement PDF export

Phase E — Curriculum Content
  19. Write full curriculum/index.js with all lesson markdown, quiz prompts, project specs
  20. Seed topics table from curriculum on first launch

Phase F — Polish & Packaging
  21. Onboarding wizard
  22. Goals system
  23. electron-builder config
  24. Build .exe
  25. Write README.md with setup instructions
```

---

## 14. README.md (generate this file too)

Include:
- What NeuralPath is (2 paragraphs)
- Prerequisites: Node 20+, Python 3.11+, Anthropic API key
- Setup: `npm install` → `pip install -r python/requirements.txt` → add API key → `npm run dev`
- Build .exe: `npm run build`
- Curriculum overview table (Phase | Title | Weeks | Domain) — use this data:
  | Phase 0 | Foundations | 3 weeks (Math, Python, **SQL & Databases**) | foundations |
  | Phase 1 | Classical ML | 3 weeks (Supervised, Trees, Unsupervised) | classical_ml |
  | Phase 2 | Deep Learning | 3 weeks (MLP, PyTorch, CNN Foundations) | deep_learning |
  | Phase 3 | Computer Vision | 5 weeks (Architectures, Detection, Segmentation, Advanced, Capstone) | cv |
  | Phase 4 | NLP & LLMs | 3 weeks (Foundations, Transformers, RAG) | nlp |
  | Phase 5 | Advanced & Research | 4 weeks (Generative, RL, MLOps, AI Bias) | advanced |
  | **Total** | | **21 weeks** | |
- Screenshot placeholders
- License: MIT

---

## 15. Additional Notes for Claude Code

- Use `better-sqlite3` synchronously — no async DB calls in main process
- All Claude API calls happen in main process via IPC — never expose API key to renderer
- The app must work fully offline except for quiz generation and project review
- Do not use any external UI component library beyond what's specified — build components from scratch using Tailwind
- Every chart must be built with Recharts
- The Monaco Editor is preferred for the project starter code display (read-only mode)
- All SQLite queries must be parameterized — no string interpolation
- Handle Claude API errors gracefully: show "AI unavailable — using cached questions" fallback if API fails
- Cached questions: store last 3 quiz generations per topic in SQLite so the app still works if offline
- All dates stored as ISO 8601 strings in SQLite
- Implement window size memory: restore last window dimensions on launch

---

## 16. Google Colab Integration

### 16.1 Why This Exists

Several weeks in this curriculum require a GPU to complete in reasonable time. Training ResNet on CIFAR-10, fine-tuning with LoRA, training a DCGAN, or running YOLOv8 on a custom dataset will take hours on CPU — or simply fail due to RAM limits. Google Colab provides a free T4 GPU. This section defines how NeuralPath detects heavy weeks, generates ready-to-run Colab notebooks, and imports results back into the app so progress tracking stays intact.

### 16.2 Hardware Classification — Which Weeks Need Colab

Add a `compute` field to each curriculum week entry in `src/curriculum/index.js`:

```js
compute: "local"   // runs fine on CPU, <4GB RAM
compute: "colab"   // requires GPU or >8GB RAM — Colab recommended
```

Colab-required weeks:

| Week | Title | Why GPU is needed |
|------|-------|-------------------|
| 9 | Modern CNN Architectures | Fine-tuning ResNet50 + EfficientNet-B3 on Flowers102 |
| 10 | Transfer Learning Showdown | Full fine-tune comparison, multiple runs |
| 11 | Object Detection (YOLOv8) | YOLO training loop, even on small dataset |
| 12 | Image Segmentation (U-Net) | U-Net training on Oxford-IIIT Pet |
| 13 | Advanced CV Topics | ONNX export + latency benchmark needs trained model |
| 14 | CV Capstone | Bias audit requires running inference at scale |
| 16 | Transformers & LLMs | LoRA fine-tuning even on Phi-3-mini needs GPU |
| 18 | Generative Models | DCGAN training on Fashion-MNIST |
| 19 | Reinforcement Learning | DQN training + video rendering |

All other weeks (1–8, 15, 17, 20, 21) are `"local"` — run fine on any modern laptop CPU.

### 16.3 App UI Changes for Colab Weeks

On the **Project Page**, when `week.compute === "colab"`, replace the default "Open in VS Code" button with:

```
[ ☁ Open in Google Colab ]   [ ⬇ Download .ipynb ]   [ ⬆ Import Results ]
```

- **Open in Google Colab** — generates the notebook (see 16.4), saves it to `userData/notebooks/week_N.ipynb`, then opens `https://colab.research.google.com/` in the system browser with a toast: "Upload the downloaded notebook to Colab to begin."
- **Download .ipynb** — opens a Save dialog, writes the generated notebook to the user's chosen path.
- **Import Results** — opens a file picker for a `results.json` file (see 16.5), parses it, and writes the project score + feedback to the `projects` table.

Add a small **compute badge** on the Project Card on the Dashboard:

```
[ GPU · Colab recommended ]   ← orange badge, shown when compute === "colab"
[ CPU · Run locally ]         ← gray badge, shown when compute === "local"
```

### 16.4 Notebook Generation (`electron/notebookGenerator.js`)

Implement a function `generateNotebook(week)` that programmatically constructs a Jupyter notebook (`.ipynb` JSON format) and returns it as a string.

Every generated notebook must follow this exact cell structure:

#### Cell 1 — Header & Setup (markdown)
```markdown
# NeuralPath — Week {N}: {Week Title}
> Generated by NeuralPath desktop app. Run each cell in order.
> **Runtime required:** GPU (Runtime → Change runtime type → T4 GPU)

## Objectives
{project.description}

## Evaluation Criteria
{project.evaluation_criteria as a numbered list}
```

#### Cell 2 — Environment setup (code)
```python
# ── Environment Check ──────────────────────────────────────────
import subprocess, sys

def install(pkg):
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", pkg])

# Week-specific installs — generated dynamically per week
# Example for Week 11 (YOLOv8):
install("ultralytics")
install("roboflow")

import torch
print(f"PyTorch: {torch.__version__}")
print(f"GPU available: {torch.cuda.is_available()}")
print(f"Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
```

#### Cell 3 — Google Drive mount (code)
```python
# ── Mount Google Drive (for saving checkpoints & results) ──────
from google.colab import drive
drive.mount('/content/drive')

import os
SAVE_DIR = '/content/drive/MyDrive/NeuralPath/Week{N}'
os.makedirs(SAVE_DIR, exist_ok=True)
print(f"Save directory: {SAVE_DIR}")
```

#### Cell 4 — Dataset download (code)
Generated per week. Each week has a `colab_dataset_setup` string field in the curriculum definition. Example for Week 11:
```python
# ── Dataset Setup ──────────────────────────────────────────────
import torchvision.datasets as datasets
import torchvision.transforms as transforms

# Oxford-IIIT Pet Dataset
dataset = datasets.OxfordIIITPet(
    root='/content/data',
    split='trainval',
    target_types='segmentation',
    download=True
)
print(f"Dataset loaded: {len(dataset)} samples")
```

#### Cell 5 — Starter code (code)
Inject the same `project.starter_code` that appears in the app's local Project Page. This ensures the user starts from the same scaffold whether running locally or on Colab.

#### Cell 6 — [USER WORK ZONE] (code)
```python
# ══════════════════════════════════════════════════════════════
# YOUR IMPLEMENTATION — Write your solution below
# ══════════════════════════════════════════════════════════════

# TODO: Implement the project objectives listed in Cell 1
```

#### Cell 7 — Evaluation & Results export (code)
```python
# ── Results Export ─────────────────────────────────────────────
# Run this cell AFTER completing your implementation.
# It saves a results.json that you import back into NeuralPath.

import json
from datetime import datetime

# Collect your metrics here — edit as needed for your project
results = {
    "week_id": "p{phase}_w{week_number}",
    "week_title": "{week.title}",
    "completed_at": datetime.now().isoformat(),
    "metrics": {
        # Fill these in manually or compute them in your code above
        "primary_metric_name": "val_accuracy",   # e.g. mAP@50, val_loss, FID
        "primary_metric_value": None,             # replace with your actual value
        "secondary_metrics": {}                   # any other metrics you tracked
    },
    "self_notes": "",   # Write a brief note about your implementation
    "model_saved_path": f"{SAVE_DIR}/model_final.pt"
}

# Save locally in Colab
with open('/content/results.json', 'w') as f:
    json.dump(results, f, indent=2)

# Also save to Drive
with open(f'{SAVE_DIR}/results.json', 'w') as f:
    json.dump(results, f, indent=2)

print("✅ results.json saved.")
print("Next step: Download /content/results.json and import it into NeuralPath.")
print(json.dumps(results, indent=2))
```

#### Cell 8 — Download helper (code)
```python
# ── Download results.json to your machine ─────────────────────
from google.colab import files
files.download('/content/results.json')
```

### 16.5 Results Import Flow

When the user clicks **Import Results** and selects a `results.json` file:

```js
// electron/main.js — handle results import
ipcMain.handle('colab:importResults', async (event, filePath) => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const results = JSON.parse(raw);

  // Validate expected fields
  const required = ['week_id', 'completed_at', 'metrics'];
  for (const field of required) {
    if (!results[field]) throw new Error(`Missing field: ${field}`);
  }

  // Map primary metric to a 0-100 score
  // Different weeks use different metrics — normalize to percentage
  const metricNormalization = {
    val_accuracy: (v) => Math.round(v * 100),       // 0.0-1.0 → 0-100
    'mAP@50':     (v) => Math.round(v * 100),
    val_iou:      (v) => Math.round(v * 100),
    FID:          (v) => Math.max(0, 100 - Math.round(v / 3)), // lower FID = better
    val_loss:     (v) => Math.max(0, 100 - Math.round(v * 20)),
    reward:       (v) => Math.min(100, Math.round(v / 5)),     // CartPole max 500
  };

  const normalize = metricNormalization[results.metrics.primary_metric_name];
  const score = normalize
    ? normalize(results.metrics.primary_metric_value)
    : 75; // default if metric unknown

  // Write to projects table
  db.run(
    `INSERT OR REPLACE INTO projects
     (week_id, title, submitted_at, self_notes, score, status, ai_feedback)
     VALUES (?, ?, ?, ?, ?, 'graded', ?)`,
    [
      results.week_id,
      results.week_title,
      results.completed_at,
      results.self_notes || '',
      score,
      `Completed on Google Colab. Primary metric (${results.metrics.primary_metric_name}): ${results.metrics.primary_metric_value}. Secondary metrics: ${JSON.stringify(results.metrics.secondary_metrics)}`
    ]
  );

  return { score, metrics: results.metrics };
});
```

After successful import, the Project Card on Dashboard updates to show the score badge and "Completed via Colab" tag (blue cloud icon instead of the normal checkmark).

### 16.6 Colab Setup Guide Page (`pages/ColabGuide.jsx`)

Add a dedicated **Colab Guide** page accessible from the sidebar (cloud icon). It renders the following content as styled markdown:

```markdown
## Running NeuralPath Projects on Google Colab

### First-time setup (do this once)
1. Go to https://colab.research.google.com
2. Sign in with your Google account
3. Go to Runtime → Change runtime type → Select **T4 GPU** → Save
4. Connect your Google Drive when prompted by the notebook

### Per-project workflow
1. Open the heavy project week in NeuralPath
2. Click **Download .ipynb**
3. In Colab: File → Upload notebook → select the downloaded file
4. Run all cells in order (Ctrl+F9 runs all)
5. Fill in the [USER WORK ZONE] cell with your implementation
6. Run the Results Export cell (Cell 7) when done
7. Cell 8 will auto-download results.json to your machine
8. Back in NeuralPath: click **Import Results** → select results.json
9. Your score and progress are now recorded ✅

### Free tier limits to know
- **GPU session:** 12 hours max per session (T4 GPU)
- **Idle timeout:** ~90 minutes of inactivity disconnects you
- **Storage:** Files in /content are deleted when session ends — always save to Drive
- **Tip:** Save model checkpoints every N epochs to Drive, not just at the end

### Saving your work mid-session
The generated notebooks include Drive mounting in Cell 3.
All checkpoints and the final model are saved to:
`MyDrive/NeuralPath/Week{N}/`

If your session disconnects, re-mount Drive and load from the last checkpoint.
```

### 16.7 Curriculum Index Changes

Add two new fields to every week object in `src/curriculum/index.js`:

```js
{
  week: 11,
  title: "Object Detection",
  compute: "colab",                      // NEW
  colab_runtime: "GPU",                  // NEW — "GPU" | "CPU" | "TPU"
  colab_dataset_setup: `...python code`, // NEW — dataset download cell content
  colab_installs: ["ultralytics", "roboflow"],  // NEW — pip packages for Cell 2
  project: { ... }
}
```

For `compute: "local"` weeks, still generate a downloadable notebook (some users may prefer Colab even for light weeks), but the badge shows gray "CPU · Optional" instead of orange "GPU · Recommended".

### 16.8 Implementation Steps (add to Section 13 Phase E)

```
Phase E — Curriculum Content (updated)
  19. Write full curriculum/index.js with all fields including:
      - compute classification per week
      - colab_dataset_setup code per heavy week
      - colab_installs list per heavy week
  20. Implement notebookGenerator.js
  21. Implement colab:importResults IPC handler
  22. Add ColabGuide page + sidebar entry
  23. Update Project Page UI for Colab weeks (badge, three-button layout)
  24. Seed topics table from curriculum on first launch
```

### 16.9 Quick Reference — Colab Week Checklist

The app's Colab Guide page also renders this as a live checklist (checkboxes stored in SQLite), so the user can track their Colab sessions:

| Week | Project | Metric to report | Colab packages |
|------|---------|-----------------|----------------|
| 9 | Transfer Learning Showdown | val_accuracy | torchvision |
| 10 | Custom Object Detector | mAP@50 | ultralytics, roboflow |
| 11 | U-Net Segmentation | val_iou | albumentations, segmentation-models-pytorch |
| 12 | CV Inference Pipeline | inference_latency_ms | onnxruntime, fastapi |
| 13 | CV Audit Report | n/a (report-based) | fairlearn, facenet-pytorch |
| 16 | LoRA Fine-Tuning | val_loss | peft, transformers, bitsandbytes |
| 18 | Conditional DCGAN | FID | pytorch-fid |
| 19 | DQN Cart-Pole | reward | gymnasium, moviepy |

---

## 17. Research Alignment — Prof. Deniz Gündüz & Emre Ozfatura

> This section aligns the NeuralPath curriculum with the published research vision of two key researchers whose work represents the frontier of communication-aware machine learning. Claude Code must integrate these paper summaries and project extensions into the relevant curriculum weeks as described below.

### 17.1 Researcher Profiles

**Prof. Deniz Gündüz** — Department of Electrical and Electronic Engineering, Imperial College London. ERC Starting Grant BEACON (no. 677854). Research mission: eliminating the artificial separation between communication systems and machine learning — building systems where the two co-design each other from the ground up. Core conviction: Shannon's separation theorem breaks down in practical, latency-constrained, distributed ML settings, and the solution is joint end-to-end learning of communication and inference together.

**Emre Ozfatura** — PhD researcher, Information Processing and Communications Lab, Imperial College London (also affiliated with Özyeğin University, Turkey). Research focus: communication-efficient federated learning — specifically gradient sparsification, quantization, and hierarchical distributed training across heterogeneous wireless networks.

Their combined work establishes a research program spanning: task-oriented communications, deep joint source-channel coding, over-the-air federated learning, gradient compression, and hierarchical distributed ML. Every paper below should be treated as a conceptual north star for the project weeks it maps to.

---

### 17.2 Paper Summaries & Curriculum Mappings

---

#### PAPER 1 — "Deep Joint Source-Channel Coding for Wireless Image Transmission" (arXiv:1809.01733)
**Authors:** Bourtsoulatze, Kurka, Gündüz | **Published:** IEEE Trans. Cognitive Comms. & Networking, 2019

**Core idea:** Replace the classical separation of image compression (JPEG/JPEG2000) and channel coding (LDPC) with a single end-to-end CNN autoencoder — the encoder maps raw pixels directly to complex-valued channel symbols, and the decoder reconstructs the image from the noisy received symbols. The channel itself is inserted as a non-trainable differentiable layer, enabling end-to-end backpropagation through the communication link. Called **DeepJSCC**.

**Key results:**
- Outperforms JPEG + capacity-achieving channel code at low SNR and limited bandwidth
- Eliminates the "cliff effect" — graceful degradation instead of catastrophic failure when SNR drops
- Learns implicit channel estimation, compression, and error protection simultaneously in one model
- Achieves 18ms per image on GPU (vs 387ms for CPU; comparable to JPEG decode times)
- Works on AWGN and slow Rayleigh fading channels without channel state information

**Vision statement:** The binary abstraction of communication is the wrong layer of abstraction for ML tasks. Learning continuous, task-aware representations that are directly optimized for the channel removes artificial inefficiencies that separation introduces.

**Curriculum mapping:**

| Week | How this paper applies |
|------|------------------------|
| Week 8 (CNN Foundations) | DeepJSCC's encoder-decoder is a perfect real-world motivation for learning CNN autoencoders. The "non-trainable channel layer" concretely illustrates differentiable simulation of real-world noise. |
| Week 9 (Modern CNN Architectures) | The architecture evolution from LeNet → ResNet is contextualized by how DeepJSCC adapts similar ideas (conv layers, PReLU, power normalization) for a non-vision task. |
| Week 13 (Advanced CV Topics) | ONNX export and latency benchmarking in Week 13 maps directly to DeepJSCC's CPU/GPU runtime analysis. |
| Week 18 (Generative Models — VAE) | DeepJSCC's encoder can be viewed as a constrained VAE — the bottleneck is the channel bandwidth, not a learned latent dimension. Connects autoencoder theory to physical constraints. |

**Project extension for Week 8:** Add this as an optional "Research Track" challenge. After implementing the basic CNN autoencoder on CIFAR-10, the student implements a simplified DeepJSCC: add a non-trainable AWGN noise layer between encoder and decoder (parameterized by SNR), train end-to-end, and compare PSNR vs a JPEG baseline at the same compression ratio. Metric: PSNR vs SNR curve. Must demonstrate graceful degradation (no cliff effect).

---

#### PAPER 2 — "Communicate to Learn at the Edge" (arXiv:2009.13269)
**Authors:** Gündüz, Kurka, Jankowski, Mohammadi Amiri, Ozfatura, Sreekumar | **Published:** IEEE Communications Magazine, 2021

**Core idea:** A survey/vision paper arguing that current ML-at-the-edge systems make a fundamental architectural mistake: they treat the wireless channel as a reliable bit pipe, then optimize communication and learning separately. This paper presents three interconnected research pillars: (1) distributed inference where DNNs are split across devices and edge servers, (2) distributed training with coded computation to handle stragglers, and (3) federated edge learning (FEEL) with over-the-air gradient aggregation.

**Key ideas:**
- Separation of communication and ML is provably suboptimal under strict latency constraints
- DeepJSCC (from Paper 1) applied to re-identification: analog JSCC outperforms digital transmission by a large SNR margin
- Straggler mitigation via coded computation: redundant computation across servers using polynomial codes
- Over-the-air computation exploits wireless channel superposition — all devices transmit simultaneously and the channel computes the gradient sum for free
- FEEL with analog over-the-air achieves better convergence than digital quantization at both IID and non-IID data distributions

**Vision statement:** Intelligence at the edge requires a new theory of communication that is built for machine tasks, not human perception. The correct unit of reliability is inference accuracy, not bit error rate.

**Curriculum mapping:**

| Week | How this paper applies |
|------|------------------------|
| Week 2 (ML Ecosystem) | Introduces the concept of edge inference and why centralized training is impractical for IoT/autonomous systems — a real-world motivation for the entire curriculum. |
| Week 7 (PyTorch Deep Dive) | DNN splitting (inference partitioning across devices) connects to understanding nn.Module internals, hooks, and partial forward passes. |
| Week 20 (MLOps) | The straggler problem in coded computing is a distributed systems analogue of the MLOps concept of fault-tolerant training pipelines. |
| Week 21 (AI Bias) | Data non-IID distribution in FEEL is a form of representation bias — different devices have different data distributions, which biases the global model toward majority-data clients. |

**Project extension for Week 20 (MLOps):** Add a research-track challenge: simulate FEEL with non-IID data. Using MNIST, split digits by class across 10 "devices" (each device sees only 2 classes). Train FedAvg vs a baseline with IID splits. Measure: convergence speed and accuracy gap. Write a 1-page analysis connecting your findings to the over-the-air computation motivation in this paper.

---

#### PAPER 3 — "Machine Learning at the Wireless Edge: Distributed SGD Over-the-Air" (arXiv:1901.00844)
**Authors:** Mohammadi Amiri, Gündüz | **Published:** IEEE Trans. Signal Processing, 2020

**Core idea:** Proposes two concrete algorithms for federated learning over a shared wireless multiple access channel (MAC): **D-DSGD** (digital, separation-based: quantize gradients → transmit over orthogonal links) and **A-DSGD** (analog, over-the-air: sparsify gradients → project to channel bandwidth → all devices transmit simultaneously, letting the MAC compute the sum). Proves convergence for A-DSGD under strongly convex loss with noisy channel and gradient sparsification. Shows A-DSGD dominates D-DSGD especially in low-power, low-bandwidth regimes and is more robust to non-IID data bias.

**Key technical contributions:**
- Gradient sparsification (top-k) + random projection (compressive sensing) as analog compression
- Approximate message passing (AMP) at the parameter server for sparse vector reconstruction
- Power allocation strategy across iterations (allocate more power to later iterations when gradient variance decreases)
- Formal convergence bound accounting for sparsification error, projection noise, and channel noise
- D-DSGD outperforms SignSGD and QSGD even without the analog benefit

**Vision statement:** The wireless channel is not just a pipe — it is a computational resource. The MAC's superposition property is a free gradient aggregation operation that digital systems discard by encoding around.

**Curriculum mapping:**

| Week | How this paper applies |
|------|------------------------|
| Week 1 (Math for ML) | The convergence proof uses strongly convex analysis, rate supermartingale theory, and approximate message passing — all grounded in probability theory and linear algebra from Week 1. |
| Week 4 (Supervised Learning) | SGD, gradient estimation, and convergence theory introduced in Week 4 are the same foundations A-DSGD is built on — but extended to the distributed, noisy-channel setting. |
| Week 20 (MLOps) | Distributed training, gradient compression (quantization + sparsification), and federated averaging (FedAvg) are all MLOps-level concerns covered by this paper. |
| Week 21 (AI Bias) | Non-IID data distribution across devices is explored as a bias source: devices with skewed datasets pull the global model toward their distribution. |

**Project extension for Week 20:** Research-track challenge: Implement a simplified D-DSGD simulation. Using PyTorch + 10 virtual "devices" on CIFAR-10, simulate distributed training where each device sends only the top-k% gradient values (gradient sparsification). Compare: full gradient FedAvg vs top-1% vs top-0.1% sparsification. Plot: test accuracy vs total bits transmitted (communication budget). Report: at what sparsification level does accuracy degrade significantly?

---

#### PAPER 4 — "Time-Correlated Sparsification for Communication-Efficient Federated Learning" (arXiv:2101.08837)
**Authors:** Mehmet Emre Ozfatura, Kerem Ozfatura, Gündüz | **Published:** arXiv 2021

**Core idea:** Introduces **TCS (Time-Correlated Sparsification)** — a novel gradient compression strategy for federated learning that exploits the temporal correlation of important gradient positions across iterations. Standard top-K sparsification picks the k largest gradients independently each round (requiring transmitting both values AND positions). TCS maintains a global sparse mask that evolves slowly, so clients only need to transmit the values for known positions (no index overhead) plus a tiny local exploration mask for discovering newly important weights.

**Key results:**
- Achieves centralized baseline accuracy on CIFAR-10/ResNet-18 with ×100 sparsification
- Up to ×2000 reduction in communication load when combined with 5-bit quantization
- Outperforms top-K in communication efficiency at the same accuracy level
- Layer-wise fairness variant (TCS-LF) prevents gradient starvation of early layers
- Momentum SGD integrates cleanly into TCS framework

**Technical novelties:**
- Dual-mask design: global mask (known by all, no transmission cost) + local exploration mask (small, cheap to transmit)
- Fractional quantization: divides gradient value range into geometric intervals for fair per-layer compression
- Error accumulation: carries forward compression errors to next iteration to prevent gradient information loss
- Sparse encoding scheme using block-index + intra-block position (log(1/φ)+2 bits vs log(d) bits per nonzero)

**Vision statement:** Gradient sparsification is not just compression — it is dynamic network pruning during training. The positions of important weights correlate strongly across iterations because the optimization landscape changes slowly near convergence.

**Curriculum mapping:**

| Week | How this paper applies |
|------|------------------------|
| Week 4 (Supervised Learning) | Error accumulation in TCS is a direct extension of gradient descent theory — the compression error is viewed as a gradient estimation error that must be bounded for convergence. |
| Week 6 (Neural Network Architecture) | The layer-wise fairness problem (gradient magnitudes vary across layers due to backpropagation dynamics) is a direct consequence of how backprop works — Week 6's backprop lesson should reference this. |
| Week 7 (PyTorch Deep Dive) | Implementing a sparsification mask in PyTorch requires deep understanding of gradient hooks, tensor masking, and custom optimizer steps — all Week 7 skills. |
| Week 20 (MLOps) | Model compression (pruning, sparsification) and quantization are core MLOps topics. TCS is a research-grade answer to the question "how do you make federated learning fast?" |

**Project extension for Week 7:** Research-track challenge: Implement basic gradient sparsification in PyTorch using gradient hooks. For a CNN training on CIFAR-10, intercept gradients during `.backward()`, keep only the top-1% by magnitude using a binary mask, zero the rest, and accumulate the error. Compare: standard SGD vs top-1% sparsification vs top-0.1% sparsification with error accumulation. Plot convergence curves. Deliverable: a `SparsifiedSGD` optimizer class.

---

#### PAPER 5 — "Hierarchical Federated Learning Across Heterogeneous Cellular Networks" (arXiv:1909.02362)
**Authors:** Salehi Heydar Abad, Ozfatura, Gündüz, Ercetin | **Published:** IEEE ICASSP 2020

**Core idea:** Proposes **HFL (Hierarchical Federated Learning)** for heterogeneous cellular networks: mobile users (MUs) cluster around small-cell base stations (SBSs) for local gradient aggregation every iteration, while SBSs periodically sync with the macro base station (MBS) every H iterations for global consensus. This two-tier hierarchy dramatically reduces communication latency vs. sending every gradient to the MBS, while gradient sparsification at each communication link reduces bandwidth further. Proves sub-carrier allocation optimality (greedy max-min fairness is optimal). Demonstrates on CIFAR-10/ResNet-18 that HFL achieves better accuracy than FL with up to 40× lower latency.

**Key contributions:**
- End-to-end latency model accounting for uplink/downlink in both tiers (MU→SBS and SBS→MBS)
- Optimal sub-carrier allocation via greedy max-min rate algorithm
- Sparsification at all 4 communication links (4 separate φ parameters)
- Discounted error accumulation to handle staleness from hierarchical delays
- Non-IID data distribution as future work direction (honest limitation acknowledgment)

**Vision statement:** The flat parameter-server model for federated learning ignores the physical topology of wireless networks. Hierarchical aggregation matches the natural cluster structure of cellular networks and enables a natural trade-off between local accuracy and global consensus frequency.

**Curriculum mapping:**

| Week | How this paper applies |
|------|------------------------|
| Week 19 (RL) | The resource allocation optimization (sub-carrier assignment) can be framed as a scheduling problem, connecting to RL policy optimization concepts. |
| Week 20 (MLOps) | Hierarchical training architectures, gradient averaging strategies (FedAvg with H local steps), and communication-computation tradeoffs are all MLOps engineering decisions. |
| Week 21 (AI Bias) | Non-IID data across clusters creates systematic bias: cluster-level models overfit to local demographics. This paper's honest acknowledgment of this limitation is a good case study in responsible ML. |
| Week 6 (Neural Networks) | Momentum correction strategy for reducing staleness from delayed gradient updates directly extends Week 6's optimizer content. |

**Project extension for Week 20:** Research-track challenge: Simulate two-tier hierarchical federated averaging. Using MNIST and 3 "clusters" of 3 devices each, implement: (1) standard FedAvg (all devices → central server every round), (2) HFL with H=4 (devices → cluster head every round, cluster heads → central every 4 rounds). Compare: total rounds to 95% accuracy, total model updates transmitted. Write analysis of the communication-accuracy tradeoff. Optional: add top-k sparsification and measure additional gains.

---

### 17.3 Research Vision — What These Papers Mean for Your Learning

The unified message across all five papers is a single profound idea: **the boundary between communication and computation is artificial, and erasing it unlocks fundamental efficiency gains**.

In classical engineering, you build the best compressor, then the best channel coder, then stack them. This modularity is clean but wasteful — the compressor doesn't know about the channel, and the channel coder doesn't know about the downstream task. Gündüz's research program asks: what if we let the system learn what to communicate, how to communicate it, and for what purpose — all jointly, end-to-end?

For you, this means your curriculum is not just about learning ML tools in isolation. The advanced sections (Phases 4 and 5) should be understood through this lens: every model you train will eventually run somewhere (a device, a server, a phone), be transmitted somewhere (WiFi, 5G, Bluetooth), and serve some downstream purpose (classification, generation, control). The research frontier lives at the intersection of these constraints.

The five papers above give you five concrete entry points into this research area. When you complete the curriculum, you will have the foundations to read and extend this work yourself — that is the PhD-trajectory goal of NeuralPath.

---

### 17.4 Implementation Instructions for Claude Code

In `src/curriculum/index.js`, add a `research_papers` array field to each week object that contains any of the 5 papers above. Each entry follows this shape:

```js
research_papers: [
  {
    id: "deepjscc",
    title: "Deep Joint Source-Channel Coding for Wireless Image Transmission",
    authors: "Bourtsoulatze, Kurka, Gündüz",
    arxiv: "1809.01733",
    relevance: "Your CNN autoencoder in this week's project is architecturally identical to DeepJSCC's encoder. The difference: DeepJSCC inserts a noisy channel between encoder and decoder and trains end-to-end for transmission, not reconstruction.",
    project_extension: {
      title: "DeepJSCC Mini-Replication",
      difficulty: "research_track",   // shown with a special badge — optional, not required for completion
      description: "Add a non-trainable AWGN noise layer to your Week 8 autoencoder...",
      colab_recommended: true
    }
  }
]
```

In the **Lesson Page**, when a week has `research_papers`, render a collapsible "Research Extension" panel at the bottom of the lesson. This panel shows:
- Paper title, authors, arXiv link
- 2-sentence relevance explanation
- Optional project extension card (labeled "Research Track — optional")

In the **Portfolio Page**, add a "Research Papers Engaged" section that lists all paper extensions the user attempted, with their scores. This is the highest-prestige section of the portfolio — label it clearly as PhD-trajectory work.

In the **Progress Page** Curriculum Map tab, weeks with `research_papers` get a small beaker icon (🔬) next to their node. Weeks where the user attempted a research extension get a gold star overlay.

---

### 17.5 Suggested Reading Order (for the Portfolio)

If the user completes the full curriculum and wants to engage with this research area, instruct them (via an in-app "Research Roadmap" card on the Portfolio page) to read the papers in this order:

1. **Paper 2 (Communicate to Learn at the Edge)** — survey paper, read first for the big picture
2. **Paper 1 (DeepJSCC)** — the flagship technical result, read after Week 8-9
3. **Paper 3 (A-DSGD / D-DSGD)** — first deep FL paper, read after Week 20
4. **Paper 4 (TCS)** — gradient compression details, read after Paper 3
5. **Paper 5 (Hierarchical FL)** — systems paper, read last for the full picture

Include arXiv links for all 5 papers on the Portfolio page under a "Further Reading" section.
