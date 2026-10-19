# QR Event Check-in: AWS infrastructure with Terraform

This Terraform configuration provisions:

- A VPC with two public subnets and two private database subnets.
- An internet-facing Application Load Balancer (ALB).
- One Amazon Linux 2023 EC2 instance for the application host.
- Amazon RDS for MySQL with public access disabled and an RDS-managed master secret.
- Security groups that allow public web traffic only to the ALB, ALB traffic to the EC2 host, and MySQL traffic only from the application host.
- AWS Systems Manager access to EC2 without opening SSH.
- Optional Route 53 DNS and ACM HTTPS when both `domain_name` and `route53_zone_id` are supplied.

The EC2 bootstrap installs Docker and Nginx. Nginx forwards `/api/` to `127.0.0.1:3000` and other paths to `127.0.0.1:8080`. The Terraform stack does **not** build or start the application containers.

## Important application readiness work

The source repository currently has no production Dockerfiles. Its backend `docker-compose.yml` starts a local MySQL container and phpMyAdmin with sample credentials. Do not expose phpMyAdmin or use those sample credentials in production. Before deploying the application, create production Docker images (or another repeatable deployment process) for the React frontend and NestJS backend, and bind them to localhost ports 8080 and 3000 respectively.

The current backend TypeORM configuration has `synchronize: true` and `logging: true`, and CORS is enabled broadly. Review and change these settings before using production data: use migrations instead of automatic schema changes, restrict CORS to the public frontend origin, and use a strong JWT secret. These are application changes and are not made by this infrastructure configuration.

## Prerequisites

- Terraform 1.6 or later.
- AWS CLI credentials with permission to create the listed networking, EC2, IAM, ELB, RDS, ACM, and Route 53 resources.
- A Route 53 public hosted zone and a domain name if HTTPS and a custom domain are required.

Terraform authentication follows the AWS CLI credential chain. Do not put AWS access keys in `.tf` or `.tfvars` files.

## Deploy

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars. Set domain_name and route53_zone_id to enable HTTPS.
terraform init
terraform fmt -recursive
terraform validate
terraform plan
terraform apply
```

The plan creates billable AWS resources, including an ALB, EC2 instance, and RDS instance. Review the plan and expected AWS charges before applying it.

If no domain is configured, the ALB exposes HTTP only. With both domain settings configured, Terraform creates a DNS-validated ACM certificate, an HTTPS listener, an HTTP-to-HTTPS redirect, and a Route 53 alias record.

Use the `application_url` output to open the ALB endpoint. Use the `ssm_connect_command` output to open an EC2 shell through Session Manager. The database endpoint is private and should only be used by the application host.

## Tear down

For a disposable environment, first set `rds_deletion_protection = false` and `rds_skip_final_snapshot = true`, apply those changes, then run `terraform destroy`. This permanently deletes the database and its data. Keep deletion protection and a final snapshot for environments whose data must be retained.

## Architecture and limitations

- The ALB spans two Availability Zones, but the application runs on one EC2 instance; the application tier is therefore a single point of failure.
- RDS Multi-AZ is optional and disabled by default to limit cost.
- No NAT Gateway is created. The EC2 host is in a public subnet and uses its public IPv4 address for outbound package and image downloads. Its security group does not allow direct inbound application traffic; web traffic enters through the ALB.
- The application security group permits port 80 only from the ALB security group. RDS is not publicly accessible and accepts port 3306 only from the application security group.
- Terraform state may contain infrastructure metadata. Store remote state in a restricted, encrypted backend before sharing this configuration with a team.
