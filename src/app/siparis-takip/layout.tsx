import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sipariş Takip",
  robots: { index: false, follow: false },
};

export default function SiparisTakipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
