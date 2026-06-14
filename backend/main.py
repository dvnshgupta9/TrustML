from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime

from database import get_supabase
from models import (
    UserCreate, UserResponse, ModelCreate, ModelResponse,
    ModelVersionCreate, ModelVersionResponse, MetricCreate, MetricResponse,
    FairnessEvaluationCreate, FairnessEvaluationResponse,
    PolicyCreate, PolicyResponse, PolicyEvaluationResponse,
    DeploymentCreate, DeploymentResponse, AlertCreate, AlertResponse,
    EvaluationRequest
)
from auth import get_current_user, require_role
from ml_metrics import MetricsCalculator
from fairness import FairnessEvaluator
from policy_engine import PolicyEngine

app = FastAPI(title="ML Model Monitoring API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "ML Model Monitoring and Fairness Evaluation API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user = Depends(get_current_user)
):
    supabase = get_supabase()

    user_dict = {
        "id": current_user.id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "role": user_data.role.value
    }

    response = supabase.table("users").upsert(user_dict).execute()
    return response.data[0]

@app.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    supabase = get_supabase()
    response = supabase.table("users").select("*").eq("id", current_user.id).maybeSingle().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    return response.data

@app.get("/models", response_model=List[ModelResponse])
async def list_models(current_user = Depends(get_current_user)):
    supabase = get_supabase()
    response = supabase.table("models").select("*").order("created_at", desc=True).execute()
    return response.data

