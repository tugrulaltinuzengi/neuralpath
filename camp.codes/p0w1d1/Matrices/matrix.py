import numpy as np
X = np.random.randn(32, 4)   # 32 samples, 4 features
W = np.random.randn(4, 8)    # project to 8 units
b = np.zeros(8)
Y = X @ W + b                # shape (32, 8)
print(Y.shape)              # (32, 8)