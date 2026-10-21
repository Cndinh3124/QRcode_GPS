# QR Event Check-in — Production Deployment Guide

Tài liệu ngắn dành cho IT/DevOps triển khai hệ thống **QR Event Check-in** trên server thực tế.

## 1. Kiến trúc

```text
Internet
   │
   ▼
Nginx + HTTPS
   ├── /        → React Frontend
   └── /api     → NestJS Backend
                     │
                     ▼
                   MySQL
```

Thành phần:
- **Frontend:** React + Vite + TypeScript + Ant Design + React Query
- **Backend:** NestJS + TypeORM + JWT + RBAC
- **Database:** MySQL
- **AI anomaly scorer:** Python FastAPI + scikit-learn Isolation Forest (internal service)
- **Web Server / Reverse Proxy:** Nginx
- **SSL:** HTTPS
- **Process Manager:** PM2 hoặc Docker

---

## 2. Yêu cầu server

Khuyến nghị tối thiểu:

- Ubuntu Server 22.04/24.04 LTS
- 2 vCPU
- 4 GB RAM
- 40 GB SSD
- Public IP
- Domain name
- HTTPS certificate
- MySQL 8.x

Mở firewall tối thiểu:

```text
22/tcp    SSH
80/tcp    HTTP
443/tcp   HTTPS
```

**Không public port MySQL 3306 ra Internet.**

---

# 3. Chuẩn bị source code


Project gồm:

```text
event-checkin-backend/
event-checkin-frontend/
ai-fraud-service/
```

## AI check-in risk MVP

Mỗi check-in hợp lệ tạo một assessment `PENDING` trong cùng transaction với attendance. Worker NestJS xử lý assessment nền và gọi dịch vụ Python; check-in không đợi mô hình. Nếu AI service chưa sẵn sàng, bản ghi được retry và sau 8 lần sẽ chuyển `FAILED`. Sau khi baseline được huấn luyện, thao tác huấn luyện sẽ đưa các job `FAILED` về hàng đợi.

Màn quản trị **AI điểm danh** chỉ dành cho tài khoản `ADMIN`, tại `/ai-fraud`. Nó hiển thị mức bất thường, tín hiệu, và cho phép lưu kết quả xác minh có audit history. Hệ thống không tự đổi trạng thái điểm danh hoặc tự kết luận gian lận.

### Khởi chạy dịch vụ AI

Trong `event-checkin-backend/.env`, tạo token riêng dài/ngẫu nhiên cho `AI_SERVICE_TOKEN` và cấu hình `AI_FRAUD_SERVICE_URL`. Không dùng giá trị ví dụ. Từ thư mục backend:

```bash
docker compose up -d --build ai-fraud
```

Đảm bảo backend Node chạy trên cùng host với Docker nếu đang dùng URL mặc định `http://127.0.0.1:8001`. Volume `ai_fraud_model` lưu model qua lần khởi động lại. AI service chỉ bind vào loopback; không mở port 8001 ra Internet.

Sau khi có ít nhất 30 lượt điểm danh `PRESENT` hoặc `LATE`, đăng nhập bằng ADMIN, mở **AI điểm danh**, rồi chọn **Huấn luyện baseline**. Baseline lấy tối đa 2.000 lượt gần nhất. Màn hình gọi score “mức bất thường tương đối”, không phải xác suất gian lận. Dữ liệu GPS/device hiện do client gửi nên có thể bị giả mạo; dùng kết quả để ưu tiên xem xét thủ công, không coi là bằng chứng.

Các entity mới được TypeORM tự tạo trong cấu hình hiện tại (`synchronize: true`). Trước khi tắt `synchronize` ở production, cần sinh và áp dụng migration cho `attendance_risk_assessments` và `attendance_risk_reviews`; không bật synchronize trên database production.

---

# 4. Deploy Backend

## Cài Node.js

Khuyến nghị Node.js LTS phù hợp với project.

Kiểm tra:

```bash
node -v
npm -v
```

## Cài dependency

```bash
cd event-checkin-backend
npm ci
```

## Tạo `.env`

```env
APP_NAME=QR Event Check-in
PORT=3000
NODE_ENV=production

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=<DB_USER>
DB_PASSWORD=<STRONG_PASSWORD>
DB_DATABASE=<DB_NAME>

JWT_SECRET=<LONG_RANDOM_SECRET>
JWT_EXPIRES=1d

FRONTEND_URL=https://<DOMAIN>
```

