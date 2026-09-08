'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function SiteMotion({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef(null);
  const navigationTimerRef = useRef(null);
  const [leaving, setLeaving] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const groups = [
      {
        selector: 'main section h1, main section h2, main section h3, main section h4, .hero-title, .section-title, .experiences-statement-title, .inquiries-title, .destination-title',
        className: 'site-reveal-heading',
      },
      {
        selector: 'main section p, .hero-subtitle, .experiences-statement-desc, .inquiries-top-desc, .scroll-indicator',
        className: 'site-reveal-copy',
      },
      {
        selector: 'main section img:not(.sazan-navbar-logo), .btn-sharp',
        className: 'site-reveal-media',
      },
    ];

    const elements = [];
    groups.forEach(({ selector, className }) => {
      root.querySelectorAll(selector).forEach((element, index) => {
        element.classList.add('site-reveal', className);
        element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
        elements.push(element);
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    setLeaving(false);
    const interceptInternalLinks = (event) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) return;

      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) return;

      event.preventDefault();
      setLeaving(true);
      if (navigationTimerRef.current) window.clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = window.setTimeout(() => {
        router.push(`${destination.pathname}${destination.search}${destination.hash}`);
      }, 360);
    };

    document.addEventListener('click', interceptInternalLinks, true);
    return () => {
      document.removeEventListener('click', interceptInternalLinks, true);
      if (navigationTimerRef.current) window.clearTimeout(navigationTimerRef.current);
    };
  }, [pathname, router]);

  return (
    <div ref={rootRef} className={`site-page-transition ${leaving ? 'is-leaving' : ''}`}>
      {children}
    </div>
  );
}
