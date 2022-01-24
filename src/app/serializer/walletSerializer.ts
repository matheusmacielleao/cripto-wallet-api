import Asset from '../entities/asset.entity';
import Wallet from '../entities/wallet.entity';

const walletSerializer = ({
  address,
  name,
  cpf,
  birthdate,
  createdAt,
  updatedAt,
  assets,
}: Wallet) => ({
  name,
  cpf,
  birthdate,
  address,
  assets: assets.map(assetSerialize),
  createdAt,
  updatedAt,
});

const assetSerialize = ({ id, ammount, coin, transactions }: Asset) => ({
  coin: coin.code,
  fullname: coin.fullname,
  ammount,
  transactions,
});

const paginateSerialize = (wallets: Wallet[]) => ({
  wallets: wallets.map(walletSerializer),
});

export { walletSerializer, paginateSerialize };
