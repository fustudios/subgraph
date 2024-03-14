import { Transfer as TransferEvent } from '../../generated/OgNft/ERC721';
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Nft, Transfer } from '../../generated/schema';
import { ERC721 } from '../../generated/CollectionUpgrade/ERC721';

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

export function createNft(collectionId: Address, tokenId: BigInt, userId: string | null, ts: BigInt): Nft {
  let nftId = getNftId(collectionId, tokenId);

  let nftContract = ERC721.bind(collectionId);
  let tokenUri = nftContract.tokenURI(tokenId);

  let nft = new Nft(nftId);
  nft.collection = collectionId;
  nft.tokenId = tokenId;
  if (userId != null) {
    nft.firstUser = userId;
    nft.user = userId;
  }
  nft.createdAt = ts;
  nft.tokenUri = tokenUri;
  nft.upgrades = [];
  nft.isMinted = false;
  nft.save();

  return nft;
}

export function createOrLoadNft(collectionId: Address, tokenId: BigInt, userId: string | null, ts: BigInt): Nft {
  let nftId = getNftId(collectionId, tokenId);

  let nft = Nft.load(nftId);
  if (!nft) {
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
