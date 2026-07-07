import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '북대서양 심층 순환(AMOC) 담수 유입 시뮬레이션',
  description: '그린란드 빙하 융해에 따른 담수 유입이 AMOC 순환 세기에 미치는 비선형 붕괴 효과 시뮬레이션',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
