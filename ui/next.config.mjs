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
      {
        source: '/doc/:path*',
        destination: `http://js1.blockelite.cn:14874/:path*`,
      },
    ];
  },
};

export default nextConfig;
