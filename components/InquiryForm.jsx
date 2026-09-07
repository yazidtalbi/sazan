'use client';

import { useState } from 'react';
import ParallaxImage from '@/components/ParallaxImage';

export default function InquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <section id="inquiries" className="inquiries-section">
      <div className="container">
        <div className="inquiries-card">
          <div className="inquiries-grid">
            
            {/* LEFT MEDIA COLUMN WITH PARALLAX INQUIRY IMAGE */}
            <div className="inquiries-media">
              <ParallaxImage
                src="/inquiry.png"
                alt="Sazan Island Sanctuary"
                speed={0.35}
              />
            </div>

            {/* RIGHT FORM WRAPPER */}
            <div className="inquiries-form-wrapper">
              {/* TOP DESCRIPTIVE TEXT (Small max-width, top of section) */}
              <p className="inquiries-top-desc">
                We are currently accepting private invitation requests for our inaugural season. 
                Register your interest to receive our private dossier.
              </p>

              {/* SECTION TITLE */}
              <h2 className="inquiries-title">Inquiries</h2>

              {submitted ? (
                <div className="form-feedback success">
                  <h3>Thank you for your inquiry.</h3>
                  <p style={{ marginTop: '0.5rem' }}>Our private concierge team will reach out with your dossier invitation shortly.</p>
                </div>
              ) : (
                <form className="luxury-underline-form" onSubmit={handleSubmit}>
                  {/* ROW 1: NAME */}
                  <div className="form-underline-group">
                    <input type="text" id="fullname" name="fullname" placeholder=" " required />
                    <label htmlFor="fullname">Name</label>
                  </div>

                  {/* ROW 2: EMAIL & PHONE */}
                  <div className="form-underline-row">
                    <div className="form-underline-group">
                      <input type="email" id="email" name="email" placeholder=" " required />
                      <label htmlFor="email">Email</label>
                    </div>
                    <div className="form-underline-group">
                      <input type="tel" id="phone" name="phone" placeholder=" " />
                      <label htmlFor="phone">Phone</label>
                    </div>
                  </div>

                  {/* ROW 3: MESSAGE */}
                  <div className="form-underline-group">
                    <textarea id="message" name="message" rows="2" placeholder=" "></textarea>
                    <label htmlFor="message">Message</label>
                  </div>

                  {/* SUBMIT BUTTON (Normal width, not full width) */}
                  <div className="form-submit-row">
                    <button type="submit" className="btn-send-inquiry" disabled={loading}>
                      {loading ? 'SENDING...' : 'SEND INQUIRY'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
