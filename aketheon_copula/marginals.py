"""Marginal distribution helpers for growth and margin."""
from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np
from numpy.typing import ArrayLike, NDArray
from scipy import stats

logger = logging.getLogger(__name__)


@dataclass
class GrowthDistribution:
    """Wrapper around a lognormal distribution for growth rates."""

    mu_log1p: float
    sigma_log1p: float

    def __post_init__(self) -> None:
        if self.sigma_log1p <= 0:
            raise ValueError("sigma_log1p must be positive.")
        self._lognorm = stats.lognorm(s=self.sigma_log1p, scale=np.exp(self.mu_log1p))
        logger.debug(
            "Created GrowthDistribution with mu_log1p=%.4f sigma_log1p=%.4f",
            self.mu_log1p,
            self.sigma_log1p,
        )

    def ppf(self, q: ArrayLike) -> NDArray[np.float64]:
        samples = self._lognorm.ppf(q) - 1.0
        clipped = np.clip(samples, -0.9, 1.0)
        return clipped


def make_growth_dist(mu_log1p: float, sigma_log1p: float) -> GrowthDistribution:
    """Create a growth distribution such that ln(1+g) ~ N(mu, sigma²)."""

    return GrowthDistribution(mu_log1p=mu_log1p, sigma_log1p=sigma_log1p)


def make_margin_beta(mean: float, var: float) -> stats.rv_continuous:
    """Create a beta distribution for margins given mean and variance."""

    if not (0 < mean < 1):
        raise ValueError("Mean must lie in (0, 1).")
    if var <= 0:
        raise ValueError("Variance must be positive.")

    max_var = mean * (1 - mean)
    if var >= max_var:
        raise ValueError("Variance too large for a beta distribution with given mean.")

    common = mean * (1 - mean) / var - 1
    alpha = mean * common
    beta = (1 - mean) * common

    logger.debug("Computed beta parameters alpha=%.4f beta=%.4f", alpha, beta)
    return stats.beta(alpha, beta)
