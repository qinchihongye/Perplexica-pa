/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 's2.googleusercontent.com',
      },
    ],
  },
  rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_PY_API}:${process.env.NEXT_PUBLIC_PY_PORT}/:path*`,
      },
    ];
  },
};

export default nextConfig;
