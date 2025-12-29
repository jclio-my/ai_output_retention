/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 启用手动切换
  content: [
    "./src/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 强制使用微软雅黑
        sans: ['"Microsoft YaHei"', 'sans-serif'],
      },
      colors: {
        // 定义极简深黑
        ink: '#1a1a1a',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
