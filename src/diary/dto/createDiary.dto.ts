import { IsString } from 'class-validator';

export class CreateDiaryBodyDto {
  @IsString()
  readonly content: string;
}
