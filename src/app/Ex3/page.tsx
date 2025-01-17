"use client";

import {
  BaseError,
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import TetherAbi from "../../abis/Tether.json";
import MockTokenAbi from "../../abis/MockToken.json";
import { useMemo, useState } from "react";
import { Abi } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { getConfig } from "@/wagmi";

function App() {
  const account = useAccount();
  const chainId = useChainId();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const mockTokenContract: {
    abi: Abi;
    address: `0x${string}`;
  } = {
    abi: MockTokenAbi as Abi,
    address: "0xb89d3e6C1554F218f72B67b598B099E8922579cf",
  };

  const {
    data: hash,
    isPending,
    error: writeContractError,
    writeContractAsync,
  } = useWriteContract();

  const {
    data: balanceData,
    status: balanceStatus,
    refetch,
  } = useReadContract({
    ...mockTokenContract,
    functionName: "balanceOf",
    args: [account?.addresses?.[0]],
  });

  const { data } = useReadContracts({
    contracts: [
      {
        ...mockTokenContract,
        functionName: "decimals",
      },
      {
        ...mockTokenContract,
        functionName: "symbol",
      },
    ],
  });
  const [formattedAmount, symbol] = useMemo(() => {
    if (data && balanceData) {
      const [decimals, symbol] = data?.map((e) => e?.result);

      return [
        (balanceData as any) / BigInt(10 ** Number(decimals)),
        String(symbol),
      ];
    }
    return [0, ""];
  }, [data, balanceData]);

  const mint = async () => {
    try {
      const tx = await writeContractAsync({
        ...mockTokenContract, // Ensure this object includes address, ABI, and chainId
        functionName: "claim",
      });
      const config = getConfig();
      await waitForTransactionReceipt(config, {
        chainId: 80002,
        confirmations: 1,
        hash: tx as `0x${string}`,
      });
      refetch();
    } catch (error: any) {
      console.error("Error during mint:", error.reason || error.message);
    }
  };

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const handleSendTransaction = async () => {
    if (!recipient || !amount) {
      alert("Please provide a valid recipient address and amount.");
      return;
    }

    try {
      const [decimals] = data?.map((e) => e?.result) as any;
      const tx = await writeContractAsync({
        ...mockTokenContract,
        functionName: "transfer",
        args: [recipient, BigInt(amount) * BigInt(10 ** Number(decimals))],
      });
      const config = getConfig();
      await waitForTransactionReceipt(config, {
        chainId: 80002,
        confirmations: 1,
        hash: tx as `0x${string}`,
      });
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {account?.addresses?.[0]}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      {(balanceData as any) && (
        <div>
          <h2>Read Contract</h2>
          <div>Call fetch current balance status: {balanceStatus}</div>
          <div>
            Formatted current balance: {formattedAmount?.toLocaleString()}
          </div>
          <div>Token symbol: {symbol}</div>
        </div>
      )}

      <div>
        <h2>Write Contract</h2>
        <button disabled={isPending} onClick={mint}>
          {isPending ? "Confirming..." : "Claim"}
        </button>
        {hash && <div>Transaction Hash: {hash}</div>}
        {writeContractError && (
          <div>
            Error:{" "}
            {(writeContractError as BaseError).shortMessage ||
              writeContractError.message}
          </div>
        )}
      </div>

      {
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
              Amount:
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
            disabled={!recipient || !amount}
          >
            Send
          </button>
          {/* {sendError && <p style={{ color: "red" }}>{sendError.message}</p>} */}
        </div>
      }
    </>
  );
}

export default App;
