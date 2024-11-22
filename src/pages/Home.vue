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
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">Learn More</Button>
        </HeroActions>
      </HeroContent>
    </Hero>
  </main>
</template>