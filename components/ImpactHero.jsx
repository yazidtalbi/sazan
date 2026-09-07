import ParallaxImage from './ParallaxImage';

export default function ImpactHero({ src, alt, title, kicker }) {
  return (
    <section className="experiences-hero-section-130 impact-shared-hero">
      <div className="experiences-hero-bg-wrapper">
        <ParallaxImage src={src} alt={alt} speed={0.3} />
        <div className="hero-overlay" />
      </div>
      <div className="hero-content experiences-hero-content">
        <div className="luxury-vertical-line" />
        <h1 className="experiences-main-title">{title}</h1>
        <div className="scroll-indicator"><span>{kicker}</span></div>
      </div>
    </section>
  );
}
