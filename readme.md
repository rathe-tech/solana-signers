Solana Signers
===

[![Version](http://img.shields.io/npm/v/@rathe/solana-signers.svg)](https://www.npmjs.org/package/@rathe/solana-signers)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![Downloads](http://img.shields.io/npm/dm/@rathe/solana-signers.svg)](https://npmjs.org/package/@rathe/solana-signers)
[![Downloads](http://img.shields.io/npm/dt/@rathe/solana-signers.svg)](https://npmjs.org/package/@rathe/solana-signers)

Transaction signer implementation for Ledger devices and the standard Solana Keypair class. Both legacy and versioned transactions are supported.

## Install with npm:

```sh
npm install --save @rathe/solana-signers
```

## Usage

```ts
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction
} from "@solana/web3.js";
import { LedgerTransactionSigner, NaclTransactionSigner } from "@rathe/solana-signers";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

const bip32Path = "LEDGER_BIP32_PATH";
const ledgerSigner = await LedgerTransactionSigner.create(bip32Path);

const keypair = Keypair.generate();
const naclSigner = new NaclTransactionSigner(keypair);

const isLedger = true;
const signer = isLedger ? ledgerSigner : naclSigner;
const fromAddress = signer.publicKey;
const toKeypair = Keypair.generate();
const lamportsToSend = 1_000_000;

const transferTransaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: fromAddress,
    toPubkey: toKeypair.publicKey,
    lamports: lamportsToSend
  })
);

await signer.signTransaction(transferTransaction);
const signature = await connection.sendRawTransaction(transferTransaction.serialize());

const result = await connection.confirmTransaction(signature);
if (result.value.err != null) {
  throw result.value.err;
} else {
  console.log("Transaction confirmed: %o", signature);
}

```

## License

[MIT](LICENSE)