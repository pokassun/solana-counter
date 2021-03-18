import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

export async function getConnection() {
  const url = clusterApiUrl("devnet");
  const connection = new Connection(url, "recent");
  const version = await connection.getVersion();
  console.log("Connection to cluster established:", url, version);
  return connection;
}

async function main() {
  const pubkey = process.argv[2];

  if (!pubkey) {
    console.log("No account supplied");
    process.exit(1);
  }

  console.log("Lets look at account:", pubkey);

  let pk = new PublicKey(pubkey);

  const connection = await getConnection();

  let account = await connection.getAccountInfo(pk);

  if (!account) {
    console.log("Account not found on chain");
    process.exit(1);
  }

  console.log(account);

  let owner = new PublicKey(account.owner.toBase58());

  console.log("Owner PubKey:", owner.toString());
}

main()
  .catch((err) => {
    console.error(err);
  })
  .then(() => process.exit());
