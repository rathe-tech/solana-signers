import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

export interface TransactionSigner {
  get publicKey(): PublicKey;
  signTransaction(transaction: Transaction): Promise<void>;
  signVersionedTransaction(transaction: VersionedTransaction): Promise<void>;
}