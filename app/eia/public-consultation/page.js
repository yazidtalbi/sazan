import ImpactPageShell from '@/components/ImpactPageShell';
import ImpactHero from '@/components/ImpactHero';
import ParallaxImage from '@/components/ParallaxImage';

export const metadata = {
  title: 'Public Consultation | Sazan Coast',
  description: 'Public consultation and transparent stakeholder involvement for Sazan Coast.',
};

export default function PublicConsultationPage() {
  return (
    <ImpactPageShell>
      <ImpactHero
        kicker="Environmental Impact"
        title={<>Public<br /><em>Consultation</em></>}
        src="/inquiry.png"
        alt="Public Consultation"
      />

      {/* OVERVIEW SECTION */}
      <section className="masterplan-quote-section" style={{ padding: '6rem 0 4rem' }}>
        <div className="container">
          <span className="eia-eyebrow">OVERVIEW</span>
          <h2 className="masterplan-big-quote">
            Sazan Coast is committed to transparent public dialogue and open consultation.
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
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2400&q=90"
          alt="Coastal Resort View"
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
            Stakeholder feedback is an integral part of the EIA process and provides an opportunity for affected communities, public authorities, interested organizations, and other stakeholders to raise questions, provide information, and express concerns regarding the proposed development.
          </p>
          <p className="eia-body-text" style={{ fontSize: '18px', lineHeight: 1.55, color: 'rgba(0, 0, 0, 0.72)', textAlign: 'center' }}>
            This framework will guide the implementation of mitigation measures, monitor key environmental and social conditions, and provide a basis for continuously evaluating and improving the project's environmental performance.
          </p>
        </div>
      </section>
    </ImpactPageShell>
  );
}
