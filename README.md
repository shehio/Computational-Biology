# Computational-Biology
This repository was created to maintain the assignments of UW CSEP 527.
We worked on some interesting problems using Hidden Markov Models, Viterbi algorithm, Gillespie algorithm, Smith–Waterman algorithm, and many others.

| Biological Problem | Attempted Algorithm |
| :----------------: | :-----------------: |
| Population Evolution | Gillespie |
| Genome Alignment | Smith Waterman |
| RNA Transcript Abundance Estimation | Expectation Maximization |
| Cluster Cell Types Based On Gene Expression (Single-Cell Analysis) | Dimensionality Reduction (T-SNE) / K-Means Clustering |
| Differential Analysis | T-tests |
| Learning Sequences from Observed Data | Viterbi / Hidden Markov Models |
| Alternative Splicing Prediction | Gradient Descent for L2 Regularized KL-Loss Logistic Regression |

## Contents

Each directory is a self-contained assignment. Notebooks are meant to be run from
inside their own directory, since they load data files by relative path.

| Directory | File | What it does | Data it reads |
| :-- | :-- | :-- | :-- |
| `gillespie/` | `runGillespie.m`, `gillespie.m`, `stochiometricOde.m` | MATLAB/Octave Gillespie stochastic simulation of a population-evolution reaction network. | (none) |
| `Smith Waterman/` | `smith–waterman.ts` | TypeScript implementation of the Smith–Waterman local alignment algorithm, with unit tests and alignment of reads against the lambda phage genome. | `lambda_virus.fa` |
| `Smith Waterman/` | `genome-read-file-analysis.ts` | Reads a FASTQ file, reports read-length statistics and a k-mer histogram (plotted via Plotly). | `lambda_virus.fa`, `reads_1.fq` |
| `RNA Transcript Abundance Estimation/` | `RNA Quantification Using Expectation-Maximization.ipynb` | Estimates transcript abundances (rho) with the EM algorithm. | `transcripts.txt`, `transcript_reads.txt` (not included) |
| `Single-cell Analysis/` | `Cluster Cell Types Based On Gene Expression.ipynb` | Clusters single cells by gene expression using t-SNE and K-Means. | `Zeisel_expr.txt`, `Zeisel_genes.txt`, `Zeisel_labels.txt` (not included) |
| `Differential Expression/` | `differential_expression.ipynb` | Finds the most differentially expressed genes per cell type with t-tests. | `Zeisel_expr.txt`, `Zeisel_genes.txt`, `Zeisel_labels.txt` (not included) |
| `Viterbi/` | `gc_hmm.ipynb` | Viterbi decoding and Viterbi training of an HMM to detect GC-rich regions in a genome. | `NC_011297.fna` |
| `Alternative Splicing Prediction/` | `L2 Regularized Logistic Regression KL-divergence Gradient Descent.ipynb` | Predicts alternative splicing with L2-regularized, KL-divergence logistic regression trained by gradient descent. | `Splicing_Data.txt` |

## Setup

### Python notebooks

Requires Python 3. Install the dependencies and launch Jupyter:

```bash
pip install -r requirements.txt
jupyter notebook
```

Then open the notebook you want from within its directory.

### MATLAB / Octave

The `gillespie/` scripts run in MATLAB or GNU Octave. From that directory:

```bash
octave runGillespie.m
```

### TypeScript (Smith Waterman)

The `Smith Waterman/` programs run under Node.js via `ts-node`, and depend on
`lodash` and `plotly`:

```bash
npm install lodash plotly
npx ts-node "smith–waterman.ts"
```

`genome-read-file-analysis.ts` uploads a histogram to Plotly and reads your
credentials from the `PLOTLY_USERNAME` and `PLOTLY_API_KEY` environment variables.
These are supplied from 1Password so no secret is ever written to disk —
`Smith Waterman/plotly.env` holds only `op://` references, and `op run` injects the
resolved values into the process environment:

```bash
op run --env-file="Smith Waterman/plotly.env" -- npx ts-node genome-read-file-analysis.ts
```

The referenced 1Password item is `Private/plotly` (fields `username`, `api_key`).
Requires the [1Password CLI](https://developer.1password.com/docs/cli/) signed in.
If you would rather not use 1Password, export the two variables by hand instead.

## Data files

Some datasets are included in the repository (`Splicing_Data.txt`, `lambda_virus.fa`,
`reads_1.fq`, `NC_011297.fna`). The single-cell / differential-expression notebooks
expect the Zeisel dataset (`Zeisel_expr.txt`, `Zeisel_genes.txt`, `Zeisel_labels.txt`)
and the RNA quantification notebook expects `transcripts.txt` and `transcript_reads.txt`;
these are not committed and must be supplied in the notebook's directory before running.
