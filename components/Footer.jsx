import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer-minimal">
      <div className="footer-full-width-bar">
        <div className="footer-side-line"></div>
        <Link href="/" className="footer-logo-center">
          <img src="/svg/sazan.svg" alt="SAZAN" className="sazan-footer-logo" />
        </Link>
        <div className="footer-side-line"></div>
      </div>
    </footer>
  );
}
