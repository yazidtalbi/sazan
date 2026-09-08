import ImpactPageShell from '@/components/ImpactPageShell';
import ImpactHero from '@/components/ImpactHero';
import ParallaxImage from '@/components/ParallaxImage';

export const metadata = {
  title: 'Management & Monitoring | Sazan Coast',
  description: 'Environmental management and monitoring framework for Sazan Coast.',
};

export default function ManagementMonitoringPage() {
  return (
    <ImpactPageShell>
      <ImpactHero
        kicker="Environmental Impact"
        title={<>Management &amp;<br /><em>Monitoring</em></>}
        src="/managementandmonitoring.png"
        alt="Management and Monitoring"
      />

      {/* OVERVIEW SECTION */}
      <section className="masterplan-quote-section" style={{ padding: '6rem 0 4rem' }}>
        <div className="container">
          <span className="eia-eyebrow">OVERVIEW</span>
          <h2 className="masterplan-big-quote">
            Sazan Coast is committed to ensuring that environmental responsibility continues throughout the life of the development.
          </h2>
          <div className="quote-cols-grid">
            <p>
              A comprehensive management and monitoring framework will guide mitigation measures, track key environmental and social conditions, and measure performance over time.
            </p>
            <p>
              Through ongoing evaluation and adaptation, the project aims to respond to changing conditions, strengthen environmental outcomes, and uphold its commitments from development through long-term operation.
            </p>
          </div>
        </div>
      </section>

      {/* FULL WIDTH PARALLAX IMAGE */}
      <section style={{ position: 'relative', width: '100%', height: '70vh', minHeight: '480px', overflow: 'hidden', margin: '3rem 0' }}>
        <ParallaxImage
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=90"
          alt="Coastal Flowers & Sea"
          speed={0.45}
        />
      </section>

      {/* CENTERED TEXT UNDERNEATH WITH CONSTRAINED MAX-WIDTH */}
      <section style={{ padding: '3rem 1.5rem 8rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>
            Measuring<br />
            What <em>Matters</em>
          </h2>
          <p className="eia-body-text" style={{ fontSize: '18px', lineHeight: 1.55, color: 'rgba(0, 0, 0, 0.72)', marginBottom: '1.5rem', textAlign: 'center' }}>
            The project will establish a comprehensive framework for environmental management and monitoring to support responsible development throughout the project lifecycle.
          </p>
          <p className="eia-body-text" style={{ fontSize: '18px', lineHeight: 1.55, color: 'rgba(0, 0, 0, 0.72)', textAlign: 'center' }}>
            This framework will guide the implementation of mitigation measures, monitor key environmental and social conditions, and provide a basis for continuously evaluating and improving the project's environmental performance.
          </p>
        </div>
      </section>
    </ImpactPageShell>
  );
}
