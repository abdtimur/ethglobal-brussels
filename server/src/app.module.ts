import { Module } from '@nestjs/common';
import { SalesforceModule } from './salesforce/salesforce.module';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';

const GlobalConfigModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
  load: [configuration],
});

@Module({
  imports: [GlobalConfigModule, SalesforceModule],
})
export class AppModule {}
