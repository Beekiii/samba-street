import { defineConfig } from 'astro/config';

// The finance dashboard (/dashboard) only exists while running `npm run dev`.
// It is left out of `npm run build`, so financial data never ends up online.
// When donors get access, this is where it gets switched on (behind a login).
const privateDashboard = {
  name: 'private-dashboard',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') {
        injectRoute({ pattern: '/dashboard', entrypoint: './src/dashboard/Dashboard.astro' });
      }
    },
  },
};

// Photos inside journal posts: have Astro make a few smaller sizes, so phones
// download a light version instead of the full camera photo. (Astro passes
// these settings on to its image resizer.)
function responsivePostImages() {
  const visit = (node) => {
    if (node.type === 'element' && node.tagName === 'img') {
      const src = String(node.properties?.src ?? '');
      const isLocal = src && !src.startsWith('/') && !/^[a-z]+:/i.test(src);
      if (isLocal) {
        node.properties.widths = [480, 720, 960, 1440];
        node.properties.sizes = '(min-width: 800px) 720px, calc(100vw - 32px)';
      }
    }
    node.children?.forEach(visit);
  };
  return (tree) => visit(tree);
}

export default defineConfig({
  site: 'https://sambastreet.charity',
  integrations: [privateDashboard],
  markdown: {
    rehypePlugins: [responsivePostImages],
  },
});
