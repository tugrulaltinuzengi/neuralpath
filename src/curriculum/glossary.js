// Glossary of specialized terms used across the curriculum.
//
// Every lesson is plain markdown. The rehype plugin in src/lib/rehypeGlossary.js
// scans the rendered text and wraps the FIRST occurrence of any term below in a
// dotted-underline span. Hovering (or focusing) it pops up the definition here,
// plus a Wolfram-rendered figure when the entry names a `plot` key from plots.js.
//
// Entry shape:
//   { id, label, terms: ["alias", ...], def: "1-2 sentences", plot?: "<plots.js key>" }
//
//   - `terms` are matched case-insensitively on whole-word boundaries. List the
//     plural / common variants you want caught. Multi-word terms win over the
//     single words inside them (the matcher prefers the longest match).
//   - keep `def` beginner-friendly: assume the reader has NOT seen the term before.

import { PLOTS } from "./plots.js";

export const GLOSSARY_ENTRIES = [
  // ── Datasets & jargon a newcomer won't recognize ──────────────────
  {
    id: "iris",
    label: "Iris dataset",
    terms: ["Iris flower", "Iris dataset", "Iris"],
    def: "A classic 150-row beginner dataset: four flower measurements (sepal/petal length & width) for three iris species. It is the “hello world” of classification — small, clean, and easy to visualize.",
  },
  {
    id: "wine",
    label: "Wine dataset",
    terms: ["Wine dataset", "Wine"],
    def: "A UCI dataset of 178 wines described by 13 chemical measurements, labeled by which of three cultivars they came from. Often paired with Iris for practicing classification and EDA.",
  },
  {
    id: "mnist",
    label: "MNIST",
    terms: ["MNIST"],
    def: "70,000 small (28×28 pixel) grayscale images of handwritten digits 0–9. The standard first benchmark for image classifiers.",
  },
  {
    id: "cifar",
    label: "CIFAR-10",
    terms: ["CIFAR-10", "CIFAR10", "CIFAR"],
    def: "60,000 tiny 32×32 color photos in 10 everyday classes (cat, ship, truck…). A step up from MNIST and a common CNN benchmark.",
  },
  {
    id: "imagenet",
    label: "ImageNet",
    terms: ["ImageNet"],
    def: "A ~1.2-million-image dataset spanning 1,000 categories. Pretraining on ImageNet is the source of most off-the-shelf vision models.",
  },
  {
    id: "imdb",
    label: "IMDB dataset",
    terms: ["IMDB"],
    def: "50,000 movie reviews labeled positive or negative — the standard benchmark for binary sentiment classification.",
  },
  {
    id: "compas",
    label: "COMPAS",
    terms: ["COMPAS"],
    def: "A criminal-risk-scoring tool whose racially biased predictions became the textbook case study in algorithmic fairness.",
  },

  // ── Linear algebra (Week 1) ───────────────────────────────────────
  {
    id: "vector",
    label: "Vector",
    terms: ["vectors", "vector"],
    def: "An ordered list of numbers, e.g. one data point described by its features. Geometrically, an arrow from the origin in d-dimensional space.",
  },
  {
    id: "dot-product",
    label: "Dot product",
    terms: ["dot product", "dot products"],
    def: "Multiply two vectors element-by-element and sum the result. It measures how aligned they are — it is zero when they are perpendicular, and is the core operation inside every neuron (w·x + b).",
  },
  {
    id: "matmul",
    label: "Matrix multiplication",
    terms: ["matrix multiplication", "matrix multiply", "matmul"],
    def: "Combining two matrices so each output cell is the dot product of a row and a column. One matrix multiply applies a whole neural-network layer to a whole batch at once.",
  },
  {
    id: "transpose",
    label: "Transpose",
    terms: ["transpose"],
    def: "Flipping a matrix over its diagonal so rows become columns. Written Aᵀ; used constantly to line up shapes for multiplication.",
  },
  {
    id: "inverse",
    label: "Matrix inverse",
    terms: ["matrix inverse", "inverse"],
    def: "The matrix A⁻¹ that undoes A (A·A⁻¹ = I). It exists only for full-rank square matrices and underlies closed-form least-squares solutions.",
  },
  {
    id: "norm",
    label: "L2 norm",
    terms: ["L2 norm", "Euclidean norm", "norm"],
    def: "The length of a vector: the square root of the sum of its squared entries. Norms define distances, loss magnitudes, and regularization penalties.",
  },
  {
    id: "eigen",
    label: "Eigenvalues & eigenvectors",
    terms: ["eigenvalues", "eigenvalue", "eigenvectors", "eigenvector"],
    def: "An eigenvector is a direction a matrix only stretches (never rotates); its eigenvalue is how much it stretches. Symmetric matrices like covariance matrices always have real eigenvalues — which is why PCA works cleanly.",
    plot: "eigenvector",
  },
  {
    id: "svd",
    label: "Singular Value Decomposition",
    terms: ["SVD", "singular value decomposition", "singular values"],
    def: "Factoring any matrix as A = UΣVᵀ, ranking its directions by importance. The numerically stable workhorse behind PCA, pseudo-inverses, and low-rank compression.",
    plot: "eigenvector",
  },
  {
    id: "pca",
    label: "Principal Component Analysis (PCA)",
    terms: ["PCA", "principal component analysis", "principal components"],
    def: "A way to compress data by rotating it onto the directions of greatest variance (the top eigenvectors of the covariance matrix), then keeping only the first few.",
    plot: "pca-variance",
  },
  {
    id: "variance-explained",
    label: "Variance explained",
    terms: ["variance explained", "scree plot"],
    def: "The fraction of the data's total spread captured by each principal component. A scree plot shows it dropping off, helping you decide how many components to keep.",
    plot: "pca-variance",
  },

  // ── Calculus & probability (Weeks 1, 4) ───────────────────────────
  {
    id: "gradient",
    label: "Gradient",
    terms: ["gradient", "gradients", "partial derivatives", "partial derivative"],
    def: "The vector of slopes of a function with respect to each input — it points in the direction of steepest increase. Training follows the negative gradient downhill.",
    plot: "gradient-descent",
  },
  {
    id: "gradient-descent",
    label: "Gradient descent",
    terms: ["gradient descent"],
    def: "The core training algorithm: repeatedly nudge the parameters a small step in the opposite direction of the gradient to reduce the loss.",
    plot: "gradient-descent",
  },
  {
    id: "chain-rule",
    label: "Chain rule",
    terms: ["chain rule"],
    def: "The calculus rule for differentiating nested functions. Backpropagation is just the chain rule applied layer by layer through a network.",
    plot: "gradient-descent",
  },
  {
    id: "jacobian",
    label: "Jacobian",
    terms: ["Jacobian", "Jacobians"],
    def: "The matrix of all first-order partial derivatives of a vector-valued function — how every output responds to every input.",
  },
  {
    id: "backprop",
    label: "Backpropagation",
    terms: ["backpropagation", "backprop"],
    def: "The algorithm that computes a network's gradients efficiently by applying the chain rule backward from the loss to every weight.",
    plot: "gradient-descent",
  },
  {
    id: "distribution",
    label: "Probability distribution",
    terms: ["probability distribution", "distributions", "distribution"],
    def: "A description of how likely each value of a random quantity is. The normal (Gaussian) distribution — the bell curve — is the most common in ML.",
    plot: "normal-distribution",
  },
  {
    id: "variance",
    label: "Variance",
    terms: ["variance"],
    def: "How spread out a distribution is around its mean — the average squared distance from the center. Its square root is the standard deviation.",
    plot: "normal-distribution",
  },
  {
    id: "expectation",
    label: "Expectation",
    terms: ["expectation", "expected value"],
    def: "The long-run average of a random quantity, weighting each outcome by its probability.",
    plot: "normal-distribution",
  },
  {
    id: "bayes",
    label: "Bayes' theorem",
    terms: ["Bayes theorem", "Bayes' theorem", "Bayes"],
    def: "The rule for updating a belief after seeing evidence: posterior ∝ likelihood × prior. The foundation of probabilistic inference.",
  },
  {
    id: "mle",
    label: "Maximum Likelihood Estimation",
    terms: ["MLE", "maximum likelihood"],
    def: "Choosing the model parameters that make the observed data most probable. Minimizing cross-entropy loss is MLE in disguise.",
  },

  // ── Pandas / NumPy (Week 1–2) ──────────────────────────────────
  {
    id: "broadcasting",
    label: "Broadcasting",
    terms: ["broadcasting"],
    def: "NumPy's rule for combining arrays of different shapes by automatically stretching the smaller one — so you can add a vector to every row of a matrix without a loop.",
  },
  {
    id: "vectorization",
    label: "Vectorization",
    terms: ["vectorization", "vectorized operations"],
    def: "Replacing explicit Python loops with whole-array operations that run in fast compiled code. The key to performant NumPy/Pandas.",
  },
  {
    id: "dataframe",
    label: "DataFrame",
    terms: ["DataFrames", "DataFrame"],
    def: "Pandas' table structure: labeled columns of mixed types with a row index. The spreadsheet of Python data work.",
  },

  // ── Classical ML (Weeks 4–6) ──────────────────────────────────
  {
    id: "ols",
    label: "Ordinary Least Squares (OLS)",
    terms: ["OLS", "ordinary least squares"],
    def: "Fitting a line/plane by minimizing the sum of squared errors between predictions and targets — the classic linear-regression objective.",
  },
  {
    id: "regularization",
    label: "Regularization (L1 / L2)",
    terms: ["regularization", "L1/L2", "L1", "L2", "Ridge", "Lasso", "ElasticNet"],
    def: "Adding a penalty on large weights to curb overfitting. Ridge (L2) shrinks weights smoothly; Lasso (L1) drives some to exactly zero, selecting features.",
    plot: "regularization",
  },
  {
    id: "sigmoid",
    label: "Sigmoid",
    terms: ["sigmoid"],
    def: "The S-shaped function that squashes any number into a probability between 0 and 1. It turns a linear score into the output of logistic regression.",
    plot: "sigmoid",
  },
  {
    id: "cross-entropy",
    label: "Cross-entropy loss",
    terms: ["cross-entropy", "cross entropy", "log loss"],
    def: "The standard classification loss: it heavily punishes confident wrong predictions and rewards high probability on the true class.",
    plot: "cross-entropy",
  },
  {
    id: "softmax",
    label: "Softmax",
    terms: ["softmax"],
    def: "Turns a vector of raw scores into a probability distribution over classes (positive, sums to 1). The multiclass generalization of the sigmoid.",
  },
  {
    id: "decision-boundary",
    label: "Decision boundary",
    terms: ["decision boundary"],
    def: "The surface in feature space where a classifier switches from predicting one class to another.",
  },
  {
    id: "overfitting",
    label: "Overfitting",
    terms: ["overfitting"],
    def: "When a model memorizes noise in the training data and fails to generalize — low training error but high error on new data.",
    plot: "bias-variance",
  },
  {
    id: "underfitting",
    label: "Underfitting",
    terms: ["underfitting"],
    def: "When a model is too simple to capture the real pattern — high error on both training and test data.",
    plot: "bias-variance",
  },
  {
    id: "bias-variance",
    label: "Bias–variance tradeoff",
    terms: ["bias-variance tradeoff", "bias-variance", "bias–variance"],
    def: "The central tension in ML: simple models err by being too rigid (bias), complex models err by being too sensitive to the training set (variance). Good generalization balances the two.",
    plot: "bias-variance",
  },
  {
    id: "learning-curves",
    label: "Learning curves",
    terms: ["learning curves", "learning curve"],
    def: "Plots of training and validation error versus training-set size or epochs — used to diagnose under- vs. over-fitting.",
    plot: "bias-variance",
  },
  {
    id: "generalization",
    label: "Generalization",
    terms: ["generalization", "generalize"],
    def: "How well a model performs on data it has never seen — the whole point of learning, as opposed to memorizing.",
    plot: "bias-variance",
  },
  {
    id: "confusion-matrix",
    label: "Confusion matrix",
    terms: ["confusion matrix"],
    def: "A table of predicted vs. actual labels (true/false positives and negatives). Precision, recall and F1 are all computed from its four cells.",
    plot: "confusion-matrix",
  },
  {
    id: "precision",
    label: "Precision",
    terms: ["precision"],
    def: "Of everything the model flagged as positive, what fraction really was? High precision = few false alarms.",
    plot: "confusion-matrix",
  },
  {
    id: "recall",
    label: "Recall",
    terms: ["recall"],
    def: "Of all the actual positives, what fraction did the model catch? High recall = few misses.",
    plot: "confusion-matrix",
  },
  {
    id: "f1",
    label: "F1 score",
    terms: ["F1"],
    def: "The harmonic mean of precision and recall — a single number that rewards doing well on both at once.",
    plot: "confusion-matrix",
  },
  {
    id: "roc-auc",
    label: "ROC-AUC",
    terms: ["ROC-AUC", "ROC", "AUC", "PR curves", "PR curve"],
    def: "The ROC curve plots true-positive vs. false-positive rate across thresholds; AUC (area under it) summarizes ranking quality — 0.5 is random, 1.0 is perfect.",
    plot: "roc-curve",
  },
  {
    id: "cross-validation",
    label: "Cross-validation (k-fold)",
    terms: ["cross-validation", "cross validation", "k-fold", "k fold"],
    def: "Splitting data into k parts, training on k−1 and testing on the held-out part, rotating through all k. Gives a more reliable performance estimate than a single split.",
  },
  {
    id: "hyperparameter",
    label: "Hyperparameter tuning",
    terms: ["GridSearchCV", "RandomizedSearchCV", "hyperparameter", "hyperparameters", "Optuna"],
    def: "Settings you choose before training (learning rate, tree depth, k…) rather than learn. Grid/random search and Optuna automate the hunt for good values.",
  },

  // ── Trees & ensembles (Week 5) ────────────────────────────────────
  {
    id: "impurity",
    label: "Gini & entropy (split criteria)",
    terms: ["Gini", "entropy", "information gain"],
    def: "Measures of how mixed the classes are in a node. A decision tree chooses the split that most reduces impurity; both peak at a 50/50 mix and are zero for a pure node.",
    plot: "entropy-gini",
  },
  {
    id: "decision-tree",
    label: "Decision tree",
    terms: ["decision tree", "decision trees"],
    def: "A model that repeatedly splits the data on feature thresholds, forming a tree of yes/no questions that ends in a prediction.",
    plot: "entropy-gini",
  },
  {
    id: "bagging",
    label: "Bagging",
    terms: ["bagging", "bootstrap"],
    def: "Training many models on random resamples of the data and averaging them, which reduces variance. Random forests are bagged decision trees.",
  },
  {
    id: "random-forest",
    label: "Random forest",
    terms: ["random forest", "random forests"],
    def: "An ensemble of decorrelated decision trees (each on a bootstrap sample and a random feature subset) whose votes are averaged. Strong, low-tuning baseline.",
  },
  {
    id: "feature-importance",
    label: "Feature importance",
    terms: ["feature importance"],
    def: "A ranking of how much each input feature contributes to a model's predictions.",
  },
  {
    id: "gradient-boosting",
    label: "Gradient boosting",
    terms: ["gradient boosting", "additive modeling", "XGBoost", "LightGBM", "CatBoost"],
    def: "Building an ensemble one small tree at a time, where each new tree corrects the previous ensemble's errors. XGBoost/LightGBM/CatBoost are fast implementations that dominate tabular ML.",
  },
  {
    id: "ensemble",
    label: "Ensemble methods",
    terms: ["voting", "stacking", "blending", "meta-learner"],
    def: "Combining several models so their strengths cover each other's weaknesses — by voting, or by training a meta-model on their outputs (stacking/blending).",
  },
  {
    id: "shap",
    label: "SHAP / Shapley values",
    terms: ["Shapley values", "SHAP", "TreeSHAP", "force plots"],
    def: "A game-theory method that fairly attributes a prediction to each feature, giving consistent global and per-example explanations.",
  },

  // ── Unsupervised (Week 6) ─────────────────────────────────────────
  {
    id: "kmeans",
    label: "k-means clustering",
    terms: ["k-means", "k means", "kmeans", "k-means++", "centroids", "centroid"],
    def: "An unsupervised algorithm that groups points into k clusters by alternately assigning each point to its nearest centroid and recomputing centroids as cluster means.",
    plot: "kmeans",
  },
  {
    id: "inertia",
    label: "Inertia & the elbow method",
    terms: ["inertia", "elbow method"],
    def: "Inertia is the total squared distance from points to their centroids. Plotting it against k and finding the 'elbow' is a heuristic for picking the number of clusters.",
    plot: "elbow",
  },
  {
    id: "clustering",
    label: "Clustering",
    terms: ["clustering", "agglomerative", "dendrogram", "linkage"],
    def: "Grouping unlabeled data so that similar points fall together. Hierarchical clustering builds a tree (dendrogram) of nested groups.",
    plot: "kmeans",
  },
  {
    id: "silhouette",
    label: "Silhouette score",
    terms: ["silhouette score", "silhouette"],
    def: "A cluster-quality score from −1 to 1 measuring how much closer each point is to its own cluster than to the next nearest one.",
  },
  {
    id: "dbscan",
    label: "DBSCAN",
    terms: ["DBSCAN", "density-based clustering"],
    def: "A clustering method that grows clusters from dense regions and labels sparse points as noise — so it finds arbitrary shapes and needs no preset k.",
  },
  {
    id: "gmm",
    label: "Gaussian Mixture Model",
    terms: ["GMM", "Gaussian Mixture", "EM algorithm"],
    def: "Models data as a blend of several Gaussian bells, fit by the Expectation–Maximization (EM) algorithm; gives soft (probabilistic) cluster membership.",
    plot: "normal-distribution",
  },
  {
    id: "tsne",
    label: "t-SNE & UMAP",
    terms: ["t-SNE", "tSNE", "UMAP", "manifold learning", "perplexity"],
    def: "Nonlinear methods that squeeze high-dimensional data down to 2D for visualization, keeping nearby points near. Great for seeing structure, but distances between far-apart clusters aren't meaningful.",
  },

  // ── Deep learning (Weeks 7–9) ──────────────────────────────────
  {
    id: "perceptron",
    label: "Perceptron / MLP",
    terms: ["perceptron", "MLP", "multilayer perceptron", "hidden layers", "hidden layer"],
    def: "A perceptron is a single artificial neuron; stacking layers of them gives a multilayer perceptron (MLP), the basic fully-connected neural network.",
  },
  {
    id: "uat",
    label: "Universal approximation",
    terms: ["universal approximation"],
    def: "The theorem that a big enough one-hidden-layer network can approximate any continuous function — why neural nets are so flexible.",
  },
  {
    id: "relu",
    label: "Activation functions (ReLU, GELU, Swish)",
    terms: ["ReLU", "GELU", "Swish", "dying ReLU", "activation function", "activation functions"],
    def: "The nonlinearity applied after each layer so the network can model curves, not just lines. ReLU (max(0,x)) is the default; GELU/Swish are smooth variants used in modern nets.",
    plot: "activations",
  },
  {
    id: "vanishing-gradient",
    label: "Vanishing / exploding gradients",
    terms: ["vanishing gradients", "vanishing gradient", "exploding gradients", "gradient clipping"],
    def: "In deep nets, gradients can shrink toward zero (stalling learning) or blow up (destabilizing it) as they propagate back. Good initialization, normalization, residuals, and gradient clipping fight this.",
    plot: "gradient-descent",
  },
  {
    id: "optimizer",
    label: "Optimizers (SGD, Adam)",
    terms: ["SGD momentum", "SGD", "RMSProp", "Adam", "AdamW", "optimizer step", "optimizer"],
    def: "Algorithms that decide how to update weights from gradients. SGD with momentum is the classic; Adam/AdamW adapt the step size per parameter and are the deep-learning default.",
    plot: "gradient-descent",
  },
  {
    id: "lr-schedule",
    label: "Learning-rate schedule",
    terms: ["LR schedules", "LR schedule", "learning rate schedule", "learning rate", "LR warmup", "cosine decay"],
    def: "A plan for changing the step size over training — e.g. warm up then cosine-decay — which usually trains faster and to a better optimum than a fixed rate.",
    plot: "lr-schedule",
  },
  {
    id: "dropout",
    label: "Dropout",
    terms: ["dropout"],
    def: "A regularizer that randomly zeros a fraction of activations each step, forcing the network not to rely on any single neuron.",
  },
  {
    id: "batchnorm",
    label: "Batch / layer normalization",
    terms: ["batch normalization", "BatchNorm", "BatchNorm2d", "layer normalization", "LayerNorm"],
    def: "Layers that re-center and re-scale activations to keep them well-behaved during training, which stabilizes and speeds up learning.",
  },
  {
    id: "early-stopping",
    label: "Early stopping",
    terms: ["early stopping"],
    def: "Halting training once validation performance stops improving, to avoid overfitting.",
    plot: "bias-variance",
  },
  {
    id: "init",
    label: "Weight initialization (He / Xavier)",
    terms: ["He initialization", "Xavier", "initialization"],
    def: "Choosing the starting random scale of weights so signals neither vanish nor explode through the layers. He init suits ReLU; Xavier suits tanh/sigmoid.",
  },
  {
    id: "tensor",
    label: "Tensor",
    terms: ["tensors", "tensor"],
    def: "A multi-dimensional array — the basic data object in PyTorch/TensorFlow. A scalar, vector and matrix are 0-, 1- and 2-D tensors.",
  },
  {
    id: "autograd",
    label: "Autograd",
    terms: ["autograd", "automatic differentiation", "computational graph", "requires_grad"],
    def: "The engine that records every operation into a computational graph and then differentiates it automatically, so you never hand-derive gradients.",
  },
  {
    id: "amp",
    label: "Mixed-precision training",
    terms: ["mixed precision", "torch.cuda.amp", "float16", "bfloat16", "gradient scaling"],
    def: "Doing most math in 16-bit floats to roughly double speed and halve memory on GPUs, with safeguards (loss scaling) to keep accuracy.",
  },

  // ── CNNs (Weeks 9–14) ──────────────────────────────────────────
  {
    id: "convolution",
    label: "Convolution",
    terms: ["convolution", "kernels", "kernel", "feature maps", "feature map"],
    def: "Sliding a small learnable filter (kernel) across an image and taking dot products, producing a feature map that highlights a pattern wherever it occurs.",
  },
  {
    id: "stride-pad",
    label: "Stride, padding & receptive field",
    terms: ["stride", "padding", "receptive field"],
    def: "Stride is how far the filter hops each step; padding adds a border so edges aren't lost; the receptive field is the input region one output value 'sees'.",
  },
  {
    id: "pooling",
    label: "Pooling",
    terms: ["max pooling", "average pooling", "pooling", "downsampling"],
    def: "Shrinking a feature map by summarizing small patches (taking the max or average), reducing resolution and computation while keeping salient signals.",
  },
  {
    id: "transfer-learning",
    label: "Transfer learning",
    terms: ["transfer learning", "feature extraction", "fine-tuning", "fine tuning", "pretrained models", "pretrained"],
    def: "Starting from a model already trained on a huge dataset and adapting it to your task — either freezing it as a feature extractor or fine-tuning its weights. Saves data and compute.",
  },
  {
    id: "resnet",
    label: "ResNet & residual connections",
    terms: ["ResNet", "residual connections", "residual connection", "skip connections", "skip connection", "identity mapping"],
    def: "Adding 'skip' shortcuts that let a layer learn a small residual on top of its input. This fixed the degradation problem and made very deep networks trainable.",
  },
  {
    id: "vit",
    label: "Vision Transformer (ViT)",
    terms: ["Vision Transformer", "ViT", "patch embedding"],
    def: "Applies the transformer (originally for text) to images by cutting them into patches and treating each patch as a token. Strong with enough data, since it has less built-in vision bias than CNNs.",
  },
  {
    id: "iou",
    label: "IoU (Intersection over Union)",
    terms: ["IoU", "Intersection over Union"],
    def: "Overlap of a predicted box/mask with the ground truth, divided by their union. 1.0 is a perfect match; the core metric for detection and segmentation.",
  },
  {
    id: "detection",
    label: "Object detection (anchors, NMS, mAP)",
    terms: ["anchor boxes", "anchor box", "NMS", "non-maximum suppression", "mAP", "bounding boxes", "bounding box"],
    def: "Finding and boxing objects in an image. Anchors are candidate boxes, NMS removes duplicate detections, and mAP (mean average precision) is the headline accuracy metric.",
  },
  {
    id: "yolo",
    label: "YOLO",
    terms: ["YOLO", "YOLOv8", "one-stage detection"],
    def: "A family of fast one-stage detectors that predict all boxes and classes in a single network pass — the go-to for real-time detection.",
  },
  {
    id: "segmentation",
    label: "Image segmentation",
    terms: ["semantic segmentation", "instance segmentation", "panoptic", "segmentation", "pixel classification"],
    def: "Labeling an image at the pixel level. Semantic = which class each pixel is; instance = which object; panoptic = both.",
  },
  {
    id: "unet",
    label: "U-Net",
    terms: ["U-Net", "UNet", "encoder-decoder"],
    def: "A segmentation architecture that downsamples an image to capture context, then upsamples back to full resolution, using skip connections to recover fine detail. Born in medical imaging.",
  },
  {
    id: "gradcam",
    label: "Grad-CAM",
    terms: ["Grad-CAM", "GradCAM", "class activation maps", "saliency"],
    def: "A visualization that uses gradients to highlight which image regions drove a CNN's prediction — a window into what the model 'looked at'.",
  },
  {
    id: "quantization",
    label: "Quantization & pruning",
    terms: ["quantization", "pruning", "INT8", "ONNX", "TensorRT"],
    def: "Shrinking and speeding up a trained model — quantization stores weights in low precision (e.g. INT8), pruning deletes unimportant weights; ONNX/TensorRT are export/runtime formats for deployment.",
  },

  // ── NLP & transformers (Weeks 15–17) ───────────────────────────
  {
    id: "tokenization",
    label: "Tokenization",
    terms: ["tokenization", "tokenizers", "tokenizer"],
    def: "Splitting text into the units (words or sub-word pieces) a model actually processes. Modern LLMs use sub-word tokens so they can handle any word.",
  },
  {
    id: "stemming",
    label: "Stemming & lemmatization",
    terms: ["stemming", "lemmatization"],
    def: "Reducing words to a root form so 'running', 'ran', 'runs' count as one — stemming chops crudely, lemmatization uses real dictionary forms.",
  },
  {
    id: "tfidf",
    label: "Bag of Words & TF-IDF",
    terms: ["bag of words", "TF-IDF", "TFIDF", "n-grams", "n-gram"],
    def: "Classic text features: count which words appear (bag of words), then down-weight words that are common across all documents (TF-IDF). n-grams keep short word sequences.",
  },
  {
    id: "embeddings",
    label: "Word embeddings",
    terms: ["word embeddings", "Word2Vec", "GloVe", "FastText", "CBOW", "skip-gram", "embedding"],
    def: "Dense vectors that place words with similar meanings near each other, learned from which words co-occur. They let models do arithmetic like king − man + woman ≈ queen.",
  },
  {
    id: "rnn",
    label: "RNN / LSTM / GRU",
    terms: ["RNN", "RNNs", "LSTM", "GRU", "recurrence", "hidden state"],
    def: "Networks that process sequences one step at a time, carrying a hidden 'memory'. LSTMs and GRUs add gates so that memory survives long sequences without the gradient vanishing.",
  },
  {
    id: "attention",
    label: "Attention",
    terms: ["attention mechanism", "self-attention", "attention", "Attention is All You Need"],
    def: "A mechanism that lets each token directly look at and weight every other token, regardless of distance. It replaced recurrence and powers all modern transformers.",
  },
  {
    id: "transformer",
    label: "Transformer",
    terms: ["Transformer architecture", "Transformers", "Transformer", "multi-head attention"],
    def: "The architecture behind modern NLP and LLMs: stacked self-attention + feed-forward blocks that process a whole sequence in parallel. Multi-head attention runs several attention 'views' at once.",
  },
  {
    id: "positional-encoding",
    label: "Positional encoding",
    terms: ["positional encoding", "position encoding"],
    def: "Information added to each token so the transformer knows word order — since attention itself is order-blind.",
  },
  {
    id: "bert",
    label: "BERT & masked language modeling",
    terms: ["BERT", "masked language modeling", "bidirectional"],
    def: "An encoder-only transformer pretrained by hiding random words and predicting them, learning deep bidirectional context for tasks like classification.",
  },
  {
    id: "gpt",
    label: "GPT & causal language modeling",
    terms: ["GPT", "causal language modeling", "autoregressive", "decoder-only", "in-context learning"],
    def: "Decoder-only transformers trained to predict the next token. At scale they show in-context learning — solving new tasks from examples in the prompt, without retraining.",
  },
  {
    id: "scaling-laws",
    label: "Scaling laws",
    terms: ["scaling laws"],
    def: "The empirical finding that model quality improves predictably as you add parameters, data, and compute — the reason LLMs got so big.",
  },
  {
    id: "lora",
    label: "LoRA / PEFT",
    terms: ["LoRA", "QLoRA", "PEFT", "parameter-efficient"],
    def: "Fine-tuning a giant model by training only a small number of added low-rank weight matrices, freezing the rest. Cuts trainable parameters (and cost) by orders of magnitude.",
  },
  {
    id: "rag",
    label: "Retrieval-Augmented Generation (RAG)",
    terms: ["retrieval-augmented generation", "RAG", "grounding"],
    def: "Giving an LLM extra accuracy by retrieving relevant documents and feeding them into the prompt, so answers are grounded in real sources instead of memory.",
  },
  {
    id: "vector-store",
    label: "Vector store / similarity search",
    terms: ["vector store", "vector database", "FAISS", "ChromaDB", "similarity search", "embeddings index", "ANN"],
    def: "A database of embedding vectors that finds the items most similar to a query by nearest-neighbor search — the retrieval engine inside RAG.",
  },
  {
    id: "chunking",
    label: "Chunking",
    terms: ["chunking"],
    def: "Splitting long documents into smaller passages before embedding them, so retrieval can return focused, relevant pieces.",
  },
  {
    id: "llm-eval",
    label: "LLM evaluation (BLEU, ROUGE, LLM-as-judge)",
    terms: ["BLEU", "ROUGE", "BERTScore", "LLM-as-judge"],
    def: "Ways to score generated text: BLEU/ROUGE compare word overlap with references, BERTScore compares meaning, and 'LLM-as-judge' uses a strong model to grade outputs.",
  },
  {
    id: "prompting",
    label: "Prompt engineering",
    terms: ["prompt engineering", "chain-of-thought", "zero/few-shot", "few-shot", "zero-shot", "system prompts", "system prompt"],
    def: "Designing the model's input to get better outputs — giving examples (few-shot), asking it to reason step by step (chain-of-thought), or setting behavior with a system prompt.",
  },

  // ── Generative & RL (Weeks 18–19) ──────────────────────────────
  {
    id: "vae",
    label: "Variational Autoencoder (VAE)",
    terms: ["VAE", "VAEs", "ELBO", "reparameterization trick"],
    def: "A generative model that learns a smooth probabilistic latent space you can sample from. The reparameterization trick makes that random sampling differentiable so it can be trained by backprop.",
  },
  {
    id: "latent-space",
    label: "Latent space",
    terms: ["latent space"],
    def: "A compressed, learned coordinate system where each point decodes to a data sample. Nearby points produce similar outputs.",
  },
  {
    id: "kl",
    label: "KL divergence",
    terms: ["KL divergence", "Kullback-Leibler"],
    def: "A measure of how different one probability distribution is from another. Used as a loss term to keep learned distributions close to a target.",
  },
  {
    id: "gan",
    label: "GAN (generator vs discriminator)",
    terms: ["GAN", "GANs", "generator", "discriminator", "minimax game", "mode collapse", "DCGAN", "StyleGAN2"],
    def: "Two networks in a contest: a generator invents fake samples while a discriminator tries to spot them. They improve together, though training can be unstable or collapse to few outputs (mode collapse).",
  },
  {
    id: "diffusion",
    label: "Diffusion models",
    terms: ["diffusion", "DDPM", "DDIM", "noise schedule", "denoising", "score matching", "latent diffusion", "Stable Diffusion"],
    def: "Generative models that learn to reverse a gradual noising process: start from pure noise and denoise step by step into an image. The basis of Stable Diffusion.",
  },
  {
    id: "clip",
    label: "CLIP conditioning",
    terms: ["CLIP conditioning", "CLIP", "cross-attention", "text-to-image"],
    def: "Using a model that aligns images and text in one space to steer image generation from a text prompt — how diffusion models turn words into pictures.",
  },
  {
    id: "mdp",
    label: "Markov Decision Process (MDP)",
    terms: ["MDP", "Markov Decision Process", "value functions", "value function"],
    def: "The framework for reinforcement learning: an agent in a state takes an action, gets a reward, and moves to a new state. A policy maps states to actions; a value function estimates long-run reward.",
  },
  {
    id: "qlearning",
    label: "Q-learning & DQN",
    terms: ["Q-learning", "Q learning", "DQN", "Bellman update", "experience replay", "target network", "epsilon-greedy"],
    def: "Learning the value of each action in each state (the Q-value). Deep Q-Networks approximate it with a neural net, stabilized by experience replay and a slowly-updated target network.",
  },
  {
    id: "policy-gradient",
    label: "Policy gradient (REINFORCE, PPO)",
    terms: ["policy gradient", "REINFORCE", "actor-critic", "PPO"],
    def: "RL methods that directly adjust the policy to favor actions that led to higher reward. Actor-critic and PPO add a value estimate to reduce noise and keep updates stable.",
  },
  {
    id: "exploration",
    label: "Exploration vs. exploitation",
    terms: ["exploration-exploitation", "exploration strategies", "reward shaping", "reward hacking"],
    def: "The RL dilemma of trying new actions to discover reward (exploration) vs. cashing in on what already works (exploitation). Reward hacking is when an agent games a poorly-designed reward.",
  },
  {
    id: "gym",
    label: "Gymnasium",
    terms: ["Gymnasium", "Gym", "environment wrappers"],
    def: "The standard Python toolkit of RL environments (CartPole, Atari…) with a common step/reset interface for training and benchmarking agents.",
  },

  // ── MLOps & fairness (Weeks 20–21) ──────────────────────────────
  {
    id: "dvc",
    label: "Data versioning (DVC)",
    terms: ["DVC", "data versioning"],
    def: "Git-like version control for datasets and models, so experiments are reproducible and large files don't bloat your code repo.",
  },
  {
    id: "mlflow",
    label: "Experiment tracking (MLflow)",
    terms: ["MLflow", "model registry", "experiment tracking"],
    def: "A tool that logs each training run's parameters, metrics, and artifacts, and stores versioned models — so you can compare and reproduce results.",
  },
  {
    id: "drift",
    label: "Data / concept drift",
    terms: ["data drift", "concept drift", "model degradation", "Evidently AI"],
    def: "When live data or the world changes after deployment so a model's accuracy silently decays. Monitoring tools watch for this and trigger retraining.",
  },
  {
    id: "model-card",
    label: "Model cards & datasheets",
    terms: ["model cards", "model card", "datasheets", "audit trails"],
    def: "Short standardized documents describing a model's or dataset's intended use, performance, and limitations — a cornerstone of responsible ML.",
  },
  {
    id: "distribution-shift",
    label: "Distribution shift",
    terms: ["distribution shift", "spurious correlations", "spurious correlation", "shortcut learning"],
    def: "When test/production data differs from training data, often because the model latched onto a shortcut (e.g. a background) instead of the real signal.",
  },
  {
    id: "fairness-bias",
    label: "Algorithmic bias",
    terms: ["historical bias", "representation bias", "measurement bias", "aggregation bias", "deployment bias", "dataset bias"],
    def: "Systematic ways a model can treat groups unfairly — from skewed training data, mislabeled measurements, or one-size-fits-all modeling. The first step is naming which kind you have.",
  },
  {
    id: "fairness-metrics",
    label: "Fairness metrics",
    terms: ["demographic parity", "equalized odds", "calibration", "group fairness", "impossibility theorems"],
    def: "Quantitative definitions of 'fair' — e.g. equal positive rates (demographic parity) or equal error rates (equalized odds) across groups. Impossibility theorems show you usually can't satisfy all at once.",
  },
  {
    id: "fairness-tools",
    label: "Fairness toolkits",
    terms: ["Fairlearn", "AI Fairness 360", "Aequitas", "disaggregated evaluation"],
    def: "Open-source libraries that measure and mitigate bias, and report performance broken down by demographic group (disaggregated evaluation).",
  },
  {
    id: "mitigation",
    label: "Bias mitigation (pre/in/post-processing)",
    terms: ["pre-processing", "in-processing", "post-processing", "reweighing", "threshold adjustment"],
    def: "Three places to intervene on bias: fix the data before training (pre), add fairness constraints during training (in), or adjust decisions after (post), e.g. per-group thresholds.",
  },

  // ── SQL (Week 3) ──────────────────────────────────────────────────
  {
    id: "join",
    label: "SQL JOIN",
    terms: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "self-join"],
    def: "Combining rows from two tables on a matching column. INNER keeps only matches; LEFT keeps all left-table rows, filling gaps with NULL.",
  },
  {
    id: "groupby-sql",
    label: "GROUP BY / aggregation",
    terms: ["GROUP BY", "HAVING", "aggregate"],
    def: "Collapsing rows into groups and computing a summary (COUNT, SUM, AVG…) per group. HAVING filters those groups after aggregation.",
  },
  {
    id: "window-fn",
    label: "Window functions",
    terms: ["window functions", "window function", "ROW_NUMBER", "PARTITION BY"],
    def: "Calculations across a set of rows related to the current row (running totals, rankings, previous value) without collapsing them like GROUP BY does.",
  },
  {
    id: "cte",
    label: "CTE (WITH clause)",
    terms: ["CTEs", "CTE", "WITH clause"],
    def: "A named temporary result you define with WITH and reference like a table, making complex queries readable as a series of steps.",
  },
  {
    id: "normalization-db",
    label: "Database normalization",
    terms: ["database normalization", "foreign keys", "foreign key", "1NF", "3NF"],
    def: "Organizing tables to remove redundancy, linking them by foreign keys. Normal forms (1NF–3NF) are the standard tidiness levels.",
  },

  // ── Federated learning (research extensions, Weeks 1/7/20/21) ─────
  {
    id: "federated",
    label: "Federated learning",
    terms: ["federated learning", "FedAvg", "FEEL", "over-the-air"],
    def: "Training a shared model across many devices that keep their data local, sending only model updates to a server (FedAvg averages them). Central to the privacy- and communication-aware research track.",
  },
  {
    id: "sparsification",
    label: "Gradient sparsification",
    terms: ["gradient sparsification", "sparsification", "top-k", "top-K"],
    def: "Sending only the largest gradient values (and accumulating the rest as error) to cut communication cost in distributed/federated training by orders of magnitude.",
  },
  {
    id: "non-iid",
    label: "Non-IID data",
    terms: ["non-IID", "non-iid"],
    def: "When different clients/devices hold differently-distributed data (e.g. each phone sees only some classes), which biases and slows federated training.",
  },
];

// ── Lookup table: lowercase alias -> entry (with resolved plot) ──────
export const GLOSSARY = (() => {
  const map = new Map();
  for (const e of GLOSSARY_ENTRIES) {
    const resolved = {
      id: e.id,
      label: e.label,
      def: e.def,
      plot: e.plot ? PLOTS[e.plot] : null,
    };
    for (const t of e.terms) {
      const key = t.toLowerCase();
      // First definition wins if two entries claim the same alias.
      if (!map.has(key)) map.set(key, resolved);
    }
  }
  return map;
})();

// All aliases, longest first, so multi-word terms match before their parts.
export const GLOSSARY_TERMS = [...GLOSSARY.keys()].sort((a, b) => b.length - a.length);

// Lookup by entry id — used by the tooltip component to render its content.
export const GLOSSARY_BY_ID = (() => {
  const map = {};
  for (const e of GLOSSARY.values()) map[e.id] = e;
  return map;
})();