@app.post("/models", response_model=ModelResponse)
async def create_model(
    model: ModelCreate,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    supabase = get_supabase()

    model_dict = {
        "name": model.name,
        "description": model.description,
        "model_type": model.model_type.value,
        "use_case": model.use_case,
        "owner_id": current_user.id
    }

    response = supabase.table("models").insert(model_dict).execute()
    return response.data[0]

@app.get("/models/{model_id}", response_model=ModelResponse)
async def get_model(model_id: str, current_user = Depends(get_current_user)):
    supabase = get_supabase()
    response = supabase.table("models").select("*").eq("id", model_id).maybeSingle().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Model not found")

    return response.data

@app.get("/models/{model_id}/versions", response_model=List[ModelVersionResponse])
async def list_model_versions(model_id: str, current_user = Depends(get_current_user)):
    supabase = get_supabase()
    response = supabase.table("model_versions").select("*").eq(
        "model_id", model_id
    ).order("created_at", desc=True).execute()
    return response.data

@app.post("/model-versions", response_model=ModelVersionResponse)
async def create_model_version(
    version: ModelVersionCreate,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    supabase = get_supabase()

    version_dict = {
        "model_id": version.model_id,
        "version": version.version,
        "training_data_info": version.training_data_info,
        "hyperparameters": version.hyperparameters,
        "framework": version.framework,
        "created_by": current_user.id
    }

    response = supabase.table("model_versions").insert(version_dict).execute()
    return response.data[0]

@app.get("/model-versions/{version_id}", response_model=ModelVersionResponse)
async def get_model_version(version_id: str, current_user = Depends(get_current_user)):
    supabase = get_supabase()
    response = supabase.table("model_versions").select("*").eq("id", version_id).maybeSingle().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Model version not found")

    return response.data

@app.patch("/model-versions/{version_id}/status")
async def update_version_status(
    version_id: str,
    status: str,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    supabase = get_supabase()
    response = supabase.table("model_versions").update({"status": status}).eq("id", version_id).execute()
    return response.data[0]

@app.post("/metrics", response_model=MetricResponse)
async def create_metric(
    metric: MetricCreate,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    supabase = get_supabase()

    metric_dict = {
        "model_version_id": metric.model_version_id,
        "metric_type": metric.metric_type,
        "value": metric.value,
        "dataset_type": metric.dataset_type.value,
        "metadata": metric.metadata
    }

    response = supabase.table("metrics").insert(metric_dict).execute()
    return response.data[0]

@app.get("/model-versions/{version_id}/metrics", response_model=List[MetricResponse])
async def list_metrics(version_id: str, current_user = Depends(get_current_user)):
    supabase = get_supabase()
    response = supabase.table("metrics").select("*").eq(
        "model_version_id", version_id
    ).order("computed_at", desc=True).execute()
    return response.data

@app.post("/evaluate/metrics")
async def evaluate_metrics(
    request: EvaluationRequest,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    calculator = MetricsCalculator()

    if request.task_type == "classification":
        metrics = calculator.calculate_classification_metrics(
            request.actuals,
            request.predictions,
            request.probabilities
        )
    elif request.task_type == "regression":
        metrics = calculator.calculate_regression_metrics(
            request.actuals,
            request.predictions
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid task type")

    return {"metrics": metrics}

@app.post("/evaluate/fairness")
async def evaluate_fairness(
    request: EvaluationRequest,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    if not request.protected_attributes:
        raise HTTPException(status_code=400, detail="Protected attributes required for fairness evaluation")

    evaluator = FairnessEvaluator()
    results = evaluator.evaluate_all_fairness_metrics(
        request.actuals,
        request.predictions,
        request.protected_attributes
    )

    return {"fairness_evaluations": results}

@app.post("/fairness-evaluations", response_model=FairnessEvaluationResponse)
async def create_fairness_evaluation(
    evaluation: FairnessEvaluationCreate,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    supabase = get_supabase()

    eval_dict = {
        "model_version_id": evaluation.model_version_id,
        "protected_attribute": evaluation.protected_attribute,
        "metric_name": evaluation.metric_name,
        "value": evaluation.value,
        "group_metrics": evaluation.group_metrics,
        "threshold_passed": evaluation.threshold_passed,
        "metadata": evaluation.metadata
    }

    response = supabase.table("fairness_evaluations").insert(eval_dict).execute()
    return response.data[0]

@app.get("/model-versions/{version_id}/fairness", response_model=List[FairnessEvaluationResponse])
async def list_fairness_evaluations(version_id: str, current_user = Depends(get_current_user)):
    supabase = get_supabase()
    response = supabase.table("fairness_evaluations").select("*").eq(
        "model_version_id", version_id
    ).order("evaluated_at", desc=True).execute()
    return response.data

@app.get("/policies", response_model=List[PolicyResponse])
async def list_policies(current_user = Depends(get_current_user)):
    supabase = get_supabase()
    response = supabase.table("policies").select("*").order("created_at", desc=True).execute()
    return response.data

@app.post("/policies", response_model=PolicyResponse)
async def create_policy(
    policy: PolicyCreate,
    current_user = Depends(require_role("admin"))
):
    supabase = get_supabase()

    policy_dict = {
        "name": policy.name,
        "description": policy.description,
        "policy_type": policy.policy_type.value,
        "conditions": policy.conditions,
        "is_active": policy.is_active,
        "created_by": current_user.id
    }

    response = supabase.table("policies").insert(policy_dict).execute()
    return response.data[0]

@app.post("/model-versions/{version_id}/evaluate-policies")
async def evaluate_policies(
    version_id: str,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    results = await PolicyEngine.evaluate_all_policies(version_id)
    return results

@app.get("/model-versions/{version_id}/policy-evaluations", response_model=List[PolicyEvaluationResponse])
async def list_policy_evaluations(version_id: str, current_user = Depends(get_current_user)):
    supabase = get_supabase()
    response = supabase.table("policy_evaluations").select("*").eq(
        "model_version_id", version_id
    ).order("evaluated_at", desc=True).execute()
    return response.data

@app.post("/deployments", response_model=DeploymentResponse)
async def create_deployment(
    deployment: DeploymentCreate,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    policy_results = await PolicyEngine.evaluate_all_policies(deployment.model_version_id)

    if not policy_results["all_passed"]:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Model version failed policy evaluations and cannot be deployed",
                "violations": policy_results["total_violations"]
            }
        )

    supabase = get_supabase()

    deployment_dict = {
        "model_version_id": deployment.model_version_id,
        "environment": deployment.environment,
        "status": "active",
        "deployed_by": current_user.id,
        "metadata": deployment.metadata
    }

    response = supabase.table("deployments").insert(deployment_dict).execute()

    supabase.table("model_versions").update({"status": "deployed"}).eq(
        "id", deployment.model_version_id
    ).execute()

    return response.data[0]

@app.get("/deployments", response_model=List[DeploymentResponse])
async def list_deployments(
    environment: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    supabase = get_supabase()
    query = supabase.table("deployments").select("*")

    if environment:
        query = query.eq("environment", environment)

    response = query.order("deployed_at", desc=True).execute()
    return response.data

@app.post("/alerts", response_model=AlertResponse)
async def create_alert(
    alert: AlertCreate,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    supabase = get_supabase()

    alert_dict = {
        "model_version_id": alert.model_version_id,
        "alert_type": alert.alert_type.value,
        "severity": alert.severity.value,
        "message": alert.message,
        "details": alert.details
    }

    response = supabase.table("monitoring_alerts").insert(alert_dict).execute()
    return response.data[0]

@app.get("/alerts", response_model=List[AlertResponse])
async def list_alerts(
    acknowledged: Optional[bool] = None,
    current_user = Depends(get_current_user)
):
    supabase = get_supabase()
    query = supabase.table("monitoring_alerts").select("*")

    if acknowledged is not None:
        query = query.eq("acknowledged", acknowledged)

    response = query.order("created_at", desc=True).execute()
    return response.data

@app.patch("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    current_user = Depends(require_role("data_scientist", "admin"))
):
    supabase = get_supabase()

    update_dict = {
        "acknowledged": True,
        "acknowledged_by": current_user.id,
        "acknowledged_at": datetime.now().isoformat()
    }

    response = supabase.table("monitoring_alerts").update(update_dict).eq("id", alert_id).execute()
    return response.data[0]

@app.get("/dashboard/stats")
async def get_dashboard_stats(current_user = Depends(get_current_user)):
    supabase = get_supabase()

    models_count = len(supabase.table("models").select("id").execute().data)
    versions_count = len(supabase.table("model_versions").select("id").execute().data)
    deployed_count = len(
        supabase.table("model_versions").select("id").eq("status", "deployed").execute().data
    )
    alerts_count = len(
        supabase.table("monitoring_alerts").select("id").eq("acknowledged", False).execute().data
    )

    return {
        "total_models": models_count,
        "total_versions": versions_count,
        "deployed_models": deployed_count,
        "unacknowledged_alerts": alerts_count
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
