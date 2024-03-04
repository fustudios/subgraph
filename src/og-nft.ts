import { Transfer as TransferEvent } from '../generated/OgNft/OgNft';
import { Nft, Transfer } from '../generated/schema';
import { getOrCreateUser } from './utils/user';

export function handleTransfer(event: TransferEvent): void {
  event.block.number.toI64();
  let transfer = new Transfer(
    event.block.number.toString().padStart(32, '0') +
      event.transaction.index.toString().padStart(8, '0') +
      event.logIndex.toString().padStart(8, '0'),
  );

  // let transfer = new Transfer(event.transaction.hash.concatI32(event.logIndex.toI32()));

  let tokenId = event.params.tokenId;
  event.logIndex;
  transfer.from = event.params.from;
  transfer.to = event.params.to;

  transfer.blockNumber = event.block.number;
  transfer.ts = event.block.timestamp;
  transfer.transactionHash = event.transaction.hash;

  let userId = transfer.to;
  // if (userId != zeroAddress) {
  let user = getOrCreateUser(userId, transfer.ts);
  user.save();
  // }

  let nftId = 'og_' + tokenId.toString();
  let nft = Nft.load(nftId);
  if (!nft) {
    nft = new Nft(nftId);
    nft.type = 'Og';
    nft.tokenId = tokenId;
    nft.firstUser = userId;
    nft.createdAt = transfer.ts;
  }
  nft.user = userId;
  nft.save();

  transfer.nft = nftId;
  transfer.save();
}
