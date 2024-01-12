import { Body, Controller, Post } from '@nestjs/common';
import { pbkdf2 } from '@/utils/auth';
import { PrismaService } from '~/prisma/prisma.service';
import { CreateUserBodyDto } from './dto/createUser.dto';

@Controller('user')
export class UserController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post('signup')
  async signup(@Body() { username, password }: CreateUserBodyDto) {
    return this.prismaService.user.create({
      data: { ...pbkdf2(password), username },
    });
  }
}
