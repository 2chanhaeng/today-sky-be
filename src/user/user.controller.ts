import {
  Body,
  Controller,
  Post,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { pbkdf2 } from '@/utils/auth';
import { PrismaService } from '~/prisma/prisma.service';
import { CreateUserBodyDto } from './dto/createUser.dto';
import { Prisma } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post('signup')
  async signup(@Body() { username, password }: CreateUserBodyDto) {
    try {
      const result = await this.prismaService.user.create({
        data: { ...pbkdf2(password), username },
        select: { id: true },
      });
      return !!result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Username already exists.');
        }
      }
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
