# aketheon_copula

`aketheon_copula` simuliert korrelierte Umsatzwachstum- und EBIT-Margen-Treiber per Gaussian Copula. Es liefert ein kleines Python-Paket samt CLI, um Samples zu erzeugen, als CSV zu speichern und direkt zu visualisieren.

## Installation

```bash
pip install -e .
```

## Verwendung

```bash
python -m aketheon_copula.cli --n 100000 --rho 0.6 --out runs/run1
```

Die CLI schreibt `samples.csv`, `scatter.png`, `growth_hist.png` und `margin_hist.png` in das Zielverzeichnis und gibt Korrelationen als JSON zurück, z. B.:

```json
{
  "pearson": 0.59,
  "spearman": 0.57,
  "kendall": 0.40
}
```

Die Pearson-Korrelation liegt nahe beim Zielwert und Spearman/Kendall zeigen ebenfalls positive Abhängigkeiten.
