// Full curriculum definition for NeuralPath.
// Structure: CURRICULUM = [ Phase { phase, title, weeks: [ Week { week, title,
// compute, project, days: [ Day {...} ] } ] } ].
//
// Lessons are written as markdown. Each week may carry research_papers that map
// to Prof. Deniz Gündüz / Emre Ozfatura's work (CLAUDE.md Section 17).

export const DOMAIN_LABELS = {
  foundations: "Foundations",
  classical_ml: "Classical ML",
  deep_learning: "Deep Learning",
  cv: "Computer Vision",
  nlp: "NLP",
  advanced: "Advanced",
};

// ── Research papers (Section 17) ──
export const PAPERS = {
  deepjscc: {
    id: "deepjscc",
    title: "Deep Joint Source-Channel Coding for Wireless Image Transmission",
    authors: "Bourtsoulatze, Kurka, Gündüz",
    arxiv: "1809.01733",
  },
  edge: {
    id: "edge",
    title: "Communicate to Learn at the Edge",
    authors: "Gündüz, Kurka, Jankowski, Mohammadi Amiri, Ozfatura, Sreekumar",
    arxiv: "2009.13269",
  },
  dsgd: {
    id: "dsgd",
    title: "Machine Learning at the Wireless Edge: Distributed SGD Over-the-Air",
    authors: "Mohammadi Amiri, Gündüz",
    arxiv: "1901.00844",
  },
  tcs: {
    id: "tcs",
    title: "Time-Correlated Sparsification for Communication-Efficient Federated Learning",
    authors: "M. E. Ozfatura, K. Ozfatura, Gündüz",
    arxiv: "2101.08837",
  },
  hfl: {
    id: "hfl",
    title: "Hierarchical Federated Learning Across Heterogeneous Cellular Networks",
    authors: "Salehi Heydar Abad, Ozfatura, Gündüz, Ercetin",
    arxiv: "1909.02362",
  },
};

// Helper to attach a paper reference with week-specific relevance + optional extension.
function paper(key, relevance, project_extension) {
  return { ...PAPERS[key], relevance, project_extension };
}

