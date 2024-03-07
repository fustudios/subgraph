import { Transfer as TransferEvent } from '../generated/OgNft/OgNft';
import { createTransfer, getNftId } from './utils/nft';
import { Nft } from '../generated/schema';
import { log } from '@graphprotocol/graph-ts';

export function handleTransfer(event: TransferEvent): void {
  let nft = Nft.load(getNftId(event.address, event.params.tokenId));
  if (nft) {
    nft.user = event.params.to;
    nft.save();
    createTransfer(event, nft.id);
  } else {
    // this is probably not necessary in production
    // log.warning('Transfer of non-upgraded NFT: {}, {}', [event.address.toHex(), event.params.tokenId.toString()]);
  }
}
