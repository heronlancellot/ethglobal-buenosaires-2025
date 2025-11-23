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
  allowedDevOrigins: ['*'], // Add your dev origin here
  reactStrictMode: false,
};

export default nextConfig;
