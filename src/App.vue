<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/sections/sidebar/Sidebar.vue'
import { SidebarProvider } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <Sidebar />

    <main class="w-full">
      <RouterView />
    </main>

  </SidebarProvider>
</template>