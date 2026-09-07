export default function ImpactQuote({ eyebrow, title, children, navigation, className = '', heading = 'h2' }) {
  const Heading = heading;
  return (
    <section className={`masterplan-quote-section ${className}`} style={{ padding: '7rem 0' }}>
      <div className="container">
        {eyebrow && <span className="eia-eyebrow">{eyebrow}</span>}
        <Heading className="masterplan-big-quote">{title}</Heading>
        {navigation}
        {children && <div className="quote-cols-grid">{children}</div>}
      </div>
    </section>
  );
}
