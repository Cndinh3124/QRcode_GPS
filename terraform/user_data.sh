#!/bin/bash
set -euo pipefail

dnf update -y
dnf install -y docker nginx
systemctl enable --now docker

cat >/etc/nginx/conf.d/qr-event.conf <<'NGINX'
server {
    listen 80;
    server_name _;

    location = /healthz {
        access_log off;
        default_type text/plain;
        return 200 "ok\n";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
    }

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

systemctl enable --now nginx
nginx -t
systemctl reload nginx

install -d -m 0755 /opt/qr-event
cat >/opt/qr-event/DEPLOYMENT.txt <<'INFO'
Application runtime ports expected by this host:
  Frontend: 127.0.0.1:8080
  Backend:  127.0.0.1:3000

Deploy the application containers so they publish these ports on localhost.
The repository currently has no production Dockerfiles. Its backend docker-compose.yml
starts a development MySQL/phpMyAdmin stack and must not be used as-is in production.
INFO
