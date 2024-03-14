import { Transfer as TransferEvent } from '../generated/OgNft/ERC721';
import { Collection } from '../generated/schema';
import { createUserIfNotExists } from './utils/user';
import { createOrLoadNft, createTransfer } from './utils/nft';
import { BI0 } from './utils/const';
import { fuOgNft } from './utils/network';
import { Address } from '@graphprotocol/graph-ts';
import { createCollection } from './utils/collection';

export function handleTransfer(event: TransferEvent): void {
  let ogCollectionId = Address.fromString(fuOgNft);
  let collection = Collection.load(ogCollectionId);
  if (!collection) {
    collection = createCollection(ogCollectionId, 'FU Studios OG Membership', 'Og', 0, event.block.timestamp);
    collection.save();
  }

  let ts = event.block.timestamp;
  let tokenId = event.params.tokenId;
  let userId = event.params.to.toHex();

  createUserIfNotExists(userId, ts);
  let nft = createOrLoadNft(ogCollectionId, tokenId, userId, ts);
  nft.isMinted = true;
  nft.user = userId;
  nft.save();

  createTransfer(event, nft.id);
}
