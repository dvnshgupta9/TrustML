from typing import Dict, Any, List
from database import get_supabase

class PolicyEngine:

    @staticmethod
    def evaluate_performance_threshold_policy(
        conditions: Dict[str, Any],
        metrics: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        required_metrics = conditions.get("required_metrics", {})

        passed = True
        details = {}
        violations = []

        for metric_name, threshold_config in required_metrics.items():
            threshold = threshold_config.get("threshold")
            operator = threshold_config.get("operator", ">=")

            metric_values = [m for m in metrics if m["metric_type"] == metric_name]

            if not metric_values:
                passed = False
                violations.append(f"Missing required metric: {metric_name}")
                continue

            metric_value = metric_values[0]["value"]

            if operator == ">=":
                metric_passed = metric_value >= threshold
            elif operator == "<=":
                metric_passed = metric_value <= threshold
            elif operator == ">":
                metric_passed = metric_value > threshold
            elif operator == "<":
                metric_passed = metric_value < threshold
            elif operator == "==":
                metric_passed = metric_value == threshold
            else:
                metric_passed = False

            details[metric_name] = {
                "value": metric_value,
                "threshold": threshold,
                "operator": operator,
                "passed": metric_passed
            }

            if not metric_passed:
                passed = False
                violations.append(
                    f"{metric_name} = {metric_value} does not meet threshold {operator} {threshold}"
                )

        return {
            "passed": passed,
            "details": details,
            "violations": violations
        }

    @staticmethod
    def evaluate_fairness_requirement_policy(
        conditions: Dict[str, Any],
        fairness_evaluations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        required_attributes = conditions.get("required_attributes", [])
        required_metrics = conditions.get("required_metrics", [])

        passed = True
        details = {}
        violations = []

        for attr in required_attributes:
            attr_evals = [f for f in fairness_evaluations if f["protected_attribute"] == attr]

            if not attr_evals:
                passed = False
                violations.append(f"Missing fairness evaluation for attribute: {attr}")
                continue

            for metric_name in required_metrics:
                metric_evals = [e for e in attr_evals if e["metric_name"] == metric_name]

                if not metric_evals:
                    passed = False
                    violations.append(
                        f"Missing fairness metric {metric_name} for attribute {attr}"
                    )
                    continue

                evaluation = metric_evals[0]

                if not evaluation["threshold_passed"]:
                    passed = False
                    violations.append(
                        f"Fairness violation: {attr} - {metric_name} = {evaluation['value']}"
                    )

                details[f"{attr}_{metric_name}"] = {
                    "value": evaluation["value"],
                    "threshold_passed": evaluation["threshold_passed"]
                }

        return {
            "passed": passed,
            "details": details,
            "violations": violations
        }

    @staticmethod
    def evaluate_statistical_test_policy(
        conditions: Dict[str, Any],
        metrics: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        test_type = conditions.get("test_type", "degradation_check")
        baseline_version_id = conditions.get("baseline_version_id")
        significance_level = conditions.get("significance_level", 0.05)

        passed = True
        details = {}
        violations = []

        if not baseline_version_id:
            return {
                "passed": False,
                "details": {"error": "No baseline version specified"},
                "violations": ["No baseline version specified for comparison"]
            }

        supabase = get_supabase()
        baseline_metrics_response = supabase.table("metrics").select("*").eq(
            "model_version_id", baseline_version_id
        ).execute()

        baseline_metrics = {m["metric_type"]: m["value"] for m in baseline_metrics_response.data}
        current_metrics = {m["metric_type"]: m["value"] for m in metrics}

        for metric_name, baseline_value in baseline_metrics.items():
            if metric_name not in current_metrics:
                continue

            current_value = current_metrics[metric_name]

            if test_type == "degradation_check":
                degradation_threshold = conditions.get("max_degradation_pct", 5.0)

                if baseline_value > 0:
                    pct_change = ((current_value - baseline_value) / baseline_value) * 100
                else:
                    pct_change = 0

                metric_passed = pct_change >= -degradation_threshold

                details[metric_name] = {
                    "baseline": baseline_value,
                    "current": current_value,
                    "pct_change": pct_change,
                    "threshold": -degradation_threshold,
                    "passed": metric_passed
                }

                if not metric_passed:
                    passed = False
                    violations.append(
                        f"{metric_name} degraded by {abs(pct_change):.2f}% "
                        f"(threshold: {degradation_threshold}%)"
                    )

        return {
            "passed": passed,
            "details": details,
            "violations": violations
        }

    @staticmethod
    async def evaluate_all_policies(
        model_version_id: str
    ) -> Dict[str, Any]:
        supabase = get_supabase()

        policies_response = supabase.table("policies").select("*").eq("is_active", True).execute()
        policies = policies_response.data

        metrics_response = supabase.table("metrics").select("*").eq(
            "model_version_id", model_version_id
        ).execute()
        metrics = metrics_response.data

        fairness_response = supabase.table("fairness_evaluations").select("*").eq(
            "model_version_id", model_version_id
        ).execute()
        fairness_evals = fairness_response.data

        results = {
            "all_passed": True,
            "policy_results": [],
            "total_violations": []
        }

        for policy in policies:
            if policy["policy_type"] == "performance_threshold":
                result = PolicyEngine.evaluate_performance_threshold_policy(
                    policy["conditions"], metrics
                )
            elif policy["policy_type"] == "fairness_requirement":
                result = PolicyEngine.evaluate_fairness_requirement_policy(
                    policy["conditions"], fairness_evals
                )
            elif policy["policy_type"] == "statistical_test":
                result = PolicyEngine.evaluate_statistical_test_policy(
                    policy["conditions"], metrics
                )
            else:
                result = {
                    "passed": False,
                    "details": {"error": f"Unknown policy type: {policy['policy_type']}"},
                    "violations": ["Unknown policy type"]
                }

            policy_eval = {
                "policy_id": policy["id"],
                "policy_name": policy["name"],
                "policy_type": policy["policy_type"],
                "passed": result["passed"],
                "details": result["details"],
                "violations": result.get("violations", [])
            }

            results["policy_results"].append(policy_eval)

            if not result["passed"]:
                results["all_passed"] = False
                results["total_violations"].extend(result.get("violations", []))

            supabase.table("policy_evaluations").insert({
                "model_version_id": model_version_id,
                "policy_id": policy["id"],
                "passed": result["passed"],
                "details": result
            }).execute()

        return results
