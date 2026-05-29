"""
Mini training demo: learn a single weight from data using gradient descent.

Task: predict 'is this flower a Setosa?' (1 = yes, 0 = no)
      using only one feature: petal length.

Setosa has SMALL petals (~1.5 cm), other species have LARGE petals (~4-5 cm).
So the correct learned weight should be NEGATIVE
(bigger petal length -> LESS likely to be Setosa).

We start the weight at +0.5 (wrong sign) and watch it slide to negative.
"""

import numpy as np

rng = np.random.default_rng(7)

petal_setosa = rng.normal(1.5, 0.2, 50)
petal_other  = rng.normal(4.5, 0.5, 50)
x = np.concatenate([petal_setosa, petal_other])
y = np.concatenate([np.ones(50), np.zeros(50)])

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

w = 0.5
lr = 0.05

print(f"step    weight")
print(f"{0:4d}    {w:+.3f}   <-- start (wrong sign)")

for step in range(1, 201):
    preds = sigmoid(w * x)
    grad = np.mean((preds - y) * x)
    w = w - lr * grad
    if step in (1, 5, 25, 50, 100, 200):
        print(f"{step:4d}    {w:+.3f}")

print(f"\nFinal weight: {w:+.3f}")
print("Gradient descent flipped the sign on its own.")
