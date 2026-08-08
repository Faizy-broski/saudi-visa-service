import Navbar from './Navbar';
import FooterBanner from './FooterBanner';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-24">{children}</main>
      <FooterBanner />
    </>
  );
}
