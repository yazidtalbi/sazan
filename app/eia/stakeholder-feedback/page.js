import ImpactPageShell from '@/components/ImpactPageShell';
import ImpactHero from '@/components/ImpactHero';
import ParallaxImage from '@/components/ParallaxImage';

export const metadata = {
  title: 'Stakeholder Feedback | Sazan Coast',
  description: 'Stakeholder feedback and public dialogue for the Sazan Coast Environmental Impact Assessment.',
};

export default function StakeholderFeedbackPage() {
  return (
    <ImpactPageShell>
      <ImpactHero
        kicker="Environmental Impact"
        title={<>Stakeholder<br /><em>Feedback</em></>}
        src="/Stakeholderfeedback.png"
        alt="Stakeholder Feedback"
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
          src="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=2400&q=90"
          alt="Coastal Panorama"
          speed={0.45}
        />
      </section>

      {/* CENTERED TEXT UNDERNEATH WITH CONSTRAINED MAX-WIDTH */}
      <section style={{ padding: '3rem 1.5rem 6rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>
            Every Voice<br />
            <em>Matters</em>
          </h2>
          <p className="eia-body-text" style={{ fontSize: '18px', lineHeight: 1.55, color: 'rgba(0, 0, 0, 0.72)', textAlign: 'center' }}>
            Stakeholder feedback is an integral part of the EIA process and provides an opportunity for affected communities, public authorities, interested organizations, and other stakeholders to raise questions, provide information, and express concerns regarding the proposed development.
          </p>
        </div>
      </section>

      {/* DOCUMENTED FEEDBACK SECTION */}
      <section className="masterplan-quote-section" style={{ padding: '4rem 0 8rem' }}>
        <div className="container">
          <h2 className="masterplan-big-quote">
            Documented <em>Feedback</em>
          </h2>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem, 2.4vw, 2.2rem)', fontWeight: 400, color: 'var(--text-main)', maxWidth: '840px', margin: '0 auto 2.5rem', textAlign: 'center', lineHeight: 1.25 }}>
            Where stakeholder input identifies new information, concerns, or potential impacts, these will be evaluated and incorporated into the EIA where appropriate.
          </h3>
          <div className="quote-cols-grid">
            <p>
              Together, summary of questions, comments, and recommendations received regarding the EIA, management process, or proposed development will be published.
            </p>
            <p>
              A record of all feedback received and how they have been addressed will be documented in EIA supporting documents, and all documentation from stakeholder consultation will be preserved and catalogued for future decision-making.
            </p>
          </div>
        </div>
      </section>
    </ImpactPageShell>
  );
}
