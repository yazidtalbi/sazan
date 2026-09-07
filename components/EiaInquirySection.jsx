'use client';

import { useState } from 'react';
import ParallaxImage from './ParallaxImage';

export default function EiaInquirySection({ parallax = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your feedback. Your inquiry has been received.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section className="eia-inquiry-section" id="inquiries">
      <div className="eia-inquiry-bg-map">
        <img src="/svg/map1.svg" alt="Coastal Map Sketch" className="eia-map-sketch-img" />
      </div>

      <div className="container">
        <div className="eia-inquiry-card">
          <div className="eia-inquiry-grid">
            {/* LEFT IMAGE */}
            <div className="eia-inquiry-media">
              {parallax ? <ParallaxImage src="/inquiry.png" alt="Sazan Coast anchorage photography placeholder" speed={0.25} /> : <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85"
                alt="Sazan Coast Yacht Anchorage"
                className="eia-inquiry-img"
              />}
            </div>

            {/* RIGHT FORM */}
            <div className="eia-inquiry-content">
              <p className="eia-inquiry-welcome">
                We welcome questions, comments, and feedback regarding the EIA, management process and proposed development.
              </p>

              <h2 className="eia-inquiry-title">Inquiries</h2>

              <form onSubmit={handleSubmit} className="eia-inquiry-form">
                <div className="eia-form-group full-width">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="eia-form-input"
                  />
                </div>

                <div className="eia-form-row">
                  <div className="eia-form-group">
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="eia-form-input"
                    />
                  </div>
                  <div className="eia-form-group">
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="eia-form-input"
                    />
                  </div>
                </div>

                <div className="eia-form-group full-width">
                  <input
                    type="text"
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="eia-form-input"
                  />
                </div>

                <div className="eia-form-submit">
                  <button type="submit" className="eia-btn-send">
                    Send Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* BOTTOM BRANDING DIVIDER LINE */}
        <div className="eia-bottom-brand">
          <div className="eia-brand-line"></div>
          <div className="eia-brand-logo-text">
            <span className="brand-main">SAZAN</span>
            <span className="brand-sub">COAST</span>
          </div>
        </div>
      </div>
    </section>
  );
}
