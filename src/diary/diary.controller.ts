import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Diary, PrismaService } from '~/prisma/prisma.service';
import { CreateDiaryBodyDto } from './dto/createDiary.dto';

const tempUser = { id: '1', username: '1', password: '1', salt: '1' };

@Controller('diary')
export class DiaryController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async gets(): Promise<Diary[]> {
    return this.prismaService.diary.findMany();
  }

  @Post('/:year/:month/:date')
  async create(
    @Param(
      'year',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    year: number,
    @Param(
      'month',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    month: number,
    @Param(
      'date',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    date: number,
    @Body() update: CreateDiaryBodyDto,
  ) {
    const id = { user_id: tempUser.id, year, month, date };
    const where = { id };
    const create = { ...id, ...update };
    return this.prismaService.diary.upsert({ where, update, create });
  }
}
