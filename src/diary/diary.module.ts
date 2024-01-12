import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService, DiaryService],
  controllers: [DiaryController],
})
export class DiaryModule {}
