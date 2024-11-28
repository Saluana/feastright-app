<script setup lang="ts">
import { MainNavigation } from '@/components/sections/navbar'
import {
  Hero,
  HeroContent,
  HeroTitle,
  HeroDescription,
  HeroActions
} from '@/components/sections/hero'
import { Button } from '@/components/ui/button'
</script>

<template>
  <main>
    <MainNavigation />
    <router-view />
    <Hero layout="centered" height="nav">
      <HeroContent class="container mx-auto" padding="md">
        <HeroTitle as="h1">
          Build your next <br>
          <span class="text-primary">Landing Page</span><br>
          with Shadcn Vue
        </HeroTitle>
        <HeroDescription>
          Beautiful and accessible components that you can copy and paste into your apps.
        </HeroDescription>
        <HeroActions>
          <router-link to="https://vue-uikit-shadcn.vercel.app/buildy">
            <Button size="lg" class="text-white">Get Started</Button>
          </router-link>
          <a href="https://vue-uikit-shadcn.vercel.app/?lets=go">
            <Button size="lg" variant="outline">Get UI Blocks</Button>
          </a>
        </HeroActions>
      </HeroContent>
    </Hero>
  </main>
</template>