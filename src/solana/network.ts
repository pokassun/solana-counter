import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js";

export const SOLANA_NETWORK = <Cluster>process.env.SOLANA_NETWORK || "devnet";
export const WALLET_PROVIDER = process.env.WALLET_PROVIDER || "https://www.sollet.io";

/**
 * Connection to the network
 */
let connection: Connection;

export async function getConnection(): Promise<Connection> {
  if (connection) {
    return connection;
  }
  const url = clusterApiUrl(SOLANA_NETWORK);
  connection = new Connection(url, "singleGossip");
  const version = await connection.getVersion();
  console.log("Connection to cluster established:", url, version);

  return connection;
}
