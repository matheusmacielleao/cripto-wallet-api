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

  async getAll(payload: any): Promise<any> {
    return this.walletRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.assets', 'asset')
      .leftJoinAndSelect('asset.coin', 'coin')
      .leftJoinAndSelect('asset.transactions', 'transaction')
      .where(payload)
      .getRawAndEntities();

    //return await this.walletRepository.find({
    // where: payload,
    // relations: ['assets', 'assets.coin', 'assets.transactions'],
    //});
  }

  async getConversion(payload: any): Promise<any> {
    let brlCotation = 1;
    let quoteTo = await axios
      .get(
        `https://economia.awesomeapi.com.br/json/last/${payload.quoteTo}-USD,BRL-USD`,
      )
      .then((response) => response.data)
      .catch((error) => {
        throw new HttpException('Invalid coin', HttpStatus.BAD_REQUEST);
      });
    let currentCoin = await axios
      .get(
        `https://economia.awesomeapi.com.br/json/last/${payload.currentCoin}-USD`,
      )
      .then((response) => response.data)
      .catch((error) => {
        throw new HttpException('Invalid coin', HttpStatus.BAD_REQUEST);
      });
    brlCotation =
      quoteTo[payload.quoteTo + 'USD'].high / quoteTo['BRLUSD'].high;
    quoteTo = quoteTo[payload.quoteTo + 'USD'];
    currentCoin = currentCoin[payload.currentCoin + 'USD'];

    const conversion = {
      high: currentCoin.high / quoteTo.high,
      quoteToName: quoteTo.name.split('/')[0],
      quoteToCode: quoteTo.code,
      currentCoinName: currentCoin.name.split('/')[0],
    };

    return { conversion, brlCotation };
  }

  async withdrawOrDeposit(id: string, payload: OperationDto[]): Promise<any> {
    const results = await Promise.all(
      payload.map(async (payload) => {
        const wallet = await this.walletRepository.findOne(id);
        const { conversion, brlCotation } = await this.getConversion(payload);

        let coin = await this.coinRepository.findOne({ code: payload.quoteTo });
        if (!coin) {
          coin = this.coinRepository.create({
            code: conversion.quoteToCode,
            fullname: conversion.quoteToName,
          });
          await this.coinRepository.save(coin);
        }

        let asset = await this.assetRepository.findOne({
          coin: coin,
          wallet: wallet,
        });
        if (!asset) {
          asset = await this.assetRepository.create({
            wallet,
            coin: coin,
            ammount: 0,
          });
        }

        asset.ammount = asset.ammount + conversion.high * payload.value;
        if (asset.ammount < 0)
          throw new HttpException(
            'inssuficient founds',
            HttpStatus.BAD_REQUEST,
          );
        await this.assetRepository.save(asset);

        const transaction = await this.transactionRepository.create({
          wallet,
          asset,
          currentCotation: brlCotation + 0.0,
          value: conversion.high * payload.value,
        });

        await this.transactionRepository.save(transaction);
        return transaction;
      }),
    );

    return results;
  }
  async transference(id: string, payload: OperationDto): Promise<any> {
    const wallet = await this.walletRepository.findOne(id);
    const receiverWallet = await this.walletRepository.findOne({
      address: payload.receiverAddress,
    });
    //100 reais pra usd
    const coin = await this.coinRepository.findOne(payload.currentCoin);
    const quoteCoin = await this.coinRepository.findOne(payload.quoteTo);

    const { conversion, brlCotation } = await this.getConversion(payload);

    const senderAsset = await this.assetRepository.findOne({
      coin,
      wallet,
    });

    const receiverAsset = await this.assetRepository.findOne({
      coin: quoteCoin,
      wallet: receiverWallet,
    });

    senderAsset.ammount = senderAsset.ammount - payload.value;
    this.assetRepository.save(senderAsset);
    receiverAsset.ammount =
      receiverAsset.ammount + payload.value * conversion.high;
    this.assetRepository.save(receiverAsset);

    const transfer = await this.transferRepository.create({
      wallet,
      asset: senderAsset,
      receiverAsset: receiverAsset,
      receiverWallet: receiverWallet,
      currentCotation: brlCotation + 0.0,
      value: -payload.value,
      receivedValue: conversion.high * payload.value,
    });

    await this.transferRepository.save(transfer);

    return '';
  }
}
