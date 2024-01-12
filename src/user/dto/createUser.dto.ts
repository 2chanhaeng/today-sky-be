import { IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateUserBodyDto implements Omit<Prisma.UserCreateInput, 'salt'> {
  @IsString()
  readonly username: string;

  @IsString()
  readonly password: string;
}
