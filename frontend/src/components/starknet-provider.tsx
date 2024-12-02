"use client";
import React from "react";
import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  jsonRpcProvider,
  argent,
  braavos,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";
import { RPC_URL } from "./RPC";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const provider = jsonRpcProvider({
    rpc: (chain) => ({
      nodeUrl: RPC_URL,
    }),
  });

  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "onlyIfNoConnectors",
    order: "random",
  });

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={provider}
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}
