Solana Signers
===

[![Version](http://img.shields.io/npm/v/@rathe/solana-signers.svg)](https://www.npmjs.org/package/@rathe/solana-signers)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![Downloads](http://img.shields.io/npm/dm/@rathe/solana-signers.svg)](https://npmjs.org/package/@rathe/solana-signers)
[![Downloads](http://img.shields.io/npm/dt/@rathe/solana-signers.svg)](https://npmjs.org/package/@rathe/solana-signers)

Transaction signers for Solana Node.js/CLI integrations.

Supported signers for:
- Solana keypair via `tweetnacl`
- Ledger hardware wallets via `@ledgerhq/hw-app-solana`
- Trezor hardware wallets via `@trezor/connect`

## Install with npm:

```sh
npm install --save @rathe/solana-signers
```

## Examples

### Signing with a keypair:
```ts
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction
} from "@solana/web3.js";
import { NaclTransactionSigner } from "@rathe/solana-signers";

const rpcUrl = "YOUR_RPC_URL";
const connection = new Connection(rpcUrl, "confirmed");

const keypair = Keypair.generate();
const signer = new NaclTransactionSigner(keypair);

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

### Signing with a Ledger hardware wallet:
```ts
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction
} from "@solana/web3.js";
import { LedgerTransactionSigner } from "@rathe/solana-signers";

const rpcUrl = "YOUR_RPC_URL";
const connection = new Connection(rpcUrl, "confirmed");

const bip32Path = "LEDGER_BIP32_PATH"; // Can be found in the Ledger Wallet app
const signer = await LedgerTransactionSigner.create(bip32Path);

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

### Signing with a Trezor hardware wallet:
```ts
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction
} from "@solana/web3.js";
import { TrezorTransactionSigner } from "@rathe/solana-signers";

const rpcUrl = "YOUR_RPC_URL";
const connection = new Connection(rpcUrl, "confirmed");

const path = "TREZOR_WALLET_PATH"; // Can be found in the Trezor Suite app
const signer = await TrezorTransactionSigner.create({ path });

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