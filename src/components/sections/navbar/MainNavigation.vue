<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Navbar, NavbarBrand, NavbarLayer } from '@/components/sections/navbar'
import { DarkMode } from '@/components/darkMode'
import { Home, ChevronsRight} from 'lucide-vue-next'
import { computed, defineAsyncComponent} from 'vue'
import {SidebarTrigger, useSidebar} from '@/components/ui/sidebar'
import { useMediaQuery } from '@vueuse/core'

const {open, openMobile, setOpen, setOpenMobile} = useSidebar()

const router = useRouter()
// const route = useRoute()

const isMobileView = useMediaQuery('(max-width: 768px)')

const isOpen = computed(() => isMobileView.value ? openMobile.value : open.value)

function toggleSidebar() {
  if (isMobileView.value) {
    setOpenMobile(!openMobile.value)

    setTimeout(() => {
      // Type cast to HTMLElement which has the blur method
      (document.activeElement as HTMLElement)?.blur()
    }, 0)
  } else {
    setOpen(!open.value)
  }
}

interface RouteChild {
  name: string
  path: string
  title: string
  description?: string
  meta: {
    icon?: string
    title: string
    description?: string
  }
}

interface ParentRoute {
  name: string
  path: string
  title: string
  description?: string
  children?: RouteChild[]
}

// Расширяем структуру маршрутов с правильной типизацией
const parentRoutes = router.getRoutes()
  .filter(route => route.meta?.isGroupParent)
  .map(route => ({
    name: String(route.name),
    path: route.path,
    title: route.meta?.title as string,
    description: route.meta?.description as string,
    children: route.children?.map(child => ({
      name: String(child.name),
      path: child.path,
      title: child.meta?.title as string,
      description: child.meta?.description as string,
      meta: {
        icon: child.meta?.icon as string,
        title: child.meta?.title as string,
        description: child.meta?.description as string
      }
    }))
  })) as ParentRoute[]

// Динамический импорт иконок из роутера
const getIcon = (iconName?: string) => {
  if (!iconName) return ChevronsRight
  
  return defineAsyncComponent({
    loader: () => import('lucide-vue-next').then((mod: any) => mod[iconName]),
    errorComponent: ChevronsRight
  })
}

// Обновляем идентификаторы для доступности
const sheetId = 'mobile-navigation'
const menuDescription = 'Main navigation menu with all available sections and pages'
</script>

<template>
  <Navbar class=" border-gradient h-[64px]" style="--navbar-height: 64px;">
    <div class="flex container mx-auto px-2 md:px-4 lg:px-8">
      <NavbarLayer position="start" class="flex-1">
        <div class="flex items-center gap-6">
          <NavbarBrand class="text-primary">
            <SidebarTrigger class="h-6 w-6" />
            <span @click="toggleSidebar" class="font-semibold text-sm">{{ isOpen ? 'Close menu' : 'Open menu' }}</span>
          </NavbarBrand>
          
        </div>
      </NavbarLayer>

      <!-- Правая часть: кнопки -->
      <NavbarLayer position="end" data-navbar-end>
        <div class="flex items-center gap-1 md:gap-2">
          
          
          <DarkMode data-dark-mode />

        </div>
      </NavbarLayer>
    </div>
  </Navbar>
</template>

<style scoped>
/* Активная ссылка */
.router-link-active {
  color: hsl(var(--primary));
}

/* Градиентная граница */
.border-gradient {
  border-image: linear-gradient(
    to right,
    hsl(var(--primary) / 0.1),
    hsl(var(--primary) / 0.4),
    hsl(var(--primary) / 0.1)
  ) 1;
}

:global(.dark) .border-gradient {
  border-image: linear-gradient(
    to right,
    hsl(var(--primary) / 0.2),
    hsl(var(--primary) / 0.5),
    hsl(var(--primary) / 0.2)
  ) 1;
}

/* Тень с подсветкой */
.shadow-glow {
  box-shadow: 
    0 1px 2px -1px hsl(var(--primary) / 0.1),
    0 0 0 1px hsl(var(--primary) / 0.05),
    0 1px 2px 0 hsl(var(--primary) / 0.05);
}

:global(.dark) .shadow-glow {
  box-shadow: 
    0 1px 2px -1px hsl(var(--primary) / 0.2),
    0 0 0 1px hsl(var(--primary) / 0.1),
    0 1px 2px 0 hsl(var(--primary) / 0.1);
}

/* Эффект при наведении */
.shadow-glow:hover {
  box-shadow: 
    0 2px 4px -2px hsl(var(--primary) / 0.15),
    0 0 0 1px hsl(var(--primary) / 0.1),
    0 1px 3px 0 hsl(var(--primary) / 0.1);
  transition: all 0.3s ease;
}

:global(.dark) .shadow-glow:hover {
  box-shadow: 
    0 2px 4px -2px hsl(var(--primary) / 0.25),
    0 0 0 1px hsl(var(--primary) / 0.15),
    0 1px 3px 0 hsl(var(--primary) / 0.15);
}

/* Разделители аккордеона */
:deep([data-orientation="vertical"].border-b) {
  border-bottom-color: hsl(var(--border) / 0.9) !important;
}
</style> 