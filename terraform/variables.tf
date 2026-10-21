# Khu vuc AWS noi tao tai nguyen. Singapore gan Viet Nam.
variable "aws_region" {
  description = "Khu vuc AWS de tao ha tang."
  type        = string
  default     = "ap-southeast-1"
}

# Ten nay duoc dung lam tien to cho tai nguyen AWS.
variable "project_name" {
  description = "Ten ngan cua du an. Chi dung chu thuong, so va dau gach ngang."
  type        = string
  default     = "qr-event"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,19}$", var.project_name))
    error_message = "Ten phai dai tu 3 den 20 ky tu, bat dau bang chu thuong va chi gom chu thuong, so hoac dau gach ngang."
  }
}

# Phan biet moi truong phat trien va moi truong chinh.
variable "environment" {
  description = "Ten moi truong, vi du dev hoac production."
  type        = string
  default     = "production"
}

# Cau hinh may chay ung dung.
variable "instance_type" {
  description = "Loai may EC2 chay ung dung."
  type        = string
  default     = "t3.small"
}

# Cau hinh may chu co so du lieu MySQL.
variable "db_instance_class" {
  description = "Loai may chu Amazon RDS for MySQL."
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Ten co so du lieu MySQL."
  type        = string
  default     = "qr_event_checkin"
}

# RDS tu tao mat khau va luu trong AWS Secrets Manager.
variable "db_master_username" {
  description = "Ten tai khoan quan tri RDS."
  type        = string
  default     = "qradmin"
  sensitive   = true
}

# Neu bo trong hai gia tri domain, ung dung dung URL cua Load Balancer.
variable "domain_name" {
  description = "Ten mien day du cua ung dung, vi du qr.example.com."
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "ID public hosted zone Route 53 quan ly ten mien."
  type        = string
  default     = ""
}

# Multi-AZ tang kha nang san sang va tang chi phi.
variable "rds_multi_az" {
  description = "Bat che do RDS Multi-AZ."
  type        = bool
  default     = false
}

# Bao ve co so du lieu khoi viec xoa nham.
variable "rds_deletion_protection" {
  description = "Chan xoa RDS khi dang bat bao ve."
  type        = bool
  default     = true
}

# Chi dung tuy chon nay voi moi truong thu nghiem co the bo du lieu.
variable "rds_skip_final_snapshot" {
  description = "Bo qua snapshot cuoi khi xoa RDS."
  type        = bool
  default     = false
}
