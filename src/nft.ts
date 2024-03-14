import { Transfer as TransferEvent } from '../generated/OgNft/ERC721';
import { createTransfer, getNftId } from './utils/nft';
import { Nft } from '../generated/schema';
import { log } from '@graphprotocol/graph-ts';
import { createUserIfNotExists } from './utils/user';

export function handleTransfer(event: TransferEvent): void {
  let nft = Nft.load(getNftId(event.address, event.params.tokenId));
  if (nft) {
    let userId = event.params.to.toHex();
    createUserIfNotExists(userId, event.block.timestamp);
    nft.isMinted = true;
    nft.user = userId;
    nft.save();
    createTransfer(event, nft.id);
  } else {
    // this is probably not necessary in production
    // log.warning('Transfer of non-upgraded NFT: {}, {}', [event.address.toHex(), event.params.tokenId.toString()]);
  }
}
