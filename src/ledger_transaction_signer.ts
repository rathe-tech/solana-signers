import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import Solana from "@ledgerhq/hw-app-solana";
import { TransactionSigner } from "./transaction_signer";

export class LedgerTransactionSigner implements TransactionSigner {
  #solana: Solana;
  #bip32Path: string;
  #publicKey: PublicKey;

  public get publicKey() {
    return this.#publicKey;
  }

  private constructor(solana: Solana, bip32Path: string, publicKey: PublicKey) {
    this.#solana = solana;
    this.#bip32Path = bip32Path;
    this.#publicKey = publicKey;
  }

  public async signTransaction(transaction: Transaction) {
    const raw = Buffer.from(transaction.compileMessage().serialize());
    const { signature } = await this.#solana.signTransaction(this.#bip32Path, raw);
    transaction.addSignature(this.#publicKey, signature);
  }

  public async signVersionedTransaction(transaction: VersionedTransaction) {
    const raw = Buffer.from(transaction.message.serialize());
    const { signature } = await this.#solana.signTransaction(this.#bip32Path, raw);
    transaction.addSignature(this.#publicKey, signature);
  }

  public static async create(bip32Path: string): Promise<LedgerTransactionSigner> {
    const transport = await TransportNodeHid.create();
    const solana = new Solana(transport);
    const { address } = await solana.getAddress(bip32Path);
    const publicKey = new PublicKey(address);
    return new LedgerTransactionSigner(solana, bip32Path, publicKey);
  }
}