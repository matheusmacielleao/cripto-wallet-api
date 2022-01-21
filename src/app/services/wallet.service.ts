import * as moment from 'moment';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateWalletDto from '../dto/wallet/createWalletDto';
import { InjectRepository } from '@nestjs/typeorm';
import Wallet from '../entities/wallet.entity';
import { Repository } from 'typeorm';
import { cpfValidator } from '../utils/cpfValidator';
import Coin from '../entities/coin.entity';
import Asset from '../entities/asset.entity';
import OperationDto from '../dto/wallet/OperationDto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios').default;

@Injectable()
export default class WalletsService {
  constructor(
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    @InjectRepository(Coin) private coinRepository: Repository<Coin>,
    @InjectRepository(Asset) private assetRepository: Repository<Asset>,
    private httpService: HttpService,
  ) {}

  async create(payload: CreateWalletDto) {
    if (
      Math.floor(
        moment(new Date()).diff(moment(payload.birthdate), 'years', true),
      ) < 18
    ) {
      throw new HttpException(
        'Less than 18 years from BirthDate',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!cpfValidator(payload.cpf)) {
      throw new HttpException('Invalid Cpf', HttpStatus.BAD_REQUEST);
    }
    const newWallet = this.walletRepository.create(payload);

    await this.walletRepository.save(newWallet);
    return newWallet;
  }

  async getAll() {
    return await this.walletRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.assets', 'asset')
      .leftJoinAndSelect('asset.coin', 'coin')
      .getMany();
  }

  async withdrawOrDeposit(id: string, payload: OperationDto): Promise<any> {
    const wallet = await this.walletRepository.findOne(id);
    let conversion = await axios
      .get(`https://economia.awesomeapi.com.br/json/last/${payload.quoteTo}`)
      .then((response) => response.data);
    conversion = conversion[payload.quoteTo + payload.currentCoin];

    const newCoin = this.coinRepository.create({
      code: conversion.code,
      fullname: conversion.name.split('/')[0],
    });
    await this.coinRepository.save(newCoin);

    const newAsset = this.assetRepository.create({ wallet, coin: newCoin });
    this.assetRepository.save(newAsset);
    return conversion;
    //}
  }
}
