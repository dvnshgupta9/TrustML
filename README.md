# ML Model Monitoring and Fairness Evaluation System

An advanced machine learning model monitoring system with comprehensive fairness evaluation, deployment gating, and production monitoring capabilities.

## Features

### Core Capabilities
- **ML Metrics Tracking**: Monitor accuracy, precision, recall, F1, AUC-ROC, MSE, MAE, and more
- **Fairness Evaluation**: Assess demographic parity, equal opportunity, disparate impact, and equalized odds
- **Statistical Testing**: Detect performance degradation and data drift
- **Policy Engine**: Automated deployment gating based on configurable policies
- **Production Monitoring**: Real-time alerts for performance and fairness violations
- **Authentication**: Secure user authentication with role-based access control

### Technical Stack
- **Backend**: Python, FastAPI, Scikit-learn, Pandas
- **Frontend**: React, TypeScript, Chart.js, Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **DevOps**: Docker, Docker Compose

## Architecture

### Database Schema
- **users**: User management with role-based access
- **models**: ML model metadata
- **model_versions**: Version tracking with training metadata
- **metrics**: Performance metrics storage
- **fairness_evaluations**: Fairness assessment results
- **policies**: Deployment policy definitions
- **policy_evaluations**: Policy evaluation history
- **deployments**: Deployment tracking and management
- **monitoring_alerts**: Production monitoring alerts

### User Roles
- **Admin**: Full system access, policy management
- **Data Scientist**: Model creation, training, evaluation, deployment
- **Viewer**: Read-only access to dashboards and reports

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker and Docker Compose
- Supabase account

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

3. Update the `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running with Docker

```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Running Locally

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /users` - Create user profile
- `GET /users/me` - Get current user info

### Models
- `GET /models` - List all models
- `POST /models` - Create new model
- `GET /models/{id}` - Get model details
- `GET /models/{id}/versions` - List model versions

### Model Versions
- `POST /model-versions` - Create new version
- `GET /model-versions/{id}` - Get version details
- `PATCH /model-versions/{id}/status` - Update version status

### Metrics
- `POST /metrics` - Record metrics
- `GET /model-versions/{id}/metrics` - Get version metrics
- `POST /evaluate/metrics` - Calculate metrics from predictions

### Fairness
- `POST /fairness-evaluations` - Record fairness evaluation
- `GET /model-versions/{id}/fairness` - Get fairness evaluations
- `POST /evaluate/fairness` - Evaluate fairness metrics

### Policies
- `GET /policies` - List policies
- `POST /policies` - Create policy (admin only)
- `POST /model-versions/{id}/evaluate-policies` - Run policy checks

### Deployments
- `POST /deployments` - Deploy model (requires passing policies)
- `GET /deployments` - List deployments

### Monitoring
- `GET /alerts` - List alerts
- `POST /alerts` - Create alert
- `PATCH /alerts/{id}/acknowledge` - Acknowledge alert

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## Fairness Metrics

### Demographic Parity
Measures difference in positive prediction rates across groups. Target: ≤ 0.1

### Equal Opportunity
Measures difference in true positive rates across groups. Target: ≤ 0.1

### Disparate Impact
Ratio of positive rates between unprivileged and privileged groups. Target: 0.8 - 1.25

### Equalized Odds
Measures fairness in both TPR and FPR across groups. Target: ≤ 0.1

## Policy Types

### Performance Threshold
Require minimum performance metrics before deployment:
```json
{
  "policy_type": "performance_threshold",
  "conditions": {
    "required_metrics": {
      "accuracy": {"threshold": 0.8, "operator": ">="},
      "f1_score": {"threshold": 0.75, "operator": ">="}
    }
  }
}
```

### Fairness Requirement
Enforce fairness constraints:
```json
{
  "policy_type": "fairness_requirement",
  "conditions": {
    "required_attributes": ["gender", "race"],
    "required_metrics": ["demographic_parity", "equal_opportunity"]
  }
}
```

### Statistical Test
Compare against baseline version:
```json
{
  "policy_type": "statistical_test",
  "conditions": {
    "test_type": "degradation_check",
    "baseline_version_id": "uuid",
    "max_degradation_pct": 5.0,
    "significance_level": 0.05
  }
}
```

## Deployment Gating

Models must pass all active policies before deployment:

1. Create model and version
2. Record metrics and fairness evaluations
3. Evaluate against policies
4. Deploy if all policies pass

The system automatically blocks deployment if any policy fails.

## Monitoring and Alerts

Alert types:
- **performance_degradation**: Model performance below threshold
- **fairness_violation**: Fairness constraints violated
- **data_drift**: Statistical distribution shift detected
- **anomaly_detected**: Unusual patterns in predictions

Alert severities: low, medium, high, critical

## Best Practices

1. **Establish Baselines**: Create baseline versions for comparison
2. **Regular Monitoring**: Review alerts and metrics frequently
3. **Fairness First**: Evaluate fairness before deploying
4. **Policy Management**: Keep policies aligned with business requirements
5. **Version Control**: Track hyperparameters and training data info
6. **Documentation**: Maintain clear model descriptions and use cases

## Security

- All endpoints require authentication
- Role-based access control enforced at database level
- Row Level Security (RLS) policies protect data
- Secure password storage via Supabase Auth

## License

MIT License

## Contributing

Contributions welcome! Please submit pull requests with:
- Clear description of changes
- Tests for new functionality
- Updated documentation
