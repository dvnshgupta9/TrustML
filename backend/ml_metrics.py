import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, mean_squared_error,
    mean_absolute_error, r2_score, log_loss
)
from typing import Dict, List, Any, Optional
from scipy import stats

class MetricsCalculator:

    @staticmethod
    def calculate_classification_metrics(
        y_true: List[float],
        y_pred: List[float],
        y_prob: Optional[List[float]] = None
    ) -> Dict[str, float]:
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)

        metrics = {
            "accuracy": accuracy_score(y_true, y_pred),
            "precision": precision_score(y_true, y_pred, average='weighted', zero_division=0),
            "recall": recall_score(y_true, y_pred, average='weighted', zero_division=0),
            "f1_score": f1_score(y_true, y_pred, average='weighted', zero_division=0)
        }

        if y_prob is not None:
            y_prob = np.array(y_prob)
            try:
                if len(np.unique(y_true)) == 2:
                    metrics["auc_roc"] = roc_auc_score(y_true, y_prob)
                else:
                    metrics["auc_roc"] = roc_auc_score(y_true, y_prob, multi_class='ovr', average='weighted')
                metrics["log_loss"] = log_loss(y_true, y_prob)
            except Exception as e:
                print(f"Could not calculate AUC/Log Loss: {e}")

        cm = confusion_matrix(y_true, y_pred)
        if cm.shape[0] == 2:
            tn, fp, fn, tp = cm.ravel()
            metrics["true_negative_rate"] = tn / (tn + fp) if (tn + fp) > 0 else 0
            metrics["false_positive_rate"] = fp / (fp + tn) if (fp + tn) > 0 else 0

        return metrics

    @staticmethod
    def calculate_regression_metrics(
        y_true: List[float],
        y_pred: List[float]
    ) -> Dict[str, float]:
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)

        metrics = {
            "mse": mean_squared_error(y_true, y_pred),
            "rmse": np.sqrt(mean_squared_error(y_true, y_pred)),
            "mae": mean_absolute_error(y_true, y_pred),
            "r2": r2_score(y_true, y_pred)
        }

        residuals = y_true - y_pred
        metrics["mean_residual"] = np.mean(residuals)
        metrics["std_residual"] = np.std(residuals)

        return metrics

    @staticmethod
    def statistical_tests(
        baseline_metrics: Dict[str, float],
        current_metrics: Dict[str, float],
        significance_level: float = 0.05
    ) -> Dict[str, Any]:
        results = {}

        for metric_name in baseline_metrics.keys():
            if metric_name in current_metrics:
                baseline_val = baseline_metrics[metric_name]
                current_val = current_metrics[metric_name]

                diff = current_val - baseline_val
                pct_change = (diff / baseline_val * 100) if baseline_val != 0 else 0

                results[metric_name] = {
                    "baseline": baseline_val,
                    "current": current_val,
                    "difference": diff,
                    "percent_change": pct_change,
                    "degraded": diff < 0
                }

        return results

    @staticmethod
    def detect_drift(
        baseline_predictions: List[float],
        current_predictions: List[float],
        significance_level: float = 0.05
    ) -> Dict[str, Any]:
        baseline = np.array(baseline_predictions)
        current = np.array(current_predictions)

        ks_statistic, ks_pvalue = stats.ks_2samp(baseline, current)

        baseline_mean = np.mean(baseline)
        current_mean = np.mean(current)

        t_statistic, t_pvalue = stats.ttest_ind(baseline, current)

        return {
            "ks_test": {
                "statistic": float(ks_statistic),
                "p_value": float(ks_pvalue),
                "drift_detected": ks_pvalue < significance_level
            },
            "t_test": {
                "statistic": float(t_statistic),
                "p_value": float(t_pvalue),
                "significant_difference": t_pvalue < significance_level
            },
            "distribution_stats": {
                "baseline_mean": float(baseline_mean),
                "current_mean": float(current_mean),
                "baseline_std": float(np.std(baseline)),
                "current_std": float(np.std(current))
            }
        }
