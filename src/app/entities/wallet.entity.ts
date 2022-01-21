import { Exclude } from 'class-transformer';
import { randomUUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Asset from './asset.entity';

@Entity('wallet')
export default class Wallet {
  @PrimaryGeneratedColumn('uuid')
  address: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  cpf: string;

  @Column({ type: 'date', nullable: false })
  birthdate: Date;

  @OneToMany(() => Asset, (asset: Asset) => asset.wallet)
  public assets: Asset[];

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
  generatedId() {
    if (this.address) {
      return;
    }

    this.address = randomUUID();
  }
}
