import Link from 'next/link';

export default function Footer({ standalone = false }) {
  return (
    <footer className="site-footer-minimal">
      <div className="footer-full-width-bar">
        <div className="footer-side-line"></div>
        {standalone ? (
          <a href="#main-content" className="footer-logo-center" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src="/svg/sazan.svg" alt="SAZAN" className="sazan-footer-logo" />
          </a>
        ) : (
          <Link href="/" className="footer-logo-center">
            <img src="/svg/sazan.svg" alt="SAZAN" className="sazan-footer-logo" />
          </Link>
        )}
        <div className="footer-side-line"></div>
      </div>
    </footer>
  );
}
