<script setup lang="ts">
import { MainNavigation } from '@/components/sections/navbar'
import {
  Hero,
  HeroContent,
  HeroActions
} from '@/components/sections/hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
</script>

<template>
  <main>
    <MainNavigation />
    <router-view />
    <Hero sectionKey="build_your_next_landing_page_with_shadcn_vue" layout="centered" height="nav">
      <HeroContent class="container mx-auto" padding="md">
        <Input class="max-w-[42rem] h-[48px] text-lg" placeholder="Enter recipe URL" />
        <HeroActions>
          <a href="#">
            <Button size="lg" class="text-white">Import recipe</Button>
          </a>
          <a href="#">
            <Button size="lg" variant="outline">I'm feeling lucky</Button>
          </a>
        </HeroActions>
      </HeroContent>
    </Hero>
  </main>
</template>