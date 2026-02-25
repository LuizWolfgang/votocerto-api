import { Module } from '@nestjs/common';
import { SupportersController } from './supporters.controller';
import { SupportersService } from './supporters.service';

@Module({
  controllers: [SupportersController],
  providers: [SupportersService]
})
export class SupportersModule {}
