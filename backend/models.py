from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    DATA_SCIENTIST = "data_scientist"
    VIEWER = "viewer"

class ModelType(str, Enum):
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    CLUSTERING = "clustering"
    RANKING = "ranking"

class VersionStatus(str, Enum):
    TRAINING = "training"
    TESTING = "testing"
    APPROVED = "approved"
    REJECTED = "rejected"
    DEPLOYED = "deployed"

class DatasetType(str, Enum):
    TRAIN = "train"
    VALIDATION = "validation"
    TEST = "test"
    PRODUCTION = "production"

class PolicyType(str, Enum):
    PERFORMANCE_THRESHOLD = "performance_threshold"
    FAIRNESS_REQUIREMENT = "fairness_requirement"
    STATISTICAL_TEST = "statistical_test"

class AlertType(str, Enum):
    PERFORMANCE_DEGRADATION = "performance_degradation"
    FAIRNESS_VIOLATION = "fairness_violation"
    DATA_DRIFT = "data_drift"
    ANOMALY_DETECTED = "anomaly_detected"

class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class UserCreate(BaseModel):
    email: str
    full_name: str
    role: UserRole = UserRole.VIEWER

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime

class ModelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    model_type: ModelType
    use_case: Optional[str] = None

class ModelResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    model_type: str
    use_case: Optional[str]
    owner_id: Optional[str]
    created_at: datetime
    updated_at: datetime

class ModelVersionCreate(BaseModel):
    model_id: str
    version: str
    training_data_info: Optional[Dict[str, Any]] = {}
    hyperparameters: Optional[Dict[str, Any]] = {}
    framework: Optional[str] = None

class ModelVersionResponse(BaseModel):
    id: str
    model_id: str
    version: str
    training_data_info: Dict[str, Any]
    hyperparameters: Dict[str, Any]
    framework: Optional[str]
    status: str
    created_by: Optional[str]
    created_at: datetime

class MetricCreate(BaseModel):
    model_version_id: str
    metric_type: str
    value: float
    dataset_type: DatasetType
    metadata: Optional[Dict[str, Any]] = {}

class MetricResponse(BaseModel):
    id: str
    model_version_id: str
    metric_type: str
    value: float
    dataset_type: str
    computed_at: datetime
    metadata: Dict[str, Any]

class FairnessEvaluationCreate(BaseModel):
    model_version_id: str
    protected_attribute: str
    metric_name: str
    value: float
    group_metrics: Dict[str, Any]
    threshold_passed: bool
    metadata: Optional[Dict[str, Any]] = {}

class FairnessEvaluationResponse(BaseModel):
    id: str
    model_version_id: str
    protected_attribute: str
    metric_name: str
    value: float
    group_metrics: Dict[str, Any]
    threshold_passed: bool
    evaluated_at: datetime
    metadata: Dict[str, Any]

class PolicyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    policy_type: PolicyType
    conditions: Dict[str, Any]
    is_active: bool = True

class PolicyResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    policy_type: str
    conditions: Dict[str, Any]
    is_active: bool
    created_by: Optional[str]
    created_at: datetime

class PolicyEvaluationResponse(BaseModel):
    id: str
    model_version_id: str
    policy_id: str
    passed: bool
    details: Dict[str, Any]
    evaluated_at: datetime

class DeploymentCreate(BaseModel):
    model_version_id: str
    environment: str
    metadata: Optional[Dict[str, Any]] = {}

class DeploymentResponse(BaseModel):
    id: str
    model_version_id: str
    environment: str
    status: str
    deployed_by: Optional[str]
    deployed_at: datetime
    rollback_at: Optional[datetime]
    metadata: Dict[str, Any]

class AlertCreate(BaseModel):
    model_version_id: Optional[str] = None
    alert_type: AlertType
    severity: Severity
    message: str
    details: Optional[Dict[str, Any]] = {}

class AlertResponse(BaseModel):
    id: str
    model_version_id: Optional[str]
    alert_type: str
    severity: str
    message: str
    details: Dict[str, Any]
    acknowledged: bool
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]
    created_at: datetime

class EvaluationRequest(BaseModel):
    predictions: List[float]
    actuals: List[float]
    probabilities: Optional[List[float]] = None
    protected_attributes: Optional[Dict[str, List[Any]]] = None
    task_type: str = "classification"
