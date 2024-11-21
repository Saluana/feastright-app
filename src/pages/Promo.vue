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
import { Badge } from '@/components/ui/badge'

// Заглушки изображений
const placeholders = {
  abstract: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMEIyRkY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDY2Q0M7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNMCAwaDgwMHY2MDBIMHoiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=',
  pattern: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cGF0aCBkPSJNMCAwaDIwdjIwSDB6IiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgwLDAsMCwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg=='
}
</script>

<template>
  <MainNavigation />

  <!-- Large Hero with gradient overlay -->
  <Hero layout="centered" class="h-[calc(100vh-64px)] bg-gradient-to-br from-primary/20 via-primary/10 to-background">
    <div class="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
    <HeroContent class="relative container mx-auto py-12">
      <Badge variant="outline" class="mb-4">New Release</Badge>
      <HeroTitle class="max-w-4xl">Transform Your Business with AI-Powered Solutions</HeroTitle>
      <HeroDescription>
        Leverage the power of artificial intelligence to streamline operations and boost productivity.
      </HeroDescription>
      <HeroActions>
        <Button size="lg" variant="default">Start Free Trial</Button>
        <Button size="lg" variant="outline">Watch Demo</Button>
      </HeroActions>
    </HeroContent>
  </Hero>

  <!-- Medium Hero with abstract background -->
  <Hero container="full" layout="centered" height="large" spacing="none" class="relative overflow-hidden">
    <div 
      class="absolute inset-0 bg-cover bg-center opacity-20"
      :style="{ backgroundImage: `url(${placeholders.abstract})` }"
    />
    <HeroContent class="relative container mx-auto z-10">
      <Badge>Limited Time Offer</Badge>
      <HeroTitle>50% Off for Early Birds</HeroTitle>
      <HeroDescription>
        Join now and get exclusive access to premium features at half the price.
      </HeroDescription>
      <HeroActions>
        <Button variant="default" class="rounded-full my-8 py-6 px-10">Claim Offer</Button>
      </HeroActions>
    </HeroContent>
  </Hero>

  <!-- Full screen Hero with image background -->
  <Hero container="full" layout="centered" height="screen" spacing="none" class="relative">
    <div class="absolute inset-0">
      <img :src="placeholders.abstract" class="object-cover w-full h-full" alt="Background" />
      <div class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
    </div>
    <HeroContent class="relative container mx-auto z-10">
      <HeroTitle>Build the Future Today</HeroTitle>
      <HeroDescription>
        Join thousands of innovative companies already using our platform to grow their business.
      </HeroDescription>
      <HeroActions>
        <Button size="lg" variant="default">Get Started</Button>
        <Button size="lg" variant="outline">Schedule Demo</Button>
      </HeroActions>
    </HeroContent>
  </Hero>

  <!-- Hero with overlay background -->
  <Hero 
    container="full" 
    layout="centered" 
    height="screen"
    background="overlay"
  >
    <HeroContent 
      class="relative z-10"
      width="xl"
      spacing="lg"
    >
      <Badge>Limited Time Offer</Badge>
      <HeroTitle>50% Off for Early Birds</HeroTitle>
      <HeroDescription>
        Join now and get exclusive access to premium features at half the price.
      </HeroDescription>
      <HeroActions>
        <Button variant="default" class="rounded-full my-8 py-6 px-10">
          Claim Offer
        </Button>
      </HeroActions>
    </HeroContent>
  </Hero>
</template> 