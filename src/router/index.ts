import { createRouter, createWebHistory } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue')
  },
  {
    path: '/hero',
    name: 'Hero',
    component: () => import('@/pages/Hero.vue')
  },
  {
    path: '/promo',
    name: 'Promo',
    component: () => import('@/pages/Promo.vue')
  },
  {
    path: '/media',
    name: 'Media',
    component: () => import('@/pages/Media.vue')
  },
  {
    path: '/split',
    name: 'Split',
    component: () => import('@/pages/Split.vue')
  },
  {
    path: '/split-full',
    name: 'SplitFull',
    component: () => import('@/pages/SplitFull.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 