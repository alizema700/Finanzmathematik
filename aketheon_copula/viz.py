"""Visualization helpers for copula simulations."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Iterable

import matplotlib.pyplot as plt
import numpy as np

logger = logging.getLogger(__name__)


def scatter_growth_margin(growth: Iterable[float], margin: Iterable[float], out_png: str) -> None:
    """Create a scatter plot of growth vs margin."""

    growth_arr = np.asarray(list(growth)) * 100
    margin_arr = np.asarray(list(margin)) * 100

    Path(out_png).parent.mkdir(parents=True, exist_ok=True)
    logger.info("Saving scatter plot to %s", out_png)

    plt.figure(figsize=(6, 4))
    plt.scatter(growth_arr, margin_arr, s=5, alpha=0.3)
    plt.xlabel("Growth (%)")
    plt.ylabel("Margin (%)")
    plt.title("Growth vs Margin")
    plt.grid(alpha=0.2)
    plt.tight_layout()
    plt.savefig(out_png, dpi=150)
    plt.close()


def hist_distribution(data: Iterable[float], out_png: str, title: str) -> None:
    """Plot histogram with percentile markers."""

    data_arr = np.asarray(list(data))

    Path(out_png).parent.mkdir(parents=True, exist_ok=True)
    logger.info("Saving histogram to %s", out_png)

    plt.figure(figsize=(6, 4))
    plt.hist(data_arr, bins=30, alpha=0.7, color="#1f77b4")

    for percentile, color in zip([5, 50, 95], ["#d62728", "#2ca02c", "#d62728"]):
        value = np.percentile(data_arr, percentile)
        plt.axvline(value, color=color, linestyle="--", label=f"{percentile}th" if percentile != 50 else "Median")

    plt.title(title)
    plt.xlabel(title)
    plt.ylabel("Frequency")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_png, dpi=150)
    plt.close()
