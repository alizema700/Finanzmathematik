"""Tests for Gaussian copula utilities."""
from __future__ import annotations

import numpy as np
import pytest
from scipy.stats import norm

from aketheon_copula.copula import cholesky_pd, mvnorm_copula_uniform


def test_cholesky_pd_rejects_non_pd() -> None:
    cov = np.array([[1.0, 2.0], [2.0, 1.0]])
    with pytest.raises(ValueError, match="positive definite"):
        cholesky_pd(cov)


def test_mvnorm_copula_uniform_correlation_matches_target() -> None:
    target_rho = 0.55
    cov = np.array([[1.0, target_rho], [target_rho, 1.0]])
    U = mvnorm_copula_uniform(60_000, cov, seed=123)
    Z = norm.ppf(U)
    empirical_rho = np.corrcoef(Z.T)[0, 1]
    assert empirical_rho == pytest.approx(target_rho, abs=0.03)
