'use client';

export default function RediscoverAdventureSection() {
  return (
    <section className="rediscover-adventure-section">
      <div className="container text-center">
        <div className="rediscover-editorial-wrapper">
          
          <div className="rediscover-headline-container">
            {/* LINE 1 */}
            <h2 className="rediscover-line-1">
              Awaken
            </h2>

            {/* LINE 2 */}
            <h2 className="rediscover-line-1">
              your sense
            </h2>

            {/* LINE 3 WITH BOTANICAL OLIVE ENGRAVING */}
            <div className="rediscover-line-2-wrapper">
              <span className="rediscover-line-2">of</span>
              <div className="olive-engraving-wrapper">
                <img
                  src="/olive-branch-transparent.png"
                  alt="Mediterranean Olive Branch Engraving"
                  className="olive-engraving-img"
                />
              </div>
            </div>

            {/* LINE 4: ITALIC SANCTUARY */}
            <div className="rediscover-line-3-wrapper">
              <h2 className="rediscover-line-3">
                Sanctuary
              </h2>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
