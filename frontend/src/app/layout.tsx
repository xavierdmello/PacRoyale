import { StarknetProvider } from "@/components/starknet-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StarknetProvider>
          {children}
        </StarknetProvider>
      </body>
    </html>
  );
} 