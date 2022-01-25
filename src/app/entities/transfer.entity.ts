import { ChildEntity, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import Asset from './asset.entity';
import Transaction from './transaction.entity';
import Wallet from './wallet.entity';

@Entity('transfer')
export default class Transfer extends Transaction {
  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.assets)
  @JoinColumn({ name: 'receiverWallet', referencedColumnName: 'address' })
  public receiverWallet: Wallet;

  @ManyToOne(() => Asset, (asset: Asset) => asset.transactions)
  @JoinColumn({ name: 'receiverAsset', referencedColumnName: 'id' })
  public receiverAsset: Asset;

  @Column({
    default: 0.0,
    type: 'decimal',
    transformer: {
      from: (value: string) => parseFloat(value),
      to: (value: number) => value.toString(),
    },
  })
  receivedValue: number;
}
