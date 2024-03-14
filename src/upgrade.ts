import {
  AddFee,
  SetCollectionStandard,
  UpgradeNFT,
  WhitelistCollection,
} from '../generated/CollectionUpgrade/CollectionUpgrade';
import { Collection, Nft } from '../generated/schema';
import { Collection as CollectionTemplate } from '../generated/templates';
import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts';
import { ERC721 } from '../generated/CollectionUpgrade/ERC721';
import { createNft, createOrLoadNft } from './utils/nft';
import { BI0, BI1 } from './utils/const';
import { createUserIfNotExists } from './utils/user';
import { createCollection, getCollectionStandardFromId } from './utils/collection';

export function handleWhitelistCollection(event: WhitelistCollection): void {
  log.warning('!!!! handle whitelist collection: {}', [event.transaction.hash.toHex()]);
  let collectionAddress = event.params.collection;
  let collectionContract = ERC721.bind(collectionAddress);

  createCollection(
    collectionAddress,
    collectionContract.name(),
    'External',
    event.params.standard,
    event.block.timestamp,
  );

  CollectionTemplate.create(collectionAddress);
}

export function handleSetCollectionStandard(event: SetCollectionStandard): void {
  let collection = Collection.load(event.params.collection);
  if (collection) {
    collection.standard = getCollectionStandardFromId(event.params.standard);
    collection.save();
  }
}

export function handleUpgradeNFT(event: UpgradeNFT): void {
  let collectionId = event.params.collection;
  let tokenId = event.params.id;
  let upgrade = event.params.upgrade;
  let ts = event.block.timestamp;

  let erc721 = ERC721.bind(collectionId);
  let userIdCall = erc721.try_ownerOf(tokenId);
  let isMinted = false;
  let userId: string | null = null;
  if (userIdCall.reverted) {
    log.warning('Skipping unminted token: {}', [collectionId.toHex(), tokenId.toString()]);
    // skip unminted tokens (aka not owned by anyone)
  } else {
    isMinted = true;
    userId = userIdCall.value.toHex();
    createUserIfNotExists(userId, ts);
  }

  log.warning('handleUpgradeNFT: {}, {}, {}, {}', [
    userId == null ? 'null' : (userId as string),
    collectionId.toHex(),
    tokenId.toString(),
    upgrade.toString(),
  ]);

  let nft = createOrLoadNft(collectionId, tokenId, userId, ts);
  nft.upgrades = nft.upgrades.concat([upgrade]);
  nft.isMinted = isMinted;
  nft.save();

  let collection = Collection.load(collectionId);
  if (collection) {
    collection.numUpgrades = collection.numUpgrades.plus(BI1);
    if (nft.upgrades.length === 1) {
      collection.numTokensUpgraded = collection.numTokensUpgraded.plus(BI1);
    }
    collection.save();
  } else {
    log.error('Collection not found: {}', [collectionId.toHex()]);
  }
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
