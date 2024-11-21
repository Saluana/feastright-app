<script setup lang="ts">
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

// Base64 заглушки для изображений
const placeholderLight = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg=='
const placeholderDark = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAyMDYxNyIvPjwvc3ZnPg=='
</script>

<template>
  <MainNavigation />

  <!-- Hero 1: Centered with background -->
  <Hero layout="centered" class="h-[calc(100vh-64px)] bg-gradient-to-b from-muted/50 to-background dark:from-muted/10">
    <HeroContent class="container mx-auto">
      <Badge>New Features</Badge>
      <HeroTitle as="h2">A better way to build your SaaS</HeroTitle>
      <HeroDescription>
        Create a landing page that converts visitors into customers with our easy-to-use builder.
      </HeroDescription>
      <HeroActions>
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">Learn More</Button>
      </HeroActions>
    </HeroContent>
  </Hero>

  <!-- Hero 2: Split with image -->
  <Hero container="box" layout="split" height="medium" spacing="md" key="hero-2">
      <HeroContent align="left" width="lg" padding="sm">
        <HeroTitle as="h2">Transform your workflow</HeroTitle>
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

  <!-- Hero 3: Minimal centered -->
  <Hero container="box" layout="centered" height="medium" spacing="sm">
    <HeroContent>
      <HeroTitle as="h2" class="text-5xl lg:text-6xl">
        Simple. Fast. Secure.
      </HeroTitle>
      <HeroDescription class="max-w-xl">
        Everything you need to launch your next project.
      </HeroDescription>
      <HeroActions>
        <Button size="lg">Start Free Trial</Button>
      </HeroActions>
    </HeroContent>
  </Hero>

  <!-- Hero 4: Split with image -->
  <Hero container="box" layout="split" height="medium" spacing="md" key="hero-4">
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
      <HeroContent align="left" width="lg" padding="lg">
        <HeroTitle as="h2">Transform your workflow</HeroTitle>
        <HeroDescription>
          Streamline your development process with our integrated tools and components.
        </HeroDescription>
        <HeroActions class="justify-start">
          <Button size="lg">Try Now</Button>
        </HeroActions>
      </HeroContent>
  </Hero>

  <!-- Hero 5: Full screen with overlay -->
  <Hero container="full" layout="centered" height="screen" class="relative">
    <div class="absolute inset-0">
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
      <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" />
    </div>
    <HeroContent class="relative z-10">
      <HeroTitle as="h2">Build the future</HeroTitle>
      <HeroDescription>
        Join thousands of developers building the next generation of web applications.
      </HeroDescription>
      <HeroActions>
        <Button size="lg" variant="default">Get Started</Button>
        <Button size="lg" variant="outline">View Demo</Button>
      </HeroActions>
    </HeroContent>
  </Hero>
</template> 