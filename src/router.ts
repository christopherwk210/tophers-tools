import { createRouter, createWebHistory } from 'vue-router'
import ToolList from '@/views/ToolList.vue';

// @ts-ignore
import NProgress from 'nprogress';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ToolList
    },

    // Animation
    {
      path: '/smooth-approach',
      name: 'smooth-approach',
      component: () => import('@/tools/animation/smooth-approach/SmoothApproach.vue')
    },
    {
      path: '/lottie-looper',
      name: 'lottie-looper',
      component: () => import('@/tools/animation/lottie-looper/LottieLooper.vue')
    },

    // GameMaker
    {
      path: '/project-analyzer',
      name: 'project-analyzer',
      component: () => import('@/tools/gamemaker/project-analyzer/ProjectAnalyzer.vue')
    },
    {
      path: '/gml-javadoc-gen',
      name: 'gml-javadoc-gen',
      component: () => import('@/tools/gamemaker/javadoc-gen/JavaDocGen.vue')
    },
    {
      path: '/color-picker',
      name: 'color-picker',
      component: () => import('@/tools/gamemaker/color-picker/ColorPicker.vue')
    },
    {
      path: '/eq-generator',
      name: 'eq-generator',
      component: () => import('@/tools/gamemaker/eq-generator/EQ.vue')
    },

    // Math
    {
      path: '/cross-multiplier',
      name: 'cross-multiplier',
      component: () => import('@/tools/math/cross-multiplier/CrossMultiplier.vue')
    },
    {
      path: '/linear-equations',
      name: 'linear-equations',
      component: () => import('@/tools/math/linear-equation-solver/LinearEquationSolver.vue')
    },
    {
      path: '/ratiomatic',
      name: 'ratiomatic',
      component: () => import('@/tools/math/ratiomatic/Ratiomatic.vue')
    },

    // Media
    // {
    //   path: '/bamboo',
    //   name: 'bamboo',
    //   component: () => import('@/tools/media/bamboo/Bamboo.vue')
    // },

    // Misc
    // {
    //   path: '/visual-json',
    //   name: 'visual-json',
    //   component: () => import('@/tools/misc/visual-json/VisualJSON.vue')
    // },
    {
      path: '/discord-gradient-text',
      name: 'discord-gradient-text',
      component: () => import('@/tools/misc/discord-gradient-text/DiscordGradientText.vue')
    },

    // Web
    {
      path: '/color-overlay',
      name: 'color-overlay',
      component: () => import('@/tools/web/color-overlay/ColorOverlay.vue')
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: ToolList },
  ]
});

NProgress.configure({ showSpinner: false });

router.beforeEach((to, from, next) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
