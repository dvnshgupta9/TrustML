import numpy as np
from typing import Dict, List, Any, Optional
from collections import defaultdict

class FairnessEvaluator:

    @staticmethod
    def demographic_parity(
        y_pred: List[float],
        protected_attribute: List[Any]
    ) -> Dict[str, Any]:
        protected = np.array(protected_attribute)
        predictions = np.array(y_pred)

        groups = np.unique(protected)
        group_rates = {}

        for group in groups:
            group_mask = protected == group
            positive_rate = np.mean(predictions[group_mask])
            group_rates[str(group)] = float(positive_rate)

        max_rate = max(group_rates.values())
        min_rate = min(group_rates.values())

        dp_difference = max_rate - min_rate

        threshold_passed = dp_difference <= 0.1

        return {
            "metric_value": dp_difference,
            "group_rates": group_rates,
            "threshold_passed": threshold_passed,
            "interpretation": "Lower is better. Values <= 0.1 indicate fairness."
        }

    @staticmethod
    def equal_opportunity(
        y_true: List[float],
        y_pred: List[float],
        protected_attribute: List[Any]
    ) -> Dict[str, Any]:
        true_labels = np.array(y_true)
        predictions = np.array(y_pred)
        protected = np.array(protected_attribute)

        groups = np.unique(protected)
        tpr_by_group = {}

        for group in groups:
            group_mask = protected == group
            positive_mask = true_labels == 1
            combined_mask = group_mask & positive_mask

            if np.sum(combined_mask) > 0:
                tpr = np.mean(predictions[combined_mask])
                tpr_by_group[str(group)] = float(tpr)
            else:
                tpr_by_group[str(group)] = 0.0

        if len(tpr_by_group) > 0:
            max_tpr = max(tpr_by_group.values())
            min_tpr = min(tpr_by_group.values())
            eo_difference = max_tpr - min_tpr
        else:
            eo_difference = 0.0

        threshold_passed = eo_difference <= 0.1

        return {
            "metric_value": eo_difference,
            "group_tpr": tpr_by_group,
            "threshold_passed": threshold_passed,
            "interpretation": "Measures difference in true positive rates. Lower is better."
        }

    @staticmethod
    def disparate_impact(
        y_pred: List[float],
        protected_attribute: List[Any],
        privileged_group: Any,
        unprivileged_group: Any
    ) -> Dict[str, Any]:
        protected = np.array(protected_attribute)
        predictions = np.array(y_pred)

        privileged_mask = protected == privileged_group
        unprivileged_mask = protected == unprivileged_group

        privileged_rate = np.mean(predictions[privileged_mask]) if np.sum(privileged_mask) > 0 else 0
        unprivileged_rate = np.mean(predictions[unprivileged_mask]) if np.sum(unprivileged_mask) > 0 else 0

        if privileged_rate > 0:
            di_ratio = unprivileged_rate / privileged_rate
        else:
            di_ratio = 0.0

        threshold_passed = 0.8 <= di_ratio <= 1.25

        return {
            "metric_value": di_ratio,
            "privileged_rate": float(privileged_rate),
            "unprivileged_rate": float(unprivileged_rate),
            "threshold_passed": threshold_passed,
            "interpretation": "Ratio should be between 0.8 and 1.25 for fairness."
        }

    @staticmethod
    def equalized_odds(
        y_true: List[float],
        y_pred: List[float],
        protected_attribute: List[Any]
    ) -> Dict[str, Any]:
        true_labels = np.array(y_true)
        predictions = np.array(y_pred)
        protected = np.array(protected_attribute)

        groups = np.unique(protected)
        group_metrics = {}

        for group in groups:
            group_mask = protected == group

            positive_mask = true_labels == 1
            negative_mask = true_labels == 0

            tp_mask = group_mask & positive_mask
            tn_mask = group_mask & negative_mask

            tpr = np.mean(predictions[tp_mask]) if np.sum(tp_mask) > 0 else 0
            fpr = np.mean(predictions[tn_mask]) if np.sum(tn_mask) > 0 else 0

            group_metrics[str(group)] = {
                "tpr": float(tpr),
                "fpr": float(fpr)
            }

        tpr_values = [m["tpr"] for m in group_metrics.values()]
        fpr_values = [m["fpr"] for m in group_metrics.values()]

        tpr_diff = max(tpr_values) - min(tpr_values) if tpr_values else 0
        fpr_diff = max(fpr_values) - min(fpr_values) if fpr_values else 0

        max_diff = max(tpr_diff, fpr_diff)
        threshold_passed = max_diff <= 0.1

        return {
            "metric_value": max_diff,
            "group_metrics": group_metrics,
            "tpr_difference": tpr_diff,
            "fpr_difference": fpr_diff,
            "threshold_passed": threshold_passed,
            "interpretation": "Measures fairness in both TPR and FPR. Lower is better."
        }

    @staticmethod
    def evaluate_all_fairness_metrics(
        y_true: List[float],
        y_pred: List[float],
        protected_attributes: Dict[str, List[Any]]
    ) -> Dict[str, Dict[str, Any]]:
        results = {}

        for attr_name, attr_values in protected_attributes.items():
            results[attr_name] = {}

            results[attr_name]["demographic_parity"] = FairnessEvaluator.demographic_parity(
                y_pred, attr_values
            )

            results[attr_name]["equal_opportunity"] = FairnessEvaluator.equal_opportunity(
                y_true, y_pred, attr_values
            )

            results[attr_name]["equalized_odds"] = FairnessEvaluator.equalized_odds(
                y_true, y_pred, attr_values
            )

        return results
