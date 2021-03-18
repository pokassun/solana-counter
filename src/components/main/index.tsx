import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@components";
import { Wallet } from "src/solana/wallet";
import { SOLANA_NETWORK, WALLET_PROVIDER } from "src/solana/network";
import { CounterProgram } from "src/program/counter";

export const Main: React.FC = () => {
  const [logs, setLogs] = useState([]);
  function addLog(log: string) {
    setLogs((logs) => [...logs, log]);
  }

  const wallet = useMemo(() => new Wallet(WALLET_PROVIDER, SOLANA_NETWORK), []);
  const counterProgram = useMemo(() => new CounterProgram(), []);

  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>(undefined);
  const [isConnected, setConnected] = useState(false);
  const [counterValue, setCounterValue] = useState(0);

  useEffect(() => {
    if (selectedWallet) {
      selectedWallet.on("connect", () => {
        setConnected(true);
        addLog("Connected to wallet " + selectedWallet.publicKey.toBase58());
        loadCounts();
      });
      selectedWallet.on("disconnect", () => {
        setConnected(false);
        addLog("Disconnected from wallet");
      });
      selectedWallet.connect().catch((error) => {
        addLog("Connection to wallet failed " + error.toString());
      });
      return () => {
        selectedWallet.disconnect();
      };
    } else {
      loadCounts();
    }
  }, [selectedWallet]);

  const handleConnect = () => {
    // Trigger connection
    setSelectedWallet(wallet);
  };

  const handleDisconnect = async () => {
    await selectedWallet?.disconnect();
    setSelectedWallet(undefined);
  };

  const handleIncrement = async () => {
    try {
      await counterProgram.increment(selectedWallet);
      await loadCounts();
    } catch (e) {
      addLog("Error: " + e.message);
    }
  };

  const handleDecrement = async () => {
    try {
      await counterProgram.decrement(selectedWallet);
      await loadCounts();
    } catch (e) {
      addLog("Error: " + e.message);
    }
  };

  async function loadCounts() {
    const value = await counterProgram.getCounts();
    addLog("Current counts: " + value);
    setCounterValue(value);
  }

  return (
    <div className="flex-1">
      <div className="text-center font-light py-5 bg-gray-700">
        <div className="container mx-auto my-4">
          <h1 className="text-white text-5xl mb-2">Solana Counter</h1>
        </div>
      </div>
      <div className="container mx-auto flex flex-col items-center py-8">
        <div className="flex flex-row space-x-12 py-6 items-center justify-center">
          <Button
            type="button"
            className="rounded-full shadow w-14 h-14 text-5xl pb-1"
            onClick={handleIncrement}
            disabled={!isConnected}>
            +
          </Button>
          <p className="text-8xl">{counterValue}</p>
          <Button
            type="button"
            className="rounded-full shadow w-14 h-14 text-5xl pb-1"
            onClick={handleDecrement}
            disabled={!isConnected}>
            -
          </Button>
        </div>
        <div className="flex flex-row space-x-2 my-4">
          {!isConnected && (
            <Button type="button" className="py-2 px-4" onClick={handleConnect}>
              Connect
            </Button>
          )}
          {isConnected && (
            <Button type="button" className="py-2 px-4" onClick={handleDisconnect}>
              Disconnect
            </Button>
          )}
        </div>
        <div className="my-4 space-y-2">
          <div>
            Status:{" "}
            <span className={isConnected ? "text-green-500" : "text-gray-600"}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {/* <div>
            Balance:{" "}
          </div> */}
        </div>
        <p className="w-full text-left text-gray-400 py-4">
          Connect your wallet to increment or decrement the counter
        </p>
        <div className="w-full">
          <h2 className="mt-4 mb-2 text-2xl">Logs</h2>
          <div className="border bg-gray-100 p-4">
            {logs.map((log, i) => (
              <div key={i}>
                <span className="h-2 w-2 rounded-full bg-gray-500" /> {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
