variable "aws_region" {
  description = "AWS Region triển khai hạ tầng. Singapore thường phù hợp cho người dùng tại Việt Nam."
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Tên ngắn dùng trong tên tài nguyên AWS. Chỉ dùng chữ thường, số và dấu gạch ngang."
  type        = string
  default     = "qr-event"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,19}$", var.project_name))
    error_message = "project_name phải dài 3-20 ký tự, bắt đầu bằng chữ thường và chỉ gồm chữ thường, số hoặc dấu gạch ngang."
  }
}

variable "environment" {
  description = "Tên môi trường, ví dụ dev hoặc production."
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "Loại EC2 chạy ứng dụng. Có thể tăng cấu hình khi tải thực tế yêu cầu."
  type        = string
  default     = "t3.small"
}

variable "db_instance_class" {
  description = "Loại máy chủ Amazon RDS for MySQL."
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Tên cơ sở dữ liệu MySQL được tạo trên RDS."
  type        = string
  default     = "qr_event_checkin"
}

variable "db_master_username" {
  description = "Tên tài khoản quản trị RDS; mật khẩu sẽ do RDS tạo và lưu trong Secrets Manager."
  type        = string
  default     = "qradmin"
  sensitive   = true
}

variable "domain_name" {
  description = "Tên miền đầy đủ cho ứng dụng, ví dụ qr.example.com. Để trống nếu chưa cấu hình tên miền."
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "ID public hosted zone Route 53 đang quản lý domain_name. Để trống nếu chưa dùng Route 53."
  type        = string
  default     = ""
}

variable "rds_multi_az" {
  description = "Bật triển khai RDS Multi-AZ. Tăng khả năng sẵn sàng và chi phí."
  type        = bool
  default     = false
}

variable "rds_deletion_protection" {
  description = "Bảo vệ RDS khỏi thao tác xóa. Bật cho môi trường production có dữ liệu cần giữ."
  type        = bool
  default     = true
}

variable "rds_skip_final_snapshot" {
  description = "Bỏ snapshot cuối khi xóa RDS. Chỉ bật cho môi trường thử nghiệm có thể tạo lại dữ liệu."
  type        = bool
  default     = false
}
