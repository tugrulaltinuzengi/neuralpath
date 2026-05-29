#!/usr/bin/env python3
"""Generate the datasets referenced by the NeuralPath curriculum.

Several weekly projects load files from assets/datasets/. Rather than ship
large/binary data in the repo, this script regenerates them reproducibly.

Run once after installing requirements:
    python assets/datasets/prepare_datasets.py

Produces:
    iris.csv          (Week 1 — EDA Pipeline)
    wine.csv          (Week 1 — EDA Pipeline)
    ecommerce.db      (Week 3 — SQL Feature Store: orders/customers/products/events)
"""
import os
import sqlite3
import sklearn.datasets as skd
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))


def write_iris():
    data = skd.load_iris(as_frame=True)
    df = data.frame.rename(columns={"target": "species_id"})
    df["species"] = df["species_id"].map(dict(enumerate(data.target_names)))
    df.to_csv(os.path.join(HERE, "iris.csv"), index=False)
    print("wrote iris.csv", df.shape)


def write_wine():
    data = skd.load_wine(as_frame=True)
    df = data.frame.rename(columns={"target": "cultivar"})
    df.to_csv(os.path.join(HERE, "wine.csv"), index=False)
    print("wrote wine.csv", df.shape)


def write_ecommerce(seed: int = 42):
    rng = np.random.default_rng(seed)
    n_customers, n_products, n_orders = 500, 60, 4000

    customers = pd.DataFrame({
        "customer_id": range(1, n_customers + 1),
        "signup_date": pd.to_datetime("2023-01-01")
        + pd.to_timedelta(rng.integers(0, 600, n_customers), unit="D"),
        "country": rng.choice(["US", "UK", "DE", "FR", "TR"], n_customers, p=[.4, .2, .15, .15, .1]),
    })
    categories = ["electronics", "books", "home", "sports", "beauty"]
    products = pd.DataFrame({
        "product_id": range(1, n_products + 1),
        "category": rng.choice(categories, n_products),
        "price": np.round(rng.uniform(5, 500, n_products), 2),
    })
    cust_ids = rng.integers(1, n_customers + 1, n_orders)
    prod_ids = rng.integers(1, n_products + 1, n_orders)
    orders = pd.DataFrame({
        "order_id": range(1, n_orders + 1),
        "customer_id": cust_ids,
        "product_id": prod_ids,
        "quantity": rng.integers(1, 5, n_orders),
        "order_date": pd.to_datetime("2023-06-01")
        + pd.to_timedelta(rng.integers(0, 500, n_orders), unit="D"),
    })
    # Web events: views/carts/purchases keyed loosely to customers.
    n_events = 12000
    events = pd.DataFrame({
        "event_id": range(1, n_events + 1),
        "customer_id": rng.integers(1, n_customers + 1, n_events),
        "event_type": rng.choice(["view", "add_to_cart", "purchase"], n_events, p=[.7, .2, .1]),
        "event_time": pd.to_datetime("2023-06-01")
        + pd.to_timedelta(rng.integers(0, 500 * 24 * 60, n_events), unit="m"),
    })

    db_path = os.path.join(HERE, "ecommerce.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    con = sqlite3.connect(db_path)
    customers.to_sql("customers", con, index=False)
    products.to_sql("products", con, index=False)
    orders.to_sql("orders", con, index=False)
    events.to_sql("events", con, index=False)
    con.close()
    print("wrote ecommerce.db (customers, products, orders, events)")


if __name__ == "__main__":
    write_iris()
    write_wine()
    write_ecommerce()
    print("done.")
