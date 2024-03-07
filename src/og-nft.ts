import { Transfer as TransferEvent } from '../generated/OgNft/OgNft';
import { Collection } from '../generated/schema';
import { createOrUpdateUser } from './utils/user';
import { createOrUpdateNft, createTransfer } from './utils/nft';
import { BI0, ogCollectionId } from './utils/const';

export function handleTransfer(event: TransferEvent): void {
  let collection = Collection.load(ogCollectionId);
  if (!collection) {
    collection = new Collection(ogCollectionId);
    collection.createdAt = event.block.timestamp;
    collection.name = 'FU Studios OG Membership';
    collection.code = 'og';
    collection.fees = BI0;
    collection.numNftsUpgraded = BI0;
    collection.save();
  }

  let ts = event.block.timestamp;
  let tokenId = event.params.tokenId;
  let userId = event.params.to;

  createOrUpdateUser(userId, ts);
  let nft = createOrUpdateNft(ogCollectionId, tokenId, userId, ts);

  createTransfer(event, nft.id);
}
