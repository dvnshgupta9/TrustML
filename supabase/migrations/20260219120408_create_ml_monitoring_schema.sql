/*
  # ML Model Monitoring and Fairness Evaluation System Schema

  ## Overview
  This migration creates a comprehensive schema for tracking ML models, their performance metrics,
  fairness evaluations, deployment policies, and monitoring alerts.

  ## Tables Created

  ### 1. users
  Stores user information for authentication and audit trails
  - `id` (uuid, primary key) - User identifier from auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role (admin, data_scientist, viewer)
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. models
  Stores ML model metadata and high-level information
  - `id` (uuid, primary key) - Unique model identifier
  - `name` (text) - Model name
  - `description` (text) - Model description
  - `model_type` (text) - Type of model (classification, regression, etc.)
  - `use_case` (text) - Business use case
  - `owner_id` (uuid) - Reference to users table
  - `created_at` (timestamptz) - Model creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. model_versions
  Tracks different versions of each model with training metadata
  - `id` (uuid, primary key) - Version identifier
  - `model_id` (uuid) - Reference to models table
  - `version` (text) - Version number/tag
  - `training_data_info` (jsonb) - Information about training data
  - `hyperparameters` (jsonb) - Model hyperparameters
  - `framework` (text) - ML framework used
  - `status` (text) - Version status (training, testing, approved, rejected, deployed)
  - `created_by` (uuid) - User who created this version
  - `created_at` (timestamptz) - Version creation timestamp

  ### 4. metrics
  Stores performance metrics for each model version
  - `id` (uuid, primary key) - Metric identifier
  - `model_version_id` (uuid) - Reference to model_versions
  - `metric_type` (text) - Type of metric (accuracy, precision, recall, f1, auc_roc, mse, mae, etc.)
  - `value` (numeric) - Metric value
  - `dataset_type` (text) - Dataset used (train, validation, test, production)
  - `computed_at` (timestamptz) - When metric was computed
  - `metadata` (jsonb) - Additional metric metadata

  ### 5. fairness_evaluations
  Stores fairness evaluation results for protected attributes
  - `id` (uuid, primary key) - Evaluation identifier
  - `model_version_id` (uuid) - Reference to model_versions
  - `protected_attribute` (text) - Attribute being evaluated (race, gender, age, etc.)
  - `metric_name` (text) - Fairness metric (demographic_parity, equal_opportunity, disparate_impact, etc.)
  - `value` (numeric) - Metric value
  - `group_metrics` (jsonb) - Per-group breakdowns
  - `threshold_passed` (boolean) - Whether fairness threshold was met
  - `evaluated_at` (timestamptz) - Evaluation timestamp
  - `metadata` (jsonb) - Additional evaluation metadata

  ### 6. policies
  Defines deployment policies and gating criteria
  - `id` (uuid, primary key) - Policy identifier
  - `name` (text) - Policy name
  - `description` (text) - Policy description
  - `policy_type` (text) - Type (performance_threshold, fairness_requirement, statistical_test)
  - `conditions` (jsonb) - Policy conditions and thresholds
  - `is_active` (boolean) - Whether policy is currently enforced
  - `created_by` (uuid) - User who created policy
  - `created_at` (timestamptz) - Policy creation timestamp

  ### 7. policy_evaluations
  Tracks policy evaluation results for model versions
  - `id` (uuid, primary key) - Evaluation identifier
  - `model_version_id` (uuid) - Reference to model_versions
  - `policy_id` (uuid) - Reference to policies
  - `passed` (boolean) - Whether model passed the policy
  - `details` (jsonb) - Detailed evaluation results
  - `evaluated_at` (timestamptz) - Evaluation timestamp

  ### 8. deployments
  Tracks model deployment history
  - `id` (uuid, primary key) - Deployment identifier
  - `model_version_id` (uuid) - Reference to model_versions
  - `environment` (text) - Deployment environment (staging, production)
  - `status` (text) - Deployment status (pending, active, rolled_back)
  - `deployed_by` (uuid) - User who deployed
  - `deployed_at` (timestamptz) - Deployment timestamp
  - `rollback_at` (timestamptz) - Rollback timestamp if applicable
  - `metadata` (jsonb) - Additional deployment metadata

  ### 9. monitoring_alerts
  Stores monitoring alerts for production models
  - `id` (uuid, primary key) - Alert identifier
  - `model_version_id` (uuid) - Reference to model_versions
  - `alert_type` (text) - Type of alert (performance_degradation, fairness_violation, data_drift)
  - `severity` (text) - Alert severity (low, medium, high, critical)
  - `message` (text) - Alert message
  - `details` (jsonb) - Detailed alert information
  - `acknowledged` (boolean) - Whether alert has been acknowledged
  - `acknowledged_by` (uuid) - User who acknowledged
  - `acknowledged_at` (timestamptz) - Acknowledgment timestamp
  - `created_at` (timestamptz) - Alert creation timestamp

  ## Security
  - RLS enabled on all tables
  - Policies ensure users can only access data they own or have permission to view
  - Admin users have full access
  - Data scientists can create and manage models
  - Viewers have read-only access
*/