**Không commit `.env` lên Git.**

## Build

```bash
npm run build
```

## Production

```bash
npm run start:prod
```

Khuyến nghị dùng PM2:

```bash
npm install -g pm2

pm2 start dist/main.js --name qr-event-backend
pm2 save
pm2 startup
```

Kiểm tra:

```bash
pm2 status
pm2 logs qr-event-backend
```

---

# 5. Database MySQL

Tạo database:

```sql
CREATE DATABASE qr_event_checkin
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Tạo user riêng cho application:

```sql
CREATE USER '<DB_USER>'@'localhost'
IDENTIFIED BY '<STRONG_PASSWORD>';

GRANT ALL PRIVILEGES
ON qr_event_checkin.*
TO '<DB_USER>'@'localhost';

FLUSH PRIVILEGES;
```

## Quan trọng

Production:

```ts
synchronize: false
```

Không sử dụng:

```ts
synchronize: true
```

để tránh TypeORM tự thay đổi schema database.

Phải sử dụng **migration** để quản lý database schema.

---

# 6. Deploy Frontend

```bash
cd event-checkin-frontend
npm ci
```

Cấu hình API production, ví dụ:

```env
VITE_API_URL=https://<DOMAIN>/api
```

Build:

```bash
npm run build
```

Sau khi build, thư mục:

```text
dist/
```

là static files cần đưa lên Nginx.

Ví dụ:

```text
/var/www/qr-event/
└── dist/
```

---

# 7. Nginx

Frontend:

```nginx
server {
    listen 80;
    server_name <DOMAIN>;

    root /var/www/qr-event/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kiểm tra:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Sau đó cấu hình HTTPS bằng Let's Encrypt/Certbot.

---

# 8. CORS

Backend chỉ cho phép domain production:

```text
https://<DOMAIN>
```

Không để production:

```text
*
```

nếu hệ thống có authentication.

---

# 9. Kiểm tra sau khi deploy

## Backend

```bash
curl https://<DOMAIN>/api/...
```

Kiểm tra Swagger nếu được bật:

```text
https://<DOMAIN>/api
```

## Frontend

Mở:

```text
https://<DOMAIN>
```

Kiểm tra:

- Login
- Dashboard
- Users
- Events
- QR
- Participants
- Attendance
- Reports
- Export Excel
- Public Check-in

---

# 10. Kiểm tra chức năng QR Check-in

Quy trình thực tế:

```text
Admin tạo Event
      ↓
Event được Published
      ↓
Đến startTime
      ↓
CHECKING_IN
      ↓
QR được quét
      ↓
Frontend lấy GPS
      ↓
Backend kiểm tra:
  - QR Token
  - Event status
  - Thời gian
  - GPS
  - Radius
  - Participant duplicate
      ↓
PRESENT / LATE
      ↓
Lưu Attendance
      ↓
Dashboard / Reports
```

---

# 11. Backup Database

Thiết lập backup định kỳ:

```bash
mysqldump \
  -u <DB_USER> \
  -p \
  qr_event_checkin \
  > backup_$(date +%Y-%m-%d).sql
```

Production nên có:

- Backup hàng ngày
- Lưu backup sang server/storage khác
- Kiểm tra khả năng restore định kỳ

---


# 12. Vận hành

Backend:

```bash
pm2 status
pm2 logs qr-event-backend
pm2 restart qr-event-backend
```

Nginx:

```bash
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx
```

Database:

```bash
sudo systemctl status mysql
```

Khi cập nhật version mới:

```bash
git pull
npm ci
npm run build
pm2 restart qr-event-backend
```

Frontend:

```bash
npm ci
npm run build
```

Sau đó cập nhật thư mục `dist/` trên Nginx.

---


## Production URL

Sau khi triển khai:

```text
Frontend:
https://<DOMAIN>

Backend API:
https://<DOMAIN>/api

Database:
localhost:3306
```

Hệ thống chỉ được xem là sẵn sàng production sau khi hoàn tất security checklist và kiểm thử toàn bộ luồng **Event → QR → GPS → Attendance → Dashboard → Reports**.
