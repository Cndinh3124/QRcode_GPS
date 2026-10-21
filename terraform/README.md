# QR Event Check-in: AWS infrastructure with Terraform

This Terraform configuration provisions:

- A VPC with two public subnets and two private database subnets.
- An internet-facing Application Load Balancer (ALB).
- One Amazon Linux 2023 EC2 instance for the application host.
- Amazon RDS for MySQL with public access disabled and an RDS-managed master secret.
- Security groups that allow public web traffic only to the ALB, ALB traffic to the EC2 host, and MySQL traffic only from the application host.
- AWS Systems Manager access to EC2 without opening SSH.
- Optional Route 53 DNS and ACM HTTPS when both `domain_name` and `route53_zone_id` are supplied.

The EC2 bootstrap installs Docker and Nginx. Nginx forwards `/api/` to `127.0.0.1:3000` and other paths to `127.0.0.1:8080`. `docker-compose.aws.yml` builds the frontend, backend, and Python AI scorer on EC2 and binds their ports to loopback only. The AI scorer is reachable only on the private Docker network. The Terraform stack creates infrastructure; application deployment is a separate step after `terraform apply`.

## Important application readiness work

The backend and frontend production Dockerfiles are separate from the development Compose stack. The backend `docker-compose.yml` starts a local MySQL container and phpMyAdmin with sample credentials. Do not expose phpMyAdmin or use those sample credentials in production. Use `docker-compose.aws.yml` with the private RDS endpoint instead.

The current backend TypeORM configuration has `synchronize: true` and `logging: true`, and CORS is enabled broadly. Review and change these settings before using production data: use migrations instead of automatic schema changes, restrict CORS to the public frontend origin, and use a strong JWT secret. These are application changes and are not made by this infrastructure configuration.

## Prerequisites

- Terraform 1.6 or later.
- AWS CLI credentials with permission to create the listed networking, EC2, IAM, ELB, RDS, ACM, and Route 53 resources.
- A Route 53 public hosted zone and a domain name if HTTPS and a custom domain are required.

Terraform authentication follows the AWS CLI credential chain. Do not put AWS access keys in `.tf` or `.tfvars` files.

## Deploy infrastructure

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

The plan creates billable AWS resources, including an ALB, EC2 instance, and RDS instance. Review the plan and expected AWS charges before applying it. Do not run `terraform apply` until you have reviewed the plan and explicitly approved the AWS spend.

If no domain is configured, the ALB exposes HTTP only. With both domain settings configured, Terraform creates a DNS-validated ACM certificate, an HTTPS listener, an HTTP-to-HTTPS redirect, and a Route 53 alias record.

Use the `application_url` output to open the ALB endpoint. Use the `ssm_connect_command` output to open an EC2 shell through Session Manager. The database endpoint is private and should only be used by the application host.

## Deploy the app after Terraform

The stack intentionally does not fetch source code or put database credentials in EC2 user data. Connect through Systems Manager Session Manager using the `ec2_instance_id` output, then deploy the public GitHub branch:

```bash
sudo dnf install -y git jq awscli-2
sudo install -d -m 0755 /opt/qr-event
sudo git clone --branch feat/ai-checkin-fraud-detection --single-branch \
  https://github.com/Cndinh3124/QRcode_GPS.git /opt/qr-event/app
```

Install the Docker Compose v2 plugin if `docker compose version` is unavailable. The official Linux instructions are at <https://docs.docker.com/compose/install/linux/>. Retrieve the RDS-managed secret on the EC2 host with its instance role (the Terraform role is scoped to that secret). The following writes credentials directly to a mode-`0600` file without printing the secret values; replace the three placeholders with `terraform output` values:

