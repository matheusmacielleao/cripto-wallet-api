import { Module } from '@nestjs/common';
import WalletsController from '../controllers/wallet.controller';
import WalletsService from '../services/wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Wallet from '../entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
