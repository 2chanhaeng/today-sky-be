import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiaryModule } from './diary/diary.module';

@Module({
  imports: [DiaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
