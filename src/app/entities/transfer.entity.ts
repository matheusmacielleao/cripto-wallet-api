import { ChildEntity, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import Asset from './asset.entity';
import Transaction from './transaction.entity';
import Wallet from './wallet.entity';

@ChildEntity('transfer')
export default class Transfer extends Transaction {
  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.assets)
  @JoinColumn({ name: 'receiverWallet', referencedColumnName: 'address' })
  public receiverWallet: Wallet;

  @ManyToOne(() => Asset, (asset: Asset) => asset.transactions)
  @JoinColumn({ name: 'receiverAsset', referencedColumnName: 'id' })
  public receiverAsset: Asset;

  @Column({
    default: 0.0,
  })
  receivedValue: number;
}
