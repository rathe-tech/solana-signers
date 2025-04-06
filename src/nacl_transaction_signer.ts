import * as nacl from "tweetnacl";
import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { TransactionSigner } from "./transaction_signer";

export class NaclTransactionSigner implements TransactionSigner {
  #keypair: Keypair;

  public constructor(keypair: Keypair) {
    this.#keypair = keypair;
  }

  public get publicKey() {
    return this.#keypair.publicKey;
  }

  public async signTransaction(transaction: Transaction) {
    const { secretKey } = this.#keypair;
    const raw = transaction.compileMessage().serialize();
    const signature = Buffer.from(nacl.sign.detached(raw, secretKey));
    transaction.addSignature(this.publicKey, signature);
  }

  public async signVersionedTransaction(transaction: VersionedTransaction) {
    const { secretKey } = this.#keypair;
    const raw = transaction.message.serialize();
    const signature = Buffer.from(nacl.sign.detached(raw, secretKey));
    transaction.addSignature(this.publicKey, signature);
  }
}