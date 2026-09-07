import ImpactPageShell from '@/components/ImpactPageShell';
import ImpactQuote from '@/components/ImpactQuote';
import ImpactImage from '@/components/ImpactImage';
import ImpactHero from '@/components/ImpactHero';

export const metadata = {
  title: 'Economic Impact | Sazan Coast',
  description: 'A long-term engine for Albania’s economy, supporting local enterprise, employment and lasting opportunity.',
};

export default function EconomicImpactPage() {
  return (
    <ImpactPageShell>
      <ImpactHero src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=90" alt="Albanian coastline and landscape" title={<>Long-Term Engine<br />for <em>Albania’s</em> Economy</>} kicker="Economic Impact" />
      <div className="economic-intro">
        <ImpactImage className="economic-intro-right" />
        <ImpactImage variant="landscape" className="economic-intro-left" />
        <ImpactQuote eyebrow="Economic Impact" className="impact-intro-quote" title="Sazan Coast is envisioned not only as a destination, but as a long-term engine for economic growth in Albania.">
          <p>Through significant investment, year-round tourism, local employment, infrastructure, and engagement with Albanian businesses and professionals, the project aims to create lasting economic value that extends well beyond the development itself.</p>
        </ImpactQuote>
      </div>

      <div className="impact-legacy">
        <img className="impact-olive" src="/olive-branch-transparent.png" alt="" />
        <ImpactQuote eyebrow="Legacy" className="economic-large-title" title={<>Protecting<br />What <em>Endures</em></>}>
          <p>Environmental responsibility is embedded in the Sazan Coast masterplan. From habitat protection and low-density planning to ecological restoration and transparent monitoring, the project is designed to safeguard Albania’s natural heritage while strengthening its long-term resilience.</p>
          <p>Development is carefully balanced with the character and capacity of the landscape, prioritizing sensitive ecosystems, responsible land use, and the preservation of coastal and marine environments.</p>
        </ImpactQuote>
      </div>

      <div className="economic-local">
        <div className="economic-local-collage">
          <ImpactImage variant="architecture" className="economic-market" />
          <ImpactImage variant="coast" className="economic-town" />
        </div>
        <ImpactQuote className="economic-large-title" title={<>Growing <em>Albania’s</em><br />Local Economy</>}>
          <p>The project aims to support local businesses, producers, and service providers through opportunities in hospitality, construction, agriculture, and the wider visitor economy. These connections will help the benefits of development reach communities across the region.</p>
        </ImpactQuote>
      </div>

      <ImpactQuote eyebrow="Impact" className="economic-large-title" title={<>Driving<br />National <em>Growth</em></>}>
        <p>Sazan Coast is projected to contribute approximately 2% to Albania’s GDP while supporting new investment, year-round tourism, long-term tax revenues, and wider economic activity. The development is also intended to strengthen Albania’s position on the international tourism map and attract greater interest from global visitors, hospitality operators, and investors.</p>
        <p>By helping establish Southern Albania as a globally recognized destination, Sazan Coast can create new opportunities for Albanian businesses, service providers, and entrepreneurs to participate in a growing tourism and hospitality economy.</p>
      </ImpactQuote>
      <div className="economic-image-pair">
        <ImpactImage variant="hospitality" />
        <ImpactImage variant="coast" />
      </div>
      <ImpactQuote eyebrow="Value" className="economic-large-title" title={<>Built for <em>Generations</em></>}>
        <p>The economic impact of Sazan Coast is designed to extend far beyond the construction phase. By bringing together investment, employment, education, local enterprise, tourism, and infrastructure, the project aims to create a resilient economic ecosystem with lasting value.</p>
        <p>The ambition is to generate opportunity across generations, supporting communities, strengthening local industries, and contributing to Albania’s long-term economic development.</p>
      </ImpactQuote>
    </ImpactPageShell>
  );
}
