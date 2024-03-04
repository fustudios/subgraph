import { User } from '../../generated/schema';
import { BigInt, Bytes } from '@graphprotocol/graph-ts';

export function getOrCreateUser(id: Bytes, ts: BigInt): User {
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.createdAt = ts;
  }
  return user;
}
