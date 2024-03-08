import { AddFee, UpgradeNFT, WhitelistCollection } from '../generated/CollectionUpgrade/CollectionUpgrade';
import { Collection, Nft } from '../generated/schema';
import { Collection as CollectionTemplate } from '../generated/templates';
import { BigInt, log } from '@graphprotocol/graph-ts';
import { Nft as NftContract } from '../generated/CollectionUpgrade/Nft';
import { createNft, createOrLoadNft } from './utils/nft';
import { BI0, BI1 } from './utils/const';
import { createOrUpdateUser } from './utils/user';

export function handleWhitelistCollection(event: WhitelistCollection): void {
  log.warning('!!!! handle whitelist collection: {}', [event.transaction.hash.toHex()]);
  let collectionAddress = event.params.collection;
  let collection = new Collection(collectionAddress);
  collection.createdAt = event.block.timestamp;
  collection.numNftsUpgraded = BI0;
  collection.fees = BI0;

  let collectionContract = NftContract.bind(event.params.collection);
  collection.name = collectionContract.name();
  collection.save();

  CollectionTemplate.create(collectionAddress);
}

export function handleUpgradeNFT(event: UpgradeNFT): void {
  let collectionId = event.params.collection;
  let tokenId = event.params.id;
  let upgrade = event.params.upgrade;
  let userId = event.transaction.from;
  let ts = event.block.timestamp;

  log.warning('handleUpgradeNFT: {}, {}, {}, {}', [
    userId.toHex(),
    collectionId.toHex(),
    tokenId.toString(),
    upgrade.toString(),
  ]);

  createOrUpdateUser(userId, ts);
  let collection = Collection.load(collectionId);
  if (collection) {
    collection.numNftsUpgraded = collection.numNftsUpgraded.plus(BI1);
  } else {
    log.error('Collection not found: {}', [collectionId.toHex()]);
  }
  let nft = createOrLoadNft(collectionId, tokenId, userId, ts);
  nft.upgrades = nft.upgrades.concat([upgrade]);
  nft.save();
}

export function handleAddFee(event: AddFee): void {
  let collectionId = event.params.collection;
  let amount = event.params.amount;

  log.warning('handleAddFee: {}, {}', [collectionId.toHex(), amount.toString()]);

  let collection = Collection.load(collectionId);
  if (collection) {
    collection.fees = collection.fees.plus(amount);
    collection.save();
  } else {
    log.error('Collection not found: {}', [collectionId.toHex()]);
  }
}
