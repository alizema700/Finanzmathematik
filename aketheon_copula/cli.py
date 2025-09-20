"""Command line interface for Gaussian copula simulations."""
from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import numpy as np
import pandas as pd

from .copula import apply_marginals, corr_diagnostics, mvnorm_copula_uniform
from .marginals import make_growth_dist, make_margin_beta
from .viz import hist_distribution, scatter_growth_margin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gaussian copula simulation for growth and margins")
    parser.add_argument("--n", type=int, default=100_000, help="Number of samples")
    parser.add_argument("--rho", type=float, default=0.4, help="Correlation between drivers")
    parser.add_argument("--seed", type=int, default=7, help="Random seed")
    parser.add_argument("--mu_g", type=float, default=0.04, help="Mean of ln(1+growth)")
    parser.add_argument("--sigma_g", type=float, default=0.08, help="Std dev of ln(1+growth)")
    parser.add_argument("--m_mean", type=float, default=0.30, help="Mean of margin beta distribution")
    parser.add_argument("--m_var", type=float, default=0.015, help="Variance of margin beta distribution")
    parser.add_argument("--out", type=str, required=True, help="Output directory")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    cov = np.array([[1.0, args.rho], [args.rho, 1.0]])
    logger.info("Using covariance matrix:\n%s", cov)

    uniforms = mvnorm_copula_uniform(args.n, cov=cov, seed=args.seed)

    growth_dist = make_growth_dist(args.mu_g, args.sigma_g)
    margin_dist = make_margin_beta(args.m_mean, args.m_var)
    growth, margin = apply_marginals(uniforms, growth_dist, margin_dist)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame({"growth": growth, "margin": margin})
    csv_path = out_dir / "samples.csv"
    df.to_csv(csv_path, index=False)
    logger.info("Saved samples to %s", csv_path)

    scatter_growth_margin(growth, margin, str(out_dir / "scatter.png"))
    hist_distribution(growth, str(out_dir / "growth_hist.png"), "Growth")
    hist_distribution(margin, str(out_dir / "margin_hist.png"), "Margin")

    diagnostics = corr_diagnostics(growth, margin)
    print(json.dumps(diagnostics, indent=2))


if __name__ == "__main__":
    main()
