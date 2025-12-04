import { PublicKey, Transaction, VersionedTransaction, } from "@solana/web3.js";
import TrezorConnect, { type ConnectSettingsPublic, UI_EVENT, UI_RESPONSE } from "@trezor/connect";
import { TransactionSigner } from "./transaction_signer";

type Transports = Pick<ConnectSettingsPublic, "transports">["transports"];

export class TrezorTransactionSigner implements TransactionSigner {
  #publicKey: PublicKey;
  #path: string;

  get publicKey() { return this.#publicKey; }

  private constructor(
    path: string,
    publicKey: PublicKey
  ) {
    this.#path = path;
    this.#publicKey = publicKey;
  }

  public async signTransaction(transaction: Transaction) {
    const result = await TrezorConnect.solanaSignTransaction({
      path: this.#path,
      serializedTx: Buffer.from(transaction.compileMessage().serialize()).toString("hex"),
    });
    if (!result.success) {
      throw new Error(`Could not sign transaction: ${result.payload.error}`);
    }
    const { payload: { signature } } = result;
    transaction.addSignature(this.#publicKey, Buffer.from(signature, "hex"));
  }

  public async signVersionedTransaction(transaction: VersionedTransaction) {
    const result = await TrezorConnect.solanaSignTransaction({
      path: this.#path,
      serializedTx: Buffer.from(transaction.message.serialize()).toString("hex"),
    });
    if (!result.success) {
      throw new Error(`Could not sign transaction: ${result.payload.error}`);
    }
    const { payload: { signature } } = result;
    transaction.addSignature(this.#publicKey, Buffer.from(signature, "hex"));
  }

  public static async create({
    path,
    passphrase,
    transports = ["NodeUsbTransport"],
  }: {
    path: string,
    passphrase?: string,
    transports?: Transports,
  }) {
    await TrezorConnect.init({
      manifest: {
        appUrl: "trezor-solana-signer",
        email: "trezor-solana-signer@acme.corp",
      },
      transports,
      debug: false,
    });

    const features = await TrezorConnect.getFeatures();
    if (features.success === false) {
      throw new Error(`Cannot get info about Trezor features set: ${features.payload.error}`);
    }

    TrezorConnect.on(UI_EVENT, async (event) => {
      if (event.type == "ui-request_passphrase") {
        TrezorConnect.uiResponse({
          type: UI_RESPONSE.RECEIVE_PASSPHRASE,
          payload: {
            value: passphrase ?? "",
            save: true,
          }
        });
      }
    });

    if (features.success === true) {
      if (features.payload.unlocked === false) {
        console.error("Device is locked, please unlock it...");
      }
      if (features.payload.passphrase_always_on_device === true && passphrase !== "") {
        console.error("Device has got configured passphrase to be asked on device, parameter --passphrase will be skipped");
      }
    }

    const deviceState = await TrezorConnect.getDeviceState();
    if (deviceState.success === false) {
      throw new Error(`Device state error: ${deviceState.payload.error}`);
    }

    const address = await TrezorConnect.solanaGetAddress({
      path,
      showOnTrezor: false,
    });
    if (address.success === false) {
      throw new Error(`Pubkey error: ${address.payload.error}`);
    }

    const { payload: { address: base58Address } } = address;
    const publicKey = new PublicKey(base58Address);

    return new TrezorTransactionSigner(path, publicKey);
  }
}