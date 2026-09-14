/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the LAN origin used when testing on a physical phone.
  allowedDevOrigins: ['192.168.1.7'],
};

export default nextConfig;
