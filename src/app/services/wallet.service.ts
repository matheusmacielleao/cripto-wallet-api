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

  async getConversion(payload: any): Promise<any> {
    let brlCotation = 1;
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

    if (!conversion && payload.quoteTo === payload.currentCoin) {
      conversion = await axios
        .get(
          `https://economia.awesomeapi.com.br/json/last/${
            payload.quoteTo + '-BRL'
          }`,
        )
        .then((response) => response.data)
        .catch((error) => {
          console.log(error.response.data);
        });

      if (
        !conversion &&
        payload.quoteTo === 'BRL' &&
        payload.currentCoin === 'BRL'
      ) {
        throw new HttpException('invalid coin', HttpStatus.BAD_REQUEST);
      } else {
        if (payload.quoteTo === 'BRL' && payload.currentCoin === 'BRL') {
          brlCotation = 1;
          conversion = {
            codein: 'BRL',
            high: 1,
            name: 'cccc/Real Brasileiro',
          };
        } else {
          brlCotation = conversion[payload.quoteTo + 'BRL'].high;
          conversion = {
            codein: conversion[payload.quoteTo + 'BRL'].code,
            high: 1,
            name: conversion[payload.quoteTo + 'BRL'].name,
          };
        }
      }
    } else {
      if (!conversion) {
        conversion = await axios
          .get(
            `https://economia.awesomeapi.com.br/json/last/${
              payload.quoteTo + '-' + payload.currentCoin
            },${payload.quoteTo + '-BRL'}`,
          )
          .then((response) => response.data)
          .catch((error) => {
            console.log(error.response.data);
          });
        brlCotation = conversion[payload.quoteTo + 'BRL'].high;
        conversion = conversion[payload.quoteTo + payload.currentCoin];
        conversion.high = 1 / conversion.high;
        return { conversion, brlCotation };
      }
      brlCotation = conversion[payload.quoteTo + 'BRL'].high;
      conversion = conversion[payload.currentCoin + payload.quoteTo];
    }

    return { conversion, brlCotation };
  }

  async withdrawOrDeposit(id: string, payload: OperationDto): Promise<any> {
    const wallet = await this.walletRepository.findOne(id);
    const { conversion, brlCotation } = await this.getConversion(payload);

    let coin = await this.coinRepository.findOne({ code: payload.quoteTo });
    if (!coin) {
      coin = this.coinRepository.create({
        code: conversion.codein,
        fullname: conversion.name.split('/')[1],
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
      throw new HttpException('inssuficient founds', HttpStatus.BAD_REQUEST);
    await this.assetRepository.save(asset);

    const transaction = await this.transactionRepository.create({
      wallet,
      asset,
      currentCotation: brlCotation + 0.0,
      value: conversion.high * payload.value,
    });

    await this.transactionRepository.save(transaction);

    return conversion;
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
