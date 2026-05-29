import numpy as np

x = np.array([5.1, 3.5, 1.4, 0.2])
w = np.array([0.2, -0.1, 0.7, 0.4])
score = x @ w          # dot product
print(score, np.linalg.norm(x))
