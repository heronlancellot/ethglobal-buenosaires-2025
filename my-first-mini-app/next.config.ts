import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'static.usernames.app-backend.toolsforhumanity.com',
      'images.unsplash.com',
      'cdn-ilddihb.nitrocdn.com',
      "img.freepik.com",
      "shop.gustoargentino.com"
    ],
  },
  allowedDevOrigins: ['*.zrok.io', 'localhost', '127.0.0.1'],
  reactStrictMode: false,
};

export default nextConfig;
