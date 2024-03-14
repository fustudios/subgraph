import { Collection } from '../../generated/schema';
import { BI0 } from './const';
import { BigInt, Bytes } from '@graphprotocol/graph-ts';

export function getCollectionStandardFromId(id: i32): string {
  switch (id) {
    case 0:
      return 'ERC721';
    default:
      return 'Unknown';
  }
}

export function createCollection(id: Bytes, name: string, type: string, standard: i32, ts: BigInt): Collection {
  let collection = new Collection(id);

  collection.name = name;
  collection.standard = getCollectionStandardFromId(standard);
  collection.type = type;
  collection.createdAt = ts;
  collection.fees = BI0;
  collection.feesUpgrades = BI0;
  collection.feesSponsorship = BI0;
  collection.numTokensUpgraded = BI0;
  collection.numUpgrades = BI0;
  collection.save();
  return collection;
}
