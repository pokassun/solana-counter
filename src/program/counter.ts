import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import BufferLayout from "buffer-layout";
import { getConnection } from "../solana/network";
import { Wallet } from "../solana/wallet";

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || "";
const PROGRAM_DATA = process.env.NEXT_PUBLIC_PROGRAM_DATA || "";

export class CounterProgram {
  private _programId: PublicKey;
  private _programData: PublicKey;
  private _programDataLayout = BufferLayout.struct([BufferLayout.u32("count")]);

  constructor() {
    this._programId = new PublicKey(PROGRAM_ID);
    this._programData = new PublicKey(PROGRAM_DATA);
  }

  async getCounts(): Promise<number> {
    const connection = await getConnection();
    const accountInfo = await connection.getAccountInfo(this._programData);
    const info = this._programDataLayout.decode(Buffer.from(accountInfo.data));
    return info.count;
  }

  async increment(wallet: Wallet): Promise<void> {
    return this._sendInstruction(wallet, [1]);
  }

  async decrement(wallet: Wallet): Promise<void> {
    return this._sendInstruction(wallet, [2]);
  }

  private async _sendInstruction(wallet: Wallet, data: number[]): Promise<void> {
    const connection = await getConnection();

    const instruction = new TransactionInstruction({
      keys: [{ pubkey: this._programData, isSigner: false, isWritable: true }],
      programId: this._programId,
      data: Buffer.from(data)
    });

    const recentBlockhash = await connection.getRecentBlockhash();

    const transaction = new Transaction({
      feePayer: wallet.publicKey,
      recentBlockhash: recentBlockhash.blockhash
    }).add(instruction);

    const rawTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(rawTransaction.serialize());

    await connection.confirmTransaction(signature, "singleGossip");
  }
}
