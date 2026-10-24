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

export default defineConfig({
  site: 'https://sambastreet.charity',
  integrations: [privateDashboard],
});
