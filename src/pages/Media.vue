<script setup lang="ts">
import { provide } from 'vue'
import { MainNavigation } from '@/components/sections/navbar'
import {
  Hero,
  HeroContent,
  HeroTitle,
  HeroDescription,
  HeroActions,
  HeroMedia
} from '@/components/sections/hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

provide('heroTitle', {
  defaultTag: 'h2',
  defaultSize: '4xl'
})

const placeholders = {
  abstract: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMEIyRkY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDY2Q0M7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNMCAwaDgwMHY2MDBIMHoiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=',
  pattern: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cGF0aCBkPSJNMCAwaDIwdjIwSDB6IiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgwLDAsMCwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg=='
}

// Base64 заглушки для изображений
const placeholderLight = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg=='
const placeholderDark = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAyMDYxNyIvPjwvc3ZnPg=='
</script>

<template>
  <MainNavigation />
  
  <!-- Hero 1: Medium Hero with abstract background -->
  <Hero 
    layout="centered" 
    height="nav"
    background="gradient"
  >
    <div 
      class="absolute inset-0 bg-cover bg-center opacity-20"
      :style="{ backgroundImage: `url(${placeholders.abstract})` }"
    />
    <HeroContent 
      class="relative z-10"
      width="lg"
    >
      <Badge>Limited Time Offer</Badge>
      <HeroTitle>50% Off for Early Birds</HeroTitle>
      <HeroDescription>
        Join now and get exclusive access to premium features at half the price.
      </HeroDescription>
      <HeroActions>
        <Button class="text-lg py-6 px-8 rounded-full my-8">Claim Offer</Button>
      </HeroActions>
    </HeroContent>
  </Hero>

  <!-- Hero 2: Split with image -->
  <Hero container="box" layout="split" height="large" key="hero-2" class="max-w-7xl mx-auto">
      <HeroContent align="left" class="container mx-auto py-12">
        <HeroTitle>Transform your workflow</HeroTitle>
        <HeroDescription>
          Streamline your development process with our integrated tools and components.
        </HeroDescription>
        <HeroActions class="justify-start">
          <Button size="lg">Try Now</Button>
        </HeroActions>
      </HeroContent>
      
      <HeroMedia aspectRatio="video">
        <img
          :src="placeholderLight"
          class="object-cover w-full h-full dark:hidden"
          alt="Placeholder"
        />
        <img
          :src="placeholderDark"
          class="object-cover w-full h-full hidden dark:block"
          alt="Placeholder"
        />
      </HeroMedia>
  </Hero>

  <!-- Hero 3: Split with left image -->
  <Hero container="box" layout="split" height="large" key="hero-3" class="max-w-7xl mx-auto">
      <HeroMedia aspectRatio="video">
        <img
          :src="placeholderLight"
          class="object-cover w-full h-full dark:hidden"
          alt="Placeholder"
        />
        <img
          :src="placeholderDark"
          class="object-cover w-full h-full hidden dark:block"
          alt="Placeholder"
        />
      </HeroMedia>
      <HeroContent align="left" class="py-12" width="lg" padding="lg">
        <HeroTitle>Transform your workflow</HeroTitle>
        <HeroDescription>
          Streamline your development process with our integrated tools and components.
        </HeroDescription>
        <HeroActions class="justify-start">
          <Button size="lg">Try Now</Button>
        </HeroActions>
      </HeroContent>
  </Hero>

<!-- Hero 4: with pattern background -->
<Hero container="box" layout="split" height="large" key="hero-4" class="max-w-7xl mx-auto pb-12">
    <div 
      class="absolute inset-0" 
    :style="{ backgroundImage: `url(${placeholders.pattern})` }"
  />
  <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <HeroContent align="left" class="container mx-auto relative py-12">
        <HeroTitle class="text-5xl lg:text-6xl">Designed for Modern Teams</HeroTitle>
        <HeroDescription>
          Built with the latest technology stack to ensure maximum performance and scalability.
        </HeroDescription>
        <HeroActions class="justify-start">
          <Button>Learn More</Button>
        </HeroActions>
      </HeroContent>
      <HeroMedia aspectRatio="video" class="relative">
        <div class="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-lg" />
        <img :src="placeholders.abstract" class="object-cover rounded-lg" alt="Abstract" />
      </HeroMedia>
    </Hero>
</template> 