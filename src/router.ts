import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import ToolList from '@/views/ToolList.vue';

import ProjectAnalyzer from '@/tools/gamemaker/project-analyzer/ProjectAnalyzer.vue';
import JavaDocGen from '@/tools/gamemaker/javadoc-gen/JavaDocGen.vue';
import ColorPicker from '@/tools/gamemaker/color-picker/ColorPicker.vue';

import LinearEquationSolver from '@/tools/math/linear-equation-solver/LinearEquationSolver.vue';
import Ratiomatic from '@/tools/math/ratiomatic/Ratiomatic.vue';
import SmoothApproach from '@/tools/animation/smooth-approach/SmoothApproach.vue';

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: ToolList
  },

  // Animation
  {
    path: '/smooth-approach',
    name: 'smooth-approach',
    component: SmoothApproach
  },

  // GameMaker
  {
    path: '/project-analyzer',
    name: 'project-analyzer',
    component: ProjectAnalyzer
  },
  {
    path: '/gml-javadoc-gen',
    name: 'gml-javadoc-gen',
    component: JavaDocGen
  },
  {
    path: '/color-picker',
    name: 'color-picker',
    component: ColorPicker
  },

  // Math
  {
    path: '/linear-equations',
    name: 'linear-equations',
    component: LinearEquationSolver
  },
  {
    path: '/ratiomatic',
    name: 'ratiomatic',
    component: Ratiomatic
  },

  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  routes
})

export default router
