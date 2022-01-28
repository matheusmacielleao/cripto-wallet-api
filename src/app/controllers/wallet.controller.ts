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
import { string } from '@hapi/joi';
@Controller('wallets')
export default class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Post()
  @HttpCode(201)
  async createWallet(@Body() post: CreateWalletDto) {
    return await this.walletService.create(post);
  }
  @Post(':address')
  async transference(
    @Param('address') adress: string,
    @Body() operation: OperationDto,
  ) {
    return await this.walletService.transference(adress, operation);
  }

  @Get()
  async getAll(@Query() payload: any) {
    const wallets = await this.walletService.getAll(payload);
    return wallets;
  }

  @Get(':address')
  async getById(@Param('address') adress: string) {
    return await this.walletService.getOne(adress);
  }

  @Get(':address/transaction')
  async getTransactions(@Param('address') adress: string) {
    return await this.walletService.getTransactions(adress);
  }

  @Put(':address')
  async withdrawOrDeposit(
    @Param('address') adress: string,
    @Body() operation: OperationDto[],
  ) {
    return await this.walletService.withdrawOrDeposit(adress, operation);
  }

  @Delete(':address')
  @HttpCode(204)
  async delete(@Param('address') address: string) {
    await this.walletService.delete(address);
  }
}
