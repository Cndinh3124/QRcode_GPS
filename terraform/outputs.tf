# URL de mo ung dung tren trinh duyet.
output "application_url" {
  description = "Dia chi cong khai cua ung dung."
  value       = local.enable_tls ? "https://${var.domain_name}" : "http://${aws_lb.app.dns_name}"
}

# DNS tu dong duoc AWS tao cho Load Balancer.
output "load_balancer_dns_name" {
  description = "Ten DNS cua Application Load Balancer."
  value       = aws_lb.app.dns_name
}

# Dung Instance ID nay de mo terminal qua Systems Manager.
output "ec2_instance_id" {
  description = "ID may EC2 dung de ket noi bang Session Manager."
  value       = aws_instance.app.id
}

# RDS nam trong mang rieng, khong truy cap truc tiep tu Internet.
output "rds_endpoint" {
  description = "Dia chi ket noi MySQL rieng tu."
  value       = aws_db_instance.main.address
}

output "rds_database_name" {
  description = "Ten co so du lieu cua ung dung."
  value       = var.db_name
}

# Gia tri nhay cam. Chi lay khi can cap nhat thong tin ket noi.
output "rds_master_secret_arn" {
  description = "ARN cua secret chua mat khau quan tri RDS."
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
  sensitive   = true
}

# Lenh nay mo terminal tren EC2 ma khong can mo cong SSH.
output "ssm_connect_command" {
  description = "Lenh ket noi EC2 bang AWS Systems Manager Session Manager."
  value       = "aws ssm start-session --target ${aws_instance.app.id} --region ${var.aws_region}"
}
