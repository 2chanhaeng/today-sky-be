import {
  Body,
  Controller,
  Post,
  HttpException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { pbkdf2 } from '@/utils/auth';
import { PrismaService } from '~/prisma/prisma.service';
import { CreateUserBodyDto } from './dto/createUser.dto';
import { onNotFoundUser } from './user.errorHandler';

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

  @Post('login')
  async login(@Body() { username, password }: CreateUserBodyDto) {
    try {
      const { salt } = await this.prismaService.user
        .findUniqueOrThrow({
          where: { username },
          select: { salt: true },
        })
        .catch(onNotFoundUser);
      const login = { username, password: pbkdf2(password, salt).password };
      await this.prismaService.user
        .findUniqueOrThrow({
          where: { login },
          select: { id: true },
        })
        .catch(onNotFoundUser);
      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
