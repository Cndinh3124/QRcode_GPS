import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { AttendanceModule } from './attendance/attendance.module';
import { GpsModule } from './gps/gps.module';
import { QrModule } from './qr/qr.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { AiFraudModule } from './ai-fraud/ai-fraud.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        config: ConfigService,
      ) => ({
        type: 'mysql',
        host: config.get<string>(
          'DB_HOST',
        ),
        port: Number(
          config.get<string>('DB_PORT'),
        ),
        username: config.get<string>(
          'DB_USERNAME',
        ),
        password: config.get<string>(
          'DB_PASSWORD',
        ),
        database: config.get<string>(
          'DB_DATABASE',
        ),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),

    RolesModule,
    UsersModule,
    AuthModule,
    EventsModule,
    AttendanceModule,
    GpsModule,
    QrModule,
    DashboardModule,
    ReportsModule,
    AiFraudModule,
  ],
})
export class AppModule {}
