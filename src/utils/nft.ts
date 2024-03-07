import { Transfer as TransferEvent } from '../../generated/OgNft/OgNft';
import { Address, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts';
import { Nft, Transfer } from '../../generated/schema';
import { createOrUpdateUser } from './user';
import { Nft as NftContract } from '../../generated/CollectionUpgrade/Nft';

export function getTransferId(event: ethereum.Event): string {
  return (
    event.block.number.toString().padStart(32, '0') +
    event.transaction.index.toString().padStart(8, '0') +
    event.logIndex.toString().padStart(8, '0')
  );
}

export function getNftId(collectionId: Address, tokenId: BigInt): string {
  return collectionId.toHex() + '_' + tokenId.toString();
}

export function createNft(collectionId: Address, tokenId: BigInt, userId: Bytes, ts: BigInt): Nft {
  let nftId = getNftId(collectionId, tokenId);

  let nftContract = NftContract.bind(collectionId);
  let tokenUri = nftContract.tokenURI(tokenId);
  log.warning('URI: {}', [tokenUri.toString()]);

  let nft = new Nft(nftId);
  nft.collection = collectionId;
  nft.tokenId = tokenId;
  nft.firstUser = userId;
  nft.user = userId;
  nft.createdAt = ts;
  nft.tokenUri = tokenUri;
  nft.save();

  return nft;
}

export function createOrUpdateNft(collectionId: Address, tokenId: BigInt, userId: Bytes, ts: BigInt): Nft {
  let nftId = getNftId(collectionId, tokenId);

  let nft = Nft.load(nftId);
  if (nft) {
    nft.user = userId;
    nft.save();
  } else {
    nft = createNft(collectionId, tokenId, userId, ts);
  }
  return nft;
}

export function createTransfer(event: TransferEvent, nftId: string): void {
  let transfer = new Transfer(getTransferId(event));
  transfer.from = event.params.from;
  transfer.to = event.params.to;

  transfer.blockNumber = event.block.number;
  transfer.ts = event.block.timestamp;
  transfer.transactionHash = event.transaction.hash;
  transfer.nft = nftId;
  transfer.save();
}
