import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quản Lý Trọ",
  description: "Ứng dụng quản lý phòng trọ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <div className="app-container">
          <header className="header">
            <Link href="/" className="nav-link">Tính hóa đơn</Link>
            <Link href="/manage" className="nav-link">Quản lý trọ</Link>
          </header>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