```bash
sudo dnf install -y git jq awscli-2 openssl
sudo bash -s -- '<rds_master_secret_arn>' '<rds_endpoint>' '<rds_database_name>' <<'SCRIPT'
set -euo pipefail
secret_arn="$1"
db_host="$2"
db_name="$3"
[[ "$db_name" =~ ^[A-Za-z0-9_]+$ ]] || { echo 'Unsafe database name' >&2; exit 1; }
secret_json="$(aws secretsmanager get-secret-value --secret-id "$secret_arn" --query SecretString --output text)"
master_user="$(jq -r .username <<<"$secret_json")"
master_password="$(jq -r .password <<<"$secret_json")"
db_user=qr_app
db_password="$(openssl rand -hex 32)"
jwt_secret="$(openssl rand -hex 32)"
ai_token="$(openssl rand -hex 32)"
docker run --rm --network host -e MYSQL_PWD="$master_password" mysql:8.4 \
  mysql --connect-timeout=10 --host="$db_host" --port=3306 --user="$master_user" \
  --execute="CREATE USER IF NOT EXISTS '$db_user'@'%' IDENTIFIED BY '$db_password'; ALTER USER '$db_user'@'%' IDENTIFIED BY '$db_password'; GRANT ALL PRIVILEGES ON \`$db_name\`.* TO '$db_user'@'%'; FLUSH PRIVILEGES;"
env_file=/opt/qr-event/app/event-checkin-backend/.env
umask 077
printf '%s\n' \
  'APP_NAME=QR Event Checkin' \
  'NODE_ENV=production' \
  'PORT=3000' \
  "DB_HOST=$db_host" \
  'DB_PORT=3306' \
  "DB_USERNAME=$db_user" \
  "DB_PASSWORD=$db_password" \
  "DB_DATABASE=$db_name" \
  "JWT_SECRET=$jwt_secret" \
  'JWT_EXPIRES=1d' \
  'AI_FRAUD_SERVICE_URL=http://ai-fraud:8001' \
  "AI_SERVICE_TOKEN=$ai_token" > "$env_file"
unset secret_json master_user master_password db_user db_password jwt_secret ai_token
SCRIPT
```

The script creates a restricted `qr_app` MySQL user and gives it access only to the application database; the backend never receives the RDS master password. Do not commit the generated file or paste its contents into logs. If Docker Compose reports the backend cannot connect to RDS, first verify the database security group allows TCP 3306 from the app security group and check the `DB_HOST` endpoint.

Then start the three application containers:

```bash
cd /opt/qr-event/app
sudo docker compose --env-file event-checkin-backend/.env \
  -f docker-compose.aws.yml up -d --build
```

The frontend uses `/api` as its API base; the host Nginx removes that prefix before forwarding requests to NestJS. Check `sudo docker compose -f docker-compose.aws.yml ps`, `sudo docker compose -f docker-compose.aws.yml logs --tail=100`, and `curl http://127.0.0.1/healthz` on EC2. The ALB URL is available from `terraform output -raw application_url`.

For a disposable demo only, TypeORM currently has `synchronize: true`, which creates the new risk tables when the backend connects. Do not point this setting at production data: switch to `synchronize: false` only after adding and applying migrations for the existing application schema and the two AI tables.

## Tear down

For a disposable environment, first set `rds_deletion_protection = false` and `rds_skip_final_snapshot = true`, apply those changes, then run `terraform destroy`. This permanently deletes the database and its data. Keep deletion protection and a final snapshot for environments whose data must be retained.

## Architecture and limitations

- The ALB spans two Availability Zones, but the application runs on one EC2 instance; the application tier is therefore a single point of failure.
- RDS Multi-AZ is optional and disabled by default to limit cost.
- No NAT Gateway is created. The EC2 host is in a public subnet and uses its public IPv4 address for outbound package and image downloads. Its security group does not allow direct inbound application traffic; web traffic enters through the ALB.
- The application security group permits port 80 only from the ALB security group. RDS is not publicly accessible and accepts port 3306 only from the application security group.
- Terraform state may contain infrastructure metadata. Store remote state in a restricted, encrypted backend before sharing this configuration with a team.
