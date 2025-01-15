"use client";

import React, { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useBalance,
  useSendTransaction,
  useTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { getConfig } from "@/wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    chainId,
  });

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    sendTransactionAsync,
    data,
    error: sendError,
    data: hash,
  } = useSendTransaction({
    mutation: {
      async onSuccess(data, variables, context) {
        const config = getConfig();
        console.log(data);
        await waitForTransactionReceipt(config, {
          chainId: 80002,
          confirmations: 1, 
          hash: data as `0x${string}`,
        });
        setRecipient("");
        setAmount("");
        refetchBalance();
        setIsLoading(false);
      },
    },
  });

  const handleSendTransaction = async () => {
    if (!recipient || !amount) {
      alert("Please provide a valid recipient address and amount.");
      return;
    }

    setIsLoading(true);
    try {
      await sendTransactionAsync({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h2>Account</h2>
        {isConnected ? (
          <div>
            <p>Status: Connected</p>
            <p>Address: {address}</p>
            <p>Chain ID: {chainId}</p>
            <p>
              Balance:{" "}
              {balanceData
                ? `${balanceData.formatted} ${balanceData.symbol}`
                : "Fetching..."}
            </p>
            <button type="button" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        ) : (
          <p>Status: Disconnected</p>
        )}
      </div>

      {!isConnected && (
        <div>
          <h2>Connect</h2>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              type="button"
            >
              {connector.name}
            </button>
          ))}
          <p>Status: {status}</p>
          {error && <p style={{ color: "red" }}>{error.message}</p>}
        </div>
      )}

      {isConnected && (
        <div>
          <h2>Send Native Token</h2>
          <div>
            <label>
              Recipient Address:
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
              />
            </label>
          </div>
          <div>
            <label>
              Amount (in ETH):
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.01"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleSendTransaction}
            disabled={isLoading || !recipient || !amount}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
          {sendError && <p style={{ color: "red" }}>{sendError.message}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
