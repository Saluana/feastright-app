<script setup lang="ts">
import Hero from '@/components/sections/hero/Hero.vue'
import HeroContent from '@/components/sections/hero/HeroContent.vue'
import HeroTitle from '@/components/sections/hero/HeroTitle.vue'
import HeroDescription from '@/components/sections/hero/HeroDescription.vue'
import HeroActions from '@/components/sections/hero/HeroActions.vue'
import { DarkMode } from '@/components/darkMode'
import Button from '@/components/ui/button/Button.vue'
</script>

<template>
  <main>
    <Hero align="center" size="lg">
      <DarkMode />
      <HeroContent>
        <HeroTitle>
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
    <!-- Другие секции будут добавляться здесь -->
  </main>
</template>