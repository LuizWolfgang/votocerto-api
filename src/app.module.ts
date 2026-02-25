import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RegionsModule } from './regions/regions.module';
import { HierarchyModule } from './hierarchy/hierarchy.module';
import { SupportersModule } from './supporters/supporters.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { RankingsModule } from './rankings/rankings.module';
import { MissionsModule } from './missions/missions.module';
import { EventsModule } from './events/events.module';
import { AlertsModule } from './alerts/alerts.module';
import { FinanceModule } from './finance/finance.module';
import { AuditModule } from './audit/audit.module';
import { ComplianceModule } from './compliance/compliance.module';
import { CommunicationsModule } from './communications/communications.module';
import { ForecastsModule } from './forecasts/forecasts.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RegionsModule,
    HierarchyModule,
    SupportersModule,
    DashboardsModule,
    RankingsModule,
    MissionsModule,
    EventsModule,
    AlertsModule,
    FinanceModule,
    AuditModule,
    ComplianceModule,
    CommunicationsModule,
    ForecastsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
