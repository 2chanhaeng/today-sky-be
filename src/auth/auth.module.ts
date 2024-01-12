import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '~/prisma/prisma.service';

@Module({
  providers: [PrismaService, AuthService],
})
export class AuthModule {}
