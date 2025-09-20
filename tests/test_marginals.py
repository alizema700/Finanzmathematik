"""Tests for marginal distribution helpers."""
from __future__ import annotations

import numpy as np
import pytest

from aketheon_copula.marginals import make_growth_dist, make_margin_beta


def test_make_margin_beta_samples_within_unit_interval() -> None:
    dist = make_margin_beta(mean=0.3, var=0.015)
    rng = np.random.default_rng(321)
    samples = dist.rvs(size=50_000, random_state=rng)
    assert np.all((samples > 0) & (samples < 1))
    assert np.mean(samples) == pytest.approx(0.3, abs=0.02)


def test_make_growth_dist_log1p_statistics() -> None:
    dist = make_growth_dist(mu_log1p=0.04, sigma_log1p=0.08)
    rng = np.random.default_rng(654)
    uniforms = rng.random(120_000)
    growth = dist.ppf(uniforms)
    log_samples = np.log1p(growth)
    assert log_samples.mean() == pytest.approx(0.04, abs=0.01)
    assert log_samples.std(ddof=1) == pytest.approx(0.08, abs=0.01)
    assert np.min(growth) >= -0.9
    assert np.max(growth) <= 1.0
