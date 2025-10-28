import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata = {
  title: "MyHomeDox",
  description: "Your home's digital record",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}