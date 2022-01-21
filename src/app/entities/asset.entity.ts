import { Exclude } from 'class-transformer';
import { randomUUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Coin from './coin.entity';
import Wallet from './wallet.entity';

@Entity('asset')
export default class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, default: 0 })
  ammount: number;

  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.assets)
  public wallet: Wallet;

  @ManyToOne(() => Coin, (coin: Coin) => coin.assets)
  public coin: Coin;

  generatedId() {
    if (this.id) {
      return;
    }

    this.id = randomUUID();
  }
}