export const CURRICULUM = [
  // ════════════════════════════════════════════════════════════════
  // PHASE 0 — FOUNDATIONS
  // ════════════════════════════════════════════════════════════════
  {
    phase: 0,
    title: "Foundations",
    weeks: [
      {
        week: 1,
        title: "Math & Python for ML",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        research_papers: [
          paper(
            "dsgd",
            "The A-DSGD convergence proof rests on strongly-convex analysis, expectation/variance bounds, and approximate message passing — exactly the probability and linear-algebra tools you build this week."
          ),
        ],
        project: {
          title: "EDA Pipeline",
          description:
            "Given a real CSV dataset (UCI Iris and Wine, in /assets/datasets/), build an EDA script that loads data, computes summary statistics, detects outliers, produces 5 visualizations, and outputs a markdown report.",
          evaluation_criteria: [
            "Code quality and readability",
            "Depth of statistical insight",
            "Appropriateness of visualization choices",
            "Correct outlier detection method",
            "Clarity of the generated markdown report",
          ],
          starter_code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def load_data(path: str) -> pd.DataFrame:
    """Load a CSV into a DataFrame."""
    return pd.read_csv(path)

def summary_stats(df: pd.DataFrame) -> pd.DataFrame:
    """Return describe() plus skew and missing counts."""
    # TODO: extend with .skew(), .isna().sum()
    return df.describe()

def detect_outliers_iqr(df: pd.DataFrame, col: str) -> pd.Series:
    """Return a boolean mask of IQR outliers for a numeric column."""
    # TODO: implement the 1.5*IQR rule
    raise NotImplementedError

def main():
    df = load_data("assets/datasets/iris.csv")
    print(summary_stats(df))
    # TODO: 5 visualizations + markdown report

if __name__ == "__main__":
    main()`,
        },
        days: [
          {
            day: 1,
            title: "Linear Algebra for ML",
            domain: "foundations",
            key_concepts: ["vectors", "matrix multiplication", "transpose", "inverse", "dot product"],
            quiz_prompt:
              "Test understanding of vectors, dot products, matrix multiplication shapes, transpose/inverse properties, and why matrix multiplication is the core operation of neural network layers.",
            lesson_markdown: `# Linear Algebra for ML

Machine learning is, mechanically, linear algebra wrapped in calculus. Every dataset is a matrix, every model layer is a matrix multiply, and every prediction is the result of pushing a vector through a chain of linear maps. If you internalize linear algebra, most of deep learning stops looking like magic.

## Vectors

A **vector** is an ordered list of numbers — a single data point with \`d\` features. The Iris flower \`[5.1, 3.5, 1.4, 0.2]\` is a vector in \`R^4\`. Geometrically a vector is an arrow from the origin; its **length** (L2 norm) is \`||x|| = sqrt(sum(x_i^2))\`.

The **dot product** measures alignment: \`x · y = sum(x_i * y_i) = ||x|| ||y|| cos(θ)\`. When the dot product is zero the vectors are orthogonal. This single operation is the atom of ML — a neuron computes \`w · x + b\`, a similarity score is a dot product, and cosine similarity normalizes it.

\`\`\`python
import numpy as np
x = np.array([5.1, 3.5, 1.4, 0.2])
w = np.array([0.2, -0.1, 0.7, 0.4])
score = x @ w          # dot product
print(score, np.linalg.norm(x))
\`\`\`

## Matrices and matrix multiplication

A **matrix** stacks vectors into rows. A dataset of \`n\` samples with \`d\` features is an \`n×d\` matrix \`X\`. **Matrix multiplication** \`A(m×k) @ B(k×n) = C(m×n)\` requires the inner dimensions to match; entry \`C[i,j]\` is the dot product of row \`i\` of A with column \`j\` of B.

A fully-connected layer applies \`Y = X @ W + b\`, mapping \`n\` samples from \`d\` features to \`h\` hidden units in one operation. Getting shapes right is 80% of debugging neural nets — always track \`(rows, cols)\`.

\`\`\`python
X = np.random.randn(32, 4)   # 32 samples, 4 features
W = np.random.randn(4, 8)    # project to 8 units
b = np.zeros(8)
Y = X @ W + b                # shape (32, 8)
\`\`\`

## Transpose, identity, and inverse

The **transpose** \`A.T\` flips rows and columns; \`(AB).T = B.T A.T\`. The **identity** \`I\` leaves vectors unchanged: \`I @ x = x\`. A square matrix has an **inverse** \`A^{-1}\` when \`A @ A^{-1} = I\`; it exists only if the matrix is full-rank (no redundant rows). The closed-form least-squares solution \`w = (XᵀX)^{-1} Xᵀy\` is built entirely from these operations — though in practice we solve it rather than invert directly, because inversion is numerically unstable.

## Why this matters

- A neural network is a composition of linear maps \`W_n(...W_2(W_1 x))\` interleaved with nonlinearities.
- Batched computation = matrix multiplication, which GPUs accelerate massively.
- Norms define loss functions and regularization (L1, L2).

## Key takeaways

- Data → matrices, models → matrix multiplies, predictions → vectors.
- The dot product measures similarity and is the core neuron operation.
- Shape discipline \`(rows, cols)\` prevents most bugs.`,
          },
          {
            day: 2,
            title: "Eigenvalues, SVD & PCA Intuition",
            domain: "foundations",
            key_concepts: ["eigenvalues", "eigenvectors", "SVD", "PCA", "variance explained"],
            quiz_prompt:
              "Probe eigenvalue/eigenvector definitions, the SVD decomposition A=UΣVᵀ, how PCA uses the covariance matrix's eigenvectors, and what 'variance explained' means.",
            lesson_markdown: `# Eigenvalues, SVD & PCA Intuition

Some directions in a matrix matter more than others. Eigenvalues, the SVD, and PCA are three views of the same idea: find the directions along which a linear transformation stretches space the most, and you have found the structure of your data.

## Eigenvalues and eigenvectors

For a square matrix \`A\`, an **eigenvector** \`v\` is a direction that \`A\` only stretches, never rotates: \`A v = λ v\`. The scalar \`λ\` is the **eigenvalue** — the stretch factor. A symmetric matrix (like a covariance matrix) always has real eigenvalues and orthogonal eigenvectors, which is why PCA works so cleanly.

\`\`\`python
import numpy as np
A = np.array([[2.0, 0.0], [0.0, 3.0]])
vals, vecs = np.linalg.eig(A)
print(vals)   # [2. 3.] -> stretches x by 2, y by 3
\`\`\`

## Singular Value Decomposition (SVD)

Every matrix — not just square ones — factors as \`A = U Σ Vᵀ\`. Here \`V\` holds input directions, \`U\` holds output directions, and \`Σ\` is a diagonal of non-negative **singular values** ranking how important each direction is. SVD is the most numerically stable workhorse in ML: it underlies PCA, pseudo-inverses, recommender systems (latent factors), and low-rank model compression.

\`\`\`python
X = np.random.randn(100, 5)
U, S, Vt = np.linalg.svd(X, full_matrices=False)
print(S)   # singular values, descending
\`\`\`

## PCA = eigen-decomposition of covariance

**Principal Component Analysis** finds the orthogonal axes along which your data varies most. Mechanically: center the data, compute the covariance matrix \`C = (1/n) XᵀX\`, take its eigenvectors (the **principal components**), and the eigenvalues tell you the **variance explained** by each. Project onto the top \`k\` components to reduce dimensions while keeping the most information.

\`\`\`python
Xc = X - X.mean(0)
U, S, Vt = np.linalg.svd(Xc, full_matrices=False)
explained = (S**2) / (S**2).sum()
print(explained.cumsum())   # how much variance the first k PCs keep
\`\`\`

Using SVD on the centered data gives PCA directly — the right singular vectors \`Vᵀ\` are the principal components and \`S²/n\` are the eigenvalues. This is more stable than forming \`XᵀX\`.

## Why this matters

- PCA is the default tool for visualization, denoising, and decorrelating features.
- Singular values reveal **effective rank** — how many dimensions truly carry signal.
- Low-rank approximations (keep top-k singular values) compress models and images.

## Key takeaways

- Eigenvectors are unrotated directions; eigenvalues are their stretch factors.
- SVD \`A=UΣVᵀ\` generalizes this to any matrix and is numerically stable.
- PCA = top eigenvectors of the covariance matrix, ranked by variance explained.`,
          },
          {
            day: 3,
            title: "Calculus — Gradients & the Chain Rule",
            domain: "foundations",
            key_concepts: ["partial derivatives", "gradient", "chain rule", "Jacobian", "backpropagation"],
            quiz_prompt:
              "Test partial derivatives, the gradient as the direction of steepest ascent, the chain rule for composed functions, and how the Jacobian generalizes the derivative — connect to backprop.",
            lesson_markdown: `# Calculus — Gradients & the Chain Rule

Training a model means minimizing a loss function. To minimize, you need to know which way is downhill — that is exactly what the gradient tells you. Backpropagation is nothing more than the chain rule applied systematically.

## Partial derivatives and the gradient

A **partial derivative** \`∂f/∂x_i\` measures how the output changes as you nudge one input, holding the rest fixed. Stack all partials into a vector and you get the **gradient** \`∇f\`. The gradient points in the direction of steepest *increase*; to minimize loss we step in the *opposite* direction — this is **gradient descent**:

\`\`\`python
import numpy as np
# f(x) = x0^2 + 3*x1^2 ; gradient = [2*x0, 6*x1]
def grad(x):
    return np.array([2*x[0], 6*x[1]])

x = np.array([3.0, 2.0])
lr = 0.1
for _ in range(20):
    x = x - lr * grad(x)
print(x)   # converges toward [0, 0]
\`\`\`

## The chain rule

When functions compose, \`y = f(g(x))\`, the derivative multiplies: \`dy/dx = f'(g(x)) · g'(x)\`. Neural networks are deep compositions \`loss(f_n(...f_1(x)))\`, so the gradient of the loss with respect to an early weight is a product of many local derivatives. **Backpropagation** computes these products efficiently by reusing intermediate results from output back to input.

\`\`\`python
# y = (3x + 1)^2 ; let u = 3x+1, y = u^2
# dy/dx = 2u * 3 = 6(3x+1)
x = 2.0
u = 3*x + 1
dy_dx = 2*u * 3
print(dy_dx)   # 42
\`\`\`

## Jacobians

When a function maps a vector to a vector \`f: R^n → R^m\`, its derivative is the **Jacobian** matrix \`J\` of shape \`m×n\`, where \`J[i,j] = ∂f_i/∂x_j\`. The chain rule for vector functions becomes Jacobian multiplication. Backprop is really repeated vector-Jacobian products — frameworks like PyTorch never form the full Jacobian; they compute \`vᵀJ\` directly, which is far cheaper.

## Why gradients can vanish or explode

Because backprop multiplies many local derivatives, if those factors are consistently <1 the gradient shrinks toward zero (**vanishing gradient**); if >1 it blows up (**exploding gradient**). This single fact motivates ReLU activations, careful initialization, normalization layers, and gradient clipping — all topics later in the curriculum.

## Key takeaways

- The gradient points uphill; descent steps the opposite way, scaled by a learning rate.
- The chain rule turns deep compositions into products of local derivatives.
- The Jacobian generalizes the derivative to vector-valued functions; backprop = efficient vector-Jacobian products.`,
          },
          {
            day: 4,
            title: "Probability & Statistics for ML",
            domain: "foundations",
            key_concepts: ["distributions", "Bayes theorem", "expectation", "variance", "MLE"],
            quiz_prompt:
              "Cover probability distributions (Gaussian, Bernoulli), Bayes theorem, expectation/variance, and maximum likelihood estimation as the basis of most loss functions.",
            lesson_markdown: `# Probability & Statistics for ML

Machine learning is applied probability. Loss functions are negative log-likelihoods, regularization is a prior, and uncertainty estimates are posterior distributions. Getting comfortable with a handful of concepts pays off everywhere.

## Distributions

A **probability distribution** describes how likely each outcome is. Two you will see constantly:

- **Bernoulli(p)** — a coin flip; models binary labels. The output of logistic regression is a Bernoulli parameter.
- **Gaussian(μ, σ²)** — the bell curve; models continuous noise. The Central Limit Theorem explains why it appears so often: sums of many small independent effects are approximately Gaussian.

\`\`\`python
import numpy as np
samples = np.random.normal(loc=0.0, scale=1.0, size=10000)
print(samples.mean(), samples.var())   # ~0 and ~1
\`\`\`

## Expectation and variance

The **expectation** \`E[X] = Σ x·p(x)\` is the long-run average. The **variance** \`Var(X) = E[(X-μ)²]\` measures spread. Linearity of expectation — \`E[aX+bY] = aE[X]+bE[Y]\` even when X and Y are dependent — is one of the most useful tools in all of ML proofs (including the federated-learning convergence bounds referenced in this week's research paper).

## Bayes theorem

Bayes relates the probability of a cause given evidence to the probability of evidence given the cause:

\`P(H | D) = P(D | H) · P(H) / P(D)\`

Posterior ∝ likelihood × prior. This is the engine behind Naive Bayes classifiers, Bayesian inference, and the probabilistic interpretation of regularization (an L2 penalty is a Gaussian prior on the weights).

\`\`\`python
# Disease test: prevalence 1%, sensitivity 99%, false-positive 5%
p_d = 0.01
p_pos_given_d = 0.99
p_pos_given_nd = 0.05
p_pos = p_pos_given_d*p_d + p_pos_given_nd*(1-p_d)
p_d_given_pos = p_pos_given_d*p_d / p_pos
print(round(p_d_given_pos, 3))   # ~0.167 — surprisingly low!
\`\`\`

## Maximum Likelihood Estimation (MLE)

MLE picks parameters that make the observed data most probable: maximize \`Π p(x_i | θ)\`, or equivalently minimize the **negative log-likelihood** \`-Σ log p(x_i | θ)\`. This is why:

- Regression with Gaussian noise → minimizing **mean squared error**.
- Classification with Bernoulli labels → minimizing **cross-entropy**.

Nearly every loss function you will ever use is a negative log-likelihood in disguise.

## Key takeaways

- Bernoulli and Gaussian distributions model most labels and noise you'll meet.
- Expectation and variance summarize distributions; linearity of expectation is everywhere.
- Bayes flips conditional probabilities; MLE turns "fit the data" into a concrete loss.`,
          },
          {
            day: 5,
            title: "NumPy & Pandas Deep Dive",
            domain: "foundations",
            key_concepts: ["broadcasting", "vectorization", "DataFrames", "groupby", "indexing"],
            quiz_prompt:
              "Test NumPy broadcasting rules, why vectorization beats Python loops, Pandas DataFrame indexing (loc/iloc), and groupby aggregation.",
            lesson_markdown: `# NumPy & Pandas Deep Dive

NumPy and Pandas are the substrate every ML library sits on. Writing fast, correct array code is a skill that separates productive practitioners from people fighting their tools.

## Vectorization

A Python loop over a million elements is slow because each iteration pays interpreter overhead. **Vectorized** NumPy operations push the loop into optimized C, often 50–100× faster:

\`\`\`python
import numpy as np
a = np.arange(1_000_000)
# slow: [x*2 for x in a]
b = a * 2          # vectorized, runs in C
c = np.sqrt(a)     # elementwise ufunc
\`\`\`

Rule of thumb: if you're writing a \`for\` loop over array elements in ML code, there is almost always a vectorized form.

## Broadcasting

**Broadcasting** lets NumPy combine arrays of different shapes by virtually stretching dimensions. The rules: align shapes from the right; dimensions are compatible if they are equal or one of them is 1. This is how you add a bias vector to a whole batch:

\`\`\`python
X = np.random.randn(32, 4)   # (32, 4)
b = np.array([1, 2, 3, 4])   # (4,) -> broadcast to (32, 4)
Y = X + b
mean = X.mean(axis=0)        # (4,)
Xc = X - mean                # center every row by broadcasting
\`\`\`

Mismatched broadcasting is a top source of silent bugs — always check shapes when results look wrong.

## Pandas DataFrames

A **DataFrame** is a labeled 2D table. Use \`.loc[]\` for label-based indexing and \`.iloc[]\` for integer position. Keep boolean masks for filtering:

\`\`\`python
import pandas as pd
df = pd.read_csv("iris.csv")
setosa = df[df["species"] == "setosa"]
df.loc[df["petal_length"] > 5, "size"] = "large"
print(df.iloc[0])     # first row by position
\`\`\`

## GroupBy: split-apply-combine

\`groupby\` is the analytical heart of Pandas. It splits rows into groups, applies an aggregation, and combines the results — the same mental model as SQL's GROUP BY (which you'll meet in Week 3):

\`\`\`python
stats = df.groupby("species").agg(
    mean_petal=("petal_length", "mean"),
    n=("petal_length", "size"),
)
print(stats)
\`\`\`

## Missing data and types

Real data has gaps. \`df.isna().sum()\` counts missing values per column; \`df.fillna(df.mean(numeric_only=True))\` imputes; \`df.dropna()\` removes. Watch \`dtype\` — a numeric column read as \`object\` will silently break math.

## Key takeaways

- Vectorize: replace element loops with array operations for huge speedups.
- Broadcasting stretches shapes by clear rules; always verify shapes.
- \`loc/iloc\` for indexing, boolean masks for filtering, \`groupby\` for split-apply-combine.`,
          },
        ],
      },
      {
        week: 2,
        title: "ML Ecosystem & Tooling",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        research_papers: [
          paper(
            "edge",
            "This survey motivates the whole curriculum: models eventually run on edge devices over wireless links, so why centralized training is impractical for IoT/autonomous systems frames why the tooling you learn this week matters."
          ),
        ],
        project: {
          title: "PyTorch From Scratch",
          description:
            "Implement a 2-layer neural network in pure PyTorch (no nn.Module) that classifies the Iris dataset. Implement the forward pass, manual gradient computation, an SGD update loop, and plot the loss curve.",
          evaluation_criteria: [
            "Correct manual forward pass",
            "Correct manual gradient / autograd usage",
            "Working SGD update loop",
            "Loss curve plotted and decreasing",
            "Reaches reasonable accuracy on Iris",
          ],
          starter_code: `import torch

# Iris: 4 features -> hidden 16 -> 3 classes
torch.manual_seed(0)
W1 = torch.randn(4, 16, requires_grad=True) * 0.1
b1 = torch.zeros(16, requires_grad=True)
W2 = torch.randn(16, 3, requires_grad=True) * 0.1
b2 = torch.zeros(3, requires_grad=True)

def forward(X):
    h = torch.relu(X @ W1 + b1)
    return h @ W2 + b2   # logits

# TODO: cross-entropy loss, .backward(), manual SGD step, loss curve`,
        },
        days: [
          {
            day: 1,
            title: "Scikit-learn Architecture",
            domain: "foundations",
            key_concepts: ["estimators", "transformers", "pipelines", "fit/predict", "fit_transform"],
            quiz_prompt:
              "Test the scikit-learn estimator/transformer API (fit, predict, transform, fit_transform), why Pipelines prevent data leakage, and the role of the fit/predict contract.",
            lesson_markdown: `# Scikit-learn Architecture

Scikit-learn's power is its consistency: thousands of algorithms share three method signatures. Learn the contract once and the whole library opens up.

## Estimators: fit / predict

An **estimator** learns from data via \`.fit(X, y)\` and produces outputs via \`.predict(X)\`. Every classifier and regressor follows this. State learned during \`fit\` is stored on attributes ending in an underscore (\`model.coef_\`).

\`\`\`python
from sklearn.linear_model import LogisticRegression
clf = LogisticRegression().fit(X_train, y_train)
preds = clf.predict(X_test)
\`\`\`

## Transformers: fit / transform

A **transformer** preprocesses data: \`.fit\` learns parameters (e.g. column means), \`.transform\` applies them, and \`.fit_transform\` does both. Critically, you \`fit\` only on training data and \`transform\` test data with those learned parameters — otherwise you leak information.

\`\`\`python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler().fit(X_train)
X_train_s = scaler.transform(X_train)
X_test_s = scaler.transform(X_test)   # uses train statistics
\`\`\`

## Pipelines: compose without leakage

A **Pipeline** chains transformers and a final estimator into one object. During cross-validation it re-fits the scaler inside each fold, preventing the subtle leakage of scaling before splitting.

\`\`\`python
from sklearn.pipeline import Pipeline
pipe = Pipeline([
    ("scale", StandardScaler()),
    ("clf", LogisticRegression()),
])
pipe.fit(X_train, y_train)
pipe.score(X_test, y_test)
\`\`\`

## Key takeaways

- Estimators: \`fit\`/\`predict\`; transformers: \`fit\`/\`transform\`/\`fit_transform\`.
- Fit preprocessing on train only, then transform test — avoid leakage.
- Pipelines compose steps and make cross-validation leak-proof.`,
          },
          {
            day: 2,
            title: "Matplotlib & Seaborn",
            domain: "foundations",
            key_concepts: ["figure/axes", "subplots", "seaborn", "distribution plots", "publication quality"],
            quiz_prompt:
              "Cover the Matplotlib figure/axes model, when to use Seaborn vs raw Matplotlib, and which plot types suit distributions, relationships, and categories.",
            lesson_markdown: `# Matplotlib & Seaborn

Good plots are how you understand data and communicate results. Matplotlib gives you total control; Seaborn gives you beautiful statistical defaults.

## The figure/axes model

Matplotlib separates the **Figure** (the canvas) from **Axes** (individual plots). Always use the explicit object-oriented API rather than the stateful \`plt.\` shortcuts — it scales to multi-panel figures.

\`\`\`python
import matplotlib.pyplot as plt
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].plot(x, y)
axes[0].set_title("Loss")
axes[1].scatter(a, b)
fig.tight_layout()
\`\`\`

## Seaborn for statistical plots

Seaborn wraps Matplotlib with sensible aesthetics and statistical operations built in. Use it for distributions (\`histplot\`, \`kdeplot\`), relationships (\`scatterplot\`, \`regplot\`), and categorical comparisons (\`boxplot\`, \`violinplot\`).

\`\`\`python
import seaborn as sns
sns.set_theme(style="whitegrid")
sns.boxplot(data=df, x="species", y="petal_length")
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="viridis")
\`\`\`

## Choosing the right plot

- **Distribution of one variable** → histogram / KDE.
- **Relationship between two** → scatter; add a regression line for trend.
- **Compare groups** → box / violin plots show spread and outliers.
- **Correlation structure** → heatmap of the correlation matrix.

## Publication quality

Label axes, add units, choose colorblind-safe palettes, set DPI on save (\`fig.savefig("plot.png", dpi=200, bbox_inches="tight")\`), and never rely on default titles.

## Key takeaways

- Use the Figure/Axes object-oriented API for control and multi-panel layouts.
- Seaborn provides statistical plots with great defaults on top of Matplotlib.
- Match plot type to question: distribution, relationship, comparison, or correlation.`,
          },
          {
            day: 3,
            title: "PyTorch Fundamentals",
            domain: "foundations",
            key_concepts: ["tensors", "autograd", "computational graph", "requires_grad", "device"],
            quiz_prompt:
              "Test tensors vs NumPy arrays, how autograd builds a dynamic computational graph, what requires_grad and .backward() do, and CPU/GPU device placement.",
            lesson_markdown: `# PyTorch Fundamentals

PyTorch is NumPy with two superpowers: automatic differentiation and GPU acceleration. Master tensors and autograd and you can build any model.

## Tensors

A **tensor** is an n-dimensional array, like a NumPy array but able to live on a GPU and track gradients. The API mirrors NumPy closely.

\`\`\`python
import torch
x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
y = x @ x.T          # matrix multiply
z = x.mean()
print(x.shape, x.dtype, x.device)
\`\`\`

## Autograd and the computational graph

When a tensor has \`requires_grad=True\`, PyTorch records every operation into a **dynamic computational graph**. Calling \`.backward()\` on a scalar walks that graph in reverse (the chain rule from Day 3 of Week 1) and fills each leaf tensor's \`.grad\`.

\`\`\`python
w = torch.tensor(2.0, requires_grad=True)
loss = (3 * w + 1) ** 2
loss.backward()
print(w.grad)   # d/dw (3w+1)^2 = 6(3w+1) = 42
\`\`\`

The graph is built fresh on every forward pass (define-by-run), which makes control flow and debugging natural.

## Devices: CPU and GPU

Move tensors and models with \`.to(device)\`. Operations require all tensors on the same device.

\`\`\`python
device = "cuda" if torch.cuda.is_available() else "cpu"
x = x.to(device)
\`\`\`

## Detaching and no_grad

During evaluation, wrap code in \`torch.no_grad()\` to skip graph building and save memory. Use \`.detach()\` to get a tensor that shares data but is cut from the graph.

## Key takeaways

- Tensors are GPU-capable, gradient-tracking arrays with a NumPy-like API.
- \`requires_grad\` + \`.backward()\` implement automatic differentiation via a dynamic graph.
- Keep tensors on one device; use \`no_grad()\` at inference time.`,
          },
          {
            day: 4,
            title: "Training Loop Anatomy",
            domain: "foundations",
            key_concepts: ["forward pass", "loss", "backward", "optimizer step", "zero_grad"],
            quiz_prompt:
              "Test the five steps of a training loop (forward, loss, zero_grad, backward, step), why gradients must be zeroed, and the role of the optimizer.",
            lesson_markdown: `# Training Loop Anatomy

Every PyTorch model — from logistic regression to a transformer — trains with the same five-step loop. Internalize it and the rest is just swapping the model.

## The five steps

1. **Forward pass** — compute predictions from inputs.
2. **Loss** — measure how wrong the predictions are.
3. **Zero gradients** — clear gradients from the previous step.
4. **Backward** — backpropagate to fill \`.grad\`.
5. **Optimizer step** — update parameters using those gradients.

\`\`\`python
import torch, torch.nn as nn
model = nn.Linear(4, 3)
opt = torch.optim.SGD(model.parameters(), lr=0.1)
loss_fn = nn.CrossEntropyLoss()

for epoch in range(100):
    logits = model(X)            # 1. forward
    loss = loss_fn(logits, y)    # 2. loss
    opt.zero_grad()              # 3. clear old grads
    loss.backward()              # 4. backprop
    opt.step()                   # 5. update weights
\`\`\`

## Why zero_grad?

PyTorch **accumulates** gradients by default (useful for some advanced tricks). If you forget \`zero_grad()\`, gradients from every batch pile up and training diverges. This is the single most common beginner bug.

## The optimizer

The **optimizer** holds references to the model's parameters and applies the update rule. SGD does \`w ← w − lr · grad\`. Swapping to Adam (\`torch.optim.Adam\`) changes only one line but adapts the step size per parameter (covered in Week 7).

## Train vs eval mode

Call \`model.train()\` during training and \`model.eval()\` during evaluation. This toggles layers like dropout and batch norm, which behave differently in each mode. Wrap evaluation in \`torch.no_grad()\`.

## Key takeaways

- The loop is always: forward → loss → zero_grad → backward → step.
- Gradients accumulate; you must zero them each iteration.
- The optimizer owns the parameters and defines the update rule; toggle train/eval mode appropriately.`,
          },
          {
            day: 5,
            title: "Experiment Tracking with MLflow",
            domain: "foundations",
            key_concepts: ["metrics logging", "artifacts", "runs", "model registry", "reproducibility"],
            quiz_prompt:
              "Cover why experiment tracking matters, what MLflow logs (params, metrics, artifacts), the concept of runs, and the model registry.",
            lesson_markdown: `# Experiment Tracking with MLflow

After your tenth training run you will not remember which learning rate gave the best accuracy. Experiment tracking turns ML from guesswork into science.

## Why track experiments

ML is empirical: you try dozens of configurations. Without logging, results are irreproducible and comparisons are guesswork. Tracking records **what you ran, with what settings, and what happened** — so you can reproduce and compare.

## MLflow runs

A **run** is one execution of your training code. You log **parameters** (hyperparameters, fixed inputs), **metrics** (numbers that change over time, like loss/accuracy), and **artifacts** (files: the trained model, plots, configs).

\`\`\`python
import mlflow
with mlflow.start_run():
    mlflow.log_param("lr", 0.01)
    mlflow.log_param("batch_size", 32)
    for epoch in range(n_epochs):
        mlflow.log_metric("val_acc", acc, step=epoch)
    mlflow.log_artifact("loss_curve.png")
\`\`\`

Launch \`mlflow ui\` to browse and compare runs in a dashboard — sortable tables and metric plots across experiments.

## The model registry

The **model registry** versions trained models and tracks lifecycle stages (Staging, Production, Archived). This bridges experimentation and deployment: you promote a specific run's model to production with a clear audit trail.

\`\`\`python
mlflow.pytorch.log_model(model, "model", registered_model_name="iris-clf")
\`\`\`

## Reproducibility checklist

Log the random seed, library versions, dataset version, and full config. A run you cannot reproduce is a run you cannot trust. (This habit becomes essential in the MLOps week.)

## Key takeaways

- Track every run's params, metrics, and artifacts so results are reproducible and comparable.
- A run = one training execution; the UI compares them side by side.
- The model registry versions models and manages their path to production.`,
          },
        ],
      },
      {
        week: 3,
        title: "SQL & Databases for ML",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        project: {
          title: "SQL Feature Store",
          description:
            "Given a raw relational e-commerce database (orders, customers, products, events — provided as /assets/datasets/ecommerce.db), profile the data with SQL only, engineer at least 10 ML features (RFM, purchase frequency, average basket size, days since last order, category affinity) using CTEs and window functions, export to pandas to train a LogisticRegression churn classifier, and write a single features.sql that regenerates the feature table.",
          evaluation_criteria: [
            "SQL correctness",
            "Feature quality and relevance",
            "Query readability (clearly named CTEs)",
            "No unnecessary subqueries where a window function suffices",
            "Working churn classifier from the exported features",
          ],
          starter_code: `import sqlite3
import pandas as pd
from sklearn.linear_model import LogisticRegression

conn = sqlite3.connect("assets/datasets/ecommerce.db")

features_sql = """
WITH order_stats AS (
    SELECT customer_id,
           COUNT(*)               AS n_orders,
           AVG(order_total)       AS avg_basket,
           MAX(order_date)        AS last_order
    FROM orders
    GROUP BY customer_id
)
-- TODO: add RFM scores, frequency, days-since-last, category affinity
SELECT * FROM order_stats;
"""

df = pd.read_sql(features_sql, conn)
# TODO: build churn label, train LogisticRegression, report AUC`,
        },
        days: [
          {
            day: 1,
            title: "SQL Foundations",
            domain: "foundations",
            key_concepts: ["SELECT", "WHERE", "ORDER BY", "LIMIT", "NULL semantics"],
            quiz_prompt:
              "Test the relational model, DDL vs DML, basic SELECT/WHERE/ORDER BY/LIMIT, data types, and three-valued NULL logic.",
            lesson_markdown: `# SQL Foundations

SQL is the lingua franca of data. Before data reaches pandas it almost always lives in a relational database, and a huge fraction of ML feature engineering happens in SQL.

## The relational model

Data lives in **tables** (relations): rows are records, columns are attributes, and each table ideally has a **primary key** uniquely identifying rows. **DDL** (Data Definition Language: \`CREATE\`, \`ALTER\`, \`DROP\`) defines structure; **DML** (Data Manipulation Language: \`SELECT\`, \`INSERT\`, \`UPDATE\`, \`DELETE\`) works with rows.

## SELECT, WHERE, ORDER BY, LIMIT

\`\`\`sql
SELECT customer_id, order_total
FROM orders
WHERE order_total > 100
  AND status = 'completed'
ORDER BY order_total DESC
LIMIT 10;
\`\`\`

\`SELECT\` chooses columns, \`WHERE\` filters rows, \`ORDER BY\` sorts, \`LIMIT\` caps the result. \`WHERE\` runs before sorting and limiting.

## Data types

Common types: \`INTEGER\`, \`REAL\`/\`FLOAT\`, \`TEXT\`/\`VARCHAR\`, \`DATE\`/\`TIMESTAMP\`, \`BOOLEAN\`. Storing numbers as text breaks comparisons and aggregation — types matter.

## NULL semantics

\`NULL\` means "unknown," not zero or empty. SQL uses **three-valued logic**: any comparison with NULL yields \`UNKNOWN\`, not true/false. So \`WHERE col = NULL\` never matches — you must use \`IS NULL\` / \`IS NOT NULL\`. Aggregate functions skip NULLs (except \`COUNT(*)\`).

\`\`\`sql
SELECT * FROM customers WHERE phone IS NULL;
\`\`\`

## Key takeaways

- Relational data is tables with keys; DDL defines structure, DML manipulates rows.
- \`SELECT … FROM … WHERE … ORDER BY … LIMIT\` is the core query shape.
- NULL is "unknown": use \`IS NULL\`, and remember three-valued logic.`,
          },
          {
            day: 2,
            title: "Aggregations & Grouping",
            domain: "foundations",
            key_concepts: ["GROUP BY", "HAVING", "COUNT/SUM/AVG", "DISTINCT", "aggregate filtering"],
            quiz_prompt:
              "Test GROUP BY, aggregate functions, the difference between WHERE and HAVING, and DISTINCT.",
            lesson_markdown: `# Aggregations & Grouping

Aggregation collapses many rows into summary numbers — counts, sums, averages per group. This is how raw event logs become features.

## Aggregate functions

\`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\` reduce a column to one value. \`COUNT(*)\` counts rows; \`COUNT(col)\` counts non-NULL values; \`COUNT(DISTINCT col)\` counts unique values.

\`\`\`sql
SELECT COUNT(*) AS n_orders,
       SUM(order_total) AS revenue,
       AVG(order_total) AS avg_order
FROM orders;
\`\`\`

## GROUP BY

\`GROUP BY\` partitions rows into groups and applies aggregates per group. Every non-aggregated column in \`SELECT\` must appear in \`GROUP BY\`.

\`\`\`sql
SELECT customer_id,
       COUNT(*) AS n_orders,
       SUM(order_total) AS lifetime_value
FROM orders
GROUP BY customer_id;
\`\`\`

## WHERE vs HAVING

\`WHERE\` filters **rows before** grouping; \`HAVING\` filters **groups after** aggregation. You cannot use an aggregate in \`WHERE\`.

\`\`\`sql
SELECT customer_id, COUNT(*) AS n
FROM orders
WHERE status = 'completed'   -- filter rows first
GROUP BY customer_id
HAVING COUNT(*) >= 5;        -- then filter groups
\`\`\`

## DISTINCT

\`DISTINCT\` removes duplicate rows. \`COUNT(DISTINCT customer_id)\` answers "how many unique customers" — a common feature.

## Key takeaways

- Aggregates collapse columns; \`GROUP BY\` applies them per group.
- \`WHERE\` filters rows pre-aggregation, \`HAVING\` filters groups post-aggregation.
- \`COUNT(DISTINCT …)\` counts unique values; \`COUNT(*)\` counts all rows.`,
          },
          {
            day: 3,
            title: "Joins & Relationships",
            domain: "foundations",
            key_concepts: ["INNER JOIN", "LEFT JOIN", "foreign keys", "normalization", "self-join"],
            quiz_prompt:
              "Test INNER vs LEFT/RIGHT/FULL OUTER joins, when each is appropriate, foreign keys, and normalization (1NF–3NF).",
            lesson_markdown: `# Joins & Relationships

Real data is split across tables to avoid duplication. **Joins** recombine them, and choosing the right join type is the difference between correct and silently-wrong features.

## Foreign keys and normalization

A **foreign key** in one table references the primary key of another (e.g. \`orders.customer_id → customers.id\`). **Normalization** (1NF → 3NF) eliminates redundancy: each fact stored once, related by keys. This keeps data consistent but means analysis requires joins.

## Join types

- **INNER JOIN** — only rows matching in both tables.
- **LEFT JOIN** — all left rows; NULLs where the right has no match.
- **RIGHT JOIN** — mirror of LEFT.
- **FULL OUTER JOIN** — all rows from both, NULLs where unmatched.

\`\`\`sql
SELECT c.name, o.order_total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
\`\`\`

A LEFT JOIN here keeps customers with **zero** orders (their \`order_total\` is NULL) — essential for churn features, where the customers you care about may have stopped ordering.

## INNER vs LEFT in features

If you INNER JOIN customers to orders, customers with no orders vanish — biasing your dataset. For ML you almost always want LEFT JOIN from the entity you're scoring, then \`COALESCE(value, 0)\` to fill NULLs.

## Self-joins

A table joined to itself, useful for comparing rows within the same table (e.g. finding pairs, hierarchies). Alias the table twice.

## Key takeaways

- Foreign keys + normalization split data; joins recombine it.
- INNER keeps only matches; LEFT keeps all left rows (vital for entities with no activity).
- Pick join type deliberately — the wrong one silently drops or duplicates rows.`,
          },
          {
            day: 4,
            title: "Advanced SQL — Window Functions & CTEs",
            domain: "foundations",
            key_concepts: ["window functions", "ROW_NUMBER/RANK", "LAG/LEAD", "CTEs", "execution order"],
            quiz_prompt:
              "Test window functions (ROW_NUMBER, RANK, LAG, PARTITION BY), CTEs vs subqueries, and logical query execution order.",
            lesson_markdown: `# Advanced SQL — Window Functions & CTEs

Window functions and CTEs are where SQL becomes a genuine feature-engineering language — computing rankings, running totals, and period-over-period changes without leaving the database.

## Window functions

A **window function** computes across a set of rows *related to the current row* without collapsing them (unlike GROUP BY). \`PARTITION BY\` defines groups; \`ORDER BY\` defines order within them.

\`\`\`sql
SELECT customer_id, order_date, order_total,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS order_seq,
       SUM(order_total) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total,
       LAG(order_date)  OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_order
FROM orders;
\`\`\`

- \`ROW_NUMBER/RANK/NTILE\` — rankings and bucketing.
- \`LAG/LEAD\` — access previous/next rows (days-between-orders features).
- Aggregates with \`OVER\` — running totals, moving averages.

## CTEs (WITH clauses)

A **Common Table Expression** names a subquery so you can build queries in readable, composable steps:

\`\`\`sql
WITH order_stats AS (
    SELECT customer_id, COUNT(*) AS n, MAX(order_date) AS last_order
    FROM orders GROUP BY customer_id
)
SELECT * FROM order_stats WHERE n > 3;
\`\`\`

CTEs beat nested subqueries for readability — name each step after what it computes.

## Logical execution order

SQL is written \`SELECT … FROM … WHERE …\` but executes as:
\`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY\`.
This explains why you can't reference a \`SELECT\` alias in \`WHERE\` (it hasn't been computed yet) but can in \`ORDER BY\`.

## Key takeaways

- Window functions compute over related rows without collapsing them — ideal for sequences and running stats.
- CTEs name subqueries into a readable pipeline.
- Logical order is FROM→WHERE→GROUP BY→HAVING→SELECT→ORDER BY.`,
          },
          {
            day: 5,
            title: "SQL for ML Workflows",
            domain: "foundations",
            key_concepts: ["feature engineering in SQL", "CASE WHEN", "indexing", "EXPLAIN", "pandas ↔ SQL"],
            quiz_prompt:
              "Test SQL feature engineering (bucketing, one-hot via CASE WHEN, date features, rolling averages), indexing and EXPLAIN, and the pandas↔SQL bridge.",
            lesson_markdown: `# SQL for ML Workflows

This is where Week 3 pays off: turning raw relational tables into a clean feature matrix, efficiently, and moving it into pandas for modeling.

## Feature engineering in SQL

**Bucketing and one-hot** with \`CASE WHEN\`:

\`\`\`sql
SELECT customer_id,
       CASE WHEN age < 25 THEN 'young'
            WHEN age < 50 THEN 'mid'
            ELSE 'senior' END AS age_band,
       CASE WHEN country = 'US' THEN 1 ELSE 0 END AS is_us
FROM customers;
\`\`\`

**Date/time features**: \`strftime('%w', order_date)\` for day-of-week, date differences for recency. **Rolling averages** use window functions with a frame:

\`\`\`sql
AVG(order_total) OVER (
  PARTITION BY customer_id ORDER BY order_date
  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
) AS rolling_avg_3
\`\`\`

## Indexing and query optimization

An **index** is a sorted lookup structure that turns full-table scans into fast seeks. Index columns used in \`WHERE\` and \`JOIN\`. Use \`EXPLAIN\` (\`EXPLAIN ANALYZE\` in Postgres) to see the query plan and spot missing indexes.

\`\`\`sql
CREATE INDEX idx_orders_customer ON orders(customer_id);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 42;
\`\`\`

## SQLite vs PostgreSQL

SQLite is a zero-config embedded file database (what NeuralPath itself uses); Postgres is a full client-server system with richer types, true concurrency, and \`EXPLAIN ANALYZE\`. SQL is largely portable, but functions and types differ.

## pandas ↔ SQL bridge

\`\`\`python
import pandas as pd, sqlite3
conn = sqlite3.connect("ecommerce.db")
df = pd.read_sql("SELECT * FROM features", conn)  # SQL -> DataFrame
df.to_sql("features", conn, if_exists="replace")  # DataFrame -> SQL
\`\`\`

Push heavy aggregation to SQL (the database is optimized for it), then pull a compact feature matrix into pandas for modeling.

## Key takeaways

- Engineer features in SQL with \`CASE WHEN\`, date functions, and windowed rolling stats.
- Index join/filter columns; use \`EXPLAIN\` to diagnose slow queries.
- \`pd.read_sql\` / \`to_sql\` bridge SQL and pandas — aggregate in SQL, model in pandas.`,
          },
        ],
      },
    ],
  },
  // ════════════════════════════════════════════════════════════════
  // PHASE 1 — CLASSICAL ML
  // ════════════════════════════════════════════════════════════════
  {
    phase: 1,
    title: "Classical ML",
    weeks: [
      {
        week: 4,
        title: "Supervised Learning I",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        research_papers: [
          paper(
            "dsgd",
            "SGD, gradient estimation, and convergence theory from this week are the exact foundations A-DSGD extends to the distributed, noisy-wireless-channel setting.",
            {
              title: "Distributed SGD Simulation (D-DSGD)",
              difficulty: "research_track",
              description:
                "Simulate distributed training across 10 virtual devices on CIFAR-10 where each device sends only top-k% of gradient values. Compare full FedAvg vs top-1% vs top-0.1% sparsification; plot test accuracy vs total bits transmitted.",
              colab_recommended: true,
            }
          ),
          paper(
            "tcs",
            "TCS treats compression error as a gradient-estimation error that must be bounded for convergence — a direct extension of the gradient descent theory you learn this week."
          ),
        ],
        project: {
          title: "Churn Predictor",
          description:
            "Train logistic regression and ridge regression on a customer churn dataset. Compare models with cross-validated AUC and produce a model card (markdown) explaining the model, data, evaluation, and limitations.",
          evaluation_criteria: [
            "Correct train/validation methodology (no leakage)",
            "Cross-validated AUC comparison",
            "Sensible feature preprocessing",
            "Clear, honest model card",
            "Discussion of limitations",
          ],
          starter_code: `import pandas as pd
from sklearn.linear_model import LogisticRegression, RidgeClassifier
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("assets/datasets/churn.csv")
X = df.drop(columns=["churn"]); y = df["churn"]

pipe = Pipeline([("scale", StandardScaler()),
                 ("clf", LogisticRegression(max_iter=1000))])
auc = cross_val_score(pipe, X, y, cv=5, scoring="roc_auc")
print("LogReg AUC:", auc.mean())
# TODO: ridge comparison + model card`,
        },
        days: [
          {
            day: 1,
            title: "Linear Regression",
            domain: "classical_ml",
            key_concepts: ["OLS", "gradient descent", "Ridge", "Lasso", "ElasticNet"],
            quiz_prompt:
              "Test ordinary least squares, fitting via the normal equation vs gradient descent, and L1/L2/ElasticNet regularization effects.",
            lesson_markdown: `# Linear Regression

Linear regression predicts a continuous target as a weighted sum of features: \`ŷ = Xw + b\`. It is the simplest useful model and the conceptual root of much of ML.

## Ordinary Least Squares (OLS)

OLS chooses weights minimizing **mean squared error** \`(1/n)Σ(y−ŷ)²\`. There is a closed form, the normal equation \`w = (XᵀX)⁻¹Xᵀy\`, but it costs \`O(d³)\` and is unstable when features are correlated. For large \`d\` we minimize MSE with **gradient descent** instead (Week 1, Day 3).

\`\`\`python
from sklearn.linear_model import LinearRegression
model = LinearRegression().fit(X_train, y_train)
print(model.coef_, model.intercept_)
\`\`\`

## Regularization

Unregularized models overfit when features are many or correlated. Regularization adds a penalty on weight size:

- **Ridge (L2)**: penalty \`λΣw²\` shrinks weights smoothly toward zero — handles correlated features.
- **Lasso (L1)**: penalty \`λΣ|w|\` drives some weights *exactly* to zero — automatic feature selection.
- **ElasticNet**: a mix of L1 and L2.

\`\`\`python
from sklearn.linear_model import Ridge, Lasso, ElasticNet
Ridge(alpha=1.0).fit(X_train, y_train)
Lasso(alpha=0.1).fit(X_train, y_train)   # sparse coefficients
\`\`\`

The strength \`λ\` (sklearn's \`alpha\`) trades fit against simplicity — a hyperparameter you tune (Day 5). Recall from Week 1 that L2 regularization is equivalent to a Gaussian prior on the weights.

## Key takeaways

- OLS minimizes squared error; use gradient descent over the normal equation at scale.
- Ridge shrinks weights; Lasso zeros some out (feature selection); ElasticNet blends both.
- Regularization strength is a tunable hyperparameter controlling overfitting.`,
          },
          {
            day: 2,
            title: "Logistic Regression",
            domain: "classical_ml",
            key_concepts: ["sigmoid", "cross-entropy", "decision boundary", "softmax", "multiclass"],
            quiz_prompt:
              "Test the sigmoid function, cross-entropy loss, linear decision boundaries, and multiclass strategies (OvR vs softmax).",
            lesson_markdown: `# Logistic Regression

Despite the name, logistic regression is a **classifier**. It models the probability of a class with a sigmoid applied to a linear score.

## Sigmoid and probabilities

The **sigmoid** \`σ(z) = 1/(1+e^{−z})\` squashes any real number into (0,1), interpreted as \`P(y=1|x)\`. The linear score \`z = w·x + b\` feeds the sigmoid:

\`\`\`python
import numpy as np
def sigmoid(z): return 1/(1+np.exp(-z))
p = sigmoid(X @ w + b)   # predicted probabilities
\`\`\`

## Cross-entropy loss

We fit by maximizing likelihood of the labels — equivalently minimizing **binary cross-entropy**:
\`L = −(1/n)Σ[y·log p + (1−y)·log(1−p)]\`.
This is the Bernoulli negative log-likelihood from Week 1. Unlike MSE, it is convex for logistic regression, so gradient descent finds the global optimum.

## Decision boundary

Predicting class 1 when \`p > 0.5\` is equivalent to \`w·x + b > 0\` — a **linear** boundary (a hyperplane). Logistic regression can only separate classes linearly; nonlinear problems need features engineering or nonlinear models.

## Multiclass

- **One-vs-Rest (OvR)**: train one binary classifier per class.
- **Softmax (multinomial)**: generalize sigmoid to \`K\` classes, outputs a probability distribution summing to 1. Softmax + cross-entropy is the standard classification head in deep learning too.

\`\`\`python
from sklearn.linear_model import LogisticRegression
clf = LogisticRegression(multi_class="multinomial", max_iter=1000).fit(X, y)
clf.predict_proba(X[:3])
\`\`\`

## Key takeaways

- Sigmoid turns a linear score into a probability; the decision boundary is linear.
- Cross-entropy (Bernoulli NLL) is the convex loss for classification.
- Multiclass via OvR or softmax; softmax+CE is the universal classification objective.`,
          },
          {
            day: 3,
            title: "Bias-Variance Tradeoff",
            domain: "classical_ml",
            key_concepts: ["underfitting", "overfitting", "learning curves", "model complexity", "generalization"],
            quiz_prompt:
              "Test the bias-variance decomposition, signs of under/overfitting, how learning curves diagnose them, and the role of model complexity.",
            lesson_markdown: `# Bias-Variance Tradeoff

Every model's generalization error decomposes into **bias** (error from wrong assumptions), **variance** (error from sensitivity to the training sample), and irreducible **noise**. Managing this tradeoff is the central skill of practical ML.

## Underfitting vs overfitting

- **High bias / underfitting**: model too simple, misses real patterns — high train *and* test error.
- **High variance / overfitting**: model too complex, memorizes noise — low train error but high test error.

Adding complexity (more features, deeper trees, more parameters) lowers bias but raises variance. The sweet spot minimizes total error.

## Learning curves

Plot train and validation error vs training-set size or model complexity:

- Curves that converge at **high** error → high bias (underfitting). More data won't help; add complexity/features.
- A **large gap** (low train, high val) → high variance (overfitting). More data, regularization, or simpler model helps.

\`\`\`python
from sklearn.model_selection import learning_curve
sizes, train, val = learning_curve(model, X, y, cv=5,
                                   train_sizes=[0.2,0.5,1.0])
\`\`\`

## Controlling the tradeoff

Regularization (Day 1), dropout, early stopping, and gathering more data reduce variance. Richer features, less regularization, and more capacity reduce bias. Cross-validation (Day 5) estimates test error honestly so you can tune the balance.

## Key takeaways

- Generalization error = bias² + variance + irreducible noise.
- Underfitting: high train+test error; overfitting: low train, high test error.
- Learning curves diagnose which problem you have and what to do about it.`,
          },
          {
            day: 4,
            title: "Model Evaluation",
            domain: "classical_ml",
            key_concepts: ["confusion matrix", "precision", "recall", "F1", "ROC-AUC"],
            quiz_prompt:
              "Test the confusion matrix, precision vs recall tradeoff, F1, ROC-AUC vs PR curves, and when accuracy misleads.",
            lesson_markdown: `# Model Evaluation

Accuracy alone lies, especially with imbalanced classes. Choosing the right metric is a modeling decision tied to the cost of different errors.

## The confusion matrix

For binary classification, predictions fall into four cells: **TP, FP, TN, FN**. Everything else derives from these.

\`\`\`python
from sklearn.metrics import confusion_matrix
tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
\`\`\`

## Precision, recall, F1

- **Precision** = TP/(TP+FP): of predicted positives, how many are right. Matters when false positives are costly (spam filter).
- **Recall** = TP/(TP+FN): of actual positives, how many you caught. Matters when false negatives are costly (disease screening).
- **F1** = harmonic mean of precision and recall — a single balanced number.

Precision and recall trade off: lowering the decision threshold raises recall but lowers precision.

## ROC-AUC and PR curves

The **ROC curve** plots true-positive rate vs false-positive rate across all thresholds; **AUC** is the area under it (1.0 perfect, 0.5 random). AUC is threshold-independent and great for ranking quality. For **imbalanced** data, the **precision-recall curve** is more informative because ROC can look optimistic when negatives dominate.

\`\`\`python
from sklearn.metrics import roc_auc_score, f1_score
auc = roc_auc_score(y_true, y_scores)
f1  = f1_score(y_true, y_pred)
\`\`\`

## When accuracy misleads

With 99% negatives, a model predicting "always negative" gets 99% accuracy but is useless. Always check per-class metrics on imbalanced problems.

## Key takeaways

- The confusion matrix (TP/FP/TN/FN) is the source of all classification metrics.
- Precision vs recall reflects the relative cost of false positives vs false negatives; F1 balances them.
- Use ROC-AUC for ranking; prefer PR curves on imbalanced data; distrust raw accuracy.`,
          },
          {
            day: 5,
            title: "Cross-Validation & Hyperparameter Tuning",
            domain: "classical_ml",
            key_concepts: ["k-fold", "GridSearchCV", "RandomizedSearchCV", "Optuna", "validation strategy"],
            quiz_prompt:
              "Test k-fold cross-validation, grid vs random search, Bayesian optimization (Optuna), and avoiding validation leakage.",
            lesson_markdown: `# Cross-Validation & Hyperparameter Tuning

A single train/test split gives a noisy estimate of performance. Cross-validation uses the data more efficiently and tuning finds the best hyperparameters honestly.

## k-fold cross-validation

Split data into \`k\` folds; train on \`k−1\`, validate on the held-out fold, rotate, and average. This uses every sample for both training and validation and gives a variance estimate.

\`\`\`python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(pipe, X, y, cv=5, scoring="roc_auc")
print(scores.mean(), scores.std())
\`\`\`

Use **stratified** k-fold for classification to preserve class ratios in each fold.

## Grid vs random search

- **GridSearchCV** exhaustively tries every combination in a grid — thorough but expensive, scaling exponentially with parameters.
- **RandomizedSearchCV** samples random combinations — usually finds good settings far faster, especially when only a few hyperparameters matter.

\`\`\`python
from sklearn.model_selection import GridSearchCV
grid = GridSearchCV(pipe, {"clf__C": [0.1, 1, 10]}, cv=5, scoring="roc_auc")
grid.fit(X, y); print(grid.best_params_)
\`\`\`

## Bayesian optimization (Optuna)

**Optuna** models the relationship between hyperparameters and score, then samples the next trial where improvement is likely — far more sample-efficient than grid/random for expensive models.

\`\`\`python
import optuna
def objective(trial):
    C = trial.suggest_float("C", 1e-3, 1e2, log=True)
    return cross_val_score(LogisticRegression(C=C, max_iter=1000), X, y, cv=5).mean()
study = optuna.create_study(direction="maximize"); study.optimize(objective, n_trials=30)
\`\`\`

## Avoiding leakage

Do all preprocessing **inside** the CV loop (use Pipelines). Fitting a scaler on the full dataset before CV leaks test information and inflates scores.

## Key takeaways

- k-fold CV gives a robust, lower-variance performance estimate; stratify for classification.
- Random search usually beats grid search; Optuna's Bayesian search is most sample-efficient.
- Keep preprocessing inside the CV loop to prevent leakage.`,
          },
        ],
      },
      {
        week: 5,
        title: "Tree-Based Methods",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        project: {
          title: "Tabular Competition Baseline",
          description:
            "Using the Titanic dataset (in assets), build a full pipeline: feature engineering → baseline logistic regression → Random Forest → XGBoost → stacked ensemble. Report a cross-validated score comparison table and a SHAP analysis of the best model.",
          evaluation_criteria: [
            "Thoughtful feature engineering",
            "Correct CV comparison across models",
            "Working stacked ensemble",
            "SHAP analysis with interpretation",
            "Clear results table",
          ],
          starter_code: `import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
import xgboost as xgb

df = pd.read_csv("assets/datasets/titanic.csv")
# TODO: feature engineering (title extraction, family size, fare bins)
# TODO: LR baseline -> RF -> XGBoost -> StackingClassifier
# TODO: SHAP analysis with shap.TreeExplainer`,
        },
        days: [
          {
            day: 1,
            title: "Decision Trees",
            domain: "classical_ml",
            key_concepts: ["Gini", "entropy", "information gain", "pruning", "depth control"],
            quiz_prompt:
              "Test how decision trees split (Gini/entropy/information gain), why unpruned trees overfit, and depth/leaf controls.",
            lesson_markdown: `# Decision Trees

A decision tree asks a sequence of yes/no questions about features, splitting the data until each leaf is mostly one class. They are interpretable and the building block of the most powerful tabular models.

## Splitting criteria

At each node the tree picks the feature and threshold that best **purifies** the children. Purity is measured by:

- **Gini impurity** \`1 − Σ p_k²\` — probability of misclassifying a random sample.
- **Entropy** \`−Σ p_k log p_k\` — information-theoretic disorder.

The split maximizing **information gain** (parent impurity minus weighted child impurity) is chosen greedily.

\`\`\`python
from sklearn.tree import DecisionTreeClassifier
tree = DecisionTreeClassifier(criterion="gini", max_depth=4).fit(X, y)
\`\`\`

## Overfitting and pruning

A tree grown until every leaf is pure memorizes the training set — extreme overfitting (high variance). Control it by:

- **max_depth** — limit how deep the tree grows.
- **min_samples_leaf / min_samples_split** — require enough samples to split.
- **Cost-complexity pruning** (\`ccp_alpha\`) — trim branches that add little.

## Strengths and limits

Trees handle nonlinearity and feature interactions automatically, need no scaling, and are interpretable. But a single tree is unstable — small data changes produce very different trees. That instability is exactly what ensembles (Days 2–4) exploit.

## Key takeaways

- Trees split greedily to reduce Gini/entropy, maximizing information gain.
- Unpruned trees overfit; control depth, leaf size, and use pruning.
- Single trees are high-variance — motivating the ensembles that follow.`,
          },
          {
            day: 2,
            title: "Random Forests",
            domain: "classical_ml",
            key_concepts: ["bagging", "feature importance", "OOB score", "bootstrap", "decorrelation"],
            quiz_prompt:
              "Test bagging, how random feature subsets decorrelate trees, out-of-bag estimation, and feature importance.",
            lesson_markdown: `# Random Forests

A random forest averages many decorrelated decision trees. By combining high-variance, low-bias learners it dramatically reduces variance while keeping bias low — one of the best out-of-the-box tabular models.

## Bagging

**Bootstrap aggregating** trains each tree on a random sample (with replacement) of the data. Averaging many trees trained on slightly different data cancels their individual noise. Variance drops roughly like \`1/N\` for independent trees.

## Decorrelation via random features

If every tree saw all features, they'd be similar and averaging would help little. Random forests also restrict each split to a **random subset of features** (\`max_features\`), forcing diversity. Decorrelated trees average to a much better model.

\`\`\`python
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=300, max_features="sqrt",
                            oob_score=True, n_jobs=-1).fit(X, y)
print(rf.oob_score_)
\`\`\`

## Out-of-bag (OOB) score

Each bootstrap sample omits ~37% of rows; those **out-of-bag** rows act as a free validation set per tree. The aggregated OOB score estimates test performance without a separate holdout.

## Feature importance

Forests rank features by how much they reduce impurity across all splits. Useful for a quick sense of signal, but biased toward high-cardinality features — prefer **permutation importance** or SHAP (Day 5) for reliable attributions.

## Key takeaways

- Bagging trains trees on bootstrap samples and averages to cut variance.
- Random feature subsets decorrelate trees, which is what makes averaging powerful.
- OOB gives free validation; treat impurity-based importance with caution.`,
          },
          {
            day: 3,
            title: "Gradient Boosting",
            domain: "classical_ml",
            key_concepts: ["additive modeling", "XGBoost", "LightGBM", "CatBoost", "learning rate"],
            quiz_prompt:
              "Test how boosting fits residuals additively, the difference from bagging, and XGBoost/LightGBM/CatBoost tradeoffs.",
            lesson_markdown: `# Gradient Boosting

Gradient boosting builds trees **sequentially**, each correcting the errors of the ensemble so far. It dominates tabular ML competitions and is the go-to for structured data.

## Additive modeling

Unlike bagging (parallel, independent trees), boosting is **additive and sequential**: start with a weak prediction, compute the residual errors, fit a new small tree to those residuals, add it scaled by a **learning rate**, and repeat. Each tree is a gradient-descent step in function space on the loss.

\`\`\`
F_0(x) = initial guess
F_{m}(x) = F_{m-1}(x) + lr * tree_m(x)   # tree_m fits the negative gradient
\`\`\`

Small learning rate + many trees generalizes better but trains slower; this is the key tradeoff.

## XGBoost, LightGBM, CatBoost

- **XGBoost** — regularized boosting with second-order gradients; robust default.
- **LightGBM** — leaf-wise growth and histogram binning; fastest on large data.
- **CatBoost** — handles categorical features natively with ordered boosting; great with many categories and less tuning.

\`\`\`python
import xgboost as xgb
model = xgb.XGBClassifier(n_estimators=400, learning_rate=0.05,
                          max_depth=4, subsample=0.8)
model.fit(X_train, y_train)
\`\`\`

## Tuning essentials

The most important knobs: \`n_estimators\` × \`learning_rate\` (trade depth of training), \`max_depth\` (tree complexity), and subsampling (\`subsample\`, \`colsample_bytree\`) for regularization. Use early stopping on a validation set to pick the number of trees automatically.

## Key takeaways

- Boosting adds trees sequentially, each fitting the previous ensemble's residuals — gradient descent in function space.
- Low learning rate + many trees + early stopping generalizes best.
- XGBoost (robust), LightGBM (fast/large data), CatBoost (categoricals) are the three workhorses.`,
          },
          {
            day: 4,
            title: "Ensemble Methods",
            domain: "classical_ml",
            key_concepts: ["voting", "stacking", "blending", "diversity", "meta-learner"],
            quiz_prompt:
              "Test voting vs stacking vs blending, why model diversity matters, and how a meta-learner combines base models.",
            lesson_markdown: `# Ensemble Methods

Combining diverse models almost always beats any single one. Beyond bagging and boosting, **voting**, **stacking**, and **blending** combine arbitrary models.

## Voting

The simplest ensemble averages predictions. **Hard voting** takes the majority class; **soft voting** averages predicted probabilities (usually better). Works best when base models are accurate *and* make different errors.

\`\`\`python
from sklearn.ensemble import VotingClassifier
ens = VotingClassifier([("lr", lr), ("rf", rf), ("xgb", xgb_clf)],
                       voting="soft").fit(X, y)
\`\`\`

## Stacking

**Stacking** trains a **meta-learner** on the out-of-fold predictions of the base models. The meta-model learns *how much to trust each base model* in different regions — more powerful than fixed averaging. Use cross-validated base predictions to avoid leakage.

\`\`\`python
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression
stack = StackingClassifier(
    estimators=[("rf", rf), ("xgb", xgb_clf)],
    final_estimator=LogisticRegression(), cv=5).fit(X, y)
\`\`\`

## Blending

A simpler cousin of stacking: hold out a single validation set, train base models on the rest, then fit the meta-learner on their validation predictions. Less data-efficient but avoids the cross-validation complexity.

## Diversity is the secret

Ensembles only help if errors are uncorrelated. Combine *different model families* (linear + trees + boosting), different feature sets, or different seeds. Three identical models add nothing.

## Key takeaways

- Voting averages predictions (soft > hard); cheap and effective.
- Stacking learns a meta-model over base models' out-of-fold predictions.
- Diversity drives ensemble gains — combine genuinely different models.`,
          },
          {
            day: 5,
            title: "SHAP Values",
            domain: "classical_ml",
            key_concepts: ["Shapley values", "global vs local", "TreeSHAP", "force plots", "explainability"],
            quiz_prompt:
              "Test the idea of Shapley values from game theory, local vs global explanations, TreeSHAP, and reading SHAP plots.",
            lesson_markdown: `# SHAP Values

SHAP explains *why* a model made a specific prediction by fairly attributing the output among the features — grounded in cooperative game theory.

## Shapley values

Borrowed from game theory, a **Shapley value** distributes a "payout" (the prediction) among "players" (features) by averaging each feature's marginal contribution across all possible orderings. SHAP applies this to ML: each feature gets a signed contribution pushing the prediction above or below the baseline. The attributions provably sum to the model output.

## Local vs global

- **Local**: explain one prediction — which features pushed this customer toward "churn"?
- **Global**: aggregate \`|SHAP|\` across all samples to rank overall feature importance — more reliable than impurity-based importance because it's consistent.

\`\`\`python
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X)
shap.summary_plot(shap_values, X)        # global importance + direction
shap.force_plot(explainer.expected_value, shap_values[0], X.iloc[0])  # one prediction
\`\`\`

## TreeSHAP

Computing exact Shapley values is exponential in features, but **TreeSHAP** exploits tree structure to compute them in polynomial time — making SHAP practical for random forests and gradient boosting (the models from this week).

## Reading the plots

- **Summary plot**: each dot is a sample; position shows SHAP value, color shows feature value — reveals direction and magnitude of effects.
- **Force plot**: shows for one prediction which features pushed up (red) vs down (blue) from the baseline.

## Key takeaways

- SHAP fairly attributes a prediction to features via game-theoretic Shapley values that sum to the output.
- Local explanations justify single predictions; global aggregation gives reliable importance.
- TreeSHAP makes exact SHAP fast for tree ensembles — the standard explainability tool for tabular ML.`,
          },
        ],
      },
      {
        week: 6,
        title: "Unsupervised Learning",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        research_papers: [
          paper(
            "tcs",
            "The layer-wise fairness problem in TCS — gradient magnitudes varying across layers — is a direct consequence of backprop dynamics, the same structure that shapes which features clustering discovers."
          ),
          paper(
            "hfl",
            "HFL's momentum-correction strategy for reducing staleness from delayed hierarchical updates extends the optimizer intuition you build when reasoning about iterative algorithms like k-means and EM."
          ),
        ],
        project: {
          title: "Customer Segmentation",
          description:
            "Cluster an e-commerce dataset using RFM features, determine the optimal number of clusters, visualize the clusters with PCA and UMAP, and write a business interpretation of each segment.",
          evaluation_criteria: [
            "Sound feature scaling for clustering",
            "Justified choice of k (elbow/silhouette)",
            "Clear PCA + UMAP visualizations",
            "Actionable business interpretation of segments",
            "Code clarity",
          ],
          starter_code: `import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

df = pd.read_csv("assets/datasets/rfm.csv")   # recency, frequency, monetary
X = StandardScaler().fit_transform(df[["recency","frequency","monetary"]])
# TODO: elbow + silhouette to pick k, fit KMeans, PCA/UMAP plot, interpret`,
        },
        days: [
          {
            day: 1,
            title: "K-Means Clustering",
            domain: "classical_ml",
            key_concepts: ["centroids", "inertia", "elbow method", "k-means++", "limitations"],
            quiz_prompt:
              "Test the k-means algorithm, inertia, choosing k via the elbow method, k-means++ initialization, and its assumptions/limits.",
            lesson_markdown: `# K-Means Clustering

K-means partitions data into \`k\` groups by alternating between assigning points to the nearest centroid and recomputing centroids. It's the default starting point for clustering.

## The algorithm

1. Initialize \`k\` centroids.
2. **Assign** each point to its nearest centroid.
3. **Update** each centroid to the mean of its assigned points.
4. Repeat until assignments stop changing.

This is coordinate descent on **inertia** = total within-cluster squared distance. It always converges, but only to a *local* optimum.

\`\`\`python
from sklearn.cluster import KMeans
km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X)
print(km.inertia_, km.cluster_centers_)
\`\`\`

## Choosing k: the elbow method

Inertia always decreases as \`k\` grows, so you can't just minimize it. Plot inertia vs \`k\` and look for the **elbow** where gains flatten. Combine with the **silhouette score** (Day 2) for a second opinion.

## k-means++

Random initialization can give poor clusters. **k-means++** spreads initial centroids apart probabilistically, giving better and more consistent results — it's sklearn's default. Always set \`n_init>1\` to take the best of several runs.

## Limitations

K-means assumes clusters are **spherical, similar-sized, and convex**, and requires \`k\` up front. It fails on elongated or nested shapes (use DBSCAN/GMM, Day 3) and is sensitive to feature scaling — always standardize first.

## Key takeaways

- K-means alternates assign/update steps to minimize within-cluster variance (inertia).
- Pick \`k\` with the elbow method plus silhouette; use k-means++ and multiple inits.
- It assumes spherical, balanced clusters and needs scaled features.`,
          },
          {
            day: 2,
            title: "Hierarchical Clustering",
            domain: "classical_ml",
            key_concepts: ["dendrogram", "linkage", "agglomerative", "silhouette score", "cluster distance"],
            quiz_prompt:
              "Test agglomerative clustering, linkage methods (single/complete/average/Ward), reading a dendrogram, and the silhouette score.",
            lesson_markdown: `# Hierarchical Clustering

Hierarchical clustering builds a tree of nested clusters, letting you see structure at every granularity without committing to \`k\` in advance.

## Agglomerative approach

Start with each point as its own cluster, then repeatedly **merge the two closest clusters** until one remains. The merge history forms a **dendrogram** — cut it at a chosen height to get any number of clusters.

\`\`\`python
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
Z = linkage(X, method="ward")
labels = fcluster(Z, t=4, criterion="maxclust")
\`\`\`

## Linkage methods

"Closest" depends on the **linkage**:

- **Single**: distance between nearest points — finds elongated chains (can over-merge).
- **Complete**: distance between farthest points — compact clusters.
- **Average**: mean pairwise distance — a balance.
- **Ward**: merges to minimize variance increase — usually best, akin to k-means objective.

## Reading a dendrogram

The y-axis is merge distance. Long vertical lines before a merge indicate well-separated clusters; cutting horizontally where lines are long gives a natural cluster count.

## Silhouette score

The **silhouette** measures, for each point, how much closer it is to its own cluster than the nearest other cluster, ranging −1 to 1. The average silhouette over the data is a clustering-quality metric that works for any algorithm — use it to compare \`k\` values.

\`\`\`python
from sklearn.metrics import silhouette_score
print(silhouette_score(X, labels))
\`\`\`

## Key takeaways

- Agglomerative clustering merges nearest clusters into a dendrogram you can cut at any level.
- Linkage (single/complete/average/Ward) defines cluster distance; Ward is a strong default.
- Silhouette score quantifies cluster quality and helps choose \`k\`.`,
          },
          {
            day: 3,
            title: "DBSCAN & Gaussian Mixture Models",
            domain: "classical_ml",
            key_concepts: ["density-based clustering", "epsilon/minPts", "noise points", "GMM", "EM algorithm"],
            quiz_prompt:
              "Test DBSCAN's density parameters and noise handling, and GMMs as soft probabilistic clustering fit by EM.",
            lesson_markdown: `# DBSCAN & Gaussian Mixture Models

When clusters aren't spherical or you don't know \`k\`, density-based and probabilistic methods step in.

## DBSCAN

**DBSCAN** groups points that are densely packed and labels sparse points as **noise**. Two parameters: \`eps\` (neighborhood radius) and \`min_samples\` (points needed to form a dense region). It finds **arbitrarily shaped** clusters and automatically determines their number.

\`\`\`python
from sklearn.cluster import DBSCAN
db = DBSCAN(eps=0.5, min_samples=5).fit(X)
db.labels_   # -1 marks noise
\`\`\`

Strengths: no \`k\`, handles odd shapes, flags outliers. Weakness: struggles with clusters of very different densities, and \`eps\` is sensitive (use a k-distance plot to choose it).

## Gaussian Mixture Models

A **GMM** models data as a mixture of \`k\` Gaussians, each with its own mean and covariance. Unlike k-means' hard assignments, GMM gives **soft** memberships — \`P(cluster | point)\` — and can fit elliptical clusters of different sizes and orientations.

\`\`\`python
from sklearn.mixture import GaussianMixture
gmm = GaussianMixture(n_components=4, covariance_type="full").fit(X)
probs = gmm.predict_proba(X)   # soft assignments
\`\`\`

## The EM algorithm

GMMs are fit by **Expectation-Maximization**: the **E-step** computes soft cluster responsibilities given current parameters; the **M-step** updates means/covariances/weights given those responsibilities. Repeat to convergence — k-means is a hard-assignment special case of EM. Choose \`k\` with the **BIC/AIC** criteria.

## Key takeaways

- DBSCAN finds arbitrary-shaped clusters by density and labels outliers as noise — no \`k\` needed.
- GMMs give soft, probabilistic, elliptical clusters via mixtures of Gaussians.
- EM alternates expectation (responsibilities) and maximization (parameters); k-means is its hard limit.`,
          },
          {
            day: 4,
            title: "PCA — Dimensionality Reduction",
            domain: "classical_ml",
            key_concepts: ["variance explained", "scree plot", "reconstruction", "whitening", "limitations"],
            quiz_prompt:
              "Test PCA as variance-maximizing projection, the scree plot, reconstruction error, and PCA's linear limitations.",
            lesson_markdown: `# PCA — Dimensionality Reduction

PCA (introduced mathematically in Week 1) is the workhorse for reducing dimensions, denoising, and decorrelating features. Here we use it practically.

## What PCA does

PCA finds orthogonal directions (**principal components**) capturing maximum variance, then projects data onto the top \`k\`. The components are the eigenvectors of the covariance matrix; the eigenvalues give **variance explained**.

\`\`\`python
from sklearn.decomposition import PCA
pca = PCA(n_components=2).fit(X_scaled)
X_2d = pca.transform(X_scaled)
print(pca.explained_variance_ratio_)
\`\`\`

Always **standardize** first — PCA is scale-sensitive, and a feature in large units would dominate.

## The scree plot

Plot explained-variance-ratio vs component index. The "elbow" (or cumulative variance crossing, say, 95%) tells you how many components to keep — the dimensionality-reduction analogue of the k-means elbow.

\`\`\`python
import numpy as np
cum = np.cumsum(pca.explained_variance_ratio_)
k = np.argmax(cum >= 0.95) + 1   # components for 95% variance
\`\`\`

## Reconstruction

Because PCA is linear and invertible on its components, you can **reconstruct** approximate data from the reduced representation. Reconstruction error measures information lost — also a basis for anomaly detection (poorly reconstructed points are unusual).

## Limitations

PCA is **linear**: it captures variance, not necessarily class-discriminative or nonlinear structure. High variance ≠ usefulness. For nonlinear manifolds and visualization, use t-SNE/UMAP (Day 5). PCA is great for preprocessing and compression, less so for revealing complex cluster structure.

## Key takeaways

- PCA projects onto top-variance orthogonal components; standardize features first.
- Use a scree/cumulative-variance plot to choose the number of components.
- PCA is linear and variance-driven — good for compression/denoising, limited for nonlinear structure.`,
          },
          {
            day: 5,
            title: "t-SNE & UMAP",
            domain: "classical_ml",
            key_concepts: ["manifold learning", "perplexity", "neighbors", "local vs global structure", "visualization"],
            quiz_prompt:
              "Test t-SNE and UMAP intuition, their key hyperparameters, what they preserve, and pitfalls in interpreting their plots.",
            lesson_markdown: `# t-SNE & UMAP

t-SNE and UMAP are nonlinear dimensionality-reduction methods built for **visualization** — revealing cluster structure that PCA's linear projection misses.

## The idea

Both are **manifold learning**: they model high-dimensional neighborhoods and find a 2D layout where similar points stay close. t-SNE converts distances to probabilities and minimizes the divergence between high- and low-dimensional neighbor distributions. UMAP builds a fuzzy neighbor graph and optimizes a low-dimensional embedding of it.

\`\`\`python
from sklearn.manifold import TSNE
emb = TSNE(n_components=2, perplexity=30, random_state=0).fit_transform(X)

import umap
emb2 = umap.UMAP(n_neighbors=15, min_dist=0.1).fit_transform(X)
\`\`\`

## Key hyperparameters

- **t-SNE perplexity** (~5–50): balances attention to local vs broader neighborhoods.
- **UMAP n_neighbors**: small → local detail, large → global structure; **min_dist**: how tightly points pack.

## What they preserve — and don't

Both preserve **local** neighborhood structure well. UMAP preserves more **global** structure and is much faster, scaling to large datasets. Pitfalls when reading the plots:

- **Cluster sizes and inter-cluster distances are not meaningful** in t-SNE — don't over-interpret gaps.
- Results vary with random seed and hyperparameters — try several.
- They're for **visualization/exploration**, not as features for downstream models (use PCA for that).

## t-SNE vs UMAP

UMAP is generally preferred today: faster, better global structure, and it can \`transform\` new points. t-SNE remains a strong, well-understood baseline for pure visualization.

## Key takeaways

- t-SNE and UMAP are nonlinear methods that reveal cluster structure for visualization.
- Tune perplexity (t-SNE) / n_neighbors + min_dist (UMAP); try multiple settings and seeds.
- Don't read cluster sizes/distances literally; use these for exploration, PCA for downstream features.`,
          },
        ],
      },
    ],
  },
  // ════════════════════════════════════════════════════════════════
  // PHASE 2 — DEEP LEARNING FOUNDATIONS
  // ════════════════════════════════════════════════════════════════
  {
    phase: 2,
    title: "Deep Learning",
    weeks: [
      {
        week: 7,
        title: "Neural Network Architecture",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        research_papers: [
          paper(
            "edge",
            "Splitting a DNN across devices and edge servers (distributed inference) connects to understanding nn.Module internals, hooks, and partial forward passes you reason about this week."
          ),
          paper(
            "tcs",
            "Implementing a sparsification mask requires deep understanding of gradient hooks, tensor masking, and custom optimizer steps — core skills introduced here.",
            {
              title: "SparsifiedSGD via Gradient Hooks",
              difficulty: "research_track",
              description:
                "Intercept gradients during .backward() with PyTorch hooks, keep only the top-1% by magnitude with a binary mask, accumulate the error, and compare standard SGD vs top-1% vs top-0.1% on CIFAR-10. Deliver a SparsifiedSGD optimizer class.",
              colab_recommended: false,
            }
          ),
        ],
        project: {
          title: "MLP Digit Classifier",
          description:
            "Build a fully connected network on MNIST using nn.Module. Implement a custom training loop, validation loop, early stopping, and an LR scheduler. Achieve >98% test accuracy and analyze failure cases.",
          evaluation_criteria: [
            "Clean nn.Module model definition",
            "Correct training + validation loops",
            "Working early stopping and LR scheduler",
            ">98% test accuracy",
            "Insightful failure-case analysis",
          ],
          starter_code: `import torch, torch.nn as nn

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28*28, 256), nn.ReLU(),
            nn.Linear(256, 10),
        )
    def forward(self, x):
        return self.net(x)

# TODO: train/val loops, early stopping, LR scheduler, failure analysis`,
        },
        days: [
          {
            day: 1,
            title: "Perceptron to MLP",
            domain: "deep_learning",
            key_concepts: ["perceptron", "MLP", "universal approximation", "depth vs width", "hidden layers"],
            quiz_prompt:
              "Test the perceptron, why a single linear layer can't solve XOR, the universal approximation theorem, and depth vs width tradeoffs.",
            lesson_markdown: `# Perceptron to MLP

The multilayer perceptron is the foundation of deep learning. Understanding why stacking layers with nonlinearities is powerful sets up everything that follows.

## The perceptron

A **perceptron** computes \`y = step(w·x + b)\` — a single linear boundary. It can only separate **linearly separable** data; famously it cannot learn XOR, because no single line separates the classes. This limitation nearly killed neural network research in the 1970s.

## Stacking layers: the MLP

A **multilayer perceptron** stacks linear layers separated by **nonlinear activations**:

\`\`\`python
import torch.nn as nn
mlp = nn.Sequential(
    nn.Linear(2, 8), nn.ReLU(),
    nn.Linear(8, 8), nn.ReLU(),
    nn.Linear(8, 1),
)
\`\`\`

The nonlinearity is essential: without it, stacked linear layers collapse into a single linear layer (\`W₂W₁x\` is still linear). The ReLU between them lets the network bend decision boundaries and solve XOR.

## Universal approximation theorem

The **universal approximation theorem** states that an MLP with a single hidden layer of enough neurons can approximate any continuous function to arbitrary precision. So why go deep? Because the theorem says nothing about *how many* neurons — a shallow net may need exponentially many, while a deep net represents the same function compactly.

## Depth vs width

- **Width** (more neurons per layer) adds capacity but can be parameter-hungry.
- **Depth** (more layers) builds **hierarchical, compositional** features — early layers learn simple patterns, later layers combine them. Depth is usually more parameter-efficient, which is why modern networks are deep.

The tradeoff is trainability: deeper networks suffer vanishing gradients (Day 3), motivating the techniques in the rest of this phase.

## Key takeaways

- A perceptron draws one linear boundary; it can't solve XOR.
- MLPs stack linear layers with nonlinear activations — the nonlinearity is what makes depth meaningful.
- Universal approximation guarantees expressivity; depth achieves it efficiently via hierarchical features.`,
          },
          {
            day: 2,
            title: "Activation Functions",
            domain: "deep_learning",
            key_concepts: ["ReLU", "GELU", "Swish", "dying ReLU", "initialization"],
            quiz_prompt:
              "Test why nonlinear activations are needed, ReLU vs GELU vs Swish, the dying ReLU problem, and weight initialization's role.",
            lesson_markdown: `# Activation Functions

Activations inject the nonlinearity that makes deep networks expressive. The choice affects gradient flow, training speed, and final accuracy.

## Why nonlinearity

As Day 1 noted, without nonlinear activations a deep net collapses to a linear model. Activations let networks approximate complex functions. Historically **sigmoid** and **tanh** were used, but both **saturate** — their gradients vanish for large inputs, stalling deep training.

## ReLU and friends

**ReLU** \`max(0, x)\` is the modern default: cheap, non-saturating for positive inputs, and it produces sparse activations.

\`\`\`python
import torch.nn.functional as F
F.relu(x)
F.gelu(x)    # smooth, used in transformers
F.silu(x)    # Swish: x * sigmoid(x)
\`\`\`

- **GELU** \`x·Φ(x)\` — smooth, probabilistically motivated; standard in BERT/GPT.
- **Swish/SiLU** \`x·σ(x)\` — smooth, often slightly better than ReLU in deep nets.

The smooth variants avoid ReLU's hard zero and can ease optimization.

## The dying ReLU problem

If a neuron's weights push its pre-activation permanently negative, ReLU outputs 0 and its gradient is 0 — the neuron **dies** and never updates. Causes: too-high learning rates or bad initialization. Fixes: **Leaky ReLU** (small negative slope), lower learning rate, or smooth activations like GELU.

## Initialization matters

Activations interact with **weight initialization**. **He initialization** (variance \`2/n_in\`) is tuned for ReLU to keep activation variance stable across layers; **Xavier/Glorot** suits tanh. Bad initialization makes activations explode or vanish from the first forward pass — initialization and activation choice must match.

## Key takeaways

- Activations provide nonlinearity; sigmoid/tanh saturate and vanish gradients.
- ReLU is the default; GELU/Swish are smooth alternatives common in modern architectures.
- Watch for dying ReLUs; match initialization (He for ReLU) to the activation.`,
          },
          {
            day: 3,
            title: "Backpropagation",
            domain: "deep_learning",
            key_concepts: ["chain rule", "vanishing gradients", "exploding gradients", "gradient clipping", "computational graph"],
            quiz_prompt:
              "Test the full backprop derivation as repeated chain rule, why gradients vanish/explode in deep nets, and gradient clipping.",
            lesson_markdown: `# Backpropagation

Backpropagation is how networks learn: it computes the gradient of the loss with respect to every weight by applying the chain rule backward through the computational graph.

## The algorithm

A forward pass computes activations and the loss. The **backward pass** then propagates gradients from the loss back to each parameter:

1. Compute \`∂L/∂output\`.
2. For each layer (output → input), multiply by the local derivative (chain rule) to get \`∂L/∂(layer input)\` and \`∂L/∂(layer weights)\`.
3. Reuse the upstream gradient so each weight's gradient is computed once.

For a layer \`y = Wx\`, the gradients are \`∂L/∂W = (∂L/∂y) xᵀ\` and \`∂L/∂x = Wᵀ (∂L/∂y)\`. This is why backprop is a sequence of matrix multiplies — and why GPUs train networks fast.

\`\`\`python
loss.backward()      # PyTorch autograd runs the full backward pass
for p in model.parameters():
    print(p.grad.shape)
\`\`\`

## Vanishing and exploding gradients

Because backprop multiplies many local derivatives, in deep networks the product can shrink toward zero (**vanishing** — early layers stop learning) or blow up (**exploding** — training diverges). Saturating activations (sigmoid) worsen vanishing; large weights cause exploding.

## Remedies

- **Non-saturating activations** (ReLU/GELU) keep gradients alive.
- **Careful initialization** (He/Xavier) keeps signal variance stable.
- **Normalization** (batch/layer norm, Day 5) stabilizes activations.
- **Residual connections** (Phase 3) give gradients a shortcut path.
- **Gradient clipping** caps the gradient norm to prevent explosions, essential in RNNs/transformers:

\`\`\`python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
\`\`\`

## Key takeaways

- Backprop = chain rule applied backward through the graph, reusing upstream gradients.
- Gradient products vanish or explode in deep nets, stalling or destabilizing training.
- Combat with good activations, initialization, normalization, residuals, and gradient clipping.`,
          },
          {
            day: 4,
            title: "Optimizers",
            domain: "deep_learning",
            key_concepts: ["SGD momentum", "RMSProp", "Adam", "AdamW", "LR schedules"],
            quiz_prompt:
              "Test SGD with momentum, adaptive optimizers (RMSProp, Adam, AdamW), weight decay, and learning-rate schedules.",
            lesson_markdown: `# Optimizers

The optimizer decides how to turn gradients into weight updates. The right choice and learning-rate schedule often matter as much as the architecture.

## SGD with momentum

Plain SGD steps \`w ← w − lr·g\`. **Momentum** accumulates a velocity, smoothing noisy gradients and accelerating along consistent directions — like a ball rolling downhill:

\`\`\`python
opt = torch.optim.SGD(model.parameters(), lr=0.1, momentum=0.9)
\`\`\`

SGD + momentum often generalizes best in vision, but needs careful LR tuning.

## Adaptive methods

These scale the step per-parameter using gradient history:

- **RMSProp** divides by a running average of squared gradients — good for non-stationary objectives.
- **Adam** combines momentum (first moment) and RMSProp (second moment) with bias correction — robust and the most popular default.

\`\`\`python
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
\`\`\`

## AdamW and weight decay

Standard Adam mixes L2 regularization into the adaptive update incorrectly. **AdamW** *decouples* weight decay from the gradient step, applying it directly to weights — giving better generalization. It's the default for transformers.

\`\`\`python
opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
\`\`\`

## Learning-rate schedules

A fixed LR is rarely optimal. Common schedules:

- **Step/exponential decay** — drop LR periodically.
- **Cosine annealing** — smoothly decay to near zero; very common.
- **Warmup** — start small and ramp up, stabilizing early training (essential for transformers).

\`\`\`python
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
\`\`\`

## Key takeaways

- SGD+momentum smooths and accelerates updates; often best-generalizing in vision.
- Adam/RMSProp adapt the step per parameter; AdamW decouples weight decay for better generalization.
- Learning-rate schedules (warmup + cosine decay) are frequently as important as the optimizer itself.`,
          },
          {
            day: 5,
            title: "Regularization",
            domain: "deep_learning",
            key_concepts: ["L1/L2", "dropout", "batch normalization", "layer normalization", "early stopping"],
            quiz_prompt:
              "Test L1/L2 weight decay, dropout, batch vs layer normalization, and early stopping as regularizers.",
            lesson_markdown: `# Regularization

Deep nets have millions of parameters and overfit easily. Regularization constrains them to generalize.

## Weight decay (L1/L2)

Penalizing weight magnitude (L2 = \`λΣw²\`) keeps weights small and the function smooth; L1 encourages sparsity. In modern code this is the optimizer's \`weight_decay\` (use AdamW for correct decoupled decay, Day 4).

## Dropout

**Dropout** randomly zeros a fraction of activations during training, forcing the network not to rely on any single neuron — like training an ensemble of subnetworks. At test time it's disabled and activations are scaled.

\`\`\`python
nn.Dropout(p=0.5)   # active only in model.train() mode
\`\`\`

## Batch normalization

**BatchNorm** normalizes each layer's pre-activations using the **batch's** mean and variance, then applies learnable scale/shift. Benefits: faster, more stable training; tolerance of higher learning rates; a mild regularizing effect. It behaves differently in train vs eval (using running statistics at test time) — a frequent bug source.

\`\`\`python
nn.BatchNorm1d(256)   # or BatchNorm2d for conv feature maps
\`\`\`

## Layer normalization

**LayerNorm** normalizes across **features within a single example** instead of across the batch. It's independent of batch size and the standard choice for **transformers and RNNs**, where batch statistics are unstable or sequences vary in length.

## Early stopping

Monitor validation loss and **stop** when it stops improving, keeping the best checkpoint. Simple, effective, and free — it prevents the network from over-training. This is the regularizer you'll implement in this week's project.

## Key takeaways

- Weight decay shrinks weights; dropout trains an implicit ensemble by zeroing activations.
- BatchNorm normalizes across the batch (great for CNNs); LayerNorm across features (standard for transformers).
- Early stopping halts at best validation performance — cheap and powerful.`,
          },
        ],
      },
      {
        week: 8,
        title: "PyTorch Deep Dive",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        research_papers: [
          paper(
            "deepjscc",
            "DeepJSCC's encoder-decoder is a perfect real-world motivation for CNN autoencoders, and its non-trainable channel layer concretely illustrates differentiable simulation of real-world noise.",
            {
              title: "DeepJSCC Mini-Replication",
              difficulty: "research_track",
              description:
                "Build a CNN autoencoder on CIFAR-10, insert a non-trainable AWGN noise layer (parameterized by SNR) between encoder and decoder, train end-to-end, and compare PSNR vs a JPEG baseline at the same compression ratio. Demonstrate graceful degradation (no cliff effect) on a PSNR-vs-SNR curve.",
              colab_recommended: true,
            }
          ),
        ],
        project: {
          title: "Custom Architecture Benchmark",
          description:
            "Implement 3 MLP variants with different normalization strategies (BatchNorm vs LayerNorm vs no-norm) on CIFAR-10. Plot training curves, test accuracy, and gradient norms, then write an analysis of what worked and why.",
          evaluation_criteria: [
            "Three correctly implemented variants",
            "Fair comparison protocol",
            "Training curves + gradient-norm plots",
            "Sound analysis tying results to theory",
            "Reproducibility (seeds, config)",
          ],
          starter_code: `import torch, torch.nn as nn

def make_mlp(norm="batch"):
    layers = [nn.Flatten()]
    in_dim = 3*32*32
    for h in [512, 256]:
        layers += [nn.Linear(in_dim, h)]
        if norm == "batch": layers += [nn.BatchNorm1d(h)]
        elif norm == "layer": layers += [nn.LayerNorm(h)]
        layers += [nn.ReLU()]
        in_dim = h
    layers += [nn.Linear(in_dim, 10)]
    return nn.Sequential(*layers)

# TODO: train each variant, log gradient norms, compare`,
        },
        days: [
          {
            day: 1,
            title: "nn.Module Internals",
            domain: "deep_learning",
            key_concepts: ["parameters", "buffers", "hooks", "custom layers", "state_dict"],
            quiz_prompt:
              "Test how nn.Module registers parameters and buffers, forward hooks, building custom layers, and state_dict.",
            lesson_markdown: `# nn.Module Internals

Understanding how \`nn.Module\` works under the hood lets you build custom layers, debug models, and implement research ideas like gradient hooks.

## Parameters vs buffers

Assigning an \`nn.Parameter\` to a module attribute **registers** it — it shows up in \`.parameters()\` and gets gradients. **Buffers** (registered via \`register_buffer\`) are persistent state that is *not* trained, like BatchNorm's running mean. Both are saved in \`state_dict\`.

\`\`\`python
import torch, torch.nn as nn
class Affine(nn.Module):
    def __init__(self, d):
        super().__init__()
        self.w = nn.Parameter(torch.ones(d))   # trained
        self.register_buffer("count", torch.zeros(1))  # tracked, not trained
    def forward(self, x):
        self.count += 1
        return x * self.w
\`\`\`

## The forward method

You define \`forward()\`; calling the module (\`model(x)\`) routes through \`__call__\`, which runs hooks then \`forward\`. Never call \`forward\` directly — you'd skip hooks.

## Hooks

**Hooks** let you inspect or modify tensors mid-network without editing the model. A forward hook sees inputs/outputs; a **backward/tensor hook** can intercept and modify gradients — the mechanism behind gradient sparsification (this week's research extension).

\`\`\`python
def grad_hook(grad):
    return grad * 0.5   # scale or mask gradients
param.register_hook(grad_hook)
\`\`\`

## state_dict and saving

\`state_dict()\` is an ordered dict of all parameters and buffers — the canonical way to save/load models:

\`\`\`python
torch.save(model.state_dict(), "model.pt")
model.load_state_dict(torch.load("model.pt"))
\`\`\`

Save the \`state_dict\`, not the whole model object, for portability.

## Key takeaways

- \`nn.Parameter\` registers trainable tensors; buffers hold persistent non-trained state.
- Call the module, not \`forward\`, so hooks run; hooks inspect/modify activations and gradients.
- \`state_dict\` is the portable container of weights and buffers for saving/loading.`,
          },
          {
            day: 2,
            title: "DataLoader & Dataset",
            domain: "deep_learning",
            key_concepts: ["Dataset class", "DataLoader", "transforms", "augmentation", "collate"],
            quiz_prompt:
              "Test the custom Dataset interface (__len__/__getitem__), DataLoader batching/shuffling, and data augmentation transforms.",
            lesson_markdown: `# DataLoader & Dataset

Feeding data efficiently is half of deep learning. PyTorch's \`Dataset\` and \`DataLoader\` abstractions handle batching, shuffling, and parallel loading.

## The Dataset interface

A custom **Dataset** implements two methods: \`__len__\` (number of samples) and \`__getitem__\` (return one sample by index). This decouples *what* a sample is from *how* it's batched.

\`\`\`python
from torch.utils.data import Dataset
class CSVData(Dataset):
    def __init__(self, X, y): self.X, self.y = X, y
    def __len__(self): return len(self.X)
    def __getitem__(self, i): return self.X[i], self.y[i]
\`\`\`

## DataLoader

The **DataLoader** wraps a Dataset to yield batches, with shuffling, parallel workers, and pinned memory for fast GPU transfer:

\`\`\`python
from torch.utils.data import DataLoader
loader = DataLoader(ds, batch_size=64, shuffle=True,
                    num_workers=4, pin_memory=True)
for xb, yb in loader:
    ...
\`\`\`

Shuffle the **training** loader (not validation). More workers parallelize loading so the GPU isn't starved.

## Transforms and augmentation

**Transforms** preprocess samples on the fly. For images, torchvision provides composable transforms; **augmentation** (random crops, flips, color jitter) synthetically expands the dataset and is one of the most effective regularizers in vision.

\`\`\`python
import torchvision.transforms as T
train_tf = T.Compose([
    T.RandomCrop(32, padding=4),
    T.RandomHorizontalFlip(),
    T.ToTensor(),
    T.Normalize(mean, std),
])
\`\`\`

Apply augmentation only to training data; validation/test use deterministic transforms.

## Custom collate

The \`collate_fn\` controls how samples combine into a batch — needed for variable-length data (e.g. padding sequences in NLP).

## Key takeaways

- A Dataset defines \`__len__\`/\`__getitem__\`; the DataLoader batches, shuffles, and parallelizes loading.
- Shuffle and pin memory for training; use multiple workers to keep the GPU fed.
- Augmentation (train only) is a powerful regularizer; custom collate handles variable-length batches.`,
          },
          {
            day: 3,
            title: "Loss Functions",
            domain: "deep_learning",
            key_concepts: ["cross-entropy", "focal loss", "triplet loss", "regression losses", "class imbalance"],
            quiz_prompt:
              "Test cross-entropy, focal loss for imbalance, triplet/contrastive loss for embeddings, and when to use each.",
            lesson_markdown: `# Loss Functions

The loss defines *what* the network optimizes. Choosing the right one for your task and data distribution is a core modeling decision.

## Cross-entropy

For classification, **cross-entropy** measures the distance between predicted and true class distributions — the negative log-likelihood from Week 1. PyTorch's \`CrossEntropyLoss\` combines log-softmax and NLL, so feed it **raw logits**, not probabilities:

\`\`\`python
loss = nn.CrossEntropyLoss()(logits, targets)   # targets are class indices
\`\`\`

## Regression losses

- **MSE** (\`L2\`) penalizes large errors quadratically — sensitive to outliers.
- **MAE** (\`L1\`) is robust to outliers.
- **Huber/SmoothL1** blends them: quadratic near zero, linear far away.

## Focal loss for imbalance

When one class dominates, cross-entropy is swamped by easy majority examples. **Focal loss** down-weights well-classified examples by a factor \`(1−p)^γ\`, focusing learning on hard cases — invented for dense object detection (Phase 3).

\`\`\`
FL = -(1 - p_t)^gamma * log(p_t)
\`\`\`

## Metric-learning losses

For learning **embeddings** (face recognition, retrieval), you optimize distances rather than class labels:

- **Triplet loss** pulls an anchor toward a positive and pushes it from a negative by a margin.
- **Contrastive loss** does the same for pairs.

These produce spaces where similar items are close — the basis of the re-identification example in this week's research paper.

## Key takeaways

- Use CrossEntropyLoss (on logits) for classification; pick MSE/MAE/Huber by outlier sensitivity for regression.
- Focal loss focuses training on hard examples under heavy class imbalance.
- Triplet/contrastive losses shape embedding spaces by relative distances.`,
          },
          {
            day: 4,
            title: "Mixed Precision Training",
            domain: "deep_learning",
            key_concepts: ["float16/bfloat16", "torch.cuda.amp", "gradient scaling", "memory savings", "throughput"],
            quiz_prompt:
              "Test mixed precision (FP16/BF16), autocast, gradient scaling and why it's needed, and the speed/memory benefits.",
            lesson_markdown: `# Mixed Precision Training

Mixed precision trains networks faster and with less memory by using 16-bit floats where safe, while keeping 32-bit where numerical precision matters.

## Why mixed precision

Default training uses **FP32**. Modern GPUs compute **FP16/BF16** much faster and use half the memory, letting you fit bigger models and batches. The catch: FP16 has limited range, so naive use causes overflow/underflow.

## autocast

\`torch.autocast\` automatically runs each operation in the appropriate precision — matmuls/convs in FP16, reductions/softmax in FP32:

\`\`\`python
from torch.cuda.amp import autocast, GradScaler
scaler = GradScaler()
for xb, yb in loader:
    opt.zero_grad()
    with autocast():
        loss = loss_fn(model(xb), yb)
    scaler.scale(loss).backward()
    scaler.step(opt)
    scaler.update()
\`\`\`

## Gradient scaling

Small gradients can **underflow** to zero in FP16. The **GradScaler** multiplies the loss by a large factor before backprop (scaling gradients up into FP16's representable range), then unscales before the optimizer step. It dynamically adjusts the scale and skips steps where gradients overflow to \`inf\`.

## BF16 vs FP16

**BF16** has the same exponent range as FP32 (just less mantissa), so it rarely needs gradient scaling and is more robust — preferred on hardware that supports it (A100, TPU). FP16 needs the scaler but works on older GPUs.

## Benefits

Typically 1.5–3× faster training and ~50% less memory, with negligible accuracy change. It's standard for any large model — and essential on Colab's T4 GPU for the heavy weeks ahead.

## Key takeaways

- Mixed precision uses FP16/BF16 for speed and memory, FP32 where precision matters, via autocast.
- FP16 needs a GradScaler to prevent gradient underflow; BF16 usually doesn't.
- Expect ~2× speedup and half the memory with little to no accuracy loss.`,
          },
          {
            day: 5,
            title: "Debugging Neural Networks",
            domain: "deep_learning",
            key_concepts: ["gradient flow", "weight histograms", "nan/inf detection", "overfit a batch", "sanity checks"],
            quiz_prompt:
              "Test debugging strategies: overfitting a single batch, checking gradient norms, detecting NaN/inf, and weight/activation histograms.",
            lesson_markdown: `# Debugging Neural Networks

Networks fail silently — they run but don't learn. A systematic debugging toolkit saves days of confusion.

## Sanity check: overfit one batch

The fastest sanity test: can your model **overfit a single batch** to near-zero loss? If not, there's a bug in the model, loss, or data pipeline — not a tuning issue. Always do this before a long run.

\`\`\`python
xb, yb = next(iter(loader))
for _ in range(200):
    opt.zero_grad()
    loss = loss_fn(model(xb), yb)
    loss.backward(); opt.step()
# loss should approach 0
\`\`\`

## Monitor gradient flow

Print gradient norms per layer. **Vanishing** (norms ~0 in early layers) or **exploding** (huge norms) gradients point to initialization, activation, or normalization problems (Week 7).

\`\`\`python
for name, p in model.named_parameters():
    if p.grad is not None:
        print(name, p.grad.norm().item())
\`\`\`

## Detect NaN / inf

NaNs come from \`log(0)\`, division by zero, or exploding gradients. Catch them early:

\`\`\`python
torch.autograd.set_detect_anomaly(True)   # pinpoints the offending op
assert torch.isfinite(loss), "NaN/inf loss!"
\`\`\`

Common causes: learning rate too high, unstable loss (taking log of un-clamped probabilities), or bad data.

## Histograms

Logging **weight and activation histograms** (via TensorBoard/MLflow) over training reveals dead neurons (all-zero activations), saturating layers, or drifting weight distributions — issues invisible in the loss curve alone.

## A debugging order

1. Overfit one batch. 2. Check data (visualize a batch, verify labels). 3. Check shapes and the loss input format. 4. Inspect gradients. 5. Reduce LR. 6. Add normalization/clipping.

## Key takeaways

- If you can't overfit a single batch, you have a bug, not a tuning problem.
- Monitor per-layer gradient norms and watch for NaN/inf with anomaly detection.
- Visualize data, weights, and activations — many failures are invisible in the loss curve.`,
          },
        ],
      },
      {
        week: 9,
        title: "Convolutional Foundations",
        compute: "colab",
        colab_runtime: "GPU",
        colab_installs: ["torchvision"],
        colab_dataset_setup: `# ── Dataset Setup: CIFAR-10 ──
import torchvision, torchvision.transforms as T
from torch.utils.data import DataLoader

tf_train = T.Compose([T.RandomCrop(32, padding=4), T.RandomHorizontalFlip(),
                      T.ToTensor(),
                      T.Normalize((0.4914,0.4822,0.4465),(0.247,0.243,0.261))])
tf_test = T.Compose([T.ToTensor(),
                     T.Normalize((0.4914,0.4822,0.4465),(0.247,0.243,0.261))])

train = torchvision.datasets.CIFAR10('/content/data', train=True, download=True, transform=tf_train)
test  = torchvision.datasets.CIFAR10('/content/data', train=False, download=True, transform=tf_test)
train_loader = DataLoader(train, 128, shuffle=True, num_workers=2)
test_loader  = DataLoader(test, 256, num_workers=2)
print(f"Train {len(train)}, Test {len(test)}")`,
        research_papers: [
          paper(
            "deepjscc",
            "The architecture evolution from LeNet → ResNet is contextualized by how DeepJSCC adapts the same conv layers, PReLU, and power normalization for a non-vision transmission task."
          ),
        ],
        project: {
          title: "CNN from Scratch on CIFAR-10",
          description:
            "Implement a CNN (no pretrained weights) achieving >85% on CIFAR-10. Include proper weight initialization, batch norm, a data augmentation pipeline, and an LR warmup + cosine decay schedule.",
          evaluation_criteria: [
            ">85% CIFAR-10 test accuracy",
            "Correct conv architecture with batch norm",
            "Augmentation pipeline",
            "LR warmup + cosine schedule",
            "Training curves and analysis",
          ],
          starter_code: `import torch, torch.nn as nn

class SmallCNN(nn.Module):
    def __init__(self, n_classes=10):
        super().__init__()
        def block(i, o):
            return nn.Sequential(nn.Conv2d(i, o, 3, padding=1),
                                 nn.BatchNorm2d(o), nn.ReLU(),
                                 nn.MaxPool2d(2))
        self.features = nn.Sequential(block(3,64), block(64,128), block(128,256))
        self.head = nn.Sequential(nn.Flatten(), nn.Linear(256*4*4, n_classes))
    def forward(self, x):
        return self.head(self.features(x))

# TODO: He init, augmentation, warmup+cosine schedule, train to >85%`,
        },
        days: [
          {
            day: 1,
            title: "The Convolution Operation",
            domain: "cv",
            key_concepts: ["kernels", "stride", "padding", "receptive field", "feature maps"],
            quiz_prompt:
              "Test how convolution works (kernels sliding over input), stride/padding effects on output size, receptive field, and parameter sharing.",
            lesson_markdown: `# The Convolution Operation

Convolutional networks revolutionized computer vision by exploiting the spatial structure of images. The convolution operation is their core.

## What convolution does

A **kernel** (small weight matrix, e.g. 3×3) slides across the image, computing a dot product at each position to produce a **feature map**. Each kernel learns to detect a pattern — edges, textures, later whole object parts. Unlike a fully-connected layer, the same kernel weights are reused at every position (**parameter sharing**), giving two huge advantages:

- **Translation equivariance** — a cat detected in one corner is detected anywhere.
- **Far fewer parameters** — a 3×3 kernel has 9 weights regardless of image size.

\`\`\`python
import torch.nn as nn
conv = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3, padding=1)
# input (N, 3, 32, 32) -> output (N, 64, 32, 32)
\`\`\`

## Stride and padding

- **Stride** is the step size; stride 2 halves spatial resolution (downsampling).
- **Padding** adds border pixels so output size can match input ("same" padding).

Output size: \`out = (in − kernel + 2·pad)/stride + 1\`. Knowing this formula prevents shape bugs.

## Receptive field

A neuron's **receptive field** is the region of the input that influences it. Early layers see small patches; stacking convolutions (and pooling) grows the receptive field so deep layers integrate global context. Depth, stride, and kernel size all expand it.

## Channels and feature maps

Input channels (RGB = 3) and output channels (number of kernels) are independent. Each output channel is one feature map from one kernel applied across all input channels. Deeper layers typically have more channels but smaller spatial size.

## Key takeaways

- Convolution slides shared kernels over the image, giving translation equivariance and parameter efficiency.
- Stride downsamples; padding controls output size via \`out=(in−k+2p)/s+1\`.
- Receptive field grows with depth/stride/kernel size, letting deep layers see global context.`,
          },
          {
            day: 2,
            title: "Pooling, Channels & Parameters",
            domain: "cv",
            key_concepts: ["max pooling", "average pooling", "channels", "parameter counting", "downsampling"],
            quiz_prompt:
              "Test pooling types and purpose, how channels stack, and counting parameters in conv layers.",
            lesson_markdown: `# Pooling, Channels & Parameters

Beyond convolution, pooling and channel management shape a CNN's efficiency and capacity. Being able to count parameters keeps your models honest.

## Pooling

**Pooling** downsamples feature maps, reducing spatial size and computation while adding small translation invariance:

- **Max pooling** keeps the strongest activation in each window — preserves salient features.
- **Average pooling** averages the window — smoother.
- **Global average pooling** collapses each feature map to one number, common before the classifier head (replacing huge fully-connected layers).

\`\`\`python
nn.MaxPool2d(2)            # halves H and W
nn.AdaptiveAvgPool2d(1)    # global average pooling
\`\`\`

Pooling has no learnable parameters; alternatively, strided convolutions can downsample while learning.

## Channels

Channels carry different feature types. A conv layer maps \`C_in\` input channels to \`C_out\` output channels: each output channel applies a separate kernel of depth \`C_in\` across all inputs and sums. So a kernel isn't 3×3 — it's \`C_in × 3 × 3\`. Networks typically increase channels as they decrease spatial size, keeping compute roughly balanced.

## Counting parameters

For a conv layer: \`params = (C_in × kH × kW + 1) × C_out\` (the +1 is bias per output channel).

\`\`\`
Conv2d(3 -> 64, 3x3): (3*3*3 + 1)*64 = 1,792 params
Conv2d(64 -> 128, 3x3): (64*3*3 + 1)*128 = 73,856 params
\`\`\`

Compare to a fully-connected layer on a 32×32×3 image to one 64-unit layer: \`3072×64 = 196,608\` params for *one* layer — convolutions are dramatically more efficient, which is why they scale to images.

## Key takeaways

- Pooling downsamples (max keeps salient features, global avg replaces big FC heads) with no parameters.
- A conv kernel spans all input channels; networks trade spatial size for more channels.
- Conv params = \`(C_in·kH·kW + 1)·C_out\` — far fewer than fully-connected layers on images.`,
          },
          {
            day: 3,
            title: "Classic Architectures: LeNet, AlexNet, VGG",
            domain: "cv",
            key_concepts: ["LeNet", "AlexNet", "VGG", "architectural evolution", "design principles"],
            quiz_prompt:
              "Test the historical evolution LeNet→AlexNet→VGG, what each contributed (ReLU, dropout, depth, small kernels), and design lessons.",
            lesson_markdown: `# Classic Architectures: LeNet, AlexNet, VGG

The evolution of CNN architectures encodes hard-won design lessons. Knowing this lineage explains why modern networks look the way they do.

## LeNet-5 (1998)

Yann LeCun's **LeNet** for handwritten digits established the template still used today: alternating **conv → pooling** layers for feature extraction, followed by fully-connected layers for classification. It proved CNNs work — but hardware and data limited their reach for years.

## AlexNet (2012)

**AlexNet** won ImageNet 2012 by a huge margin and ignited the deep learning era. Its innovations:

- **ReLU** activations — trained far faster than tanh/sigmoid (Week 7).
- **Dropout** — regularized the large fully-connected layers.
- **GPU training** — made deep CNNs feasible.
- Data augmentation and larger scale.

It showed that depth + data + GPUs + ReLU unlocked dramatic accuracy gains.

## VGG (2014)

**VGG** distilled architecture design to one principle: **stack many small 3×3 convolutions**. Two stacked 3×3 convs have the same receptive field as one 5×5 but with fewer parameters and more nonlinearity. VGG is uniform and simple — conv blocks doubling channels (64→128→256→512) with pooling between.

\`\`\`python
# VGG-style block
nn.Sequential(
    nn.Conv2d(c, c2, 3, padding=1), nn.ReLU(),
    nn.Conv2d(c2, c2, 3, padding=1), nn.ReLU(),
    nn.MaxPool2d(2),
)
\`\`\`

VGG's downside: its huge fully-connected layers make it parameter-heavy (~138M). This motivated global average pooling and the residual designs of Phase 3.

## Design lessons

- Small stacked kernels > large kernels (depth + efficiency).
- ReLU + dropout + augmentation are baseline ingredients.
- Increase channels as spatial size shrinks.

## Key takeaways

- LeNet established conv→pool→FC; AlexNet added ReLU, dropout, and GPU scale to win ImageNet.
- VGG showed stacking small 3×3 convs is more efficient and expressive than large kernels.
- These lessons (small kernels, ReLU, augmentation) underpin all modern CNNs.`,
          },
          {
            day: 4,
            title: "BatchNorm, Dropout & Initialization in CNNs",
            domain: "cv",
            key_concepts: ["BatchNorm2d", "dropout placement", "He initialization", "Xavier", "training stability"],
            quiz_prompt:
              "Test batch norm in CNNs, where to place dropout, and He vs Xavier initialization for conv layers.",
            lesson_markdown: `# BatchNorm, Dropout & Initialization in CNNs

These three techniques make deep CNNs trainable and well-regularized. Getting their placement right is the difference between a model that trains smoothly and one that stalls.

## BatchNorm in CNNs

**BatchNorm2d** normalizes each channel across the batch and spatial dimensions, then applies a learnable scale and shift. In CNNs it's nearly universal: it stabilizes training, allows higher learning rates, and speeds convergence. The standard block order is **Conv → BatchNorm → ReLU**:

\`\`\`python
nn.Sequential(
    nn.Conv2d(64, 128, 3, padding=1, bias=False),  # bias redundant before BN
    nn.BatchNorm2d(128),
    nn.ReLU(),
)
\`\`\`

Note: omit the conv bias before BatchNorm — BN's shift parameter makes it redundant. Remember BN uses running statistics at eval time (call \`model.eval()\`).

## Dropout placement

In CNNs, dropout is typically applied in the **fully-connected head**, not between conv layers (where BatchNorm already regularizes and spatial dropout is less effective). Modern architectures often rely on BatchNorm + augmentation instead of heavy dropout.

## Weight initialization

Proper initialization keeps activation variance stable through depth (Week 7):

- **He (Kaiming) initialization** — designed for ReLU; sets weight variance to \`2/fan_in\`. The default choice for conv nets.
- **Xavier (Glorot)** — for symmetric activations (tanh/sigmoid).

\`\`\`python
for m in model.modules():
    if isinstance(m, nn.Conv2d):
        nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
\`\`\`

Bad initialization makes deep CNNs fail from the first batch; He init + BatchNorm together make them robust.

## Key takeaways

- Use Conv→BatchNorm→ReLU; drop the conv bias before BN and call \`eval()\` at test time.
- Put dropout in the FC head; conv stacks lean on BatchNorm + augmentation.
- Initialize conv weights with He/Kaiming for ReLU to keep gradients healthy.`,
          },
          {
            day: 5,
            title: "Transfer Learning Concepts",
            domain: "cv",
            key_concepts: ["feature extraction", "fine-tuning", "pretrained models", "domain shift", "freezing layers"],
            quiz_prompt:
              "Test feature extraction vs fine-tuning, why pretrained features transfer, domain shift, and when to freeze vs unfreeze layers.",
            lesson_markdown: `# Transfer Learning Concepts

Training from scratch needs huge data and compute. **Transfer learning** reuses features learned on a large dataset (like ImageNet) for your task — the single most practical technique in applied CV.

## Why features transfer

CNNs learn a hierarchy: early layers detect generic edges and textures, middle layers detect parts, late layers detect task-specific concepts. The early/mid features are **general** — useful for almost any image task — so a model pretrained on ImageNet gives you a powerful feature extractor for free.

## Feature extraction vs fine-tuning

- **Feature extraction**: freeze the pretrained backbone, replace and train only a new classifier head. Fast, needs little data, good when your dataset is small or similar to ImageNet.
- **Fine-tuning**: also update (some of) the backbone weights at a low learning rate. More powerful, needs more data, better when your domain differs.

\`\`\`python
import torchvision.models as models
net = models.resnet50(weights="IMAGENET1K_V2")
for p in net.parameters():        # feature extraction: freeze backbone
    p.requires_grad = False
net.fc = nn.Linear(net.fc.in_features, num_classes)   # new head, trainable
\`\`\`

## Domain shift

**Domain shift** is the gap between the pretraining distribution and your data (e.g. medical scans vs natural photos). The larger the shift, the more fine-tuning (and the deeper into the network) you need. Always match preprocessing (the same normalization the model was trained with).

## A practical recipe

1. Start with feature extraction to get a quick baseline.
2. If under-fitting, unfreeze the top blocks and fine-tune with a small LR (often with discriminative learning rates — smaller for early layers).
3. Use strong augmentation; monitor for overfitting on small datasets.

This recipe is exactly what next week's "Transfer Learning Showdown" project explores at scale on GPU.

## Key takeaways

- Pretrained early/mid features are generic and transfer across tasks.
- Feature extraction (freeze backbone) suits small/similar data; fine-tuning suits larger domain shifts.
- Match preprocessing to the pretrained model and unfreeze progressively with low learning rates.`,
          },
        ],
      },
    ],
  },
  // ════════════════════════════════════════════════════════════════
  // PHASE 3 — COMPUTER VISION (weighted heavily)
  // ════════════════════════════════════════════════════════════════
  {
    phase: 3,
    title: "Computer Vision",
    weeks: [
      {
        week: 10,
        title: "Modern CNN Architectures",
        compute: "colab",
        colab_runtime: "GPU",
        colab_installs: ["torchvision"],
        colab_dataset_setup: `# ── Dataset Setup: Flowers102 ──
import torchvision, torchvision.transforms as T
tf = T.Compose([T.Resize(224), T.CenterCrop(224), T.ToTensor(),
                T.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])])
train = torchvision.datasets.Flowers102('/content/data', split='train', download=True, transform=tf)
val   = torchvision.datasets.Flowers102('/content/data', split='val',   download=True, transform=tf)
print(len(train), len(val))`,
        project: {
          title: "Transfer Learning Showdown",
          description:
            "Fine-tune ResNet50 vs EfficientNet-B3 on a custom image classification task (Flowers102 or Food101 from torchvision). Compare convergence speed, final accuracy, and inference time. Run freeze vs unfreeze experiments.",
          evaluation_criteria: [
            "Both backbones fine-tuned correctly",
            "Fair comparison protocol",
            "Convergence + accuracy + latency reported",
            "Freeze vs unfreeze experiment",
            "Clear conclusions",
          ],
          starter_code: `import torchvision.models as models, torch.nn as nn
resnet = models.resnet50(weights="IMAGENET1K_V2")
resnet.fc = nn.Linear(resnet.fc.in_features, 102)
effnet = models.efficientnet_b3(weights="IMAGENET1K_V1")
effnet.classifier[1] = nn.Linear(effnet.classifier[1].in_features, 102)
# TODO: train both, compare convergence/accuracy/latency, freeze vs unfreeze`,
        },
        days: [
          {
            day: 1,
            title: "ResNet & Residual Connections",
            domain: "cv",
            key_concepts: ["residual connections", "identity mapping", "skip connections", "degradation problem", "depth"],
            quiz_prompt:
              "Test the degradation problem, how residual/skip connections solve it, identity mapping, and why ResNet enabled very deep networks.",
            lesson_markdown: `# ResNet & Residual Connections

ResNet (2015) made networks with 100+ layers trainable, winning ImageNet and becoming the most influential CNN architecture. Its idea is deceptively simple.

## The degradation problem

Counterintuitively, simply stacking more layers made networks *worse* — not from overfitting, but because deep plain networks are hard to optimize (vanishing gradients, Week 7). A 56-layer plain net had higher training error than a 20-layer one. Depth was hitting an optimization wall.

## The residual block

ResNet adds a **skip connection** that lets a block learn a *residual* \`F(x)\` added to its input: \`y = F(x) + x\`. If the optimal mapping is close to identity, the network only needs to push \`F(x)\` toward zero — far easier than learning identity from scratch.

\`\`\`python
class ResidualBlock(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(c, c, 3, padding=1, bias=False), nn.BatchNorm2d(c), nn.ReLU(),
            nn.Conv2d(c, c, 3, padding=1, bias=False), nn.BatchNorm2d(c))
    def forward(self, x):
        return torch.relu(self.conv(x) + x)   # skip connection
\`\`\`

## Why it works

The skip connection creates a **gradient highway**: during backprop, gradients flow directly through the addition, bypassing the vanishing-gradient bottleneck. This lets gradients reach early layers intact, making 50/101/152-layer networks trainable.

## Impact

ResNet's residual idea is everywhere now — transformers, U-Nets, diffusion models all use residual connections. \`torchvision\` ships pretrained ResNets you'll fine-tune in this week's project.

## Key takeaways

- Plain deep nets degrade due to optimization difficulty, not overfitting.
- Residual blocks learn \`F(x)+x\`, making identity easy and creating a gradient highway.
- Skip connections enabled very deep nets and are now a universal building block.`,
          },
          {
            day: 2,
            title: "DenseNet & EfficientNet",
            domain: "cv",
            key_concepts: ["dense connections", "compound scaling", "MBConv", "feature reuse", "efficiency"],
            quiz_prompt:
              "Test DenseNet's dense connectivity and feature reuse, and EfficientNet's compound scaling and MBConv blocks.",
            lesson_markdown: `# DenseNet & EfficientNet

After ResNet, architecture research focused on connectivity and efficiency — getting more accuracy per parameter and per FLOP.

## DenseNet

**DenseNet** takes skip connections to the extreme: each layer receives the feature maps of **all preceding layers** (concatenated, not added). This **feature reuse** means later layers access all earlier features directly.

Benefits: strong gradient flow, parameter efficiency (layers can be narrow since features are reused), and implicit deep supervision. The cost is memory — concatenation grows the channel count, so DenseNets use "transition layers" to compress.

## EfficientNet and compound scaling

You can scale a CNN three ways: **depth** (more layers), **width** (more channels), and **resolution** (larger input). Prior work scaled one dimension arbitrarily. **EfficientNet** showed these should be scaled **together** in a fixed ratio — **compound scaling** — found by a small grid search and applied with a single coefficient.

\`\`\`
depth  = α^φ,  width = β^φ,  resolution = γ^φ
with α·β²·γ² ≈ 2  (constant FLOPs per φ step)
\`\`\`

EfficientNet-B0 through B7 are the same architecture at increasing compound scale, achieving state-of-the-art accuracy with far fewer parameters than ResNet/VGG.

## MBConv blocks

EfficientNet's backbone uses **MBConv** (mobile inverted bottleneck) blocks from MobileNetV2: a depthwise separable convolution (cheap), an inverted residual (expand → depthwise → project), and squeeze-and-excitation channel attention. These make each block parameter- and compute-efficient.

## Practical note

EfficientNet often gives better accuracy-per-FLOP than ResNet, but ResNet is simpler, faster to fine-tune, and more robust. This week's project compares them head to head.

## Key takeaways

- DenseNet connects every layer to all previous ones, maximizing feature reuse and gradient flow.
- EfficientNet's compound scaling jointly grows depth/width/resolution for optimal efficiency.
- MBConv (depthwise separable + inverted residual + SE) makes EfficientNet compute-efficient.`,
          },
          {
            day: 3,
            title: "Vision Transformer (ViT)",
            domain: "cv",
            key_concepts: ["patch embedding", "position encoding", "self-attention", "class token", "inductive bias"],
            quiz_prompt:
              "Test how ViT splits images into patches, patch + position embeddings, self-attention in vision, and ViT vs CNN inductive biases.",
            lesson_markdown: `# Vision Transformer (ViT)

The Vision Transformer (2020) showed that the transformer architecture from NLP, applied directly to image patches, can match or beat CNNs — reshaping computer vision.

## Images as sequences of patches

A ViT splits an image into fixed-size **patches** (e.g. 16×16), flattens each, and linearly projects it into an embedding — turning an image into a sequence of tokens, just like words in a sentence.

\`\`\`python
# (N, 3, 224, 224) -> 196 patches of 16x16 -> (N, 196, embed_dim)
patch_embed = nn.Conv2d(3, embed_dim, kernel_size=16, stride=16)
\`\`\`

## Position embeddings and the class token

Self-attention is permutation-invariant, so ViT adds learnable **position embeddings** to encode where each patch is. A special learnable **[class] token** is prepended; its final representation is fed to the classifier head.

## Self-attention in vision

Each patch attends to **every other patch**, so ViT models **global** relationships from the very first layer — unlike CNNs, whose receptive field grows slowly with depth. (Full attention mechanics come in Phase 4.) This global view is ViT's key advantage.

## Inductive bias and data hunger

CNNs have strong built-in **inductive biases**: locality and translation equivariance. ViT has almost none — it must *learn* spatial structure from data. Consequently ViT needs **large datasets** (or strong pretraining) to outperform CNNs; on small data, CNNs still win. Pretrain-then-fine-tune (as with the ImageNet-pretrained backbones this phase uses) is the standard ViT recipe.

## Key takeaways

- ViT treats an image as a sequence of linearly-embedded patches plus position embeddings.
- Self-attention gives a global receptive field from layer one; a class token drives classification.
- ViT lacks CNN inductive biases, so it needs large-scale data or pretraining to excel.`,
          },
          {
            day: 4,
            title: "Swin Transformer",
            domain: "cv",
            key_concepts: ["shifted windows", "hierarchical features", "windowed attention", "linear complexity", "multi-scale"],
            quiz_prompt:
              "Test windowed attention, the shifted-window scheme, hierarchical feature maps, and why Swin scales better than ViT for dense tasks.",
            lesson_markdown: `# Swin Transformer

ViT's global attention is expensive — quadratic in the number of patches — and it produces single-scale features unsuited to detection/segmentation. The **Swin Transformer** fixes both with windowed, hierarchical attention.

## Windowed attention

Instead of every patch attending to all others, Swin computes self-attention **within local non-overlapping windows** (e.g. 7×7 patches). This makes complexity **linear** in image size rather than quadratic — crucial for high-resolution images.

## Shifted windows

Pure window attention can't exchange information across window boundaries. Swin alternates layers: a normal-window layer, then a **shifted-window** layer where windows are offset by half. Over two layers, information flows across the whole image while keeping attention local and cheap. This shifted-window scheme is Swin's core trick.

## Hierarchical feature maps

Like a CNN, Swin builds a **pyramid**: it starts with small patches and periodically **merges** neighboring patches to halve resolution and double channels. This yields multi-scale feature maps (1/4, 1/8, 1/16, 1/32) — exactly what detection and segmentation heads (Weeks 11–12) expect, making Swin a general-purpose vision backbone.

\`\`\`
Stage 1: H/4  x W/4  x C
Stage 2: H/8  x W/8  x 2C    (patch merging)
Stage 3: H/16 x W/16 x 4C
Stage 4: H/32 x W/32 x 8C
\`\`\`

## ViT vs Swin

- **ViT**: global attention, single scale, simple, great for classification with big data.
- **Swin**: local windowed attention, hierarchical/multi-scale, linear cost, a drop-in backbone for dense prediction.

## Key takeaways

- Swin restricts attention to local windows for linear complexity.
- Shifted windows let information cross window boundaries across consecutive layers.
- Patch merging builds CNN-like multi-scale features, making Swin ideal for detection/segmentation.`,
          },
          {
            day: 5,
            title: "Model Comparison: Params, FLOPs, Latency",
            domain: "cv",
            key_concepts: ["parameter count", "FLOPs", "latency", "accuracy tradeoffs", "model selection"],
            quiz_prompt:
              "Test the distinction between parameters, FLOPs, and latency, and how to choose an architecture under accuracy/speed/memory constraints.",
            lesson_markdown: `# Model Comparison: Params, FLOPs, Latency

Choosing an architecture is a multi-objective decision. Accuracy is only one axis; parameters, compute, and real-world latency often decide what ships.

## Three different metrics

- **Parameters** — model size in memory/disk. Matters for storage and mobile deployment.
- **FLOPs** — floating-point operations per forward pass; a hardware-independent proxy for compute.
- **Latency** — actual wall-clock time per inference. This is what users feel, and it does **not** track FLOPs reliably.

A model can have few FLOPs but high latency (e.g. depthwise convs are FLOP-cheap but memory-bandwidth-bound). Always **measure latency on your target hardware**.

\`\`\`python
import time, torch
x = torch.randn(1, 3, 224, 224).cuda()
model.eval()
with torch.no_grad():
    for _ in range(10): model(x)        # warmup
    torch.cuda.synchronize(); t=time.time()
    for _ in range(100): model(x)
    torch.cuda.synchronize()
print((time.time()-t)/100*1000, "ms")
\`\`\`

## Accuracy tradeoffs

Plot accuracy vs latency (or FLOPs) for candidate models — the **Pareto frontier** shows which models are never worth choosing. EfficientNet and MobileNet sit on the efficient frontier; large ViTs maximize accuracy at high cost.

## Choosing a model

Decide by constraint:
- **Edge/mobile, real-time** → MobileNet/EfficientNet-lite, quantized (Week 13).
- **Server, accuracy-first** → large ResNet/ViT/Swin.
- **Limited data** → CNN or pretrained backbone over from-scratch ViT.

This framing — that a model's value depends on where it runs and the latency budget — is exactly the communication-aware, deployment-aware lens of the research papers in Section 17.

## Key takeaways

- Parameters, FLOPs, and latency are distinct; FLOPs don't predict latency, so measure on target hardware.
- Use accuracy-vs-latency Pareto curves to eliminate dominated models.
- Pick architectures by deployment constraint, not accuracy alone.`,
          },
        ],
      },
      {
        week: 11,
        title: "Object Detection",
        compute: "colab",
        colab_runtime: "GPU",
        colab_installs: ["ultralytics", "roboflow"],
        colab_dataset_setup: `# ── Dataset Setup: custom YOLO dataset via Roboflow ──
# Annotate ~100 images (Roboflow/Label Studio) and export in YOLOv8 format.
# from roboflow import Roboflow
# rf = Roboflow(api_key="YOUR_KEY")
# dataset = rf.workspace("ws").project("proj").version(1).download("yolov8")
print("Place your data.yaml + images/labels under /content/dataset")`,
        project: {
          title: "Custom Object Detector",
          description:
            "Train YOLOv8n on a small custom dataset (~100 images of any object, annotated with Label Studio or Roboflow free tier). Achieve >0.7 mAP@50 and export the model to ONNX.",
          evaluation_criteria: [
            "Correct dataset annotation + YOLO format",
            "Working YOLOv8 training run",
            ">0.7 mAP@50",
            "ONNX export",
            "Qualitative detection examples",
          ],
          starter_code: `from ultralytics import YOLO
model = YOLO("yolov8n.pt")        # pretrained nano
model.train(data="dataset/data.yaml", epochs=50, imgsz=640)
metrics = model.val()
model.export(format="onnx")
# TODO: tune until mAP@50 > 0.7; visualize predictions`,
        },
        days: [
          {
            day: 1,
            title: "Detection Fundamentals",
            domain: "cv",
            key_concepts: ["anchor boxes", "IoU", "NMS", "mAP", "bounding boxes"],
            quiz_prompt:
              "Test bounding boxes, IoU, anchor boxes, non-maximum suppression, and how mAP is computed.",
            lesson_markdown: `# Detection Fundamentals

Object detection localizes *and* classifies every object in an image — predicting bounding boxes plus labels. A handful of concepts underpin all detectors.

## Bounding boxes and IoU

A **bounding box** is \`(x, y, w, h)\` (or corner coordinates). **Intersection over Union (IoU)** measures overlap between predicted and ground-truth boxes:

\`IoU = area(intersection) / area(union)\`

IoU ranges 0–1; a detection counts as correct if its IoU with a true box exceeds a threshold (commonly 0.5).

## Anchor boxes

Many detectors predefine **anchor boxes** — reference boxes of various sizes/aspect ratios tiled across the image. The network predicts *offsets* from anchors rather than absolute coordinates, which stabilizes training. Anchor-free detectors (newer YOLO versions) predict box centers directly instead.

## Non-maximum suppression (NMS)

Detectors produce many overlapping boxes for the same object. **NMS** cleans this up: keep the highest-confidence box, remove others overlapping it above an IoU threshold, repeat.

\`\`\`python
import torchvision
keep = torchvision.ops.nms(boxes, scores, iou_threshold=0.5)
\`\`\`

## Mean Average Precision (mAP)

**mAP** is the standard detection metric. For each class, sweep the confidence threshold to trace a precision-recall curve, take its area (**average precision**), then average over classes. **mAP@50** uses an IoU threshold of 0.5; **mAP@50:95** averages over IoU thresholds 0.5–0.95 (stricter). Your project targets mAP@50 > 0.7.

## Key takeaways

- Detection = localize (boxes) + classify; IoU measures box overlap quality.
- Anchors give reference boxes to regress from; NMS removes duplicate detections.
- mAP averages precision-recall area across classes; mAP@50 uses IoU≥0.5.`,
          },
          {
            day: 2,
            title: "Two-Stage Detectors",
            domain: "cv",
            key_concepts: ["R-CNN", "region proposals", "RoI pooling", "FPN", "Faster R-CNN"],
            quiz_prompt:
              "Test the R-CNN family evolution, region proposals, RoI pooling/align, and feature pyramid networks.",
            lesson_markdown: `# Two-Stage Detectors

Two-stage detectors first propose *where* objects might be, then classify and refine each proposal. They pioneered modern detection and remain accuracy leaders.

## The R-CNN family

- **R-CNN** — generate region proposals (selective search), warp each, run a CNN per region. Accurate but painfully slow (thousands of CNN passes per image).
- **Fast R-CNN** — run the CNN **once** on the whole image, then extract per-region features from the shared feature map via **RoI pooling**. Much faster.
- **Faster R-CNN** — replace selective search with a learned **Region Proposal Network (RPN)** sharing features with the detector. Now proposals are fast and trainable end-to-end.

## RoI pooling and RoIAlign

Regions have different sizes, but the classifier head needs fixed-size input. **RoI pooling** divides each region into a fixed grid and pools each cell. **RoIAlign** (from Mask R-CNN, Week 12) improves it with bilinear interpolation instead of quantizing coordinates — important for precise localization and segmentation.

## Feature Pyramid Networks (FPN)

Objects appear at many scales. **FPN** combines features from multiple network depths — top-down upsampling fused with lateral connections — to produce a feature pyramid where small objects use high-resolution early features and large objects use deep semantic features. FPN dramatically improves small-object detection and is now standard across detectors (including the multi-scale Swin backbone from Week 10).

## Two-stage vs one-stage

Two-stage detectors are typically **more accurate** but **slower**; one-stage detectors like YOLO (Day 3) trade a little accuracy for real-time speed. The choice is again a latency-vs-accuracy decision.

## Key takeaways

- R-CNN → Fast → Faster: progressively sharing computation and learning proposals (RPN).
- RoI pooling/Align extract fixed-size features from variable regions; RoIAlign is more precise.
- FPN fuses multi-scale features for robust detection across object sizes.`,
          },
          {
            day: 3,
            title: "YOLO Family History",
            domain: "cv",
            key_concepts: ["one-stage detection", "grid prediction", "YOLOv1 to v8", "real-time", "speed-accuracy"],
            quiz_prompt:
              "Test the one-stage YOLO paradigm, grid-based prediction, the architectural evolution v1→v8, and the speed-accuracy tradeoff.",
            lesson_markdown: `# YOLO Family History

**YOLO** (You Only Look Once) reframed detection as a single regression problem, enabling real-time detection. Tracing its evolution shows how the field optimized the speed-accuracy frontier.

## The one-stage idea

Instead of proposing regions then classifying, YOLO divides the image into a **grid** and, in one forward pass, each cell predicts bounding boxes, objectness, and class probabilities directly. "You only look once" — no separate proposal stage — which is why it's fast enough for video.

## The evolution

- **YOLOv1 (2016)** — the original single-pass detector; fast but weak on small/clustered objects.
- **YOLOv2/v3** — anchor boxes, multi-scale predictions, better backbones (Darknet); v3's multi-scale heads were a big accuracy jump.
- **YOLOv4/v5** — bag-of-tricks: better augmentation (mosaic), CIoU loss, CSP backbones; v5 brought a polished PyTorch ecosystem.
- **YOLOv6/v7** — re-parameterization and efficiency refinements.
- **YOLOv8** — **anchor-free**, decoupled detection head, strong defaults, and a clean unified API for detection/segmentation/pose. This is what you'll train.

## Why anchor-free

Modern YOLOs predict box centers and sizes directly rather than offsets from preset anchors — removing anchor hyperparameters and simplifying training while improving generalization across object shapes.

## The speed-accuracy frontier

Each YOLO version pushed the Pareto curve: more accuracy at the same speed, or the same accuracy faster. YOLO models come in sizes (n/s/m/l/x) trading accuracy for latency — \`yolov8n\` (nano) is tiny and fast, ideal for your ~100-image project and edge deployment.

## Key takeaways

- YOLO predicts boxes and classes in a single pass over a grid — built for real-time.
- The family evolved through anchors, multi-scale heads, training tricks, to anchor-free v8.
- Model size variants (n→x) let you pick a point on the speed-accuracy curve.`,
          },
          {
            day: 4,
            title: "YOLOv8 In Depth",
            domain: "cv",
            key_concepts: ["YOLOv8 architecture", "decoupled head", "loss function", "training config", "ultralytics"],
            quiz_prompt:
              "Test YOLOv8's architecture (backbone/neck/head), its loss components, and key training configuration choices.",
            lesson_markdown: `# YOLOv8 In Depth

YOLOv8 is the model you'll train in this week's project. Understanding its structure and configuration lets you debug and tune it effectively.

## Architecture: backbone, neck, head

- **Backbone** — a CSPDarknet-style network with **C2f** blocks (cross-stage partial connections) extracting multi-scale features.
- **Neck** — a PAN-FPN that fuses features top-down and bottom-up across scales (the FPN idea from Day 2).
- **Head** — an **anchor-free, decoupled** head: separate branches for box regression and classification at three scales (for small/medium/large objects).

## The loss function

YOLOv8's loss combines three terms:

- **Classification loss** — binary cross-entropy per class.
- **Box regression loss** — **CIoU** (complete IoU, accounting for overlap, center distance, aspect ratio).
- **Distribution Focal Loss (DFL)** — models box coordinates as a distribution for finer localization.

A **task-aligned assigner** matches predictions to ground truth by combining classification and localization quality.

## Training configuration

\`\`\`python
from ultralytics import YOLO
model = YOLO("yolov8n.pt")
model.train(
    data="dataset/data.yaml",
    epochs=50, imgsz=640, batch=16,
    lr0=0.01, mosaic=1.0, patience=10,   # mosaic aug + early stopping
)
\`\`\`

Key knobs: \`imgsz\` (resolution vs speed), \`epochs\`/\`patience\`, augmentation (\`mosaic\`, \`mixup\`), and starting from pretrained weights (transfer learning, Week 9) — essential when you only have ~100 images.

## Reading results

\`model.val()\` reports mAP@50 and mAP@50:95 plus per-class metrics. Inspect the confusion matrix and PR curves Ultralytics saves to diagnose which classes underperform.

## Key takeaways

- YOLOv8 = CSP backbone + PAN-FPN neck + anchor-free decoupled multi-scale head.
- Its loss blends BCE classification, CIoU box, and DFL with a task-aligned assigner.
- Start from pretrained weights and tune imgsz/epochs/augmentation; validate with mAP and PR curves.`,
          },
          {
            day: 5,
            title: "Data Preparation for Detection",
            domain: "cv",
            key_concepts: ["COCO format", "annotation tools", "augmentation for detection", "data.yaml", "label quality"],
            quiz_prompt:
              "Test detection annotation formats (COCO, YOLO), annotation tools, detection-specific augmentation, and label quality issues.",
            lesson_markdown: `# Data Preparation for Detection

In detection, data quality dominates model quality. Most real-world detection failures trace to annotation problems, not the model.

## Annotation formats

- **COCO format** — a JSON file with images, categories, and annotations (boxes as \`[x, y, width, height]\`, absolute pixels). The research-standard format.
- **YOLO format** — one \`.txt\` per image; each line \`class cx cy w h\` with coordinates **normalized** 0–1. What YOLOv8 expects.
- **Pascal VOC** — XML per image with corner coordinates.

A \`data.yaml\` ties it together for Ultralytics: paths to train/val images and the class names.

\`\`\`yaml
train: images/train
val: images/val
nc: 2
names: ["cat", "dog"]
\`\`\`

## Annotation tools

**Roboflow** (free tier) and **Label Studio** let you draw boxes and export directly in YOLO/COCO format — exactly the workflow for your 100-image project. Annotate consistently: tight boxes, every instance labeled, consistent class definitions.

## Augmentation for detection

Augmentation must transform **boxes along with pixels**. Geometric augmentations (flip, scale, rotate, **mosaic** — stitching 4 images) require recomputing box coordinates; tools like Albumentations and YOLO's built-ins handle this. Mosaic is especially effective for small datasets, exposing the model to varied contexts and scales.

## Label quality

Common killers of mAP:
- **Missing labels** — unlabeled objects teach the model they're background.
- **Loose/inconsistent boxes** — confuse localization.
- **Class confusion** — ambiguous category definitions.

With small datasets, a few bad labels measurably hurt. Audit a sample visually and fix systematically — cleaning labels often beats more training.

## Key takeaways

- Know COCO (absolute, JSON) vs YOLO (normalized, per-image txt) formats; \`data.yaml\` configures training.
- Use Roboflow/Label Studio to annotate and export; keep boxes tight and consistent.
- Augment boxes with pixels (mosaic helps small data); label quality is the top driver of detection accuracy.`,
          },
        ],
      },
      {
        week: 12,
        title: "Image Segmentation",
        compute: "colab",
        colab_runtime: "GPU",
        colab_installs: ["albumentations", "segmentation-models-pytorch"],
        colab_dataset_setup: `# ── Dataset Setup: Oxford-IIIT Pet (segmentation) ──
import torchvision
ds = torchvision.datasets.OxfordIIITPet('/content/data', split='trainval',
        target_types='segmentation', download=True)
print(f"Dataset loaded: {len(ds)} samples")`,
        project: {
          title: "Semantic Segmentation Pipeline",
          description:
            "Train U-Net on the Oxford-IIIT Pet dataset for binary segmentation (pet vs background). Implement a custom Dataset, albumentations augmentations, an IoU metric, and visual overlay outputs. Export an inference demo script.",
          evaluation_criteria: [
            "Correct U-Net implementation",
            "Custom Dataset + augmentation",
            "IoU metric computed correctly",
            "Visual overlays produced",
            "Working inference demo",
          ],
          starter_code: `import segmentation_models_pytorch as smp
model = smp.Unet(encoder_name="resnet34", encoder_weights="imagenet",
                 in_channels=3, classes=1)   # binary mask
# TODO: custom Dataset, albumentations, Dice/BCE loss, IoU metric, overlays`,
        },
        days: [
          {
            day: 1,
            title: "Segmentation Task Definitions",
            domain: "cv",
            key_concepts: ["semantic", "instance", "panoptic", "IoU/Dice", "pixel classification"],
            quiz_prompt:
              "Test the difference between semantic, instance, and panoptic segmentation, and the metrics (IoU, Dice) used.",
            lesson_markdown: `# Segmentation Task Definitions

Segmentation assigns a label to **every pixel**, not just a box. Three flavors solve different problems, and getting the distinction right determines your architecture and metric.

## Semantic vs instance vs panoptic

- **Semantic segmentation** — label each pixel with a **class** (road, car, sky). All cars are the same label; it doesn't separate individual objects.
- **Instance segmentation** — separate each **object instance** with its own mask (car #1 vs car #2), but only for "thing" categories. Mask R-CNN (Day 5) does this.
- **Panoptic segmentation** — unifies both: every pixel gets a class *and* "things" get instance IDs, while "stuff" (sky, grass) is just labeled. The complete scene parse.

Your project is **binary semantic** segmentation: pet vs background.

## Metrics

- **IoU (Jaccard)** — intersection over union of predicted and true masks per class, then averaged (**mIoU**). The standard semantic metric.
- **Dice coefficient** — \`2|A∩B| / (|A|+|B|)\`, closely related to F1; popular in medical imaging and often used as a loss.

\`\`\`python
def iou(pred, target, eps=1e-6):
    inter = (pred & target).sum()
    union = (pred | target).sum()
    return (inter + eps) / (union + eps)
\`\`\`

## Loss functions

Pixel-wise **cross-entropy** is the baseline, but masks are often imbalanced (small foreground). **Dice loss** and **BCE+Dice** combinations directly optimize overlap and handle imbalance better — you'll use these in the project.

## Key takeaways

- Semantic labels every pixel by class; instance separates objects; panoptic does both.
- IoU/mIoU is the standard semantic metric; Dice (≈F1) suits imbalanced masks.
- Use cross-entropy or Dice/BCE losses; pick based on class balance.`,
          },
          {
            day: 2,
            title: "FCN & Skip Connections",
            domain: "cv",
            key_concepts: ["fully convolutional", "upsampling", "transposed convolution", "skip connections", "dense prediction"],
            quiz_prompt:
              "Test the fully convolutional network idea, replacing FC layers with convs, upsampling/transposed convolution, and skip connections for detail.",
            lesson_markdown: `# FCN & Skip Connections

The **Fully Convolutional Network (FCN)** was the breakthrough that made deep semantic segmentation practical, establishing the encoder-decoder pattern all segmentation models use.

## From classification to dense prediction

A classification CNN ends in fully-connected layers that discard spatial information. FCN's insight: **replace FC layers with convolutions** so the network outputs a spatial map instead of a single label. Now every pixel gets a prediction, and the network accepts any input size.

## Downsampling loses resolution

The encoder (convolution + pooling) shrinks spatial resolution to build semantic features — but segmentation needs a **full-resolution** output. So FCN must **upsample** the coarse prediction back to input size.

## Upsampling and transposed convolution

- **Transposed convolution** ("deconv") learns to upsample, inserting and convolving to increase resolution.
- **Bilinear interpolation** upsamples without parameters; often followed by a conv.

\`\`\`python
nn.ConvTranspose2d(in_ch, out_ch, kernel_size=2, stride=2)   # 2x upsample
\`\`\`

## Skip connections for detail

Upsampling a deeply-downsampled map gives blurry, imprecise boundaries. FCN adds **skip connections** from earlier, higher-resolution encoder layers to the decoder, fusing fine spatial detail with deep semantics. FCN-8s (fusing pool3, pool4) produces much sharper masks than FCN-32s. This encoder-decoder-with-skips design is the direct ancestor of U-Net (Day 3).

## Key takeaways

- FCN replaces FC layers with convs to produce dense, full-resolution predictions.
- The encoder downsamples for semantics; the decoder upsamples (transposed conv / interpolation).
- Skip connections from early layers restore fine detail lost to downsampling.`,
          },
          {
            day: 3,
            title: "U-Net Architecture",
            domain: "cv",
            key_concepts: ["encoder-decoder", "skip connections", "symmetric architecture", "medical imaging", "feature concatenation"],
            quiz_prompt:
              "Test U-Net's symmetric encoder-decoder, how skip connections concatenate features, and why it works well with little data.",
            lesson_markdown: `# U-Net Architecture

**U-Net** (2015) is the most widely used segmentation architecture — the one you'll implement this week. Born in biomedical imaging, it works remarkably well even with small datasets.

## The U shape

U-Net is a **symmetric encoder-decoder**:

- The **contracting path** (encoder) applies conv blocks and downsampling, doubling channels while halving resolution — capturing *what* is in the image.
- The **expanding path** (decoder) upsamples and applies conv blocks, halving channels while doubling resolution — recovering *where*.

Drawn out, the encoder and decoder mirror each other into a "U".

## Skip connections via concatenation

U-Net's key feature: at each decoder level, it **concatenates** the corresponding encoder feature map (same resolution) before convolving. Unlike FCN's additive skips, concatenation gives the decoder full access to high-resolution features, producing sharp, precise boundaries.

\`\`\`python
# decoder step (simplified)
up = self.upconv(x)                       # upsample
x  = torch.cat([up, skip_from_encoder], dim=1)   # concatenate
x  = self.conv_block(x)
\`\`\`

## Why it works with little data

U-Net was designed for biomedical images where labeled data is scarce. Heavy augmentation plus the architecture's efficient use of context lets it train on **tens to hundreds** of images — which is why it's perfect for the Oxford Pet project (and why a pretrained encoder, as in \`segmentation_models_pytorch\`, helps further).

## Modern usage

U-Net's encoder is often swapped for a pretrained ResNet/EfficientNet backbone (transfer learning, Week 9). The same U-Net design also forms the **denoiser in diffusion models** (Phase 5) — a testament to how general the architecture is.

## Key takeaways

- U-Net is a symmetric encoder-decoder; the encoder captures semantics, the decoder restores resolution.
- It **concatenates** encoder features into the decoder via skip connections for sharp boundaries.
- It trains well on small datasets and underpins both medical segmentation and diffusion models.`,
          },
          {
            day: 4,
            title: "DeepLabV3+",
            domain: "cv",
            key_concepts: ["atrous convolution", "ASPP", "dilated convolution", "multi-scale context", "receptive field"],
            quiz_prompt:
              "Test atrous/dilated convolutions, the ASPP module, multi-scale context aggregation, and how DeepLab differs from U-Net.",
            lesson_markdown: `# DeepLabV3+

DeepLab is the other major segmentation family. Its core idea — **atrous (dilated) convolution** — captures multi-scale context without losing resolution, and it leads many segmentation benchmarks.

## The resolution problem, revisited

U-Net recovers resolution via decoding. DeepLab takes a different route: it uses **atrous convolution** to keep feature maps at higher resolution *while* growing the receptive field.

## Atrous (dilated) convolution

A dilated convolution inserts gaps between kernel elements, enlarging the receptive field **without** adding parameters or reducing resolution. A 3×3 kernel with dilation 2 sees a 5×5 area but still uses 9 weights.

\`\`\`python
nn.Conv2d(c, c, 3, padding=2, dilation=2)   # larger receptive field, same params
\`\`\`

This lets the network aggregate broad context while keeping dense, high-resolution predictions — avoiding the heavy downsampling that blurs boundaries.

## ASPP: Atrous Spatial Pyramid Pooling

Objects appear at many scales. **ASPP** applies several parallel atrous convolutions with **different dilation rates** plus global pooling, then fuses them. This captures multi-scale context in one module — analogous to FPN's multi-scale fusion but via dilation rather than pyramids.

## DeepLabV3+

V3+ adds a lightweight **decoder** to DeepLabV3 to sharpen object boundaries (combining the dilated encoder's rich context with a simple upsampling decoder and a low-level feature skip) — borrowing U-Net's boundary-refinement idea.

## DeepLab vs U-Net

- **U-Net**: symmetric, concatenative skips, great for medical/small data.
- **DeepLab**: dilated convs + ASPP for large-context scene segmentation; strong on natural-image benchmarks (Cityscapes, PASCAL).

## Key takeaways

- Atrous/dilated convolution enlarges the receptive field without losing resolution or adding parameters.
- ASPP fuses parallel atrous convs at multiple dilation rates for multi-scale context.
- DeepLabV3+ adds a decoder for sharp boundaries; it favors large-context scenes vs U-Net's small-data strength.`,
          },
          {
            day: 5,
            title: "Mask R-CNN",
            domain: "cv",
            key_concepts: ["instance segmentation", "RoIAlign", "mask head", "detection + segmentation", "multi-task"],
            quiz_prompt:
              "Test how Mask R-CNN extends Faster R-CNN with a mask head, RoIAlign, and the multi-task loss for instance segmentation.",
            lesson_markdown: `# Mask R-CNN

**Mask R-CNN** unifies detection and segmentation: it detects each object *and* predicts its pixel mask, performing instance segmentation. It elegantly extends Faster R-CNN (Week 11).

## Detection plus a mask head

Mask R-CNN takes Faster R-CNN (RPN + box/class heads from Week 11) and adds a **third branch**: a small fully-convolutional **mask head** that predicts a binary mask for each detected object, per class. So each instance gets a box, a label, *and* a mask — solving instance segmentation, which semantic methods (U-Net, DeepLab) cannot.

\`\`\`
RPN → RoIAlign → ┬→ box regression
                 ├→ classification
                 └→ mask head (28x28 per-class mask)
\`\`\`

## RoIAlign: precise feature extraction

Faster R-CNN's RoI pooling **quantizes** region coordinates to the feature grid, causing small misalignments — fine for boxes but harmful for pixel-accurate masks. **RoIAlign** uses **bilinear interpolation** to sample features at exact (fractional) locations, preserving spatial alignment. This single fix was crucial for mask quality.

## Multi-task loss

Training optimizes a combined loss: \`L = L_class + L_box + L_mask\`. The mask loss is per-pixel binary cross-entropy, applied **only** to the ground-truth class's mask channel (decoupling mask prediction from classification). The three tasks share the backbone, and learning them jointly improves all of them.

## Where it fits

Mask R-CNN remains a strong, widely-used instance segmentation baseline. It connects the detection (Week 11) and segmentation (Week 12) threads: detection localizes instances, RoIAlign extracts aligned features, and the mask head segments each one.

## Key takeaways

- Mask R-CNN adds a per-instance mask head to Faster R-CNN, enabling instance segmentation.
- RoIAlign replaces quantized RoI pooling with bilinear sampling for pixel-accurate masks.
- A multi-task loss (class + box + mask) is trained jointly over a shared backbone.`,
          },
        ],
      },
      {
        week: 13,
        title: "Advanced CV Topics",
        compute: "colab",
        colab_runtime: "GPU",
        colab_installs: ["onnxruntime", "onnx", "fastapi"],
        colab_dataset_setup: `# ── Reuse the trained detector/segmenter from Week 11/12 ──
# Load your exported model and a few sample images for the inference pipeline.
print("Load your trained model + sample images for ONNX export & benchmarking")`,
        research_papers: [
          paper(
            "deepjscc",
            "ONNX export and latency benchmarking in this week map directly to DeepJSCC's CPU/GPU runtime analysis (18ms GPU vs 387ms CPU) — the same deployment-latency lens applied to a learned communication system."
          ),
        ],
        project: {
          title: "CV Inference Pipeline",
          description:
            "Take the trained model from Week 11, export it to ONNX, wrap it in a FastAPI endpoint, and build a minimal HTML demo page that accepts an image upload and returns the detection/segmentation overlay. Benchmark PyTorch vs ONNX inference latency.",
          evaluation_criteria: [
            "Correct ONNX export + parity check",
            "Working FastAPI endpoint",
            "Functional HTML upload demo",
            "PyTorch vs ONNX latency benchmark",
            "Clear latency analysis",
          ],
          starter_code: `import torch
# Export to ONNX
dummy = torch.randn(1, 3, 640, 640)
torch.onnx.export(model, dummy, "model.onnx", opset_version=17,
                  input_names=["images"], output_names=["out"],
                  dynamic_axes={"images": {0: "batch"}})
# TODO: onnxruntime inference, FastAPI app, HTML upload page, latency benchmark`,
        },
        days: [
          {
            day: 1,
            title: "Image Generation Overview",
            domain: "cv",
            key_concepts: ["GANs", "VAEs", "diffusion", "generative modeling", "latent space"],
            quiz_prompt:
              "Test the high-level differences between GANs, VAEs, and diffusion models for image generation, and their tradeoffs.",
            lesson_markdown: `# Image Generation Overview

Generative models learn the **distribution** of images so they can synthesize new ones. This overview frames the three major families you'll study in depth in Phase 5.

## What generative models do

A discriminative model learns \`P(y|x)\` (label given image); a **generative** model learns \`P(x)\` (the distribution of images) and samples from it. The challenge: images live in a huge, highly-structured space, so the question is how to model and sample that distribution.

## Three families

- **VAEs (Variational Autoencoders)** — encode images to a continuous **latent space**, then decode samples back. Stable to train and give a meaningful latent space, but outputs are often blurry. (Week 18, Day 1.)
- **GANs (Generative Adversarial Networks)** — a generator and discriminator play a minimax game; the generator learns to fool the discriminator. Produce sharp, realistic images but are notoriously unstable. (Week 18, Days 2–3.)
- **Diffusion models** — learn to **denoise** images step by step, reversing a gradual noising process. Highest quality and the basis of Stable Diffusion, but slower to sample. (Week 18, Days 4–5.)

## The tradeoffs

| Family | Quality | Training stability | Sampling speed |
|--------|---------|--------------------|----------------|
| VAE | Moderate (blurry) | Stable | Fast |
| GAN | Sharp | Unstable | Fast |
| Diffusion | Best | Stable | Slow |

## Why it connects to communication

An autoencoder's **latent space** is a compressed representation — exactly the "bottleneck" idea in the DeepJSCC research paper, where the bottleneck is set by **channel bandwidth** rather than a chosen latent dimension. Generative modeling and learned compression are two sides of the same coin.

## Key takeaways

- Generative models learn \`P(x)\` and sample new images.
- VAEs (stable, blurry), GANs (sharp, unstable), diffusion (best quality, slow) are the three families.
- Latent/bottleneck representations link generation to learned compression and communication.`,
          },
          {
            day: 2,
            title: "Self-Supervised Learning in CV",
            domain: "cv",
            key_concepts: ["SimCLR", "MoCo", "DINO", "MAE", "contrastive learning"],
            quiz_prompt:
              "Test self-supervised learning motivation, contrastive methods (SimCLR, MoCo), self-distillation (DINO), and masked autoencoding (MAE).",
            lesson_markdown: `# Self-Supervised Learning in CV

Labeling images is expensive; the internet has billions of **unlabeled** ones. Self-supervised learning (SSL) learns powerful representations from unlabeled data by inventing a pretext task — then fine-tunes on a small labeled set.

## The core idea

Create supervision **from the data itself**. The model learns features useful for many downstream tasks without manual labels, often matching or beating supervised pretraining.

## Contrastive learning: SimCLR & MoCo

**Contrastive** methods pull together representations of two augmented views of the *same* image (positives) and push apart different images (negatives).

- **SimCLR** — uses strong augmentations and large batches (for many negatives) with an InfoNCE loss.
- **MoCo** — maintains a **momentum-updated queue** of negatives, decoupling negative count from batch size (memory-efficient).

This is the same metric-learning principle as the triplet/contrastive losses from Week 8.

## DINO: self-distillation

**DINO** trains a student network to match a momentum-averaged teacher's output on different views — no negatives, no labels. Remarkably, DINO's ViT attention maps **segment objects** without ever being told what objects are.

## MAE: masked autoencoding

**Masked Autoencoders** mask ~75% of image patches and train a ViT to reconstruct the missing ones — the vision analogue of BERT's masked language modeling (Phase 4). Simple, scalable, and very effective for pretraining large ViTs.

## Why it matters

SSL produces backbones that transfer with little labeled data — directly relevant when your task has only ~100 images (Week 11). It's the dominant paradigm for foundation-model pretraining.

## Key takeaways

- SSL learns representations from unlabeled data via pretext tasks, then fine-tunes.
- Contrastive (SimCLR/MoCo) pulls together views of the same image; DINO uses self-distillation; MAE reconstructs masked patches.
- SSL backbones transfer well with minimal labels — the basis of vision foundation models.`,
          },
          {
            day: 3,
            title: "Grad-CAM & Visual Explainability",
            domain: "cv",
            key_concepts: ["Grad-CAM", "class activation maps", "gradients", "interpretability", "saliency"],
            quiz_prompt:
              "Test how Grad-CAM uses gradients of the target class w.r.t. feature maps to localize evidence, and how to interpret/validate the heatmaps.",
            lesson_markdown: `# Grad-CAM & Visual Explainability

When a CNN predicts "dog," *where* in the image did it look? **Grad-CAM** answers this, producing a heatmap of the regions driving a prediction — essential for trust, debugging, and bias auditing.

## The idea

**Grad-CAM** (Gradient-weighted Class Activation Mapping) uses the gradients of the target class score flowing into the **last convolutional layer**. The intuition: feature maps important for the class will have large gradients, so weight each feature map by its average gradient and combine.

## The recipe

1. Forward pass; pick the target class score.
2. Backprop to get gradients of that score w.r.t. the last conv feature maps.
3. **Global-average-pool** the gradients per channel → importance weights.
4. Weighted sum of feature maps, apply ReLU → a coarse heatmap.
5. Upsample and overlay on the image.

\`\`\`python
# register a hook to grab feature maps + gradients of the target conv layer
feature_maps = ...           # (C, h, w) from forward hook
grads = ...                  # (C, h, w) from backward hook
weights = grads.mean(dim=(1, 2))                  # (C,)
cam = torch.relu((weights[:, None, None] * feature_maps).sum(0))
\`\`\`

## Interpreting and validating

A good Grad-CAM highlights the object. Warning signs:

- The heatmap focuses on **background** → the model uses a **spurious correlation** (e.g. "boat" detected from water, not the boat). This is shortcut learning (Week 14).
- It's a debugging tool, not ground truth — Grad-CAM is coarse (last-layer resolution) and approximate.

## Use in bias auditing

Grad-CAM is central to the bias work later in this phase and Phase 5: by visualizing what models attend to across demographic groups, you can surface unfair or spurious reasoning. You'll implement it from scratch this week.

## Key takeaways

- Grad-CAM weights last-conv feature maps by their class gradients to localize evidence.
- Heatmaps on the background reveal spurious correlations / shortcut learning.
- It's a coarse but invaluable tool for debugging, trust, and bias auditing.`,
          },
          {
            day: 4,
            title: "CV Model Optimization",
            domain: "cv",
            key_concepts: ["quantization", "pruning", "ONNX", "INT8", "TensorRT"],
            quiz_prompt:
              "Test INT8 quantization, pruning, ONNX export, and runtime optimization (TensorRT) for deploying CV models efficiently.",
            lesson_markdown: `# CV Model Optimization

A model that's accurate but too slow or large never ships. Optimization shrinks models and accelerates inference for real-world deployment — the practical edge of the communication-aware theme.

## Quantization

**Quantization** stores and computes weights/activations in lower precision — typically **INT8** instead of FP32. This gives ~4× smaller models and 2–4× faster inference on supported hardware, usually with <1% accuracy loss.

- **Post-training quantization (PTQ)** — quantize a trained model using a small calibration set. Fast, no retraining.
- **Quantization-aware training (QAT)** — simulate quantization during training for best accuracy.

\`\`\`python
import torch
qmodel = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8)
\`\`\`

## Pruning

**Pruning** removes unimportant weights or whole channels. **Unstructured** pruning zeros individual weights (needs sparse kernels to speed up); **structured** pruning removes channels/filters for real speedups on standard hardware. This is conceptually the same as the gradient sparsification in the Section 17 federated-learning papers — exploiting that most parameters/gradients are near zero.

## ONNX export

**ONNX** is a portable model format that decouples training framework from inference runtime. Export once, run anywhere (ONNX Runtime, mobile, browser). You'll export your detector to ONNX this week.

\`\`\`python
torch.onnx.export(model, dummy_input, "model.onnx", opset_version=17)
\`\`\`

## Runtime optimization

**ONNX Runtime** and **TensorRT** apply graph optimizations (operator fusion, constant folding) and hardware-specific kernels. TensorRT (NVIDIA) combines fusion + quantization for large GPU speedups. Always **benchmark** PyTorch vs the optimized runtime on target hardware — the project's core deliverable.

## Key takeaways

- INT8 quantization (PTQ or QAT) gives ~4× smaller, 2–4× faster models with little accuracy loss.
- Pruning removes near-zero weights/channels (echoing gradient sparsification); structured pruning yields real speedups.
- Export to ONNX for portability; optimize with ONNX Runtime/TensorRT and always benchmark on target hardware.`,
          },
          {
            day: 5,
            title: "Deployment Patterns",
            domain: "cv",
            key_concepts: ["FastAPI serving", "batching", "ONNX Runtime", "latency vs throughput", "inference API"],
            quiz_prompt:
              "Test serving models with FastAPI, request batching, latency vs throughput tradeoffs, and ONNX Runtime inference.",
            lesson_markdown: `# Deployment Patterns

Training is half the job; serving the model to users is the other half. This lesson covers the patterns behind a production inference service — and the project that ties this week together.

## Serving with FastAPI

**FastAPI** is the standard Python framework for ML inference APIs: async, fast, with automatic validation and docs. A minimal image-inference endpoint:

\`\`\`python
from fastapi import FastAPI, UploadFile
import onnxruntime as ort, numpy as np

app = FastAPI()
session = ort.InferenceSession("model.onnx")

@app.post("/predict")
async def predict(file: UploadFile):
    img = preprocess(await file.read())          # -> (1,3,H,W) float32
    out = session.run(None, {"images": img})
    return {"detections": postprocess(out)}
\`\`\`

This is exactly the endpoint your project builds, with an HTML page uploading an image and rendering the overlay.

## Latency vs throughput

Two different goals:

- **Latency** — time for one request (matters for interactive use).
- **Throughput** — requests per second (matters for serving many users).

**Batching** multiple requests improves throughput (GPUs love big batches) but adds latency (waiting to fill a batch). **Dynamic batching** balances them by capping the wait time.

## ONNX Runtime in production

Serving the **ONNX** model (Day 4) rather than PyTorch removes the heavy training framework from production, reduces dependencies, and is faster. ONNX Runtime picks optimized execution providers (CPU, CUDA, TensorRT) automatically.

## Production concerns

Warm up the model (first inference is slow), handle malformed inputs gracefully, add health checks and request logging, and monitor latency percentiles (p95/p99, not just the mean). Monitoring for input drift (Phase 5) keeps the deployed model honest.

## Key takeaways

- FastAPI + ONNX Runtime is a clean, fast pattern for serving CV models.
- Batching trades latency for throughput; dynamic batching balances the two.
- Serve ONNX (not PyTorch) in production, warm up the model, and monitor tail latency.`,
          },
        ],
      },
      {
        week: 14,
        title: "CV Capstone",
        compute: "colab",
        colab_runtime: "GPU",
        colab_installs: ["fairlearn", "facenet-pytorch"],
        colab_dataset_setup: `# ── Dataset Setup: a public classifier + demographic eval set ──
# e.g. a torchvision ResNet on ImageNet, or a face model + FairFace subset.
import torchvision.models as models
clf = models.resnet50(weights="IMAGENET1K_V2").eval()
print("Loaded classifier for the audit")`,
        project: {
          title: "CV Audit Report",
          description:
            "Take a publicly available image classifier (e.g. ResNet on ImageNet or a face detection model). Write a structured bias audit: dataset analysis, demographic performance evaluation (using FairFace or similar), failure-case documentation, and mitigation recommendations. Output as a PDF report.",
          evaluation_criteria: [
            "Rigorous dataset analysis",
            "Demographic performance breakdown",
            "Documented failure cases",
            "Concrete mitigation recommendations",
            "Professional PDF report",
          ],
          starter_code: `# Evaluate a classifier across demographic subgroups.
# 1. Load model + a labeled subgroup dataset (e.g. FairFace).
# 2. Compute accuracy / error rates per subgroup.
# 3. Use Grad-CAM (Week 13) to inspect failure cases.
# 4. Quantify gaps; recommend mitigations.
print("Build the audit pipeline here")`,
        },
        days: [
          {
            day: 1,
            title: "Dataset Curation Best Practices",
            domain: "cv",
            key_concepts: ["class imbalance", "data cleaning", "labeling quality", "deduplication", "splits"],
            quiz_prompt:
              "Test class imbalance handling, data cleaning, label quality auditing, train/val/test split hygiene, and leakage from duplicates.",
            lesson_markdown: `# Dataset Curation Best Practices

In real projects, improving the **dataset** beats tweaking the model. Curation is unglamorous but the highest-leverage skill in applied CV.

## Class imbalance

Real datasets are skewed — some classes have thousands of examples, others a handful. Imbalance biases models toward majority classes. Remedies:

- **Resampling** — oversample minority (or augment them), undersample majority.
- **Class weights** — weight the loss inversely to class frequency.
- **Focal loss** (Week 8) — down-weight easy majority examples.

Always report **per-class** metrics, not just overall accuracy.

## Data cleaning

Real images contain corrupted files, wrong labels, duplicates, and off-distribution junk. Cleaning steps: remove unreadable/duplicate images, verify label-image correspondence on a sample, and check for **near-duplicates** that leak across splits.

## Labeling quality

Labels are noisy. Best practices: clear annotation guidelines, multiple annotators with **inter-annotator agreement** checks, and adjudication of disagreements. A model can't exceed the quality of its labels — a 10% label error rate caps achievable accuracy.

## Split hygiene

The cardinal rule: **no leakage between train and test**. Pitfalls specific to CV:

- Near-duplicate images split across train/test inflate scores.
- Images from the same source/patient/session must stay in the **same split** (group splitting).
- Split **before** any augmentation or normalization fitting.

\`\`\`python
from sklearn.model_selection import GroupShuffleSplit
gss = GroupShuffleSplit(test_size=0.2, n_splits=1, random_state=0)
train_idx, test_idx = next(gss.split(X, y, groups=patient_id))
\`\`\`

## Key takeaways

- Address class imbalance with resampling, class weights, or focal loss; report per-class metrics.
- Clean corrupt/duplicate/mislabeled data; label quality caps achievable accuracy.
- Prevent leakage with group-aware splits done before augmentation.`,
          },
          {
            day: 2,
            title: "Training at Scale",
            domain: "cv",
            key_concepts: ["DDP", "gradient accumulation", "mixed precision", "large batch", "distributed training"],
            quiz_prompt:
              "Test data-parallel training (DDP), gradient accumulation for large effective batches, and combining mixed precision at scale.",
            lesson_markdown: `# Training at Scale

When models and datasets outgrow a single GPU, you scale out. The techniques here also connect directly to the distributed-training research in Section 17.

## Data parallelism (DDP)

**Distributed Data Parallel** replicates the model on each GPU, gives each a different data shard, and **synchronizes gradients** (all-reduce) every step so all replicas stay identical. It scales near-linearly and is the standard approach.

\`\`\`python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
model = DDP(model.to(rank), device_ids=[rank])
\`\`\`

The gradient all-reduce is exactly the **communication bottleneck** the federated-learning papers (Section 17) attack with gradient sparsification and over-the-air aggregation — at scale, communication, not computation, often limits training.

## Gradient accumulation

To simulate a **large batch** that won't fit in memory, run several forward/backward passes, accumulate gradients, then step once:

\`\`\`python
for i, (xb, yb) in enumerate(loader):
    loss = loss_fn(model(xb), yb) / accum_steps
    loss.backward()
    if (i + 1) % accum_steps == 0:
        opt.step(); opt.zero_grad()
\`\`\`

This gives large-batch stability on a small GPU (or Colab's T4) at the cost of speed.

## Combining with mixed precision

Stack mixed precision (Week 8) with DDP and gradient accumulation: AMP halves memory and speeds compute, accumulation grows effective batch, DDP adds GPUs. Together they let you train big CV models on modest hardware. Watch the learning rate — large effective batches usually need LR scaling and warmup.

## Key takeaways

- DDP replicates the model and all-reduces gradients each step; the all-reduce is the communication bottleneck.
- Gradient accumulation simulates large batches within limited memory.
- Combine AMP + accumulation + DDP, and scale/warm up the LR for large effective batches.`,
          },
          {
            day: 3,
            title: "Failure Modes in CV",
            domain: "cv",
            key_concepts: ["distribution shift", "spurious correlations", "shortcut learning", "robustness", "generalization"],
            quiz_prompt:
              "Test distribution shift, spurious correlations, shortcut learning, and how to detect and mitigate these CV failure modes.",
            lesson_markdown: `# Failure Modes in CV

Models that score well on test sets can fail catastrophically in the real world. Understanding *why* is essential for building trustworthy systems.

## Distribution shift

Models assume test data matches training data. **Distribution shift** breaks this:

- **Covariate shift** — inputs change (new cameras, lighting, geography).
- **Concept drift** — the input-label relationship changes over time.

A model trained on sunny daytime photos fails at night. Detecting shift (monitoring input statistics and confidence, Phase 5) is as important as accuracy.

## Spurious correlations

Models latch onto whatever predicts the label in training, even if it's **not causal**. Classic examples: classifying "cow" from green pasture backgrounds (failing on cows on beaches), or detecting "boat" from water. The feature correlates with the label *in the dataset* but isn't the object.

## Shortcut learning

**Shortcut learning** is the general phenomenon: networks prefer the *easiest* predictive cue, not the intended one. A pneumonia classifier may learn the hospital's scanner watermark instead of lung pathology. Grad-CAM (Week 13) is your main tool to expose shortcuts — if the heatmap is on the background or an artifact, you have one.

## Detection and mitigation

- **Test on shifted data** — different sources, stress sets, adversarial crops.
- **Visualize attention** (Grad-CAM) to confirm the model uses the right evidence.
- **Augmentation** — break spurious cues (randomize backgrounds).
- **Group robustness / balanced data** — ensure no subgroup is predictable by a shortcut.

These failure modes directly motivate the bias audit you'll perform in the capstone project and Phase 5.

## Key takeaways

- Distribution shift (covariate/concept) breaks the train-matches-test assumption.
- Spurious correlations and shortcut learning make models rely on non-causal cues.
- Detect with shifted test sets and Grad-CAM; mitigate with augmentation and group-robust, balanced data.`,
          },
          {
            day: 4,
            title: "AI Bias in Vision",
            domain: "cv",
            key_concepts: ["dataset bias", "demographic performance gaps", "audit methods", "FairFace", "representation"],
            quiz_prompt:
              "Test sources of bias in vision datasets, demographic performance gaps, audit methodology, and tools like FairFace.",
            lesson_markdown: `# AI Bias in Vision

Computer vision systems make consequential decisions — in policing, hiring, healthcare — and they can encode and amplify societal bias. Auditing for this is both an ethical and engineering responsibility.

## Where bias comes from

- **Representation bias** — training data underrepresents some groups. The original ImageNet and many face datasets skew heavily toward lighter-skinned, Western subjects.
- **Measurement bias** — labels or sensors behave differently across groups (cameras historically tuned for lighter skin).
- **Aggregation bias** — one model assumed to fit all groups equally when subgroups differ.

The landmark **Gender Shades** study found commercial gender classifiers had near-perfect accuracy on lighter-skinned men but error rates up to 35% on darker-skinned women — a stark demographic performance gap.

## Demographic performance gaps

Overall accuracy hides per-group failures. A model at 95% overall can be 99% on one group and 70% on another. Auditing means **disaggregating** metrics by demographic group and reporting the gaps.

## Audit methodology

1. Assemble a **labeled evaluation set** with demographic annotations (e.g. **FairFace**, balanced across race/gender/age).
2. Compute accuracy, FPR, and FNR **per subgroup**.
3. Quantify gaps (max−min across groups).
4. Inspect failures with Grad-CAM (Week 13) to understand *why*.
5. Recommend mitigations (Phase 5 covers these in depth).

\`\`\`python
for group in subgroups:
    mask = demo == group
    print(group, accuracy(preds[mask], labels[mask]))
\`\`\`

## This week's capstone

Your capstone project is exactly this audit: take a public classifier, evaluate it across demographic groups with FairFace, document failures, and recommend fixes — producing a professional PDF report. This is portfolio-grade, PhD-trajectory work.

## Key takeaways

- Vision bias arises from representation, measurement, and aggregation in datasets and sensors.
- Overall accuracy hides demographic gaps — always disaggregate metrics by subgroup.
- Audit with a balanced labeled set (FairFace), per-group error rates, and Grad-CAM failure analysis.`,
          },
          {
            day: 5,
            title: "Reading a CV Paper in 1 Hour",
            domain: "cv",
            key_concepts: ["abstract", "method", "experiments", "critical reading", "research literacy"],
            quiz_prompt:
              "Test an efficient strategy for reading research papers: the three-pass approach, what to extract from abstract/method/experiments, and critical evaluation.",
            lesson_markdown: `# Reading a CV Paper in 1 Hour

The field moves fast; staying current means reading papers efficiently. A structured approach turns an intimidating PDF into understanding in about an hour — a core PhD-trajectory skill.

## The three-pass method

**Pass 1 (5–10 min) — the gist.** Read the title, abstract, figures, and conclusion. Answer: What problem? What's the key idea? What's the headline result? Decide if it's worth more time.

**Pass 2 (~30 min) — the content.** Read the method and experiments carefully; skim proofs. Understand the architecture/algorithm, the datasets and baselines, and the main tables. Note terms or references you need to look up.

**Pass 3 (~20 min) — the depth.** Only for papers you'll build on. Reconstruct the method as if you'd implement it; scrutinize assumptions; check whether the experiments actually support the claims.

## What to extract

- **Problem & motivation** — why does this matter?
- **Key contribution** — what's genuinely new (usually 1–2 ideas)?
- **Method** — could you re-implement the core?
- **Evidence** — fair baselines? ablations isolating the contribution? appropriate datasets/metrics?
- **Limitations** — what do the authors (or you) see as weaknesses?

## Critical reading

Don't accept claims at face value. Ask: Are baselines tuned fairly? Is the improvement within noise (error bars)? Does it generalize beyond the chosen dataset? Strong papers include **ablation studies** isolating each component — their absence is a red flag.

## Applying it to Section 17

The five research papers in NeuralPath's Section 17 are ideal practice. Use the three-pass method on the DeepJSCC paper: the abstract gives the joint source-channel coding idea, the method shows the CNN autoencoder with a channel layer, and the experiments show graceful degradation (no cliff effect). Reading these well is the bridge to extending the work yourself.

## Key takeaways

- Use three passes: gist (abstract/figures), content (method/experiments), depth (re-implementable understanding).
- Extract problem, key contribution, method, evidence quality, and limitations.
- Read critically — check baselines, ablations, error bars, and generalization, not just headline numbers.`,
          },
        ],
      },
    ],
  },
  // ════════════════════════════════════════════════════════════════
  // PHASE 4 — NLP & TRANSFORMERS
  // ════════════════════════════════════════════════════════════════
  {
    phase: 4,
    title: "NLP & LLMs",
    weeks: [
      {
        week: 15,
        title: "NLP Foundations",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        project: {
          title: "Sentiment Analysis Pipeline",
          description:
            "Build a complete sentiment classifier: a TF-IDF + Logistic Regression baseline → an LSTM → a fine-tuned DistilBERT. Compare on the IMDB dataset and write a production-style inference script.",
          evaluation_criteria: [
            "Working TF-IDF + LR baseline",
            "Correct LSTM implementation",
            "DistilBERT fine-tuning",
            "Fair comparison on IMDB",
            "Clean inference script",
          ],
          starter_code: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

baseline = Pipeline([
    ("tfidf", TfidfVectorizer(max_features=20000, ngram_range=(1,2))),
    ("clf", LogisticRegression(max_iter=1000)),
])
# TODO: train baseline on IMDB, then LSTM, then fine-tune DistilBERT; compare`,
        },
        days: [
          {
            day: 1,
            title: "Text Preprocessing",
            domain: "nlp",
            key_concepts: ["tokenization", "stemming", "lemmatization", "regex cleaning", "normalization"],
            quiz_prompt:
              "Test tokenization, stemming vs lemmatization, text normalization/cleaning, and why preprocessing choices matter.",
            lesson_markdown: `# Text Preprocessing

Before any model sees text, it must be cleaned and converted into discrete units. Preprocessing choices ripple through the whole pipeline.

## Tokenization

**Tokenization** splits text into units (tokens). Approaches:

- **Word-level** — split on whitespace/punctuation. Simple but produces huge vocabularies and chokes on unseen words.
- **Subword** (BPE, WordPiece) — split into frequent sub-units, so "unhappiness" → "un", "happiness". Handles rare/unseen words with a fixed vocabulary. This is what BERT/GPT use (Week 16).
- **Character-level** — tiny vocabulary, very long sequences.

\`\`\`python
text = "NeuralPath is great!"
tokens = text.lower().split()   # naive word tokenization
\`\`\`

## Normalization and cleaning

Common steps: lowercasing, removing or normalizing punctuation, stripping HTML, handling contractions, and **regex** cleaning (URLs, emails, repeated chars). Be careful — lowercasing destroys "US" vs "us", and over-cleaning can remove signal (emojis carry sentiment!).

## Stemming vs lemmatization

Both reduce words to a base form to collapse variants:

- **Stemming** — crude suffix chopping ("running" → "run", but "studies" → "studi"). Fast, approximate.
- **Lemmatization** — dictionary-based reduction to a valid word ("better" → "good"), using part-of-speech. Slower, accurate.

\`\`\`python
import nltk
from nltk.stem import PorterStemmer, WordNetLemmatizer
PorterStemmer().stem("running")        # 'run'
WordNetLemmatizer().lemmatize("better", pos="a")   # 'good'
\`\`\`

## When to preprocess (and when not to)

Classical methods (TF-IDF, Day 2) benefit greatly from cleaning, stemming, and stop-word removal. **Modern transformers** use their own subword tokenizers and learn from raw-ish text — heavy preprocessing can *hurt* them by removing information. Match preprocessing to the model.

## Key takeaways

- Tokenization splits text; subword tokenization (BPE/WordPiece) balances vocabulary size and unseen words.
- Stemming is crude/fast; lemmatization is accurate/slower; both collapse word variants.
- Clean aggressively for classical models, lightly for transformers — match preprocessing to the method.`,
          },
          {
            day: 2,
            title: "Bag of Words, TF-IDF & N-grams",
            domain: "nlp",
            key_concepts: ["bag of words", "TF-IDF", "n-grams", "sparse vectors", "document representation"],
            quiz_prompt:
              "Test bag-of-words, the TF-IDF weighting (term frequency × inverse document frequency), n-grams, and their limitations.",
            lesson_markdown: `# Bag of Words, TF-IDF & N-grams

Before embeddings, text was represented by counting words. These classical methods are still strong baselines (your project's first model) and clarify what neural methods improve on.

## Bag of Words

**Bag of Words (BoW)** represents a document as a vector of word counts over the vocabulary, ignoring order. "the cat sat" and "sat the cat" get identical vectors. Simple and surprisingly effective for topic/sentiment classification.

\`\`\`python
from sklearn.feature_extraction.text import CountVectorizer
X = CountVectorizer().fit_transform(documents)   # sparse count matrix
\`\`\`

These vectors are **high-dimensional and sparse** (vocabulary size, mostly zeros).

## TF-IDF

Raw counts overweight common words ("the"). **TF-IDF** scales each term by how rare it is across documents:

\`TF-IDF(t,d) = TF(t,d) × log(N / DF(t))\`

Frequent-everywhere words get low weight; distinctive words get high weight. TF-IDF + Logistic Regression is a famously strong, fast text baseline.

\`\`\`python
from sklearn.feature_extraction.text import TfidfVectorizer
X = TfidfVectorizer(max_features=20000, ngram_range=(1,2)).fit_transform(docs)
\`\`\`

## N-grams

To recover *some* word order, **n-grams** treat sequences of n words as features: "not good" (a bigram) captures negation that unigrams miss. \`ngram_range=(1,2)\` uses unigrams + bigrams. The cost is vocabulary explosion.

## Limitations

These methods can't capture **meaning** or **long-range order**: "good" and "great" are unrelated dimensions, and they don't generalize to synonyms. Word embeddings (Day 3) fix the semantic gap; RNNs/transformers fix order.

## Key takeaways

- BoW counts words ignoring order; TF-IDF reweights by rarity to highlight distinctive terms.
- N-grams capture local word order (e.g. negation) at the cost of a larger vocabulary.
- These sparse representations miss semantics and long-range structure — motivating embeddings and sequence models.`,
          },
          {
            day: 3,
            title: "Word Embeddings",
            domain: "nlp",
            key_concepts: ["Word2Vec", "CBOW", "skip-gram", "GloVe", "FastText"],
            quiz_prompt:
              "Test word embeddings, Word2Vec (CBOW vs skip-gram), GloVe, FastText subword embeddings, and the distributional hypothesis.",
            lesson_markdown: `# Word Embeddings

Word embeddings map words to dense vectors where **geometry encodes meaning** — similar words are nearby, and relationships become directions. This was a turning point in NLP.

## The distributional hypothesis

"You shall know a word by the company it keeps." Words appearing in similar contexts have similar meanings. Embeddings learn this: a word's vector is shaped by the words around it. The famous result \`king − man + woman ≈ queen\` shows relationships become consistent vector offsets.

## Word2Vec: CBOW and skip-gram

**Word2Vec** trains a shallow network on a prediction task, then keeps the learned vectors:

- **CBOW** — predict the center word from its context. Fast, good for frequent words.
- **Skip-gram** — predict context words from the center word. Better for rare words and small data.

\`\`\`python
from gensim.models import Word2Vec
model = Word2Vec(sentences, vector_size=100, sg=1)   # sg=1 -> skip-gram
model.wv.most_similar("king")
\`\`\`

## GloVe

**GloVe** takes a different route: it factorizes a global **word co-occurrence matrix**, combining the benefits of count-based and prediction-based methods. Pretrained GloVe vectors are a popular drop-in.

## FastText

**FastText** represents each word as a bag of **character n-grams**, so it can build vectors for **unseen** words from their subword pieces and handles morphologically rich languages well — the bridge to subword tokenization in transformers.

## Static vs contextual

These embeddings are **static**: "bank" has one vector regardless of "river bank" vs "money bank". Contextual embeddings from transformers (BERT, Week 16) fix this by producing context-dependent vectors — the next leap.

## Key takeaways

- Embeddings place words in a dense space where similarity and analogies are geometric.
- Word2Vec (CBOW/skip-gram) and GloVe (co-occurrence factorization) learn static vectors; FastText adds subword robustness.
- Static embeddings give each word one vector; contextual transformer embeddings resolve word sense by context.`,
          },
          {
            day: 4,
            title: "RNNs, LSTMs & GRUs",
            domain: "nlp",
            key_concepts: ["recurrence", "hidden state", "vanishing gradient", "LSTM gates", "GRU"],
            quiz_prompt:
              "Test recurrent networks, the hidden state, vanishing gradients in RNNs, and how LSTM/GRU gates fix long-range dependencies.",
            lesson_markdown: `# RNNs, LSTMs & GRUs

To model sequences — where order matters — we need networks with memory. Recurrent networks process tokens one at a time, carrying a hidden state.

## Recurrent networks

An **RNN** maintains a **hidden state** \`h_t\` updated at each step from the current input and the previous state: \`h_t = tanh(W_x x_t + W_h h_{t-1})\`. The same weights are reused across time (parameter sharing, like convolution across space), letting it handle variable-length sequences.

\`\`\`python
import torch.nn as nn
rnn = nn.RNN(input_size=100, hidden_size=128, batch_first=True)
out, h_n = rnn(embedded_sequence)   # out: per-step; h_n: final state
\`\`\`

## The vanishing gradient problem

Backpropagating through many time steps multiplies many derivatives (Week 7), so gradients vanish (or explode) over long sequences. Plain RNNs effectively forget anything more than ~10 steps back — they can't link "The cat... was hungry" across a long clause.

## LSTM: gated memory

The **Long Short-Term Memory** cell adds a **cell state** (a gradient highway) and three **gates** that learn what to keep:

- **Forget gate** — what to erase from memory.
- **Input gate** — what new information to store.
- **Output gate** — what to expose as the hidden state.

These gates let gradients flow across long ranges, solving (mostly) the vanishing problem and enabling much longer dependencies.

## GRU: a lighter variant

The **Gated Recurrent Unit** merges the cell and hidden state and uses two gates (reset, update). Fewer parameters, often comparable accuracy, faster to train — a common default.

## The limitation transformers fix

RNNs are inherently **sequential** — they can't parallelize across time, making them slow on long sequences, and even LSTMs struggle with very long range. This bottleneck motivated attention and transformers (Day 5, Week 16).

## Key takeaways

- RNNs carry a hidden state across time with shared weights but suffer vanishing gradients.
- LSTMs add a cell state and forget/input/output gates to capture long-range dependencies; GRUs are a lighter variant.
- RNNs' sequential nature limits parallelism and very-long-range modeling — the gap transformers close.`,
          },
          {
            day: 5,
            title: "Seq2Seq & the Attention Mechanism",
            domain: "nlp",
            key_concepts: ["encoder-decoder", "attention", "context vector", "alignment", "Attention is All You Need"],
            quiz_prompt:
              "Test the seq2seq encoder-decoder, the information bottleneck it has, how attention solves it, and the lead-in to transformers.",
            lesson_markdown: `# Seq2Seq & the Attention Mechanism

Attention is the idea that powers modern NLP. Understanding why it was invented — to fix a bottleneck in seq2seq translation — makes the transformer (Week 16) intuitive.

## Seq2seq encoder-decoder

For tasks like translation, a **seq2seq** model uses an **encoder** RNN to read the input into a fixed **context vector**, and a **decoder** RNN to generate the output from it.

\`\`\`
"the cat sat" → [encoder] → context → [decoder] → "le chat assis"
\`\`\`

## The bottleneck problem

Cramming an entire sentence into one fixed-size vector is a severe **information bottleneck** — long sentences lose detail, and the decoder can't revisit specific input words. Translation quality degraded sharply with length.

## Attention to the rescue

**Attention** lets the decoder look back at **all** encoder states at each output step, computing a **weighted sum** based on relevance. At each step it asks "which input words matter now?" and focuses there. The weights form an interpretable **alignment** (which source word maps to which target word).

\`\`\`
score_t,i = compatibility(decoder_state_t, encoder_state_i)
weights   = softmax(scores)             # attention distribution
context_t = Σ weights_i · encoder_state_i   # focused context
\`\`\`

This removed the bottleneck and dramatically improved translation — and made models interpretable.

## "Attention is All You Need"

The 2017 transformer paper made the radical claim that you can **drop the RNN entirely** and build a model from attention alone. **Self-attention** lets every token attend to every other token in parallel — solving both the bottleneck *and* the sequential-speed problem of RNNs. This is the foundation of BERT, GPT, and everything in Week 16.

## Key takeaways

- Seq2seq compresses input into one context vector — a bottleneck that hurts long sequences.
- Attention lets the decoder weight all encoder states by relevance, removing the bottleneck and giving interpretable alignments.
- "Attention is All You Need" replaced recurrence with parallel self-attention — the birth of the transformer.`,
          },
        ],
      },
      {
        week: 16,
        title: "Transformers & LLMs",
        compute: "colab",
        colab_runtime: "GPU",
        colab_installs: ["transformers", "peft", "datasets", "bitsandbytes", "accelerate"],
        colab_dataset_setup: `# ── Dataset Setup: a small instruction / classification dataset ──
from datasets import load_dataset
ds = load_dataset("imdb")     # or a domain-specific set for instruction tuning
print(ds)`,
        project: {
          title: "LoRA Fine-Tuning",
          description:
            "Fine-tune a small LLM (Phi-3-mini or Qwen2-0.5B) on a domain-specific dataset using LoRA via HuggingFace PEFT. Task: text classification or instruction-following. Log metrics with MLflow and calculate the trainable-parameter reduction.",
          evaluation_criteria: [
            "Correct PEFT/LoRA setup",
            "Successful fine-tuning run",
            "MLflow metric logging",
            "Trainable-parameter reduction reported",
            "Evaluation of the fine-tuned model",
          ],
          starter_code: `from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model

model_id = "Qwen/Qwen2-0.5B"
model = AutoModelForCausalLM.from_pretrained(model_id)
lora = LoraConfig(r=8, lora_alpha=16, target_modules=["q_proj","v_proj"],
                  lora_dropout=0.05, task_type="CAUSAL_LM")
model = get_peft_model(model, lora)
model.print_trainable_parameters()    # report reduction
# TODO: tokenize dataset, Trainer, MLflow logging, evaluate`,
        },
        days: [
          {
            day: 1,
            title: "Transformer Architecture from Scratch",
            domain: "nlp",
            key_concepts: ["multi-head attention", "positional encoding", "layer norm", "feed-forward", "residuals"],
            quiz_prompt:
              "Test self-attention (Q/K/V), multi-head attention, positional encoding, and the transformer block (attention + FFN + residual + layernorm).",
            lesson_markdown: `# Transformer Architecture from Scratch

The transformer is the architecture behind every modern LLM. Built entirely from attention, it processes sequences in parallel and scales to enormous sizes.

## Self-attention: Q, K, V

Each token is projected into three vectors: **Query**, **Key**, **Value**. A token's output is a weighted sum of all tokens' Values, where weights come from Query·Key similarity:

\`Attention(Q,K,V) = softmax(QKᵀ / √d_k) · V\`

The \`√d_k\` scaling keeps gradients stable. Every token attends to every other in **one parallel operation** — no recurrence — which is why transformers train fast and capture long-range dependencies (the goal from Week 15).

\`\`\`python
import torch
scores = (Q @ K.transpose(-2, -1)) / (d_k ** 0.5)
attn = scores.softmax(dim=-1)
out = attn @ V
\`\`\`

## Multi-head attention

Instead of one attention, use **multiple heads** in parallel, each with its own Q/K/V projections. Different heads learn different relationships (syntax, coreference, position). Their outputs are concatenated and projected — giving the model multiple "views" of the sequence.

## Positional encoding

Attention is **order-agnostic** (it's a set operation), so we inject position information via **positional encodings** added to token embeddings — either fixed sinusoids or learned vectors (modern models often use rotary embeddings, RoPE).

## The transformer block

Each block stacks: **multi-head self-attention → add & LayerNorm → feed-forward network → add & LayerNorm**. Residual connections (Week 10) and LayerNorm (Week 7) make deep stacks trainable. The FFN (two linear layers with a nonlinearity) processes each position independently. Stack N of these blocks and you have a transformer.

## Key takeaways

- Self-attention computes weighted sums of Values via scaled Query·Key similarity, in parallel over all tokens.
- Multi-head attention runs several attentions to capture different relationships; positional encodings restore order.
- A transformer block = attention + FFN with residuals and LayerNorm, stacked N times.`,
          },
          {
            day: 2,
            title: "BERT",
            domain: "nlp",
            key_concepts: ["masked language modeling", "bidirectional", "NSP", "fine-tuning", "[CLS] token"],
            quiz_prompt:
              "Test BERT's bidirectional encoding, masked language modeling, next-sentence prediction, and the pretrain-then-fine-tune paradigm.",
            lesson_markdown: `# BERT

**BERT** (2018) showed that pretraining a bidirectional transformer encoder on huge text, then fine-tuning, sets a new standard across NLP tasks. It's an **encoder-only** model for *understanding* text.

## Bidirectional context

Earlier language models were unidirectional (left-to-right). BERT reads the **whole sentence at once**, so each token's representation depends on both left and right context — crucial for understanding (the meaning of "bank" depends on words on both sides).

## Masked Language Modeling (MLM)

You can't do naive next-word prediction bidirectionally (the model would see the answer). BERT's trick: randomly **mask ~15%** of tokens and train the model to predict them from context. This forces deep bidirectional understanding.

\`\`\`
Input:  "The [MASK] sat on the mat"
Target: predict "cat" at the masked position
\`\`\`

## Next Sentence Prediction (NSP)

BERT also trained to predict whether sentence B follows sentence A, intended to teach inter-sentence relationships. (Later work — RoBERTa — showed NSP is largely unnecessary, but it's part of original BERT.)

## Fine-tuning

After pretraining, adapt BERT to any task by adding a small head and fine-tuning end-to-end. The special **[CLS]** token's final representation summarizes the sequence for classification:

\`\`\`python
from transformers import AutoModelForSequenceClassification
model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased", num_labels=2)
# fine-tune on IMDB — exactly the project's DistilBERT step
\`\`\`

**DistilBERT** (used in Week 15's project) is a compressed BERT — 40% smaller, 60% faster, ~97% of the performance.

## Key takeaways

- BERT is a bidirectional encoder pretrained with masked language modeling for deep understanding.
- MLM predicts masked tokens from both-side context; NSP (later found dispensable) modeled sentence pairs.
- Fine-tune by adding a head; the [CLS] token represents the sequence. DistilBERT is the efficient variant.`,
          },
          {
            day: 3,
            title: "The GPT Family",
            domain: "nlp",
            key_concepts: ["causal language modeling", "autoregressive", "in-context learning", "scaling laws", "decoder-only"],
            quiz_prompt:
              "Test causal (autoregressive) language modeling, decoder-only architecture, in-context learning, and scaling laws.",
            lesson_markdown: `# The GPT Family

While BERT understands text, **GPT** *generates* it. The GPT family — decoder-only autoregressive models — scaled into the large language models that power modern AI assistants (including Claude, which grades your quizzes).

## Causal language modeling

GPT is trained on one simple objective: **predict the next token** given all previous tokens. A **causal mask** prevents each position from attending to future tokens, so prediction is honest.

\`P(text) = Π P(token_t | token_1 ... token_{t-1})\`

This **autoregressive** generation — sampling one token, appending it, repeating — is how all generative LLMs produce text.

## Decoder-only architecture

GPT uses only the transformer **decoder** stack (masked self-attention + FFN, Day 1) — no encoder. This single objective on massive data turns out to be remarkably general: the same model can summarize, translate, answer questions, and write code.

## In-context learning

The surprising emergent ability: large GPT models perform tasks from **examples in the prompt**, with no weight updates. Show a few input→output pairs ("few-shot") and the model generalizes. This **in-context learning** is why prompt engineering (Week 17) works and reframed how we use models — programming by prompt rather than by fine-tuning.

## Scaling laws

Empirical **scaling laws** show model performance improves predictably with more parameters, data, and compute (a power law). This insight drove the race to larger models — and the **Chinchilla** finding that many models were under-trained on data, so compute should balance model and dataset size. Scaling laws also motivate efficiency methods like LoRA (Day 5).

## BERT vs GPT

- **BERT** — encoder-only, bidirectional, for understanding (classification, NER). Fine-tune it.
- **GPT** — decoder-only, autoregressive, for generation. Prompt it or fine-tune it.

## Key takeaways

- GPT is a decoder-only model trained to predict the next token; generation is autoregressive.
- In-context learning lets large models perform tasks from prompt examples without retraining.
- Scaling laws predict performance from scale; Chinchilla showed balancing data and parameters matters.`,
          },
          {
            day: 4,
            title: "The HuggingFace Ecosystem",
            domain: "nlp",
            key_concepts: ["Trainer API", "datasets library", "tokenizers", "model hub", "pipelines"],
            quiz_prompt:
              "Test the HuggingFace transformers/datasets/tokenizers libraries, the Trainer API, the model hub, and pipelines.",
            lesson_markdown: `# The HuggingFace Ecosystem

HuggingFace is the de facto platform for modern NLP — pretrained models, datasets, and training tools that turn weeks of work into a few lines. You'll use it for this week's LoRA project.

## The model hub

The **Hub** hosts hundreds of thousands of pretrained models. Load any with two lines via Auto classes that pick the right architecture:

\`\`\`python
from transformers import AutoModel, AutoTokenizer
tok = AutoTokenizer.from_pretrained("Qwen/Qwen2-0.5B")
model = AutoModel.from_pretrained("Qwen/Qwen2-0.5B")
\`\`\`

## Tokenizers

The \`tokenizers\` library provides fast (Rust-backed) subword tokenization (Week 15). Always use the tokenizer that **matches** your model — it knows the vocabulary and special tokens the model expects.

\`\`\`python
batch = tok(texts, padding=True, truncation=True, return_tensors="pt")
\`\`\`

## The datasets library

\`datasets\` loads and processes data efficiently with memory-mapping (Apache Arrow), so you can work with datasets larger than RAM. \`load_dataset("imdb")\` fetches a ready dataset; \`.map()\` applies tokenization across it lazily.

## The Trainer API

\`Trainer\` abstracts the training loop (Week 7) — handling batching, mixed precision, gradient accumulation, evaluation, checkpointing, and logging:

\`\`\`python
from transformers import Trainer, TrainingArguments
args = TrainingArguments(output_dir="out", per_device_train_batch_size=8,
                         num_train_epochs=3, eval_strategy="epoch",
                         fp16=True, report_to="mlflow")
Trainer(model=model, args=args, train_dataset=train, eval_dataset=val).train()
\`\`\`

It integrates with MLflow (\`report_to="mlflow"\`) — exactly what the project's logging requires.

## Pipelines

For quick inference, \`pipeline("sentiment-analysis")\` wraps tokenizer + model + post-processing into one callable — great for demos and baselines.

## Key takeaways

- The Hub + Auto classes load any pretrained model and its matching tokenizer in two lines.
- \`datasets\` memory-maps large data; \`.map()\` tokenizes lazily.
- The \`Trainer\` API handles the full training loop with mixed precision, checkpointing, and MLflow logging; \`pipeline\` is for quick inference.`,
          },
          {
            day: 5,
            title: "Fine-Tuning Strategies — LoRA & QLoRA",
            domain: "nlp",
            key_concepts: ["full fine-tuning", "LoRA", "QLoRA", "PEFT", "trainable parameters"],
            quiz_prompt:
              "Test full fine-tuning vs parameter-efficient methods, how LoRA works (low-rank adapters), QLoRA quantization, and the efficiency gains.",
            lesson_markdown: `# Fine-Tuning Strategies — LoRA & QLoRA

Fully fine-tuning a billion-parameter model needs enormous memory. **Parameter-efficient fine-tuning (PEFT)** adapts large models on a single GPU — the technique behind your project.

## Full fine-tuning and its cost

Full fine-tuning updates **every** weight, requiring memory for the parameters, their gradients, and optimizer states (Adam stores 2 extra values per weight). For a 7B model that's tens of GB — infeasible on a Colab T4. You also need a full copy per task.

## LoRA: low-rank adaptation

**LoRA** freezes the pretrained weights and injects small trainable **low-rank** matrices into each layer. Instead of updating a weight \`W (d×d)\`, it learns \`W + BA\` where \`B (d×r)\` and \`A (r×d)\` with rank \`r\` tiny (e.g. 8). You train only \`A\` and \`B\` — often **<1%** of parameters — while \`W\` stays frozen.

\`\`\`python
from peft import LoraConfig, get_peft_model
lora = LoraConfig(r=8, lora_alpha=16, target_modules=["q_proj","v_proj"])
model = get_peft_model(base_model, lora)
model.print_trainable_parameters()   # e.g. 0.3% trainable
\`\`\`

Benefits: huge memory savings, tiny adapter checkpoints (megabytes, swappable per task), and accuracy close to full fine-tuning. This is the conceptual cousin of the **low-rank** and **sparsification** ideas in the Section 17 communication papers — exploit that updates live in a small subspace.

## QLoRA

**QLoRA** goes further: it **quantizes** the frozen base model to 4-bit (Week 13's quantization idea) and trains LoRA adapters on top. This lets you fine-tune models far larger than would otherwise fit — e.g. a 7B+ model on a single consumer GPU — with minimal quality loss.

## Choosing a strategy

- **Small model + plenty of GPU** → full fine-tuning (simplest, best ceiling).
- **Large model, limited GPU** → LoRA.
- **Very large model, single GPU** → QLoRA.

Your project uses LoRA on a small LLM and reports the trainable-parameter reduction — concretely demonstrating the efficiency win.

## Key takeaways

- Full fine-tuning updates all weights — memory-prohibitive for large models.
- LoRA freezes weights and trains tiny low-rank adapters (<1% of params) with near-full accuracy.
- QLoRA adds 4-bit quantization of the base model to fine-tune very large models on one GPU.`,
          },
        ],
      },
      {
        week: 17,
        title: "RAG & Production NLP",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        project: {
          title: "RAG Q&A System",
          description:
            "Build a RAG pipeline over a set of ML research papers (PDFs). Components: PDF parsing → chunking → embeddings (sentence-transformers) → FAISS index → Claude API for generation. Evaluate answer quality on 20 hand-crafted Q&A pairs.",
          evaluation_criteria: [
            "Robust PDF parsing + chunking",
            "Sentence-transformer embeddings + FAISS index",
            "Claude API generation grounded in retrieved context",
            "Evaluation on 20 Q&A pairs",
            "Clear answer-quality analysis",
          ],
          starter_code: `from sentence_transformers import SentenceTransformer
import faiss, numpy as np

embedder = SentenceTransformer("all-MiniLM-L6-v2")
chunks = [...]                       # parsed + chunked PDF text
emb = embedder.encode(chunks, normalize_embeddings=True)
index = faiss.IndexFlatIP(emb.shape[1]); index.add(emb)

def retrieve(query, k=4):
    q = embedder.encode([query], normalize_embeddings=True)
    _, idx = index.search(q, k)
    return [chunks[i] for i in idx[0]]
# TODO: feed retrieved context to Claude API; evaluate on 20 Q&A pairs`,
        },
        days: [
          {
            day: 1,
            title: "RAG Architecture",
            domain: "nlp",
            key_concepts: ["retrieval-augmented generation", "chunking", "embedding models", "vector store", "grounding"],
            quiz_prompt:
              "Test the RAG pipeline (retrieve then generate), chunking strategy, embedding-based retrieval, and how RAG reduces hallucination.",
            lesson_markdown: `# RAG Architecture

LLMs hallucinate and have a fixed knowledge cutoff. **Retrieval-Augmented Generation (RAG)** grounds them in your documents — the dominant pattern for building accurate, up-to-date LLM applications.

## The core idea

Instead of relying on the model's parametric memory, RAG **retrieves** relevant text from a knowledge base and puts it in the prompt, so the model answers from provided evidence:

\`\`\`
question → embed → retrieve top-k chunks → [context + question] → LLM → grounded answer
\`\`\`

This reduces hallucination (answers are sourced), allows fresh/private knowledge without retraining, and enables citations.

## Chunking

Documents are split into **chunks** small enough to embed and fit in the prompt. Chunking strategy matters:

- Too large → diluted relevance, wasted context.
- Too small → lost context, fragmented meaning.
- Typical: a few hundred tokens with **overlap** so ideas spanning a boundary aren't split.

Chunk on semantic boundaries (paragraphs, sections) when possible — important for the research-paper PDFs in your project.

## Embedding and retrieval

Each chunk is encoded into a vector by an **embedding model** (Day 2's sentence-transformers). At query time, embed the question and find the **nearest** chunks by similarity (cosine / dot product) using a vector store (Day 2). These chunks become the context.

## Generation

The retrieved context plus the question are sent to the LLM (Claude API, in your project) with an instruction to answer **only** from the context and say "I don't know" otherwise — keeping answers grounded.

## Key takeaways

- RAG retrieves relevant chunks and feeds them to the LLM, grounding answers and reducing hallucination.
- Chunking (size + overlap, semantic boundaries) strongly affects retrieval quality.
- Pipeline: embed query → nearest-neighbor retrieval → context+question → grounded generation.`,
          },
          {
            day: 2,
            title: "Vector Databases",
            domain: "nlp",
            key_concepts: ["FAISS", "ChromaDB", "similarity search", "ANN", "embeddings index"],
            quiz_prompt:
              "Test vector databases, exact vs approximate nearest-neighbor search, FAISS and ChromaDB, and similarity metrics.",
            lesson_markdown: `# Vector Databases

RAG needs to find the most similar vectors among millions, fast. **Vector databases** specialize in this nearest-neighbor search — the retrieval engine of any RAG system.

## The problem

Given a query embedding, find the \`k\` closest document embeddings. Brute-force comparison against millions of vectors is too slow for interactive use. Vector stores solve this with specialized indexes.

## Similarity metrics

- **Cosine similarity** — angle between vectors; standard for normalized text embeddings.
- **Dot product** — cosine when vectors are normalized.
- **Euclidean (L2)** — straight-line distance.

Normalize embeddings and use inner product (\`IndexFlatIP\`) for cosine similarity, as in your project's starter code.

## Exact vs approximate search

- **Exact** (flat index) — compares against all vectors; perfectly accurate, fine up to ~100k vectors.
- **Approximate Nearest Neighbor (ANN)** — trades a little recall for massive speed via clever indexes (HNSW graphs, IVF clustering, product quantization). Essential at scale.

## FAISS

**FAISS** (Facebook AI Similarity Search) is the fast, low-level library for this. It offers flat indexes for accuracy and IVF/HNSW for scale:

\`\`\`python
import faiss
index = faiss.IndexFlatIP(dim)      # exact cosine (normalized vectors)
index.add(embeddings)               # add document vectors
scores, idx = index.search(query_vec, k=4)
\`\`\`

## ChromaDB and managed stores

**ChromaDB** is a higher-level, developer-friendly vector DB with built-in persistence and metadata filtering — less setup than raw FAISS. Managed options (Pinecone, Weaviate, pgvector) add scaling and infrastructure. For your paper-QA project, FAISS in-memory is plenty.

## Key takeaways

- Vector DBs do fast nearest-neighbor search over embeddings — RAG's retrieval engine.
- Normalize embeddings and use inner product for cosine similarity.
- Use exact flat indexes for small corpora; ANN (HNSW/IVF) for scale. FAISS is the workhorse; ChromaDB is higher-level.`,
          },
          {
            day: 3,
            title: "Evaluation of LLMs",
            domain: "nlp",
            key_concepts: ["BLEU", "ROUGE", "BERTScore", "LLM-as-judge", "human evaluation"],
            quiz_prompt:
              "Test LLM/text-generation evaluation: BLEU, ROUGE, BERTScore, human evaluation, and LLM-as-judge, with their tradeoffs.",
            lesson_markdown: `# Evaluation of LLMs

Evaluating generated text is genuinely hard — there's no single right answer. Choosing the right evaluation method is critical and often underestimated.

## N-gram overlap: BLEU and ROUGE

- **BLEU** — precision of n-gram overlap with reference(s); designed for translation. Penalizes too-short outputs.
- **ROUGE** — recall-oriented n-gram overlap; designed for summarization (did you cover the reference content?).

Both are cheap and reproducible but **shallow**: they reward surface word overlap and miss paraphrases ("happy" vs "joyful" score as different).

## Semantic similarity: BERTScore

**BERTScore** compares **contextual embeddings** (Week 16) of candidate and reference tokens rather than exact words, so it credits paraphrases and captures meaning better than BLEU/ROUGE. Still needs a reference.

## Human evaluation

The gold standard: humans rate fluency, relevance, factuality, helpfulness. Expensive and slow, but it captures what metrics miss. Use clear rubrics and multiple raters with agreement checks (echoing the labeling-quality lesson from Week 14).

## LLM-as-judge

The modern, scalable approach: prompt a strong LLM to **score or compare** outputs against criteria (correctness, grounding, completeness). It correlates surprisingly well with human judgment at a fraction of the cost — this is essentially what NeuralPath does when Claude grades your short answers. Caveats: judges have biases (position, verbosity, self-preference) — mitigate with randomized order and explicit rubrics.

## Evaluating RAG

For your RAG project, evaluate two things separately: **retrieval** (did it fetch the right chunks? — recall@k) and **generation** (is the answer correct and **grounded** in the retrieved context?). Your 20 hand-crafted Q&A pairs are the test set; an LLM-as-judge or manual check assesses answer quality.

## Key takeaways

- BLEU/ROUGE measure shallow n-gram overlap; BERTScore captures semantic similarity via embeddings.
- Human evaluation is the gold standard; LLM-as-judge scales it cheaply (with bias caveats).
- Evaluate RAG's retrieval and generation separately; grounding is the key generation criterion.`,
          },
          {
            day: 4,
            title: "Prompt Engineering Systematically",
            domain: "nlp",
            key_concepts: ["zero/few-shot", "chain-of-thought", "structured output", "system prompts", "prompt design"],
            quiz_prompt:
              "Test systematic prompting: zero/few-shot, chain-of-thought, structured/JSON output, system prompts, and prompt design principles.",
            lesson_markdown: `# Prompt Engineering Systematically

Prompting is how you program an LLM through its in-context learning (Week 16). Done systematically, it's a reliable engineering discipline, not guesswork — and it's exactly how NeuralPath instructs Claude.

## Zero-shot vs few-shot

- **Zero-shot** — just describe the task. Works well for capable models on common tasks.
- **Few-shot** — include a few input→output **examples** in the prompt. The model infers the pattern and format. Use when zero-shot is inconsistent or the format is specific.

\`\`\`
Classify sentiment as positive/negative.
Review: "Loved it!" -> positive
Review: "Total waste." -> negative
Review: "{input}" ->
\`\`\`

## Chain-of-thought (CoT)

For reasoning tasks, prompting the model to **think step by step** before answering dramatically improves accuracy — it allocates intermediate computation. Add "Let's reason step by step," or provide worked examples. For final answers, ask it to reason then output the conclusion in a parseable form.

## Structured output

For programmatic use, instruct the model to return **strict JSON** with a defined schema — and validate it. This is exactly how NeuralPath's quiz generation and grading work (Section 8 returns JSON). Tips: show the exact schema, say "return ONLY valid JSON, no markdown," and parse defensively.

## System prompts

The **system prompt** sets persistent role, tone, and rules ("You are an expert ML educator. Return only JSON."). It frames every turn — put durable instructions and constraints here, task-specific input in the user message. This separation (used throughout NeuralPath's \`claude.js\`) keeps behavior consistent.

## Design principles

- Be **specific** — state format, length, constraints explicitly.
- Give the model an **out** ("say 'I don't know' if unsure") to curb hallucination — vital for RAG.
- **Iterate** on real examples; treat prompts like code (version them, test them).

## Key takeaways

- Few-shot examples and chain-of-thought reasoning reliably improve accuracy over bare zero-shot.
- Request strict, schema'd JSON for programmatic use and parse defensively.
- System prompts hold durable role/rules; be specific and give the model an explicit "I don't know" option.`,
          },
          {
            day: 5,
            title: "NLP Bias",
            domain: "nlp",
            key_concepts: ["stereotype propagation", "toxicity", "gender bias in embeddings", "audit tools", "debiasing"],
            quiz_prompt:
              "Test sources of NLP bias (stereotypes in embeddings, toxicity), how to measure it, and mitigation approaches.",
            lesson_markdown: `# NLP Bias

Language models learn from human text and absorb its biases — then can amplify them at scale. Recognizing and measuring this is essential responsible-AI practice, bridging into Phase 5.

## Bias in embeddings

Word embeddings (Week 15) encode societal stereotypes geometrically. The classic finding: \`man:computer_programmer :: woman:homemaker\` emerges from analogy arithmetic on standard embeddings. Gender, race, and religion stereotypes are measurably present because they're present in the training corpus (representation/historical bias, Week 14).

## Stereotype propagation and toxicity

LLMs can:

- **Propagate stereotypes** — associate occupations, traits, or sentiments with demographic groups.
- **Generate toxic content** — when prompted, or unprompted from biased patterns.
- **Perform unevenly** — worse accuracy on dialects or non-dominant languages (a fairness gap like the vision gaps in Week 14).

## Measuring bias

- **WEAT** (Word Embedding Association Test) — quantifies stereotypical associations in embeddings, analogous to human implicit-association tests.
- **Benchmark datasets** — StereoSet, CrowS-Pairs measure stereotype preference; toxicity classifiers (Perspective API) score generations.
- **Disaggregated evaluation** — measure performance across languages/dialects/groups, as in the bias-audit methodology.

## Mitigation

- **Data** — curate and balance training corpora; filter toxic content.
- **Debiasing embeddings** — project out bias directions (partial, debated effectiveness).
- **In/post-processing** — fine-tuning, RLHF, and content filters reduce harmful generations.
- **Guardrails** — system prompts and safety filters at deployment.

No method fully removes bias; the responsible approach is to **measure, document, and mitigate** transparently — the theme Phase 5 develops with formal fairness metrics.

## Key takeaways

- Embeddings and LLMs absorb stereotypes and toxicity from training text and can amplify them.
- Measure with WEAT, stereotype benchmarks, toxicity scorers, and disaggregated evaluation.
- Mitigate via data curation, debiasing, fine-tuning/RLHF, and deployment guardrails — but measure and document, since none fully removes bias.`,
          },
        ],
      },
    ],
  },
  // ════════════════════════════════════════════════════════════════
  // PHASE 5 — ADVANCED & RESEARCH LEVEL
  // ════════════════════════════════════════════════════════════════
  {
    phase: 5,
    title: "Advanced & Research",
    weeks: [
      {
        week: 18,
        title: "Generative Models",
        compute: "colab",
        colab_runtime: "GPU",
        colab_installs: ["pytorch-fid"],
        colab_dataset_setup: `# ── Dataset Setup: Fashion-MNIST ──
import torchvision, torchvision.transforms as T
tf = T.Compose([T.ToTensor(), T.Normalize((0.5,), (0.5,))])
train = torchvision.datasets.FashionMNIST('/content/data', train=True, download=True, transform=tf)
print(len(train))`,
        research_papers: [
          paper(
            "deepjscc",
            "DeepJSCC's encoder is a constrained VAE where the bottleneck is the channel bandwidth, not a chosen latent dimension — connecting autoencoder/latent theory to physical communication constraints."
          ),
        ],
        project: {
          title: "Conditional DCGAN",
          description:
            "Implement and train a conditional DCGAN on MNIST or Fashion-MNIST. Generate class-conditioned samples and evaluate with FID (pytorch-fid). Document the training instabilities you encountered and how you resolved them.",
          evaluation_criteria: [
            "Correct conditional DCGAN architecture",
            "Stable-enough training",
            "Class-conditioned sample generation",
            "FID evaluation",
            "Honest write-up of instabilities and fixes",
          ],
          starter_code: `import torch, torch.nn as nn
class Generator(nn.Module):
    def __init__(self, z=100, n_classes=10, emb=10):
        super().__init__()
        self.label_emb = nn.Embedding(n_classes, emb)
        self.net = nn.Sequential(
            nn.Linear(z + emb, 256), nn.ReLU(),
            nn.Linear(256, 28*28), nn.Tanh())
    def forward(self, noise, labels):
        x = torch.cat([noise, self.label_emb(labels)], dim=1)
        return self.net(x).view(-1, 1, 28, 28)
# TODO: discriminator, training loop, FID, instability notes`,
        },
        days: [
          {
            day: 1,
            title: "Variational Autoencoders (VAE)",
            domain: "advanced",
            key_concepts: ["latent space", "reparameterization trick", "ELBO", "KL divergence", "encoder-decoder"],
            quiz_prompt:
              "Test the VAE: probabilistic latent space, the reparameterization trick, the ELBO (reconstruction + KL), and why VAE outputs are smooth/blurry.",
            lesson_markdown: `# Variational Autoencoders (VAE)

The VAE is a principled generative model that learns a smooth, continuous latent space you can sample from — bridging autoencoders and probabilistic modeling.

## From autoencoder to VAE

A plain autoencoder compresses input to a latent code and reconstructs it, but its latent space has "holes" — sampling random codes gives garbage. A **VAE** makes the latent space **probabilistic**: the encoder outputs a distribution (mean and variance) per input, and we regularize these to be close to a standard Gaussian. Now sampling from \`N(0, I)\` and decoding produces valid new data.

## The reparameterization trick

We need to sample \`z ~ N(μ, σ²)\` but can't backprop through random sampling. The **reparameterization trick** rewrites it as \`z = μ + σ·ε\` with \`ε ~ N(0, I)\`, moving randomness outside the gradient path so the network trains end-to-end.

\`\`\`python
def reparameterize(mu, logvar):
    std = torch.exp(0.5 * logvar)
    eps = torch.randn_like(std)
    return mu + eps * std   # differentiable sampling
\`\`\`

## The ELBO

VAEs maximize the **Evidence Lower BOund**, equivalently minimizing two terms:

- **Reconstruction loss** — decoded output should match the input.
- **KL divergence** — the encoder's latent distribution should stay close to \`N(0, I)\`.

\`Loss = reconstruction + β·KL\`. The KL term regularizes the latent space into a smooth, samplable region. Tuning \`β\` trades reconstruction quality against latent structure (β-VAE).

## Strengths and the blurriness problem

VAEs are stable to train and give a meaningful, interpolatable latent space. Their weakness: outputs are often **blurry**, because the reconstruction loss (pixel MSE) and the averaging over the latent distribution favor smooth, "average" images. GANs (Day 2) produce sharper results.

## Connection to communication

As the research note highlights, DeepJSCC's encoder is essentially a VAE whose bottleneck is set by **channel bandwidth** — learned compression under a physical constraint rather than a chosen latent size.

## Key takeaways

- A VAE learns a probabilistic latent space you can sample to generate new data.
- The reparameterization trick \`z=μ+σε\` makes sampling differentiable; the ELBO = reconstruction + KL.
- VAEs are stable with smooth latents but produce blurry samples — a constrained autoencoder, like learned-compression encoders.`,
          },
          {
            day: 2,
            title: "GAN Fundamentals",
            domain: "advanced",
            key_concepts: ["minimax game", "generator", "discriminator", "training instability", "mode collapse"],
            quiz_prompt:
              "Test the GAN minimax game, generator vs discriminator roles, training instability, and mode collapse.",
            lesson_markdown: `# GAN Fundamentals

**Generative Adversarial Networks** pit two networks against each other, producing some of the sharpest generated images. They're powerful but famously tricky to train — the heart of this week's project.

## The adversarial game

Two networks compete:

- **Generator G** — maps random noise \`z\` to fake samples, trying to fool the discriminator.
- **Discriminator D** — classifies samples as real or fake, trying not to be fooled.

This is a **minimax game**: \`min_G max_D  E[log D(x)] + E[log(1 − D(G(z)))]\`. As D gets better at detecting fakes, G is pushed to produce more realistic ones. At equilibrium, G's samples are indistinguishable from real data.

\`\`\`python
# alternating updates each step
loss_D = -(torch.log(D(real)) + torch.log(1 - D(G(z)))).mean()
loss_G = -torch.log(D(G(z))).mean()   # non-saturating generator loss
\`\`\`

## Why GANs are sharp

Unlike the VAE's pixel reconstruction loss (which averages and blurs), the discriminator provides a **learned** loss that rewards realism — so GANs produce crisp, detailed images. There's no explicit likelihood, just the adversarial signal.

## Training instability

The two-player dynamic is delicate. Common failures:

- **Non-convergence / oscillation** — the players cycle without settling.
- **Vanishing gradients** — if D becomes too good, G gets no useful signal (hence the non-saturating G loss).
- **Sensitivity** — to learning rates, architecture, and initialization.

Stabilizers: balanced learning rates, careful architecture (DCGAN, Day 3), label smoothing, and improved losses (WGAN with gradient penalty).

## Mode collapse

A signature GAN failure: the generator produces only a **few** types of output (e.g. one digit) because they reliably fool D, ignoring the data's full diversity. Detect it by low sample variety; mitigate with minibatch discrimination, unrolled GANs, or conditioning (Day 3). Documenting and fixing such instabilities is exactly your project's deliverable.

## Key takeaways

- A GAN trains a generator and discriminator in a minimax game; the learned adversarial loss yields sharp samples.
- Training is unstable — watch for non-convergence and vanishing gradients; use non-saturating loss and careful tuning.
- Mode collapse (limited output variety) is a hallmark failure; conditioning and architectural fixes help.`,
          },
          {
            day: 3,
            title: "DCGAN & StyleGAN2",
            domain: "advanced",
            key_concepts: ["DCGAN", "transposed convolution", "StyleGAN2", "style mixing", "progressive generation"],
            quiz_prompt:
              "Test DCGAN architectural guidelines and StyleGAN2's style-based generation and quality innovations.",
            lesson_markdown: `# DCGAN & StyleGAN2

Architecture is what made GANs actually work. DCGAN gave the stable recipe you'll implement; StyleGAN2 shows how far the idea scaled.

## DCGAN: the stable recipe

The **Deep Convolutional GAN** established architectural guidelines that made GAN training reliable:

- Replace pooling with **strided convolutions** (discriminator) and **transposed convolutions** (generator) for learned down/upsampling.
- Use **BatchNorm** in both networks (stabilizes training, Week 7).
- **ReLU** in the generator (Tanh output), **LeakyReLU** in the discriminator.
- No fully-connected hidden layers.

\`\`\`python
# DCGAN generator block: upsample with transposed conv
nn.Sequential(
    nn.ConvTranspose2d(in_c, out_c, 4, stride=2, padding=1, bias=False),
    nn.BatchNorm2d(out_c), nn.ReLU())
\`\`\`

These guidelines are your project's backbone (conditioned on class labels for the conditional variant).

## Conditional GANs

A **conditional** GAN feeds the class label to both generator and discriminator (e.g. via an embedding concatenated to the input). Now you can request "generate a 7" or a specific Fashion-MNIST class — and conditioning also helps combat mode collapse.

## StyleGAN2

**StyleGAN2** (NVIDIA) produces photorealistic faces and represents the high end of GAN design:

- A **mapping network** transforms noise into an intermediate **style** space.
- Styles are injected at each resolution via **adaptive normalization**, controlling features from coarse (pose) to fine (texture) — enabling **style mixing**.
- V2 fixed v1's "blob" artifacts with weight demodulation and improved architecture.

You won't train StyleGAN2 (it needs serious compute), but it shows how the DCGAN principles scale to state-of-the-art quality.

## Key takeaways

- DCGAN's recipe (strided/transposed convs, BatchNorm, ReLU/LeakyReLU, no FC) made GAN training stable.
- Conditional GANs feed labels to both networks for controllable, class-specific generation.
- StyleGAN2 scales the idea with a style space and per-resolution injection for photorealistic, controllable synthesis.`,
          },
          {
            day: 4,
            title: "Diffusion Models",
            domain: "advanced",
            key_concepts: ["DDPM", "DDIM", "noise schedule", "denoising", "score matching"],
            quiz_prompt:
              "Test the diffusion forward/reverse processes, DDPM training (predict the noise), noise schedules, DDIM sampling, and score-matching intuition.",
            lesson_markdown: `# Diffusion Models

Diffusion models produce the highest-quality images today and power tools like Stable Diffusion (Day 5). Their idea is elegant: learn to reverse a gradual noising process.

## Forward and reverse processes

- **Forward process** — gradually add Gaussian noise to an image over many steps until it's pure noise. This is fixed (no learning), defined by a **noise schedule**.
- **Reverse process** — train a network to **undo** one step of noising. Apply it repeatedly from pure noise to generate a clean image.

\`\`\`
x_0 (image) → ... add noise ... → x_T (pure noise)        [forward, fixed]
x_T → ... denoise step by step ... → x_0 (new image)      [reverse, learned]
\`\`\`

## DDPM training

The **Denoising Diffusion Probabilistic Model** training objective is surprisingly simple: at a random timestep, add the corresponding noise to a real image and train the network (a **U-Net**, Week 12!) to **predict the noise that was added**. The loss is just MSE between predicted and actual noise.

\`\`\`python
t = torch.randint(0, T, (batch,))
noise = torch.randn_like(x0)
xt = sqrt_acp[t]*x0 + sqrt_one_minus_acp[t]*noise   # noised image
loss = F.mse_loss(unet(xt, t), noise)               # predict the noise
\`\`\`

This stable MSE objective is why diffusion trains reliably — unlike GANs.

## Noise schedule and score matching

The **noise schedule** (linear, cosine) controls how fast noise is added; cosine schedules improve quality. The **score-matching** view: the network learns the gradient of the data log-density (the "score") pointing toward realistic images — denoising = following the score uphill.

## DDIM: faster sampling

DDPM needs hundreds–thousands of denoising steps (slow). **DDIM** reformulates sampling to be **deterministic** and skip steps, generating good images in ~20–50 steps — making diffusion practical.

## Tradeoff

Diffusion gives the **best quality and stable training**, at the cost of **slow sampling** (many network passes). DDIM and distillation narrow this gap.

## Key takeaways

- Diffusion learns to reverse a fixed noising process; a U-Net is trained to predict added noise (simple MSE loss).
- The noise schedule and the score-matching view explain how denoising steers samples toward realistic images.
- DDPM is slow (many steps); DDIM enables fast, deterministic sampling. Best quality, slow sampling.`,
          },
          {
            day: 5,
            title: "Stable Diffusion Architecture",
            domain: "advanced",
            key_concepts: ["latent diffusion", "UNet denoiser", "CLIP conditioning", "text-to-image", "cross-attention"],
            quiz_prompt:
              "Test latent diffusion (diffusing in VAE latent space), the U-Net denoiser, CLIP text conditioning, and cross-attention for text-to-image.",
            lesson_markdown: `# Stable Diffusion Architecture

Stable Diffusion made high-quality text-to-image generation accessible by running diffusion efficiently. It elegantly combines everything in this phase — VAE, U-Net, diffusion, and cross-attention conditioning.

## The efficiency problem

Running diffusion (Day 4) directly on full-resolution pixels is hugely expensive. **Latent Diffusion** (Stable Diffusion) solves this: diffuse in a **compressed latent space** instead.

## The components

1. **VAE** (Day 1) — an autoencoder compresses images to a small latent (e.g. 512×512 → 64×64). Diffusion happens here, ~48× cheaper. The VAE decoder reconstructs the final image.
2. **U-Net denoiser** (Day 4, Week 12) — predicts noise in latent space; the core trainable model.
3. **Text conditioning via CLIP** — a **CLIP** text encoder turns the prompt into embeddings.

\`\`\`
prompt → CLIP text encoder → text embeddings
noise (latent) → U-Net (conditioned on text + timestep) → denoised latent → VAE decode → image
\`\`\`

## CLIP and cross-attention

**CLIP** is trained to align image and text embeddings in a shared space (contrastive learning, Week 13) — so its text embeddings carry visual meaning. The prompt influences generation through **cross-attention** layers in the U-Net: the latent features (queries) attend to the text embeddings (keys/values, Week 16's attention), steering denoising toward the described image.

## Classifier-free guidance

To make outputs follow the prompt strongly, Stable Diffusion runs the denoiser **with and without** the text condition each step and extrapolates between them (**classifier-free guidance**). A guidance scale trades prompt adherence against diversity.

## Synthesis of the curriculum

Stable Diffusion is a capstone of everything you've learned: VAE compression, a U-Net (segmentation architecture repurposed), diffusion training, attention/cross-attention, and CLIP's contrastive multimodal learning — assembled into one system.

## Key takeaways

- Latent diffusion runs the process in a VAE's compressed latent space for huge efficiency, then decodes to an image.
- A U-Net denoiser, conditioned on CLIP text embeddings via cross-attention, drives text-to-image generation.
- Classifier-free guidance strengthens prompt adherence; Stable Diffusion unifies VAE, U-Net, diffusion, attention, and CLIP.`,
          },
        ],
      },
      {
        week: 19,
        title: "Reinforcement Learning",
        compute: "colab",
        colab_runtime: "GPU",
        colab_installs: ["gymnasium", "moviepy"],
        colab_dataset_setup: `# ── Environment Setup: CartPole ──
import gymnasium as gym
env = gym.make("CartPole-v1", render_mode="rgb_array")
print(env.observation_space, env.action_space)`,
        research_papers: [
          paper(
            "hfl",
            "HFL's resource-allocation optimization (sub-carrier assignment via greedy max-min) can be framed as a scheduling problem, connecting cellular resource management to RL policy optimization."
          ),
        ],
        project: {
          title: "DQN Cart-Pole Agent",
          description:
            "Implement DQN from scratch (experience replay, target network) on CartPole-v1. Achieve a consistent score of 500. Log training with MLflow and produce a video of the trained agent using gymnasium's render mode.",
          evaluation_criteria: [
            "Correct DQN with replay buffer + target network",
            "Consistent 500 score",
            "MLflow logging",
            "Rendered agent video",
            "Training analysis",
          ],
          starter_code: `import torch, torch.nn as nn, gymnasium as gym
from collections import deque
import random

class QNet(nn.Module):
    def __init__(self, obs, act):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(obs,128), nn.ReLU(),
                                 nn.Linear(128,128), nn.ReLU(),
                                 nn.Linear(128, act))
    def forward(self, x): return self.net(x)

replay = deque(maxlen=10000)
# TODO: epsilon-greedy, target network sync, Bellman update, MLflow, video`,
        },
        days: [
          {
            day: 1,
            title: "MDP Formulation",
            domain: "advanced",
            key_concepts: ["states", "actions", "rewards", "policy", "value functions"],
            quiz_prompt:
              "Test the Markov Decision Process: states, actions, rewards, transitions, policy, value/Q functions, and discounting.",
            lesson_markdown: `# MDP Formulation

Reinforcement learning is about agents learning to act through trial and error. The **Markov Decision Process** is its mathematical foundation — the vocabulary for everything that follows.

## The setup

An agent interacts with an environment over time:

- **State** \`s\` — the situation the agent observes (CartPole: cart position, velocity, pole angle, angular velocity).
- **Action** \`a\` — what the agent can do (push left/right).
- **Reward** \`r\` — scalar feedback after each action (+1 per timestep the pole stays up).
- **Transition** \`P(s'|s,a)\` — how the environment evolves.

The **Markov property**: the next state depends only on the current state and action, not the full history.

## The goal: maximize return

The agent maximizes **expected return** — cumulative discounted reward:

\`G_t = r_t + γ·r_{t+1} + γ²·r_{t+2} + ...\`

The **discount factor** \`γ ∈ [0,1)\` weights future rewards less, ensuring the sum is finite and expressing preference for sooner rewards.

## Policy and value functions

- **Policy** \`π(a|s)\` — the agent's strategy: a mapping from states to actions (possibly stochastic). This is what we learn.
- **State value** \`V^π(s)\` — expected return starting from \`s\` under \`π\`.
- **Action value** \`Q^π(s,a)\` — expected return from taking \`a\` in \`s\`, then following \`π\`. **Q is central to DQN** (Day 2).

The **Bellman equation** relates a state's value to its successors' values — \`Q(s,a) = r + γ·max_{a'} Q(s',a')\` — the recursive backbone of value-based RL.

## How RL differs from supervised learning

No labeled dataset — the agent generates its own data by acting, rewards are **delayed** and sparse, and actions affect future states (the data distribution depends on the policy). This makes RL uniquely challenging.

## Key takeaways

- An MDP = states, actions, rewards, transitions, with the Markov property; the agent maximizes discounted return.
- A policy maps states to actions; value (V) and action-value (Q) functions estimate expected return.
- The Bellman equation links a state's value to its successors — the basis of value-based methods like DQN.`,
          },
          {
            day: 2,
            title: "Q-Learning & Deep Q-Networks",
            domain: "advanced",
            key_concepts: ["Q-learning", "Bellman update", "experience replay", "target network", "epsilon-greedy"],
            quiz_prompt:
              "Test Q-learning, the DQN innovations (experience replay, target network), epsilon-greedy exploration, and the Bellman/TD update.",
            lesson_markdown: `# Q-Learning & Deep Q-Networks

**DQN** brought deep learning to RL, famously learning to play Atari from pixels. It's the algorithm you'll implement on CartPole.

## Q-learning

**Q-learning** learns the action-value \`Q(s,a)\` directly. Using the Bellman equation (Day 1), it updates toward the **TD target**:

\`Q(s,a) ← Q(s,a) + α[r + γ·max_{a'} Q(s',a') − Q(s,a)]\`

Once \`Q\` is learned, the optimal policy is greedy: pick \`argmax_a Q(s,a)\`. For small state spaces this is a table; for large/continuous states we need function approximation.

## Deep Q-Networks

**DQN** replaces the Q-table with a **neural network** \`Q(s,a; θ)\` that maps a state to Q-values for all actions. But naively training it on RL data is unstable. DQN added two crucial innovations:

## 1. Experience replay

Storing transitions \`(s, a, r, s')\` in a **replay buffer** and training on **random minibatches** breaks the temporal correlation between consecutive samples (which would violate the i.i.d. assumption of SGD) and reuses data efficiently.

\`\`\`python
replay.append((s, a, r, s_next, done))
batch = random.sample(replay, batch_size)   # decorrelated training data
\`\`\`

## 2. Target network

The TD target uses \`Q\` itself, so updating \`Q\` shifts the target — a moving goalpost that destabilizes training. DQN uses a **separate target network** (a periodically-copied snapshot of \`Q\`) to compute targets, keeping them stable:

\`\`\`python
target = r + gamma * Q_target(s_next).max(1).values * (1 - done)
loss = F.mse_loss(Q(s).gather(1, a), target.detach())
# every N steps: Q_target.load_state_dict(Q.state_dict())
\`\`\`

## Exploration: epsilon-greedy

To discover good actions, the agent must **explore**, not just exploit current estimates. **Epsilon-greedy** picks a random action with probability ε (decaying over training) and the greedy action otherwise — balancing exploration and exploitation.

## Key takeaways

- Q-learning updates action-values toward the Bellman TD target; the greedy policy follows argmax Q.
- DQN approximates Q with a network, stabilized by experience replay (decorrelated data) and a target network (stable targets).
- Epsilon-greedy balances exploration vs exploitation — these three pieces are your CartPole project.`,
          },
          {
            day: 3,
            title: "Policy Gradient Methods",
            domain: "advanced",
            key_concepts: ["REINFORCE", "actor-critic", "PPO", "policy optimization", "advantage"],
            quiz_prompt:
              "Test policy-gradient methods: REINFORCE, the high-variance problem, actor-critic with a baseline, and PPO's clipped objective.",
            lesson_markdown: `# Policy Gradient Methods

Instead of learning values and acting greedily (DQN), **policy gradient** methods optimize the policy directly. They handle continuous actions and stochastic policies, and underpin modern RL — including the RLHF that aligns LLMs.

## Optimizing the policy directly

Parameterize the policy \`π(a|s; θ)\` as a network and adjust θ to maximize expected return. The **policy gradient theorem** gives the gradient: increase the probability of actions that led to high return.

## REINFORCE

The simplest policy gradient: run an episode, then push up the log-probability of each action weighted by the return that followed it.

\`∇θ J ≈ Σ_t ∇θ log π(a_t|s_t) · G_t\`

\`\`\`python
loss = -(log_probs * returns).sum()   # gradient ascent on return
\`\`\`

The problem: **high variance** — returns are noisy, so learning is slow and unstable.

## Actor-critic

**Actor-critic** combines both worlds: an **actor** (policy) chooses actions, and a **critic** (value function, like DQN's V/Q) estimates expected return as a **baseline**. Using the **advantage** \`A(s,a) = Q(s,a) − V(s)\` (how much better an action is than average) instead of raw return dramatically reduces variance while keeping the gradient unbiased.

## PPO

**Proximal Policy Optimization** is the modern default — stable, sample-efficient, and easy to tune. Its key idea: limit how far the policy moves in one update (large updates destabilize RL) via a **clipped objective** that penalizes ratios straying too far from the old policy.

\`L = min(ratio·A, clip(ratio, 1−ε, 1+ε)·A)\`

PPO powers robotics, game-playing agents, and **RLHF** for aligning LLMs (the actor is the LLM, the critic/reward model scores responses) — connecting RL back to Phase 4.

## Value-based vs policy-based

- **DQN (value-based)** — discrete actions, sample-efficient, off-policy.
- **Policy gradient (PPO)** — continuous/stochastic actions, more stable for complex control, on-policy.

## Key takeaways

- Policy gradients optimize the policy directly; REINFORCE works but is high-variance.
- Actor-critic adds a value baseline (advantage) to cut variance; PPO clips updates for stability.
- PPO is the modern default and underlies RLHF for LLM alignment.`,
          },
          {
            day: 4,
            title: "Exploration & Environment Design",
            domain: "advanced",
            key_concepts: ["reward shaping", "exploration strategies", "Gymnasium", "environment wrappers", "exploration-exploitation"],
            quiz_prompt:
              "Test reward shaping and its pitfalls, exploration strategies beyond epsilon-greedy, and the Gymnasium API/wrappers.",
            lesson_markdown: `# Exploration & Environment Design

How an agent explores, and how the environment defines rewards, often matter more than the algorithm. Get these wrong and even PPO/DQN fail.

## The exploration-exploitation dilemma

An agent must **exploit** known good actions to earn reward, but **explore** to discover better ones. Too little exploration → stuck in a local optimum; too much → never capitalizes on what it learned. Strategies:

- **Epsilon-greedy** (Day 2) — simple random exploration, decayed over time.
- **Boltzmann/softmax** — sample actions proportional to their values.
- **Entropy bonus** — add policy entropy to the objective (common in PPO) to keep the policy from collapsing too early.
- **Curiosity/intrinsic rewards** — reward novel states when external reward is sparse.

## Reward shaping

The reward function defines the task. **Reward shaping** adds intermediate rewards to guide learning (e.g. reward partial progress), speeding training when rewards are sparse. But it's dangerous:

- **Reward hacking** — the agent exploits a loophole to maximize the proxy reward without achieving the goal (a boat-racing agent spinning in circles to collect points instead of finishing). This is the RL face of the spurious-correlation/shortcut problem (Week 14).
- Shaped rewards can change the optimal policy if done carelessly (use potential-based shaping to preserve it).

## Gymnasium

**Gymnasium** (the maintained successor to OpenAI Gym) is the standard RL environment API:

\`\`\`python
import gymnasium as gym
env = gym.make("CartPole-v1", render_mode="rgb_array")
obs, info = env.reset()
obs, reward, terminated, truncated, info = env.step(action)
\`\`\`

The simple \`reset\`/\`step\` loop is the interface for your CartPole project.

## Environment wrappers

**Wrappers** modify environments without changing their code — normalizing observations, clipping/scaling rewards, stacking frames, or recording video (\`RecordVideo\`, which you'll use to capture your trained agent). They compose cleanly around any environment.

## Key takeaways

- Balance exploration and exploitation via epsilon-greedy, entropy bonuses, or curiosity for sparse rewards.
- Reward shaping speeds learning but risks reward hacking — the RL version of shortcut learning.
- Gymnasium's reset/step API and wrappers (normalization, video recording) are the practical RL tooling.`,
          },
          {
            day: 5,
            title: "RL in Practice",
            domain: "advanced",
            key_concepts: ["sample efficiency", "reward hacking", "sim-to-real", "deployment challenges", "stability"],
            quiz_prompt:
              "Test practical RL challenges: sample inefficiency, reward hacking, sim-to-real gap, reproducibility, and real-world deployment risks.",
            lesson_markdown: `# RL in Practice

RL achieves spectacular results in games and simulation, but deploying it in the real world is hard. Knowing the practical pitfalls separates demos from systems.

## Sample inefficiency

RL is **data-hungry** — agents may need millions of environment interactions. That's fine in fast simulators but prohibitive when each interaction is expensive (a real robot, a physical process). Mitigations: off-policy methods (reuse data via replay, Day 2), model-based RL (learn a world model to plan), offline RL (learn from logged data), and sim-to-real transfer.

## Reward hacking, revisited

Agents optimize **exactly** what you reward, not what you intend (Day 4). In deployment this is dangerous: a recommendation agent maximizing watch-time may promote addictive or extreme content. Specifying robust reward functions — and detecting when the agent games them — is an open, safety-critical problem (and the core of AI alignment, tying to RLHF in Week 16).

## The sim-to-real gap

Policies trained in simulation often fail on real hardware because the simulator doesn't match reality (friction, sensor noise, latency — the latency-constrained edge setting of the Section 17 papers). **Domain randomization** (training across randomized simulator parameters) helps a policy generalize to the real world.

## Reproducibility and stability

RL is notoriously **high-variance** — results swing wildly across random seeds, and small implementation details (reward scaling, network init, hyperparameters) drastically change outcomes. Best practice: report results over **multiple seeds** with confidence intervals, log everything (MLflow, Week 2), and prefer stable algorithms (PPO).

## Deployment challenges

- **Safety** — exploration in the real world can cause damage; constrained/safe RL limits risky actions.
- **Non-stationarity** — the real environment changes, breaking a fixed policy (distribution shift, Week 14).
- **Monitoring** — detect when the agent encounters states unlike training (links to MLOps drift monitoring, Week 20).

## Key takeaways

- RL is sample-inefficient; off-policy, model-based, offline, and sim-to-real methods reduce real-world data needs.
- Reward hacking and the sim-to-real gap are central deployment risks; domain randomization and robust rewards help.
- RL is high-variance — evaluate over multiple seeds, log everything, and monitor for safety and distribution shift.`,
          },
        ],
      },
      {
        week: 20,
        title: "MLOps & Production ML",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        research_papers: [
          paper(
            "edge",
            "The straggler problem in coded computing is a distributed-systems analogue of fault-tolerant training pipelines, and FEEL's non-IID data is a real MLOps data-distribution concern.",
            {
              title: "FEEL with Non-IID Data",
              difficulty: "research_track",
              description:
                "Simulate federated edge learning with non-IID data: split MNIST digits by class across 10 devices (each sees only 2 classes). Train FedAvg vs an IID baseline; measure convergence speed and the accuracy gap. Connect findings to over-the-air computation.",
              colab_recommended: false,
            }
          ),
          paper(
            "dsgd",
            "Distributed training, gradient compression (quantization + sparsification), and federated averaging are all MLOps-level concerns this paper formalizes for the noisy-channel setting.",
            {
              title: "D-DSGD Gradient Sparsification",
              difficulty: "research_track",
              description:
                "Simulate distributed training on CIFAR-10 across 10 virtual devices where each sends only top-k% gradients. Compare full FedAvg vs top-1% vs top-0.1%; plot test accuracy vs total bits transmitted and find where accuracy degrades.",
              colab_recommended: true,
            }
          ),
          paper(
            "tcs",
            "Model compression (pruning, sparsification) and quantization are core MLOps topics; TCS is a research-grade answer to 'how do you make federated learning fast?' via time-correlated gradient masks."
          ),
          paper(
            "hfl",
            "Hierarchical training architectures, gradient-averaging strategies (FedAvg with H local steps), and communication-computation tradeoffs are MLOps engineering decisions.",
            {
              title: "Two-Tier Hierarchical FedAvg",
              difficulty: "research_track",
              description:
                "Simulate hierarchical FL: 3 clusters of 3 devices on MNIST. Compare standard FedAvg (all→server each round) vs HFL with H=4 (devices→cluster head each round, heads→server every 4). Compare rounds to 95% accuracy and total updates transmitted; optionally add top-k sparsification.",
              colab_recommended: false,
            }
          ),
        ],
        project: {
          title: "End-to-End ML System",
          description:
            "Build a small but complete MLOps pipeline: DVC for data versioning → a training script → MLflow tracking → a FastAPI serving endpoint → a drift-monitoring stub. Write a system design document explaining each component.",
          evaluation_criteria: [
            "DVC data versioning",
            "Training script with MLflow tracking",
            "FastAPI serving endpoint",
            "Drift-monitoring stub",
            "Clear system design document",
          ],
          starter_code: `# MLOps skeleton — wire these components together.
# 1. dvc init; dvc add data/raw.csv        # data versioning
# 2. train.py: train model, mlflow.log_metric(...), mlflow.sklearn.log_model(...)
# 3. serve.py: FastAPI /predict loading the MLflow model
# 4. monitor.py: compare incoming feature distribution vs training (drift stub)
print("Build the end-to-end pipeline; document each stage")`,
        },
        days: [
          {
            day: 1,
            title: "ML Pipelines & Data Versioning",
            domain: "advanced",
            key_concepts: ["DVC", "data versioning", "feature stores", "pipelines", "reproducibility"],
            quiz_prompt:
              "Test ML pipeline concepts, data versioning with DVC, feature stores, and why reproducibility needs versioned data + code.",
            lesson_markdown: `# ML Pipelines & Data Versioning

Research code trains a model once; production ML must retrain reliably as data changes. MLOps brings software-engineering discipline to ML — starting with versioning everything.

## Why pipelines

A model in production is the end of a **pipeline**: ingest data → validate → transform → train → evaluate → deploy. Treating these as reproducible, automated stages (not ad-hoc notebooks) is what lets you retrain confidently and trace any model back to its inputs.

## The reproducibility problem

To reproduce a model you need the exact **code AND data AND config**. Git versions code, but datasets are too large for Git and change over time. Without data versioning, "the model from last month" is irreproducible — a core failure of ad-hoc ML.

## DVC: data version control

**DVC** versions large data alongside Git. It stores lightweight pointers in Git while the actual data lives in remote storage (S3, GCS), so you can \`git checkout\` a commit and \`dvc pull\` the exact data that produced a model.

\`\`\`bash
dvc init
dvc add data/train.csv      # tracks the file, stores a .dvc pointer in Git
dvc remote add storage s3://bucket/dvc
dvc push                    # upload data to remote
\`\`\`

DVC can also define pipeline stages (\`dvc.yaml\`) with dependencies, re-running only what changed.

## Feature stores

A **feature store** centralizes computed features so training and serving use **identical** feature logic — preventing **training-serving skew** (a notorious bug where features are computed differently in production than in training). It also enables feature reuse across models. (This is the productionized version of the SQL feature engineering from Week 3.)

## Key takeaways

- Production ML is a reproducible, automated pipeline, not a one-off notebook.
- Reproducibility requires versioning code + data + config; DVC versions large data alongside Git.
- Feature stores serve consistent features to training and serving, preventing training-serving skew.`,
          },
          {
            day: 2,
            title: "Model Serving",
            domain: "advanced",
            key_concepts: ["FastAPI", "Triton", "batching", "model packaging", "latency"],
            quiz_prompt:
              "Test model serving patterns: REST APIs (FastAPI), dedicated servers (Triton), dynamic batching, and latency/throughput considerations.",
            lesson_markdown: `# Model Serving

A trained model creates value only when it serves predictions. Serving turns a model artifact into a reliable, scalable service — building on the deployment patterns from Week 13.

## Serving patterns

- **Embedded** — the model runs inside the application process. Simplest, lowest latency, but couples model and app lifecycles.
- **Model-as-a-service** — the model runs behind its own API (REST/gRPC). Decoupled, independently scalable, language-agnostic. The standard for most systems.
- **Batch/offline** — predictions precomputed on a schedule for non-real-time use.

## FastAPI serving

For Python, **FastAPI** is the go-to for a prediction microservice (Week 13). Load the model once at startup, expose a \`/predict\` endpoint, and add validation and health checks:

\`\`\`python
from fastapi import FastAPI
import mlflow.pyfunc
app = FastAPI()
model = mlflow.pyfunc.load_model("models:/churn/Production")   # from registry

@app.post("/predict")
def predict(features: dict):
    return {"prediction": model.predict([features]).tolist()}
\`\`\`

Loading from the MLflow **model registry** (Week 2) ties serving to a versioned, promoted model.

## Dedicated inference servers

For high-throughput GPU serving, **Triton Inference Server** (NVIDIA) handles multiple models/frameworks, **dynamic batching**, concurrent model execution, and GPU scheduling — more capable than a hand-rolled FastAPI app at scale.

## Batching and latency

As in Week 13: **dynamic batching** groups requests to exploit GPU parallelism, trading a little latency for much higher throughput. Monitor **tail latency** (p95/p99), warm up the model, and autoscale on load. Decide your latency budget up front — it drives every serving choice.

## Key takeaways

- Choose embedded, model-as-a-service, or batch serving by latency and coupling needs; MaaS is the common default.
- FastAPI + the MLflow registry gives a clean, versioned prediction service.
- Triton adds dynamic batching and GPU scheduling for scale; always monitor tail latency.`,
          },
          {
            day: 3,
            title: "Monitoring & Drift Detection",
            domain: "advanced",
            key_concepts: ["data drift", "concept drift", "model degradation", "Evidently AI", "alerting"],
            quiz_prompt:
              "Test production monitoring: data drift vs concept drift, detecting model degradation, monitoring tools (Evidently), and alerting.",
            lesson_markdown: `# Monitoring & Drift Detection

A deployed model silently degrades as the world changes. Monitoring is what keeps production ML trustworthy over time — and it's the drift stub you'll build this week.

## Why models degrade

Unlike traditional software, an ML model can be **correct code that gives wrong answers** because the input distribution has shifted from training (distribution shift, Week 14). Performance decays without any code change — so you must monitor it.

## Data drift vs concept drift

- **Data drift (covariate shift)** — the input distribution changes (new user demographics, seasonal patterns). The model sees inputs unlike training.
- **Concept drift** — the input→output relationship changes (fraud patterns evolve, so the same features now mean something different).

Detect data drift by comparing the **distribution** of incoming features to the training distribution — statistical tests (KS test, population stability index) or distance metrics:

\`\`\`python
from scipy.stats import ks_2samp
stat, p = ks_2samp(train_feature, live_feature)
if p < 0.05:
    alert("Feature distribution drift detected")
\`\`\`

This is exactly the kind of drift stub your project includes.

## Monitoring ground truth

When labels eventually arrive, monitor **actual performance** (accuracy, AUC) over time — the ultimate signal. But labels are often delayed, which is why distribution drift is a useful **early warning** before performance drops.

## Tools and alerting

**Evidently AI** generates drift and performance reports/dashboards out of the box; **Prometheus + Grafana** handle operational metrics (latency, throughput, error rate). Set **alerts** on drift scores and performance thresholds so degradation triggers investigation or **automated retraining** (Day 4) — not a user complaint.

## What to monitor

- **Input** — feature distributions, missing values, out-of-range values.
- **Output** — prediction distribution (a sudden shift signals a problem).
- **Performance** — metrics when labels arrive.
- **Operational** — latency, throughput, errors.

## Key takeaways

- Models degrade silently via data drift (inputs shift) and concept drift (input→output relationship changes).
- Detect data drift by comparing live vs training feature distributions (KS test, PSI) as an early warning before labels arrive.
- Use Evidently/Prometheus dashboards and alerts to trigger investigation or automated retraining.`,
          },
          {
            day: 4,
            title: "CI/CD for ML",
            domain: "advanced",
            key_concepts: ["GitHub Actions", "automated testing", "retraining triggers", "CML", "deployment automation"],
            quiz_prompt:
              "Test CI/CD adapted for ML: automated testing of data/models, retraining triggers, GitHub Actions pipelines, and safe deployment strategies.",
            lesson_markdown: `# CI/CD for ML

Continuous Integration/Deployment automates testing and releasing software. ML adds new things to test and automate — data, models, and retraining.

## CI/CD recap and the ML twist

**CI** automatically tests every code change; **CD** automatically deploys passing changes. Traditional CI tests code. **ML CI/CD** must also validate **data** and **models** — code can be perfect while a data or model issue ships a broken predictor.

## What to test in ML

- **Code tests** — unit tests for preprocessing and feature logic.
- **Data tests** — schema validation, value ranges, null rates, distribution checks (catch bad data before training).
- **Model tests** — does the new model beat a baseline / the current production model on a held-out set? Does it meet minimum metrics? Check for performance regressions on key slices (including fairness subgroups, Week 21).
- **Behavioral tests** — invariance and known input→output expectations.

## GitHub Actions pipeline

A typical workflow on each push: run tests → train (or evaluate) → compare metrics → if better, register the model and deploy.

\`\`\`yaml
on: [push]
jobs:
  train-eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: dvc pull && python train.py
      - run: python evaluate.py   # fail the job if metrics regress
\`\`\`

**CML** (Continuous Machine Learning) posts metrics/plots as comments on pull requests, so model changes are reviewed like code.

## Retraining triggers

Models need refreshing. Automate retraining on: a **schedule** (nightly/weekly), **drift detection** (Day 3 alerts), or **performance drop**. Crucially, automated retraining must run through the **same tested pipeline** — never auto-deploy an unvalidated model.

## Safe deployment

Reduce risk with **shadow deployment** (run the new model alongside, compare without serving its outputs), **canary** (route a small % of traffic), and **rollback** plans. Never flip 100% of traffic to an unproven model.

## Key takeaways

- ML CI/CD tests code, data, and models — and gates deployment on beating the current model without regressions.
- GitHub Actions + DVC + CML automate train/evaluate/review on every change.
- Trigger retraining by schedule/drift/performance through the validated pipeline; deploy safely via shadow/canary with rollback.`,
          },
          {
            day: 5,
            title: "Responsible AI Frameworks",
            domain: "advanced",
            key_concepts: ["model cards", "datasheets", "audit trails", "governance", "documentation"],
            quiz_prompt:
              "Test responsible-AI documentation: model cards, datasheets for datasets, audit trails, and governance for accountability.",
            lesson_markdown: `# Responsible AI Frameworks

Production ML affects people, so it needs documentation, accountability, and governance — not just accuracy. These frameworks operationalize responsibility and lead into the fairness focus of Week 21.

## Model cards

A **model card** is a short standardized document accompanying a model. It states: intended use (and **out-of-scope** uses), training data, evaluation results **disaggregated by relevant groups** (Week 14's bias audit), limitations, and ethical considerations. It lets users decide whether a model is appropriate for *their* context — you wrote one in the Week 4 Churn Predictor project.

\`\`\`
## Model Card: Churn Predictor v2
- Intended use: flag at-risk customers for retention outreach
- Out of scope: denying service, credit decisions
- Data: 50k customers, 2023; skews toward urban accounts
- Performance: AUC 0.84 overall; 0.79 on rural segment (gap noted)
- Limitations: degrades under seasonal promotions; retrain quarterly
\`\`\`

## Datasheets for datasets

A **datasheet** documents a dataset: why and how it was collected, its composition, known biases, consent/licensing, and recommended uses. Since data drives model behavior (and bias, Weeks 14/17), documenting the dataset is as important as documenting the model.

## Audit trails

An **audit trail** records what happened: which data and code version produced a model (DVC + Git + MLflow, Days 1–2), who approved deployment, what predictions were made. Essential for debugging, compliance (GDPR, the EU AI Act), and accountability when a model causes harm.

## Governance

**ML governance** is the organizational process: review boards for high-risk models, approval gates before deployment, defined ownership, and periodic re-audits. It ensures responsibility doesn't depend on individual goodwill but is built into the process — the structure within which the fairness work of Week 21 actually gets enforced.

## Key takeaways

- Model cards document intended use, disaggregated performance, and limitations so models are used appropriately.
- Datasheets document a dataset's collection, composition, and known biases.
- Audit trails (versioned data/code/decisions) and governance processes provide accountability and compliance.`,
          },
        ],
      },
      {
        week: 21,
        title: "AI Bias & Fairness",
        compute: "local",
        colab_runtime: "CPU",
        colab_installs: [],
        research_papers: [
          paper(
            "edge",
            "Non-IID data distribution in federated edge learning is a form of representation bias — devices with skewed data bias the global model toward majority-data clients."
          ),
          paper(
            "dsgd",
            "A-DSGD/D-DSGD explore non-IID data across devices as a bias source: clients with skewed datasets pull the global model toward their own distribution."
          ),
          paper(
            "hfl",
            "HFL honestly acknowledges that non-IID data across clusters creates systematic bias — cluster-level models overfit to local demographics — a model case study in responsible ML limitation-reporting."
          ),
        ],
        project: {
          title: "Bias Audit & Mitigation",
          description:
            "Take a hiring/credit/recidivism dataset (Adult Income or COMPAS). Train a classifier, measure fairness metrics across demographic groups, then apply one pre-processing and one post-processing mitigation. Report before/after fairness comparison and an accuracy-fairness tradeoff analysis.",
          evaluation_criteria: [
            "Correct fairness-metric computation per group",
            "One pre-processing mitigation applied",
            "One post-processing mitigation applied",
            "Before/after comparison",
            "Honest accuracy-fairness tradeoff analysis",
          ],
          starter_code: `import pandas as pd
from sklearn.linear_model import LogisticRegression
from fairlearn.metrics import MetricFrame, demographic_parity_difference

df = pd.read_csv("assets/datasets/adult.csv")
sensitive = df["sex"]
# TODO: train classifier; compute demographic parity & equalized odds per group;
# apply reweighing (pre) + threshold optimization (post); compare; plot tradeoff`,
        },
        days: [
          {
            day: 1,
            title: "Types of Bias",
            domain: "advanced",
            key_concepts: ["historical bias", "representation bias", "measurement bias", "aggregation bias", "deployment bias"],
            quiz_prompt:
              "Test the taxonomy of bias sources: historical, representation, measurement, aggregation, and deployment bias, with examples.",
            lesson_markdown: `# Types of Bias

"Bias" is not one thing — it enters ML at every stage, from the world to the data to the model to deployment. Naming the source is the first step to addressing it.

## A taxonomy of bias

- **Historical bias** — the world itself is unequal, so even perfectly collected data reflects it. A hiring model trained on past hires learns historical discrimination, even with flawless data. This is about the world, not a data error.
- **Representation bias** — the data under-represents some groups. Face datasets skewed toward lighter skin (Week 14) or federated data skewed across devices (the Section 17 non-IID setting) under-serve minorities.
- **Measurement bias** — features or labels are measured differently across groups. "Arrests" as a proxy for "crime" reflects biased policing, not actual crime; sensors calibrated for one group mismeasure others.
- **Aggregation bias** — a single model assumed to fit all groups when subgroups differ, so it serves none well (Week 14). A one-size-fits-all model masks group-specific patterns.
- **Deployment bias** — a model used differently than intended, or in a context it wasn't designed for (a risk-assessment tool meant to inform becomes a decision-maker).

## Why the taxonomy matters

Each source needs a different fix:
- Historical → question whether to build the model at all; choose labels carefully.
- Representation → collect balanced data, reweight.
- Measurement → fix proxies and instruments.
- Aggregation → group-aware models or features.
- Deployment → governance, model cards, monitoring (Week 20).

## Bias is not just "bad data"

A crucial insight: you **cannot** fully fix bias by cleaning data, because some bias (historical, measurement) is baked into how the world generates the data. This is why fairness requires explicit metrics and mitigations (the rest of this week), plus governance and human judgment.

## Key takeaways

- Bias enters at every stage: historical (the world), representation (the sample), measurement (proxies/sensors), aggregation (one model for all), deployment (misuse).
- Each source demands a different remedy — diagnosis precedes mitigation.
- You can't fully clean away bias, because some is inherent to how data is generated — fairness needs explicit metrics, mitigation, and governance.`,
          },
          {
            day: 2,
            title: "Fairness Metrics",
            domain: "advanced",
            key_concepts: ["demographic parity", "equalized odds", "calibration", "impossibility theorems", "group fairness"],
            quiz_prompt:
              "Test fairness metrics: demographic parity, equalized odds, calibration, and the impossibility of satisfying them simultaneously.",
            lesson_markdown: `# Fairness Metrics

To address bias you must measure it, but "fair" has multiple, mathematically conflicting definitions. Choosing the right metric is a value-laden decision tied to context.

## Group fairness definitions

For a sensitive attribute (e.g. sex, race) with groups A and B:

- **Demographic parity** — the positive prediction rate is equal across groups: \`P(ŷ=1|A) = P(ŷ=1|B)\`. The model approves loans at equal rates regardless of group. Ignores actual qualification, which can be a feature or a bug.
- **Equalized odds** — true-positive and false-positive rates are equal across groups: the model is equally accurate for each. A qualified person has the same chance of approval regardless of group.
- **Equal opportunity** — a relaxation requiring only equal **true-positive** rates.
- **Calibration** — a predicted probability means the same thing across groups (a "70% risk" score corresponds to 70% actual rate in every group).

\`\`\`python
from fairlearn.metrics import demographic_parity_difference, equalized_odds_difference
dp = demographic_parity_difference(y_true, y_pred, sensitive_features=sex)
eo = equalized_odds_difference(y_true, y_pred, sensitive_features=sex)
\`\`\`

## The impossibility theorems

A pivotal result: **you cannot satisfy all fairness criteria at once** (except in degenerate cases). Specifically, when base rates differ across groups, **calibration and equalized odds are mathematically incompatible**. The COMPAS debate hinged on exactly this — the tool was calibrated but had unequal false-positive rates, and both sides were "right" by different metrics.

## Choosing a metric

There's no universal answer — it depends on the **harm**:
- Care about equal *access* (hiring, lending) → demographic parity / equal opportunity.
- Care about equal *accuracy* (medical, risk) → equalized odds.
- Use scores as probabilities → calibration.

This choice is **ethical and contextual**, not purely technical — and must be made explicitly, ideally with stakeholders.

## Key takeaways

- Group fairness has multiple definitions: demographic parity (equal positive rates), equalized odds (equal TPR/FPR), calibration (scores mean the same).
- Impossibility theorems prove these conflict when base rates differ — you must choose.
- The right metric depends on the harm and is an explicit ethical/contextual decision.`,
          },
          {
            day: 3,
            title: "Bias Mitigation Techniques",
            domain: "advanced",
            key_concepts: ["pre-processing", "in-processing", "post-processing", "reweighing", "threshold adjustment"],
            quiz_prompt:
              "Test the three families of mitigation — pre-processing (resampling/reweighing), in-processing (adversarial/constrained), post-processing (threshold adjustment) — and their tradeoffs.",
            lesson_markdown: `# Bias Mitigation Techniques

Once you've measured unfairness (Day 2), you can intervene at three stages of the pipeline. Your project applies one pre-processing and one post-processing method.

## Pre-processing: fix the data

Modify the **training data** so the model learns fairer patterns, before training:

- **Reweighing** — assign sample weights so that (group, label) combinations are balanced, countering representation/historical imbalance.
- **Resampling** — over/undersample to balance groups.
- **Relabeling / fair representations** — learn transformed features that remove sensitive information.

\`\`\`python
# Reweighing: upweight under-represented (group, label) cells
from aif360.algorithms.preprocessing import Reweighing
\`\`\`

Pros: model-agnostic, applied once. Cons: may not fully remove bias the model can reconstruct from correlated features.

## In-processing: fix the training

Build fairness into the **objective**:

- **Adversarial debiasing** — train the predictor while an adversary tries to predict the sensitive attribute from its outputs; the predictor learns to be accurate yet uninformative about the protected group.
- **Constrained optimization** — optimize accuracy subject to a fairness constraint (e.g. Fairlearn's \`ExponentiatedGradient\`).

Pros: directly targets the tradeoff. Cons: more complex, model-specific.

## Post-processing: fix the outputs

Adjust **predictions** after training, treating the model as a black box:

- **Group-specific thresholds** — choose different decision thresholds per group to equalize a chosen metric (e.g. equalized odds), since one global threshold rarely satisfies fairness when base rates differ.

\`\`\`python
from fairlearn.postprocessing import ThresholdOptimizer
ThresholdOptimizer(estimator=clf, constraints="equalized_odds").fit(X, y, sensitive_features=s)
\`\`\`

Pros: simple, no retraining, works on any model. Cons: needs the sensitive attribute at prediction time, and explicit group-based thresholds may be legally fraught.

## Choosing a stage

Pre-processing when you control data; in-processing for the best accuracy-fairness frontier; post-processing when the model is fixed/external. Often combine them — and always re-measure (Day 2 metrics) after mitigation.

## Key takeaways

- Mitigate at three stages: pre-processing (reweighing/resampling), in-processing (adversarial/constrained), post-processing (group thresholds).
- Each trades complexity, control, and effectiveness; post-processing is simplest but needs the sensitive attribute at inference.
- Always re-measure fairness after mitigation and consider combining methods.`,
          },
          {
            day: 4,
            title: "Auditing Tools",
            domain: "advanced",
            key_concepts: ["Fairlearn", "AI Fairness 360", "Aequitas", "disaggregated evaluation", "fairness dashboards"],
            quiz_prompt:
              "Test fairness auditing tools (Fairlearn, AIF360, Aequitas), disaggregated evaluation, and how they fit a responsible-ML workflow.",
            lesson_markdown: `# Auditing Tools

Open-source toolkits operationalize the metrics and mitigations from this week, making fairness auditing a repeatable engineering practice rather than bespoke analysis.

## Disaggregated evaluation, formalized

The core practice (Week 14) is **disaggregation**: compute every metric **per group**, not just overall. These tools automate that and the fairness metrics of Day 2.

## Fairlearn

**Fairlearn** (Microsoft) is the most accessible, integrating with scikit-learn:

- \`MetricFrame\` — compute any metric grouped by sensitive features, with disparities.
- Mitigation — \`ExponentiatedGradient\` (in-processing), \`ThresholdOptimizer\` (post-processing).
- An interactive fairness dashboard.

\`\`\`python
from fairlearn.metrics import MetricFrame
from sklearn.metrics import accuracy_score, recall_score
mf = MetricFrame(metrics={"acc": accuracy_score, "recall": recall_score},
                 y_true=y, y_pred=preds, sensitive_features=sex)
print(mf.by_group)        # per-group metrics
print(mf.difference())    # disparities
\`\`\`

This is exactly the audit at the heart of your project.

## AI Fairness 360

**AIF360** (IBM) is the most comprehensive: ~70 fairness metrics and many mitigation algorithms across all three stages (Day 3). Heavier and research-oriented, with its own dataset abstractions — use it when you need a wide range of formal metrics.

## Aequitas

**Aequitas** focuses on **policy and audit reporting**: it produces a "fairness tree" guiding you to relevant metrics for your context and generates bias reports aimed at decision-makers and auditors — strong for the reporting/governance side (Week 20).

## Fitting into the workflow

Auditing isn't one-time. Embed it in CI/CD (Week 20, Day 4): run a fairness check on every model candidate, gate deployment on disparity thresholds, and re-audit on a schedule as data drifts. Pair the numbers with model cards (Week 20) documenting the results.

## Key takeaways

- Fairness tools automate disaggregated, per-group evaluation and standard metrics/mitigations.
- Fairlearn (scikit-friendly, MetricFrame + mitigators), AIF360 (comprehensive), Aequitas (policy/reporting) suit different needs.
- Embed audits in CI/CD with disparity gates, re-audit as data drifts, and document via model cards.`,
          },
          {
            day: 5,
            title: "Case Studies",
            domain: "advanced",
            key_concepts: ["COMPAS", "facial recognition bias", "hiring algorithms", "real-world harm", "lessons learned"],
            quiz_prompt:
              "Test the landmark fairness case studies (COMPAS recidivism, facial recognition, hiring algorithms), what went wrong, and the lessons.",
            lesson_markdown: `# Case Studies

Abstract fairness concepts become vivid — and urgent — through real failures. These cases show how the bias types, metric conflicts, and missing governance from this week play out with serious human consequences.

## COMPAS — recidivism prediction

**COMPAS** scored criminal defendants' reoffending risk, used in bail/sentencing. A 2016 ProPublica investigation found Black defendants were ~2× as likely to be **falsely** flagged high-risk (higher false-positive rate), while white defendants were more often falsely flagged low-risk.

The twist: the vendor showed COMPAS was **calibrated** (a given score meant the same reoffending rate across races). Both were right — this is the **impossibility theorem** (Day 2) in the real world: with different base rates, you cannot have equal false-positive rates *and* calibration. The deeper issue was **measurement bias** — "rearrest" reflects biased policing, not true crime (Day 1).

## Facial recognition — Gender Shades

Buolamwini & Gebru's **Gender Shades** (Week 14) audited commercial gender classifiers: near-perfect on lighter-skinned men, up to **35% error** on darker-skinned women. Cause: **representation bias** in training data. Impact: wrongful arrests from face-recognition misidentifications, disproportionately of Black individuals — leading several vendors and cities to pause or ban the technology.

## Hiring algorithms — Amazon

Amazon built a résumé-screening model trained on a decade of past hires. Because the tech workforce was male-dominated, the model learned to **penalize** résumés containing "women's" (as in "women's chess club") — **historical bias** (Day 1) encoded directly. Amazon scrapped it. Lesson: a model trained on biased outcomes reproduces and automates that bias at scale.

## Cross-cutting lessons

- **Measure disaggregated** — overall accuracy hid every one of these failures.
- **Metric choice is consequential** — COMPAS shows different fair definitions conflict; pick deliberately.
- **Question the label** — biased proxies (arrests, past hires) doom the model regardless of technique.
- **Governance matters** — audits, model cards, and the choice *not to deploy* (Week 20) are part of responsible ML.
- **Your capstone** — the Bias Audit & Mitigation project applies exactly these tools to Adult Income/COMPAS: measure, mitigate, and honestly report the accuracy-fairness tradeoff.

## Key takeaways

- COMPAS embodies the calibration-vs-equalized-odds impossibility and measurement bias in a high-stakes setting.
- Gender Shades (representation bias) and Amazon hiring (historical bias) show real harm from undiagnosed bias.
- The throughline: disaggregate metrics, choose fairness definitions deliberately, scrutinize labels, and govern deployment — sometimes the right model is none.`,
          },
        ],
      },
    ],
  },
];

// ── Helpers consumed by the store and pages ──

// Flatten all days across the curriculum, in order, with phase/week context.
export function flattenDays() {
  const out = [];
  for (const phase of CURRICULUM) {
    for (const wk of phase.weeks) {
      for (const d of wk.days) {
        out.push({
          ...d,
          id: `p${phase.phase}_w${wk.week}_d${d.day}`,
          phase: phase.phase,
          phaseTitle: phase.title,
          week: wk.week,
          weekTitle: wk.title,
        });
      }
    }
  }
  return out;
}

export function getWeek(phaseNum, weekNum) {
  const phase = CURRICULUM.find((p) => p.phase === phaseNum);
  return phase?.weeks.find((w) => w.week === weekNum) || null;
}

export function getDay(topicId) {
  return flattenDays().find((d) => d.id === topicId) || null;
}

// Domains present per phase, used by the radar chart.
export const PHASE_DOMAIN = {
  0: "foundations",
  1: "classical_ml",
  2: "deep_learning",
  3: "cv",
  4: "nlp",
  5: "advanced",
};
