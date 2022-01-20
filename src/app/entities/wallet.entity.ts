import { Exclude } from 'class-transformer';
import { randomUUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallet')
export default class Wallet {
  @PrimaryGeneratedColumn('uuid')
  address!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false, unique: true })
  cpf!: string;

  @Column({ type: 'date', nullable: false })
  birthdate!: Date;

  @Exclude()
  @CreateDateColumn()
  createdAt!: Date;

  @Exclude()
  @UpdateDateColumn({
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;
  generatedId() {
    if (this.address) {
      return;
    }

    this.address = randomUUID();
  }
}
