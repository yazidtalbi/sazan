import ImpactPageShell from '@/components/ImpactPageShell';
import ImpactHero from '@/components/ImpactHero';
import ImpactQuote from '@/components/ImpactQuote';
import ImpactImage from '@/components/ImpactImage';

export const metadata = { title: 'Environmental Stewardship | Sazan Coast', description: 'The long-term environmental strategy for protecting and enhancing Sazan Coast.' };

export default function EnvironmentalStewardshipPage() {
  return (
    <ImpactPageShell>
      <ImpactHero kicker="Environmental Impact" title={<>Environmental<br /><em>Stewardship</em></>} src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=90" alt="Sazan Coast natural landscape" />
      <section className="environment-framework environment-framework-green">
        <span className="environment-framework-eyebrow">Our Framework</span>
        <h2>Restorative Net-Positive<br /><em>Coastal Development</em></h2>
        <div className="environment-pillars">
          <div><strong>Natural Environment</strong><span>Biodiversity, ecology, marine habitats and natural resources.</span></div>
          <div><strong>People &amp; Place</strong><span>Communities, landscape, heritage, health and quality of life.</span></div>
          <div><strong>Responsible Development</strong><span>Climate adaptation, resource use and long-term environmental performance.</span></div>
        </div>
      </section>
      <ImpactQuote eyebrow="Environmental Impact" title="Sazan is guided by a long-term environmental strategy designed to protect and enhance the natural systems that define Albania’s coastline.">
        <p>The ambition is to restore ecosystems and create enduring benefits through nature-led design, habitat protection, careful construction, and transparent environmental management.</p>
      </ImpactQuote>
      <section className="environment-feature">
        <div className="environment-story-copy"><span className="eia-eyebrow">Approach</span><h2>Environment<br />First</h2><p>From the earliest stages of planning, environmental responsibility guides decisions about land use, access, infrastructure, and the guest experience. The objective is to leave Sazan’s ecological systems stronger and more resilient over time.</p></div>
        <ImpactImage variant="coast" alt="Bird flying over the Albanian coast" />
      </section>
      <ImpactQuote className="responsibility-large-title" title={<>Environmental<br /><em>Stewardship</em></>}>
        <p>From habitat protection to low-impact planning and transparent monitoring, the project is designed to safeguard Albania’s natural heritage while strengthening its long-term resilience.</p>
        <p>Environmental responsibility is foundational to the Sazan Coast masterplan. The project is carefully planned to protect sensitive ecosystems, respect the carrying capacity of the landscape, safeguard water resources, and preserve the character of the coastline.</p>
      </ImpactQuote>
      <div className="environment-image-comparison"><ImpactImage variant="landscape" alt="Coastal baseline condition" /><ImpactImage variant="coast" alt="Protected coastline" /></div>
      <section className="environment-study">
        <span className="eia-eyebrow">How We Operate</span><h2>Development<br />&amp; Protection</h2>
        <div className="environment-study-art" aria-hidden="true"><span>Study</span><span>Enhance</span><span>Disclose</span></div>
        <p>Nature-led design with rigorous environmental study, transparent reporting, and accountability underpins long-term management.</p>
      </section>
      <section className="environment-principles">
        <div className="environment-metrics">
          <div><strong>&lt;12%</strong><span>Maximum built coverage at full build-out</span></div><div><strong>G+1</strong><span>Maximum height for villas and residences</span></div><div><strong>3:1</strong><span>Trees restored for each tree affected</span></div>
        </div>
        <div className="environment-principles-list"><h2>Built<br />on Six<br />Principles</h2><ol>
          <li><strong>Ecology-first planning</strong><span>Conservation is embedded in every major planning decision.</span></li><li><strong>Low-density footprint</strong><span>Built coverage is minimized to preserve open landscape.</span></li><li><strong>Native habitat restoration</strong><span>Natural systems are repaired, protected, and expanded.</span></li><li><strong>Wildlife-sensitive design</strong><span>Lighting, circulation, and access protect sensitive species.</span></li><li><strong>Water &amp; wastewater responsibility</strong><span>Closed-loop systems reduce demand and prevent pollution.</span></li><li><strong>Long-term stewardship</strong><span>Continuous monitoring supports adaptation over time.</span></li>
        </ol></div>
      </section>
      <section className="environment-closing-statement"><h2>Every decision at <em>Sazan Coast</em><br />begins with nature</h2></section>
    </ImpactPageShell>
  );
}
