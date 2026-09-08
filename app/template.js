'use client';

import SiteMotion from '@/components/SiteMotion';
import SmoothScroll from '@/components/SmoothScroll';

export default function Template({ children }) {
  return (
    <SmoothScroll>
      <SiteMotion>{children}</SiteMotion>
    </SmoothScroll>
  );
}
