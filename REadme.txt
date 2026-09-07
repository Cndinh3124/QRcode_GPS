install package

#config + database
npm install @nestjs/config @nestjs/typeorm typeorm mysql2

#validation
npm install class-validator class-transformer

#Authentication
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
Dev dependency:
npm install -D @types/bcrypt @types/passport-jwt

#Swagger
npm install @nestjs/swagger swagger-ui-express

#Security
npm install helmet @nestjs/throttler

#QRcode + UUID + Excel
npm install qrcode uuid exceljs

#Logging
npm install nestjs-pino pino pino-pretty

#Environment 
dotenv duoc NestJS su dung thong qua @nestjs/config nen khong cai cai rieng

#Dev tools
npm install -D @types/node

@TypeORM CLI
npm install -D ts-node

#Hoac install tat ca bang mot lenh
npm install @nestjs/config @nestjs/typeorm typeorm mysql2 class-validator class-transformer @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @nestjs/swagger swagger-ui-express helmet @nestjs/throttler qrcode uuid exceljs nestjs-pino pino pino-pretty
Sau do:
npm install -D @types/bcrypt @types/passport-jwt @types/node ts-node

#Sau khi cai xong kiem tra:
npm ls --depth=0
---------------





FRONTEND
npm create vite@latest event-checkin-frontend -- --template react-ts
ESLint
npm install antd @ant-design/icons
npm install react-router-dom
npm install axios
npm install @tanstack/react-query
npm install react-hook-form
npm install dayjs
npm install recharts
npm install @ant-design/pro-layout
