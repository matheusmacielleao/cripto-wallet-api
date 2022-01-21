import { Module } from '@nestjs/common';
import WalletsController from '../controllers/wallet.controller';
import WalletsService from '../services/wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Wallet from '../entities/wallet.entity';
import Asset from '../entities/asset.entity';
import Coin from '../entities/coin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet]),
    TypeOrmModule.forFeature([Coin]),
    TypeOrmModule.forFeature([Asset]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
