import { Exclude } from 'class-transformer';
import { randomUUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Coin from './coin.entity';
import Transaction from './transaction.entity';
import Wallet from './wallet.entity';

@Entity('asset')
export default class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    default: 0.0,
    type: 'decimal',
    transformer: {
      from: (value: string) => parseFloat(value),
      to: (value: number) => value.toString(),
    },
  })
  ammount: number;

  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.assets)
  @JoinColumn({ name: 'wallet', referencedColumnName: 'address' })
  public wallet: Wallet;

  @ManyToOne(() => Coin, (coin: Coin) => coin.assets)
  @JoinColumn({ name: 'coin', referencedColumnName: 'code' })
  public coin: Coin;

  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.asset)
  @JoinTable()
  public transactions: Transaction[];

  generatedId() {
    if (this.id) {
      return;
    }

    this.id = randomUUID();
  }
}
