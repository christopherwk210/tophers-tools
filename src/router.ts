import { createRouter, createWebHistory } from 'vue-router'
import ToolList from '@/views/ToolList.vue';

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

    { path: '/:pathMatch(.*)*', name: 'not-found', component: ToolList },
  ]
})

export default router
