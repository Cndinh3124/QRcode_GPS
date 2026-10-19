output "application_url" {
  description = "URL công khai của ứng dụng. Dùng HTTPS nếu đã cấu hình domain và Route 53."
  value       = local.enable_tls ? "https://${var.domain_name}" : "http://${aws_lb.app.dns_name}"
}

output "load_balancer_dns_name" {
  description = "DNS name của Application Load Balancer."
  value       = aws_lb.app.dns_name
}

output "ec2_instance_id" {
  description = "Instance ID; dùng AWS Systems Manager Session Manager để truy cập, không cần mở SSH."
  value       = aws_instance.app.id
}

output "rds_endpoint" {
  description = "Endpoint MySQL riêng tư; không thể truy cập trực tiếp từ Internet."
  value       = aws_db_instance.main.address
}

output "rds_database_name" {
  value = var.db_name
}

output "rds_master_secret_arn" {
  description = "Secrets Manager ARN chứa mật khẩu master do RDS tự quản lý."
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
  sensitive   = true
}

output "ssm_connect_command" {
  description = "Lệnh mở phiên quản trị EC2 bằng AWS Systems Manager Session Manager."
  value       = "aws ssm start-session --target ${aws_instance.app.id} --region ${var.aws_region}"
}
