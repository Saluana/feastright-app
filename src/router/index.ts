import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: {
      title: 'Home',
      icon: 'Home'
    }
  },
  {
    // Add (.*) pattern to match URLs with slashes
    path: '/recipe/:url(.*)',
    name: 'Recipe',
    component: () => import('@/pages/Home.vue'),
    meta: {
      title: 'Recipe',
      icon: 'Home'
    }
  },
  {
    // Add (.*) pattern to match compressed data that might contain special characters
    path: '/share/:lzString(.*)',
    name: 'SharedRecipe',
    component: () => import('@/pages/Home.vue'),
    meta: {
      title: 'Shared Recipe',
      icon: 'Share'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

export default router