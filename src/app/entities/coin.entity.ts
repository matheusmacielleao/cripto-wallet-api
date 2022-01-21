import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import Asset from './asset.entity';

@Entity('coin')
export default class Coin {
  @PrimaryColumn()
  code: string;

  @Column({ nullable: false })
  fullname: string;

  @OneToMany(() => Asset, (asset: Asset) => asset.coin)
  assets: Asset[];
}
