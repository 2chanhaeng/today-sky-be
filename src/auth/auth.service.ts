import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<string | null> {
    const login = { username, password };
    const id: string | null = await this.prismaService.user
      .findUnique({
        where: { login },
        select: { id: true },
      })
      .then(({ id }) => id)
      .catch(() => null);
    return id;
  }
}
