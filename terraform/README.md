# Huong dan tao ha tang AWS bang Terraform

## Ha tang duoc tao

Terraform tao VPC, hai subnet cong khai, hai subnet rieng cho RDS, ALB, mot EC2 Amazon Linux 2023, va co so du lieu MySQL tren RDS. Database khong mo ra Internet. Security Group chi cho phep ket noi web qua ALB, tu ALB den EC2, va tu EC2 den RDS.

EC2 cai Docker va Nginx. Nginx chuyen /api/ den backend cong 3000 va cac duong dan khac den frontend cong 8080. Docker Compose chay frontend, backend va dich vu cham diem AI. Cac cong ung dung chi mo tren localhost cua EC2. Backend goi dich vu AI qua mang rieng Docker.

Neu dien ca domain_name va route53_zone_id, Terraform tao DNS Route 53, chung chi ACM va HTTPS. Neu khong, ALB chi dung HTTP.

## Chuan bi

Can co Terraform 1.6 tro len va AWS CLI da dang nhap voi quyen tao cac tai nguyen AWS nay. Can co ten mien va public hosted zone Route 53 neu muon dung HTTPS. Khong ghi AWS access key vao file Terraform.

## Tao ha tang

Chay:

    cd terraform
    cp terraform.tfvars.example terraform.tfvars

Mo terraform.tfvars va dieu chinh cau hinh. Dien ca domain_name va route53_zone_id neu can HTTPS. Sau do chay:

    terraform init
    terraform fmt -recursive
    terraform validate
    terraform plan

ALB, EC2 va RDS co the phat sinh chi phi. Doc ky ket qua plan va danh gia chi phi truoc khi chay terraform apply.

Lay URL ung dung va lenh ket noi EC2 bang:

    terraform output -raw application_url
    terraform output -raw ssm_connect_command

Dung AWS Systems Manager Session Manager de mo terminal EC2. RDS la mang rieng, chi EC2 moi ket noi duoc.

## Cai ung dung len EC2

Sau khi ket noi den EC2 bang Session Manager, tai ma nguon:

    sudo dnf install -y git jq awscli-2 openssl
    sudo install -d -m 0755 /opt/qr-event
    sudo git clone --branch feat/ai-checkin-fraud-detection --single-branch https://github.com/Cndinh3124/QRcode_GPS.git /opt/qr-event/app

Can co Docker Compose v2. Neu lenh docker compose version khong chay, cai Docker Compose plugin theo huong dan: https://docs.docker.com/compose/install/linux/

Tao file event-checkin-backend/.env tren EC2 voi cac bien DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, JWT_SECRET, JWT_EXPIRES, AI_FRAUD_SERVICE_URL va AI_SERVICE_TOKEN. Lay thong tin database tu Terraform outputs va AWS Secrets Manager. Tao tai khoan MySQL rieng cho ung dung; khong dung tai khoan quan tri RDS trong backend. File .env chua bi mat, han che quyen doc va khong commit file nay len Git.

Khoi dong cac dich vu:

    cd /opt/qr-event/app
    sudo docker compose --env-file event-checkin-backend/.env -f docker-compose.aws.yml up -d --build

Kiem tra:

    sudo docker compose -f docker-compose.aws.yml ps
    sudo docker compose -f docker-compose.aws.yml logs --tail=100
    curl http://127.0.0.1/healthz

## Luu y truoc khi dung du lieu that

TypeORM hien dang co synchronize: true, co the tu thay doi bang du lieu khi backend khoi dong. Khong dung voi du lieu that cho den khi da tao va chay migration, sau do chuyen sang synchronize: false. Gioi han CORS chi cho phep domain frontend va dung JWT secret manh.

RDS khong co dia chi cong khai. Security Group chi cho phep EC2 ket noi MySQL cong 3306. Ung dung hien chay tren mot EC2; neu may gap su co, website se dung.

## Xoa moi truong thu nghiem

Chi voi moi truong co the xoa du lieu: dat rds_deletion_protection = false va rds_skip_final_snapshot = true, chay terraform apply de cap nhat, roi chay terraform destroy. Thao tac nay xoa vinh vien database va du lieu. Moi truong can giu du lieu nen bat bao ve xoa va giu snapshot cuoi.

Terraform state co the chua thong tin ha tang. Neu lam viec theo nhom, luu state trong backend ma hoa va gioi han quyen truy cap.
