import { Exclude } from 'class-transformer';
import { randomUUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Asset from './asset.entity';
import Coin from './coin.entity';
import Wallet from './wallet.entity';

@Entity('transaction')
export default class Transaction {
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
  value: number;

  @Column({
    type: 'decimal',
  })
  currentCotation: number;

  @Exclude()
  @CreateDateColumn()
  datetime: Date;

  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.assets)
  @JoinColumn({ name: 'wallet', referencedColumnName: 'address' })
  public wallet: Wallet;

  @ManyToOne(() => Asset, (asset: Asset) => asset.transactions)
  @JoinColumn({ name: 'asset', referencedColumnName: 'id' })
  public asset: Asset;

  generatedId() {
    if (this.id) {
      return;
    }

    this.id = randomUUID();
  }
}
