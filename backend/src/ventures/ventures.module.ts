import { Module } from '@nestjs/common';
import { VenturesController } from './ventures.controller';
import { VenturesService } from './ventures.service';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [UsersModule, EmailModule],
  controllers: [VenturesController],
  providers: [VenturesService],
  exports: [VenturesService],
})
export class VenturesModule {}
