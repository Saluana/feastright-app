<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Navbar, NavbarBrand, NavbarLayer, NavbarMenu } from '@/components/sections/navbar'
import { DarkMode } from '@/components/darkMode'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Menu, Layout, Settings, LogOut } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const routes = router.getRoutes()
  .filter(route => route.name)
  .map(route => ({
    name: String(route.name),
    path: route.path
  }))
</script>

<template>
  <Navbar class="border-b-[0.5px] border-gradient shadow-glow h-[64px]" style="--navbar-height: 64px;">
    <div class="flex container mx-auto px-2 md:px-4 lg:px-8 ">
    <!-- Левая часть: бренд и навигация -->
    <NavbarLayer position="start" class="flex-1">
        <div class="flex items-center gap-6">
          <NavbarBrand>
            <Layout class="w-6 h-6" />
            <span class="font-semibold">Brand</span>
          </NavbarBrand>

          <!-- Десктопная навигация -->
          <nav class="hidden md:flex items-center gap-6">
            <router-link 
              v-for="route in routes" 
              :key="route.path"
              :to="route.path"
              class="text-sm font-medium transition-colors hover:text-primary"
              :class="route.path === route.path ? 'text-foreground' : 'text-muted-foreground'"
            >
              {{ route.name }}
            </router-link>
          </nav>
        </div>
    </NavbarLayer>

    <!-- Правая часть: кнопки -->
    <NavbarLayer position="end">
      <div class="flex items-center gap-2">
        <DarkMode />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User class="h-5 w-5" />
              <span class="sr-only">Profile menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings class="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut class="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Мобильное меню, видимое только на малых экранах -->
        <div class="md:hidden">
          <NavbarMenu>
            <template #title>Navigation</template>
            <nav class="flex flex-col space-y-4">
              <router-link
                v-for="route in routes"
                :key="route.path"
                :to="route.path"
                class="text-sm transition-colors hover:text-primary"
                :class="route.path === route.path ? 'text-foreground' : 'text-muted-foreground'"
              >
                {{ route.name }}
              </router-link>
            </nav>
          </NavbarMenu>
        </div>
      </div>
    </NavbarLayer>
    </div>
  </Navbar>
</template>

<style scoped>
.router-link-active {
  color: hsl(var(--primary));
}

.border-gradient {
  border-image: linear-gradient(
    to right,
    hsl(var(--primary) / 0.1),
    hsl(var(--primary) / 0.4),
    hsl(var(--primary) / 0.1)
  ) 1;
}

.shadow-glow {
  box-shadow: 
    0 1px 2px -1px hsl(var(--primary) / 0.1),
    0 0 0 1px hsl(var(--primary) / 0.05),
    0 1px 2px 0 hsl(var(--primary) / 0.05);
}

/* Анимация при наведении */
.shadow-glow:hover {
  box-shadow: 
    0 2px 4px -2px hsl(var(--primary) / 0.15),
    0 0 0 1px hsl(var(--primary) / 0.1),
    0 1px 3px 0 hsl(var(--primary) / 0.1);
  transition: all 0.3s ease;
}
</style> 