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
import Transaction from '../entities/transaction.entity';
import Transfer from '../entities/transfer.entity';
import GetWalletDto from '../dto/wallet/getWalletDto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios').default;

@Injectable()
export default class WalletsService {
  constructor(
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    @InjectRepository(Coin) private coinRepository: Repository<Coin>,
    @InjectRepository(Asset) private assetRepository: Repository<Asset>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
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

  async getAll(payload: any): Promise<Wallet[]> {
    return await this.walletRepository.find({
      where: payload,
      relations: ['assets', 'assets.coin', 'assets.transactions'],
    });
  }

  async withdrawOrDeposit(id: string, payload: OperationDto): Promise<any> {
    const wallet = await this.walletRepository.findOne(id);
    let conversion = await axios
      .get(
        `https://economia.awesomeapi.com.br/json/last/${
          payload.currentCoin + '-' + payload.quoteTo
        },${payload.quoteTo + '-BRL'}`,
      )
      .then((response) => response.data)
      .catch((error) => {
        console.log(error.response.data);
      });

    if (!conversion) {
      if (!(await this.coinRepository.findOne({ code: payload.currentCoin }))) {
        throw new HttpException('invalid coin', HttpStatus.BAD_REQUEST);
      }
      conversion = { codein: payload.currentCoin, high: 1 };
    }
    const currentCotation = conversion[payload.quoteTo + 'BRL'].high;

    if (conversion)
      conversion = conversion[payload.currentCoin + payload.quoteTo];

    let coin = await this.coinRepository.findOne({ code: conversion.codein });
    if (!coin) {
      coin = this.coinRepository.create({
        code: conversion.codein,
        fullname: conversion.name.split('/')[1],
      });
      await this.coinRepository.save(coin);
    }

    let asset = await this.assetRepository.findOne({ coin: coin });
    if (!asset) {
      asset = await this.assetRepository.create({
        wallet,
        coin: coin,
        ammount: 0,
      });
    }
    asset.ammount = asset.ammount + conversion.high * payload.value;
    if (asset.ammount < 0)
      throw new HttpException('inssuficient founds', HttpStatus.BAD_REQUEST);
    await this.assetRepository.save(asset);

    const transaction = await this.transactionRepository.create({
      wallet,
      asset,
      currentCotation: currentCotation + 0.0,
      value: asset.ammount,
    });

    await this.transactionRepository.save(transaction);

    return conversion;
  }
}
