/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 关键：生成纯静态 HTML
  images: { unoptimized: true }, // 静态导出不支持 Next Image 优化
};

module.exports = nextConfig;
