import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [GameModule, UserModule],
})
export class AppModule {}
