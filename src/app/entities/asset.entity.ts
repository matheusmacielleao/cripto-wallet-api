import { Exclude } from 'class-transformer';
import { randomUUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

  @Column({ default: 0 })
  ammount: number;

  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.assets)
  @JoinColumn({ name: 'wallet', referencedColumnName: 'address' })
  public wallet: Wallet;

  @ManyToOne(() => Coin, (coin: Coin) => coin.assets)
  @JoinColumn({ name: 'coin', referencedColumnName: 'code' })
  public coin: Coin;

  generatedId() {
    if (this.id) {
      return;
    }

    this.id = randomUUID();
  }
}
