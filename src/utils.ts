import { BLOCKCHAIN_NAME_TO_ENUM, BLOCK_CONFIRMATIONS } from "./constants";
import { BlockStatus, Blockchain } from "./enums";
import { v4 as uuidv4 } from "uuid";
import { ValueTransformer } from "typeorm";

// From here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/BigInt
// other options: http://mikemcl.github.io/big.js/
/**
 * bigInts are stored as strings in the DB so we need to do the transformations
 */
export const bigIntTransformer: ValueTransformer = {
  to: (entityValue: bigint): bigint => entityValue,
  from: (databaseValue: string): number | undefined => (databaseValue ? Number(databaseValue) : undefined),
};

// used to filter out null and undefined values: https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
export const notEmpty = <T>(value: T): value is NonNullable<typeof value> => !!value;

export const getBlockStatus = (blockNumber: number, latestBlock: number, blockchain: Blockchain): BlockStatus => {
  return blockNumber <= latestBlock - BLOCK_CONFIRMATIONS[blockchain] ? BlockStatus.CONFIRMED : BlockStatus.UNCONFIRMED;
};

export const getChain = (chainName: string): Blockchain => {
  const blockchain = BLOCKCHAIN_NAME_TO_ENUM[chainName.trim().toUpperCase()];
  if (blockchain) return blockchain;
  throw new Error(`invalid id: ${chainName}`);
};

export const uuid = (removeDashes = false): string => {
  if (removeDashes) {
    return uuidv4().replace(/-/g, "");
  }

  return uuidv4();
};

export const uuidWithPrefix = (removeDashes = false, prefix: string): string => `${prefix}_${uuid(removeDashes)}`;