-- Create users table for app user management
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'data_scientist', 'viewer')),
  created_at timestamptz DEFAULT now()
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  model_type text NOT NULL CHECK (model_type IN ('classification', 'regression', 'clustering', 'ranking')),
  use_case text,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create model_versions table
CREATE TABLE IF NOT EXISTS model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  version text NOT NULL,
  training_data_info jsonb DEFAULT '{}',
  hyperparameters jsonb DEFAULT '{}',
  framework text,
  status text NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'testing', 'approved', 'rejected', 'deployed')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(model_id, version)
);

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid NOT NULL REFERENCES model_versions(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  value numeric NOT NULL,
  dataset_type text NOT NULL CHECK (dataset_type IN ('train', 'validation', 'test', 'production')),
  computed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Create fairness_evaluations table
CREATE TABLE IF NOT EXISTS fairness_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid NOT NULL REFERENCES model_versions(id) ON DELETE CASCADE,
  protected_attribute text NOT NULL,
  metric_name text NOT NULL,
  value numeric NOT NULL,
  group_metrics jsonb DEFAULT '{}',
  threshold_passed boolean NOT NULL,
  evaluated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  policy_type text NOT NULL CHECK (policy_type IN ('performance_threshold', 'fairness_requirement', 'statistical_test')),
  conditions jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create policy_evaluations table
CREATE TABLE IF NOT EXISTS policy_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid NOT NULL REFERENCES model_versions(id) ON DELETE CASCADE,
  policy_id uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  passed boolean NOT NULL,
  details jsonb DEFAULT '{}',
  evaluated_at timestamptz DEFAULT now()
);

-- Create deployments table
CREATE TABLE IF NOT EXISTS deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid NOT NULL REFERENCES model_versions(id) ON DELETE CASCADE,
  environment text NOT NULL CHECK (environment IN ('staging', 'production')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rolled_back')),
  deployed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deployed_at timestamptz DEFAULT now(),
  rollback_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

-- Create monitoring_alerts table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid REFERENCES model_versions(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('performance_degradation', 'fairness_violation', 'data_drift', 'anomaly_detected')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message text NOT NULL,
  details jsonb DEFAULT '{}',
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_models_owner ON models(owner_id);
CREATE INDEX IF NOT EXISTS idx_model_versions_model ON model_versions(model_id);
CREATE INDEX IF NOT EXISTS idx_model_versions_status ON model_versions(status);
CREATE INDEX IF NOT EXISTS idx_metrics_version ON metrics(model_version_id);
CREATE INDEX IF NOT EXISTS idx_fairness_version ON fairness_evaluations(model_version_id);
CREATE INDEX IF NOT EXISTS idx_policy_eval_version ON policy_evaluations(model_version_id);
CREATE INDEX IF NOT EXISTS idx_deployments_version ON deployments(model_version_id);
CREATE INDEX IF NOT EXISTS idx_alerts_version ON monitoring_alerts(model_version_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON monitoring_alerts(acknowledged);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE fairness_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for models table
CREATE POLICY "Users can view all models"
  ON models FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Data scientists and admins can create models"
  ON models FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  );

CREATE POLICY "Model owners and admins can update models"
  ON models FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Model owners and admins can delete models"
  ON models FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for model_versions table
CREATE POLICY "Users can view all model versions"
  ON model_versions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Data scientists and admins can create model versions"
  ON model_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  );

CREATE POLICY "Data scientists and admins can update model versions"
  ON model_versions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  );

-- RLS Policies for metrics table
CREATE POLICY "Users can view all metrics"
  ON metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Data scientists and admins can insert metrics"
  ON metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  );

-- RLS Policies for fairness_evaluations table
CREATE POLICY "Users can view all fairness evaluations"
  ON fairness_evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Data scientists and admins can insert fairness evaluations"
  ON fairness_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  );

-- RLS Policies for policies table
CREATE POLICY "Users can view all policies"
  ON policies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage policies"
  ON policies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for policy_evaluations table
CREATE POLICY "Users can view all policy evaluations"
  ON policy_evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Data scientists and admins can insert policy evaluations"
  ON policy_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  );

-- RLS Policies for deployments table
CREATE POLICY "Users can view all deployments"
  ON deployments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Data scientists and admins can manage deployments"
  ON deployments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  );

-- RLS Policies for monitoring_alerts table
CREATE POLICY "Users can view all alerts"
  ON monitoring_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create alerts"
  ON monitoring_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Data scientists and admins can acknowledge alerts"
  ON monitoring_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  );