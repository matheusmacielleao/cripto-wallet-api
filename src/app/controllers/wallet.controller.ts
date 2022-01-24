import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import WalletsService from '../services/wallet.service';
import CreateWalletDto from '../dto/wallet/createWalletDto';
import OperationDto from '../dto/wallet/OperationDto';
import { paginateSerialize } from '../serializer/walletSerializer';
import GetWalletDto from '../dto/wallet/getWalletDto';
@Controller('wallets')
export default class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Post()
  @HttpCode(201)
  async createWallet(@Body() post: CreateWalletDto) {
    return await this.walletService.create(post);
  }

  @Get()
  async getAll(@Query() payload: any) {
    const wallets = await this.walletService.getAll(payload);
    return paginateSerialize(wallets);
  }
  @Put(':adress')
  async withdrawOrDeposit(
    @Param('adress') adress: string,
    @Body() operation: OperationDto,
  ) {
    return await this.walletService.withdrawOrDeposit(adress, operation);
  }
}
