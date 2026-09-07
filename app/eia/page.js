import ImpactPageShell from '@/components/ImpactPageShell';
import ImpactHero from '@/components/ImpactHero';
import ImpactQuote from '@/components/ImpactQuote';
import ImpactImage from '@/components/ImpactImage';

export const metadata = { title: 'EIA Overview | Sazan Coast', description: 'The Environmental Impact Assessment framework guiding responsible development at Sazan Coast.' };

export default function EiaOverviewPage() {
  return (
    <ImpactPageShell>
      <ImpactHero kicker="Environmental Impact" title={<>EIA <em>Overview</em></>} src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=90" alt="Sazan Coast natural landscape" />
      <section className="environment-framework environment-framework-brown">
        <span className="environment-framework-eyebrow">Our Framework</span>
        <h2>Framework<br />for <em>Responsible</em> Development</h2>
        <div className="environment-pillars">
          <div><strong>Natural<br />Environment</strong><span>Protecting native landscapes, biodiversity, and the marine ecosystems that surround Sazan.</span></div>
          <div><strong>People<br />&amp; Place</strong><span>Honouring local communities, cultural heritage, and the character of Albania’s coastline.</span></div>
          <div><strong>Responsible<br />Development</strong><span>Designing with restraint through thoughtful infrastructure, careful resource use, and long-term stewardship.</span></div>
        </div>
      </section>
      <ImpactQuote eyebrow="Environmental Impact" title="The Environmental Impact Assessment (EIA) is being undertaken to identify, evaluate, and manage the potential environmental and social effects associated with the proposed development.">
        <p>The assessment provides a structured basis for understanding existing conditions within and around the project area, identifying potentially sensitive receptors, and evaluating how project activities may interact with the surrounding natural, physical, and human environment.</p>
        <p>It also supports informed decision-making by ensuring that environmental considerations are integrated into project planning, design, construction, and operation.</p>
      </ImpactQuote>
      <section className="environment-split-stories">
        <div className="environment-story-copy"><h2>Naturally<br />Sazan</h2><p>The EIA considers a broad range of topics, including biodiversity and ecology, marine and coastal environments, air quality, noise, soil, surface water and groundwater, landscape and visual effects, climate change and natural hazards, waste and resource use, traffic and infrastructure interactions, cultural heritage, and socioeconomic conditions.</p></div>
        <ImpactImage variant="coast" alt="Sazan coastline" />
        <ImpactImage variant="landscape" alt="Undisturbed coastal landscape" />
        <div className="environment-story-copy"><h2>Effortless<br />Luxury</h2><p>Where potential adverse impacts are identified, the assessment defines appropriate measures to avoid, minimize, restore, or otherwise mitigate those impacts and evaluates the significance of any residual effects.</p><p>The EIA is an important tool for supporting regulatory approval, transparent stakeholder engagement, and the environmentally and socially responsible development of the project.</p></div>
      </section>
      <section className="environment-closing-statement"><h2>Every decision at <em>Sazan Coast</em><br />begins with nature</h2></section>
    </ImpactPageShell>
  );
}
