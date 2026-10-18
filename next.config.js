/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  devIndicators: false,
  trailingSlash: true,
  compiler: {
    styledComponents: true,
  },
  images: { unoptimized: true },
};
