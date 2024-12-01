"use client";
import React from "react";
import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const provider = publicProvider();

  const { connectors } = useInjectedConnectors({
    recommended: [
      argent(),
      braavos(),
    ],
    includeRecommended: "onlyIfNoConnectors",
    order: "random"
  });

  const chain = { 
    ...sepolia,
    rpcUrls: {
      default: {
        http: ["http://localhost:5050"]
      },
      public: {
        http: ["http://localhost:5050"]
      }
    }
  };

  return (
    <StarknetConfig
      chains={[chain]}
      provider={provider}
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
} 