import { Controller, Get } from '@nestjs/common';
import { Diary, PrismaService } from '~/prisma/prisma.service';

@Controller('diary')
export class DiaryController {
  constructor(private readonly prismaService: PrismaService) {}
  @Get()
  async gets(): Promise<Diary[]> {
    return this.prismaService.diary.findMany();
  }
}
