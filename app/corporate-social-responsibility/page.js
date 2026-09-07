import ImpactPageShell from '@/components/ImpactPageShell';
import ImpactQuote from '@/components/ImpactQuote';
import ImpactImage from '@/components/ImpactImage';
import ImpactHero from '@/components/ImpactHero';

export const metadata = {
  title: 'Corporate Social Responsibility | Sazan Coast',
  description: 'Investing in Albanian talent, education and local communities to create opportunity for the next generation.',
};

export default function CorporateSocialResponsibilityPage() {
  return (
    <ImpactPageShell>
      <ImpactHero src="/corporate-social-responsibility/1.png" alt="Albanian hillside town" title={<>Corporate Social<br /><em>Responsibility</em></>} kicker="Investing in Albania’s future" />
      <ImpactQuote eyebrow="Social Responsibility" title="Sazan Coast is designed to create lasting value beyond the boundaries of the development itself.">
        <p>Its social commitment is focused on expanding opportunity for Albanian people and communities through employment, education, skills development, local enterprise, and long-term partnerships.</p>
        <p>By investing in people as well as place, the project aims to strengthen local capacity, support economic participation, and ensure that more of the value created by Sazan Coast is shared across Albania.</p>
      </ImpactQuote>
      <div className="responsibility-talent">
        <ImpactImage src="/corporate-social-responsibility/2.jpg" alt="Albanian cultural celebration" />
        <ImpactQuote className="responsibility-large-title" title={<>Building<br /><em>Albanian</em> Talent</>}>
          <p>Sazan Coast is committed to creating long-term career opportunities for Albanian professionals and workers across tourism, hospitality, construction, engineering, and service industries.</p>
          <p>Local hiring will be prioritized throughout every phase of the project, with particular focus on Southern Albania. By combining employment with training, skills development, and career progression, the aim is to build local expertise that continues to create value long after construction is complete.</p>
        </ImpactQuote>
      </div>
      <ImpactQuote eyebrow="Commitment" className="responsibility-commitment" title="The project aims for 95% Albanian employment across permanent hotel operations, creating thousands of long-term careers while strengthening local expertise and keeping opportunity within Albania." />
      <div className="responsibility-separator" aria-label="Exclusively yours in 2026">
        <span className="responsibility-separator-line" />
        <div className="responsibility-separator-center">
          <span>Exclusively Yours in 2026</span>
          <span className="responsibility-separator-stars" aria-hidden="true">★ ★ ★ ★ ★</span>
        </div>
        <span className="responsibility-separator-line" />
      </div>
      <ImpactQuote className="responsibility-large-title" title={<>Education &amp; Skills<br /><em>Development</em></>}>
        <p>Sazan Coast will partner with local schools, vocational institutions, and universities to create clear pathways into employment through training, skills development, mentorship, and work-based opportunities. These partnerships will help connect education with the needs of Albania’s growing economy.</p>
        <p>By combining classroom learning with practical experience, students and young professionals can build skills for careers in tourism, hospitality, engineering, construction, and related industries. The goal is to develop a stronger pipeline of Albanian talent equipped to contribute to the country’s future growth.</p>
      </ImpactQuote>
      <ImpactImage src="/corporate-social-responsibility/3.png" alt="Local Albanian market" className="responsibility-panorama" />
      <ImpactQuote eyebrow="Value" className="responsibility-large-title" title={<>Supporting<br />Local Communities</>}>
        <p>The project will prioritize engagement with the communities surrounding Sazan Coast, creating opportunities for local businesses, entrepreneurs, fishermen, agricultural producers, and service providers to participate in the development and its long-term operations.</p>
        <p>By supporting local entrepreneurship and regional businesses, Sazan Coast aims to ensure that economic opportunity is distributed throughout the surrounding region rather than concentrated within the development itself.</p>
      </ImpactQuote>
      <div className="responsibility-generation">
        <img className="responsibility-wordmark" src="/svg/sazan.svg" alt="" aria-hidden="true" />
        <ImpactImage src="/corporate-social-responsibility/4.jpg" alt="Albanian family in traditional dress" />
      </div>
      <ImpactQuote className="impact-intro-quote" title={<>Building Opportunity for<br />the <em>Next</em> Generation</>}>
        <p>Through education, meaningful careers, and lasting community partnerships, Sazan Coast aims to help the next generation build its future in Albania, with opportunity rooted in the people and places that make it unique.</p>
      </ImpactQuote>
    </ImpactPageShell>
  );
}
