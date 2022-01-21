import { Module } from '@nestjs/common';
import WalletsController from '../controllers/wallet.controller';
import WalletsService from '../services/wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Wallet from '../entities/wallet.entity';
import Asset from '../entities/asset.entity';
import Coin from '../entities/coin.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet]),
    TypeOrmModule.forFeature([Coin]),
    TypeOrmModule.forFeature([Asset]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
