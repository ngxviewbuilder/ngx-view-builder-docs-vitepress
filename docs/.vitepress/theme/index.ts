import DefaultTheme from 'vitepress/theme';
import { inBrowser } from 'vitepress';
import Layout from './Layout.vue';
import ImageSlider from './components/ImageSlider.vue';
import DemoEmbed from './components/DemoEmbed.vue';
import { setupAnalytics } from './analytics';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('ImageSlider', ImageSlider);
    app.component('DemoEmbed', DemoEmbed);
    if (inBrowser) {
      setupAnalytics();
    }
  },
};
