<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/sections/sidebar/Sidebar.vue'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toast'
</script>

<template>
  <SidebarProvider>
    <Sidebar />

    <main class="w-full">
      <RouterView />
    </main>
    
    <Toaster />
  </SidebarProvider>
</template>

<style >
body {
  overflow: hidden;
  height: 100vh !important;
}
</style>
