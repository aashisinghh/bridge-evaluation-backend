<<<<<<< Updated upstream
import { Column, Entity, Index, BeforeInsert, BeforeUpdate, PrimaryColumn } from "typeorm";
import { Blockchain, BlockchainIndexType } from "../enums";
import { bigIntTransformer, uuidWithPrefix } from "../utils";
import { AppDataSource } from "../data_source";

/**
 * Keep track of what blocks have been indexed on what chains
 **/
@Entity({ name: "blockchain_indexing_status" })
@Index("unique_blockchain_indexing_status", ["blockchain", "type"], { unique: true })
export class BlockchainIndexingStatus {
  @PrimaryColumn({ name: "id", type: "text", update: false })
  id!: string;

  // The blockchain that the index refers to
  @Column({ name: "blockchain", type: "text", update: false })
  blockchain!: Blockchain;

  // The last block that the blockchain was indexed
  @Column({ name: "block_number", type: "bigint", transformer: bigIntTransformer })
  blockNumber!: number;

  // the type of the index of interest
  @Column({ type: "text", name: "type", update: false })
  type!: BlockchainIndexType;

  // The last time the blockchain_indexing_status was done update
  @Column({
    type: "timestamptz",
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  @Column({
    type: "timestamptz",
    name: "inserted_at",
    default: () => "CURRENT_TIMESTAMP",
    update: false,
  })
  insertedAt!: Date;

  private validateInitialStatesValue(): void {
    if (BigInt(this.blockNumber) > BigInt(0)) {
      return;
    }

    throw new Error(`Block Number has cannot be <= 0`);
  }

  generateUuid(): void {
    this.id = uuidWithPrefix(true, "bist");
  }

  @BeforeInsert()
  // @ts-ignore
  private beforeInsert() {
    this.validateInitialStatesValue();
    this.generateUuid();
=======
import { BeforeUpdate, BeforeInsert, Column, Entity, Index, PrimaryColumn } from "typeorm";
import { Blockchain, POSTGRESQL_ERROR } from "../enums";
import { uuidWithPrefix } from "../utils";
import { TransferDetails } from "../types";
import { AppDataSource } from "../data_source";

/**
 * Store the information about transactions.
 */
@Entity({ name: "transaction" })
@Index("unique_transaction", ["sourceBlockchain", "sourceTransactionHash"], { unique: true })
export class Transaction {
  @PrimaryColumn({ name: "id", type: "text", update: false })
  id!: string;

  // address of source account
  @Column({ name: "from", type: "text", update: false })
  from!: string;

  // the amount that was sent
  @Column({ name: "amount", type: "bigint", update: false })
  amount!: number;

  // hash of the transaction on the source blockchain
  @Column({ name: "source_transaction_hash", type: "text", update: false })
  sourceTransactionHash!: string;

  // the chain where the transaction originated
  @Column({ name: "source_blockchain", type: "text", update: false })
  sourceBlockchain!: Blockchain;

  // the gas used in the source blockchain
  @Column({ name: "source_blockchain_gas", type: "bigint", update: false })
  sourceBlockchainGas!: number;

  // the price of gas in the source blockchain
  @Column({ name: "source_blockchain_gas_price", type: "bigint", update: false })
  sourceBlockchainGasPrice!: number;

  // this is the price of the native token in USD
  @Column({ name: "source_blockchain_native_token_price", type: "bigint", update: false, nullable: true })
  sourceBlockchainNativeTokenPrice?: number;

  // the date that the transaction was initiated from the source chain
  @Column({ type: "timestamptz", name: "initiated_at", update: false })
  initiatedAt!: Date;

  // the date that the transaction was saved in this DB
  @Column({type: "timestamptz",name: "inserted_at",default: () => "CURRENT_TIMESTAMP",update: false })
  insertedAt!: Date;

  @BeforeInsert()
  // @ts-ignore
  private beforeInsert() {
    this.validate();
    this.generateUuids();
>>>>>>> Stashed changes
  }

  @BeforeUpdate()
  // @ts-ignore
  private beforeUpdate() {
<<<<<<< Updated upstream
    this.validateInitialStatesValue();
  }

  /**
   * If an index status exists, lock it and then update. Otherwise create a new status.
   */
  static async upsert(
    blockchain: Blockchain,
    type: BlockchainIndexType,
    blockNumber: number,
    updateBackwards?: boolean
  ): Promise<BlockchainIndexingStatus> {
    return await AppDataSource.transaction((transactionalEntityManager) =>
      transactionalEntityManager
        .createQueryBuilder(BlockchainIndexingStatus, "blockchainIndexingStatus")
        .setLock("pessimistic_write")
        .where({ blockchain, type })
        .getOne()
        .then(async (blockchainIndexingStatus) => {
          if (blockchainIndexingStatus) {
            if (blockNumber < BigInt(blockchainIndexingStatus.blockNumber)) {
              if (updateBackwards) {
                blockchainIndexingStatus.blockNumber = blockNumber;
                transactionalEntityManager.save(blockchainIndexingStatus);
              }
            } else {
              blockchainIndexingStatus.blockNumber = blockNumber;
              transactionalEntityManager.save(blockchainIndexingStatus);
            }

            return blockchainIndexingStatus;
          } else {
            const newBlockchainIndexingStatus = new BlockchainIndexingStatus();
            newBlockchainIndexingStatus.blockNumber = blockNumber;
            newBlockchainIndexingStatus.blockchain = blockchain;
            newBlockchainIndexingStatus.type = type;

            return transactionalEntityManager.save(newBlockchainIndexingStatus);
          }
        })
    );
  }

  static async findOne(blockchain: Blockchain, type: BlockchainIndexType): Promise<BlockchainIndexingStatus | null> {
    try {
      return await AppDataSource.getRepository(BlockchainIndexingStatus).findOne({ where: { blockchain, type } });
    } catch (err) {
      return null;
    }
=======
    this.validate();
  }

  generateUuids(): void {
    this.id = uuidWithPrefix(true, "tra");
  }

  async validate(): Promise<void> {
    // TODO(felix): validate the address and make sure it actually meets the format
    this.sourceTransactionHash = this.sourceTransactionHash.trim().toLowerCase();
    this.from = this.from?.trim();
  }

  equal(transferDetails: TransferDetails, blockchain: Blockchain): boolean {
    return (
      this.from == transferDetails.from &&
      this.amount == transferDetails.value  &&
      this.sourceTransactionHash == transferDetails.transactionHash  &&
      this.sourceBlockchain == blockchain &&
      this.sourceBlockchainGas == Number(transferDetails.gasUsed) &&
      this.sourceBlockchainGasPrice  == Number(transferDetails.gasPrice)
    )
  }

  static async create(transferDetails: TransferDetails): Promise<Transaction> {
    const blockchain = Blockchain.ETHEREUM;
    const transaction = new Transaction();
    transaction.from = transferDetails.from
    transaction. amount = transferDetails.value
    transaction.sourceTransactionHash = transferDetails.transactionHash
    transaction.sourceBlockchain = blockchain
    transaction.sourceBlockchainGas = Number(transferDetails.gasUsed)
    transaction.sourceBlockchainGasPrice  = Number(transferDetails.gasPrice)
    // transaction.initiatedAt = transferDetails.transactionMetaData?.initiatedAt!;

    const insertResult = await AppDataSource.manager
      .createQueryBuilder()
      .insert()
      .into("transaction_information")
      .values(transaction)
      .orIgnore()
      .returning("*")
      .execute();

    if ((insertResult.raw as Array<Transaction>).length == 0) {
      const collidingEntry = await AppDataSource.getRepository(Transaction).findOne({
        where: { sourceBlockchain: blockchain, sourceTransactionHash: transferDetails.transactionHash },
      });
      if (collidingEntry?.equal(transferDetails, blockchain)) {
        return collidingEntry;
      } else {
        throw {
          code: POSTGRESQL_ERROR.UNIQUE_VIOLATION,
          constraint: "unique_transaction",
          message: 'duplicate key value violates unique constraint "unique_transaction"',
        };
      }
    }
    return transaction;
>>>>>>> Stashed changes
  }
}