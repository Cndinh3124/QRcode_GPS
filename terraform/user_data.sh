#!/bin/bash
set -euo pipefail

# Cap nhat goi va cai Docker, Nginx tren Amazon Linux.
dnf update -y
dnf install -y docker nginx
systemctl enable --now docker

# Nginx nhan request tu Load Balancer.
# /api duoc chuyen den backend; cac duong dan khac den frontend.
cat >/etc/nginx/conf.d/qr-event.conf <<'NGINX'
server {
    listen 80;
    server_name _;

    # Load Balancer goi duong dan nay de kiem tra may con hoat dong.
    location = /healthz {
        access_log off;
        default_type text/plain;
        return 200 "ok\n";
    }

    # Dau / cuoi proxy_pass giup loai bo tien to /api/ khi chuyen tiep.
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $http_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
    }

    # Cac trang web duoc phuc vu boi container frontend.
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
    }
}
NGINX

# Kiem tra cau hinh truoc khi bat Nginx.
systemctl enable --now nginx
nginx -t
systemctl reload nginx

# Tao thu muc deploy. Ma nguon va file .env se duoc them o buoc sau.
install -d -m 0755 /opt/qr-event
cat >/opt/qr-event/DEPLOYMENT.txt <<'INFO'
Cac cong ung dung tren may nay:
  Frontend: 127.0.0.1:8080
  Backend:  127.0.0.1:3000

Dung docker-compose.aws.yml de build va chay frontend, backend,
va dich vu AI cham diem. Cac cong chi lang nghe tren localhost.
INFO
