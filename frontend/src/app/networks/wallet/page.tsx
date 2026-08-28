import WalletPage from '@/app/n/[domain]/wallet/page';

export default function GlobalWalletPage() {
  return <WalletPage params={Promise.resolve({ domain: 'global' })} />;
}
