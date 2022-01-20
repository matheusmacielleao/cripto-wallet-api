import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import WalletsService from '../services/wallet.service';
import CreateWalletDto from '../dto/createWalletDto';

@Controller('wallets')
export default class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Post()
  async createWallet(@Body() post: CreateWalletDto) {
    return await this.walletService.create(post);
  }

  @Get()
  async getAll() {
    return await this.walletService.getAll();
  }
}
