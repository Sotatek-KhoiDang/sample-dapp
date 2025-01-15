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
import { useMemo } from "react";
import { Abi } from "viem";

function App() {
  const account = useAccount();
  const chainId = useChainId();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const tetherContract: {
    abi: Abi;
    address: `0x${string}`;
  } = {
    abi: TetherAbi as Abi,
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  };

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
    writeContract,
  } = useWriteContract();

  const result = useReadContract({
    ...tetherContract,
    functionName: "totalSupply",
    query: {
      select(data) {
        return Number(data || 0);
      },
      enabled: chainId === 1,
    },
  });

  const { data } = useReadContracts({
    contracts: [
      {
        ...tetherContract,
        functionName: "decimals",
      },
      {
        ...tetherContract,
        functionName: "symbol",
      },
    ],
  });

  const [formattedAmount, symbol] = useMemo(() => {
    if (data && result?.data) {
      const [decimals, symbol] = data?.map((e) => e?.result);

      return [result?.data / 10 ** Number(decimals), String(symbol)];
    }
    return [0, ""];
  }, [data, result]);

  const mint = async () => {
    await writeContract({
      ...mockTokenContract,
      functionName: "mint",
      args: [
        "0x5148e3990341147Cc576585eC36026ef24c8f5D2",
        BigInt("10000000000000000000"),
      ],
    });
  };

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
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
    </>
  );
}

export default App;
