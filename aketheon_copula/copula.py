"""Core Gaussian copula utilities."""
from __future__ import annotations

import json
import logging
from typing import Callable, Dict, Tuple

import numpy as np
from numpy.typing import ArrayLike, NDArray
from scipy import stats

logger = logging.getLogger(__name__)


def cholesky_pd(cov: ArrayLike) -> NDArray[np.float64]:
    """Return the Cholesky factor of a covariance matrix.

    Raises:
        ValueError: If the covariance matrix is not symmetric positive definite.
    """

    cov_arr = np.asarray(cov, dtype=float)
    logger.debug("Validating covariance matrix with shape %s", cov_arr.shape)

    if cov_arr.ndim != 2 or cov_arr.shape[0] != cov_arr.shape[1]:
        raise ValueError("Covariance matrix must be square.")

    if not np.allclose(cov_arr, cov_arr.T, atol=1e-10):
        raise ValueError("Covariance matrix must be symmetric.")

    try:
        chol = np.linalg.cholesky(cov_arr)
    except np.linalg.LinAlgError as exc:  # pragma: no cover - exercised in tests
        raise ValueError("Covariance matrix must be positive definite.") from exc

    logger.debug("Cholesky factor computed successfully.")
    return chol


def mvnorm_copula_uniform(
    n: int, cov: ArrayLike, seed: int | None = None
) -> NDArray[np.float64]:
    """Generate Gaussian copula samples transformed to uniforms."""

    logger.info("Generating %d samples from Gaussian copula", n)
    chol = cholesky_pd(cov)
    rng = np.random.default_rng(seed)
    z = rng.standard_normal(size=(n, chol.shape[0])) @ chol.T
    u = stats.norm.cdf(z)
    logger.debug("Generated uniform samples with shape %s", u.shape)
    return u


def apply_marginals(
    U: ArrayLike,
    growth_dist: Callable[[ArrayLike], NDArray[np.float64]] | stats.rv_continuous,
    margin_dist: Callable[[ArrayLike], NDArray[np.float64]] | stats.rv_continuous,
) -> Tuple[NDArray[np.float64], NDArray[np.float64]]:
    """Apply marginal distributions to uniform samples."""

    U_arr = np.asarray(U, dtype=float)
    if U_arr.ndim != 2 or U_arr.shape[1] < 2:
        raise ValueError("Input U must be of shape (n, 2) or compatible.")

    logger.debug("Applying marginals to %d samples", U_arr.shape[0])

    def _ppf(dist: Callable[[ArrayLike], NDArray[np.float64]] | stats.rv_continuous, u: NDArray[np.float64]) -> NDArray[np.float64]:
        if hasattr(dist, "ppf"):
            return np.asarray(dist.ppf(u))
        return np.asarray(dist(u))

    growth = _ppf(growth_dist, U_arr[:, 0])
    margin = _ppf(margin_dist, U_arr[:, 1])
    return growth, margin


def corr_diagnostics(x: ArrayLike, y: ArrayLike) -> Dict[str, float]:
    """Compute correlation diagnostics."""

    x_arr = np.asarray(x, dtype=float)
    y_arr = np.asarray(y, dtype=float)

    if x_arr.shape != y_arr.shape:
        raise ValueError("Input arrays must have the same shape.")

    pearson = stats.pearsonr(x_arr, y_arr)[0]
    spearman = stats.spearmanr(x_arr, y_arr)[0]
    kendall = stats.kendalltau(x_arr, y_arr)[0]

    diagnostics = {
        "pearson": float(pearson),
        "spearman": float(spearman),
        "kendall": float(kendall),
    }
    logger.info("Correlation diagnostics: %s", json.dumps(diagnostics))
    return diagnostics
