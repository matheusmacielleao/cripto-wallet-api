import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateWalletDto from '../dto/createWalletDto';
import { InjectRepository } from '@nestjs/typeorm';
import Wallet from '../entities/wallet.entity';
import { Repository } from 'typeorm';

@Injectable()
export default class WalletsService {
  constructor(
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
  ) {}
  async getAll() {
    return await this.walletRepository.find();
  }

  async create(payload: CreateWalletDto) {
    const newWallet = this.walletRepository.create(payload);
    await this.walletRepository.save(newWallet);
    return newWallet;
  }
}
