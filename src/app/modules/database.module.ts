import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Wallet from '../entities/wallet.entity';
import Coin from '../entities/coin.entity';
import Asset from '../entities/asset.entity';
import Transfer from '../entities/transfer.entity';
import Transaction from '../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        name: 'default',
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [Wallet, Coin, Asset, Transaction, Transfer],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
