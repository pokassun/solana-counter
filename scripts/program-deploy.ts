import {
  Account,
  BpfLoader,
  BPF_LOADER_PROGRAM_ID,
  clusterApiUrl,
  Connection,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import BufferLayout from "buffer-layout";
import fs from "fs";

export async function getConnection() {
  const url = clusterApiUrl("devnet");
  const connection = new Connection(url, "recent");
  const version = await connection.getVersion();
  console.log("Connection to cluster established:", url, version);
  return connection;
}

// TODO: should come from argv
const programDataLayout = BufferLayout.struct([BufferLayout.u32("count")]);

async function main() {
  const programPath = process.argv[2];

  if (!programPath) {
    console.log("No program supplied");
    process.exit(1);
  }

  const connection = await getConnection();

  let fees = 0;
  const { feeCalculator } = await connection.getRecentBlockhash();

  // Calculate the cost to load the program

  const data = fs.readFileSync(programPath);
  const NUM_RETRIES = 500; // allow some number of retries
  fees +=
    feeCalculator.lamportsPerSignature *
      (BpfLoader.getMinNumSignatures(data.length) + NUM_RETRIES) +
    (await connection.getMinimumBalanceForRentExemption(data.length));

  // Calculate the cost to fund the greeter account
  fees += await connection.getMinimumBalanceForRentExemption(programDataLayout.span);

  // Calculate the cost of sending the transactions
  fees += feeCalculator.lamportsPerSignature * 100; // wag

  const payerAccount = new Account();
  await connection.requestAirdrop(payerAccount.publicKey, fees);
  console.log("PayerAccount publicKey: ", payerAccount.publicKey.toBase58());
  // Make Sure I have balance for Rent Exemption
  const payerBalance = await connection.getBalance(payerAccount.publicKey);
  console.log("PayerAccount balance:", payerBalance);

  // Create the program account
  const programIdAccount = new Account();
  const programId = programIdAccount.publicKey;

  await BpfLoader.load(connection, payerAccount, programIdAccount, data, BPF_LOADER_PROGRAM_ID);
  console.log("Program deployed: ", programId.toBase58());

  // Create the data account
  const programDataAccount = new Account();
  const programData = programDataAccount.publicKey;

  console.log("Creating data account", programData.toBase58());
  const space = programDataLayout.span;
  const lamports = await connection.getMinimumBalanceForRentExemption(programDataLayout.span);
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payerAccount.publicKey,
      newAccountPubkey: programData,
      lamports,
      space,
      programId
    })
  );
  await sendAndConfirmTransaction(connection, transaction, [payerAccount, programDataAccount], {
    commitment: "singleGossip",
    preflightCommitment: "singleGossip"
  });

  console.log("ProgramId: ", programId.toBase58());
  console.log("ProgramData: ", programData.toBase58());
  console.log("NOTE: update the app .env file with these address");
}

main()
  .catch((err) => {
    console.error(err);
  })
  .then(() => process.exit());
