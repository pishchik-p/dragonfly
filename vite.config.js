import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import ejs from 'ejs';
import { content } from './src/templates/data/content.js';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));
const TEMPLATE_DIR = path.resolve(ROOT_DIR, 'src/templates');

const page = {
  title: 'DRAGONFLY',
  description: 'DRAGONFLY landing page scaffold rendered with Vite, EJS, and Tailwind CSS.',
  lang: 'ru',
};

const renderEjsHtml = async (html, context) => {
  return ejs.render(
    html,
    { content, page },
    {
      filename: context.filename,
      root: TEMPLATE_DIR,
      views: [TEMPLATE_DIR],
    },
  );
};

const ejsHtmlPlugin = () => ({
  name: 'dragonfly-ejs-html',
  transformIndexHtml: {
    order: 'pre',
    handler: renderEjsHtml,
  },
});

export default defineConfig({
  base: '/dragonfly/',
  plugins: [tailwindcss(), ejsHtmlPlugin()],
});
