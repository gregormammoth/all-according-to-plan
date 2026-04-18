import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@all-according-to-plan/shared', '@all-according-to-plan/game-engine'],
};

export default nextConfig;
