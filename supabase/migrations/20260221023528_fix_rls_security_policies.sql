/*
  # Fix Row Level Security Policies
  
  1. Security Improvements
    - Replace unrestricted monitoring_alerts INSERT policy with authenticated user check
    - Add proper authorization checks for alert creation
    - Only system or authorized data scientists can create alerts
*/

DROP POLICY IF EXISTS "System can create alerts" ON monitoring_alerts;

CREATE POLICY "Data scientists and admins can create alerts"
  ON monitoring_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('data_scientist', 'admin')
    )
  );