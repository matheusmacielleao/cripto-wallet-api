import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import Transaction from './transaction.entity';
import Wallet from './wallet.entity';

@Entity('transfer')
export default class Transfer extends Transaction {
  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.assets)
  @JoinColumn({ name: 'receiverWallet', referencedColumnName: 'address' })
  public receiverWallet: Wallet;
}
