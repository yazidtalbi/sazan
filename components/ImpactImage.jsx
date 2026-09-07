import ParallaxImage from './ParallaxImage';

// Temporary stock imagery, shared with the existing site. Replace with final photography.
const placeholders = {
  coast: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
  landscape: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
  architecture: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
  hospitality: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85',
};

export default function ImpactImage({ src, variant = 'coast', className = '', alt = 'Coastal photography' }) {
  return <div className={`impact-image ${className}`}><ParallaxImage src={src || placeholders[variant]} alt={alt} speed={0.25} style={{ position: 'absolute', inset: 0 }} /></div>;
}
