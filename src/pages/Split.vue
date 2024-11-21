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
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

// Base64 заглушки для изображений
const placeholderLight = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg=='
const placeholderDark = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAyMDYxNyIvPjwvc3ZnPg=='
</script>

<template>
  <MainNavigation />
  <!-- Секция 1: Изображение справа -->
  <Hero layout="split" height="nav">
    <HeroContent 
      align="left" 
      padding="lg"
    >
      <Badge variant="outline">New Feature</Badge>
      <HeroTitle as="h2" size="4xl">Transform Your Workflow</HeroTitle>
      <HeroDescription>
        Streamline your development process with our integrated tools and components.
      </HeroDescription>
      <Card class="mt-8 p-6">
        <div class="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <blockquote class="italic">"This tool has completely changed how we work"</blockquote>
        </div>
      </Card>
      <HeroActions class="justify-center">
        <Button size="lg" class="w-full">Get Started</Button>
      </HeroActions>
    </HeroContent>
    <HeroMedia 
      rounded="none"
      aspectRatio="auto"
      class="h-full"
    >
      <img
        :src="placeholderLight"
        class="object-cover w-full h-full dark:hidden"
        alt="Workflow"
      />
      <img
        :src="placeholderDark"
        class="object-cover w-full h-full hidden dark:block"
        alt="Workflow"
      />
    </HeroMedia>
  </Hero>

  <!-- Секция 2: Изображение слева -->
  <Hero container="box" layout="split" height="large" spacing="lg" class="max-w-7xl mx-auto">
    <HeroMedia class="rounded-2xl shadow-xl" aspectRatio="auto">
      <img
        :src="placeholderLight"
        class="object-cover w-full h-full dark:hidden"
        alt="Analytics"
      />
      <img
        :src="placeholderDark"
        class="object-cover w-full h-full hidden dark:block"
        alt="Analytics"
      />
    </HeroMedia>
    <HeroContent align="left" padding="md">
      <div>
        <HeroTitle as="h2">Data-Driven Insights</HeroTitle>
        <ul class="space-y-4 mt-6">
          <li class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-primary"></div>
            <span>Real-time analytics</span>
          </li>
          <li class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-primary"></div>
            <span>Custom reports</span>
          </li>
          <li class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-primary"></div>
            <span>Team collaboration</span>
          </li>
        </ul>
        <HeroActions size="lg" class="mt-8 justify-start">
          <Button variant="outline">Learn More</Button>
        </HeroActions>
      </div>
    </HeroContent>
  </Hero>

  <!-- Секция 3: Изображение справа -->
  <Hero container="box" layout="split" height="large" spacing="lg" class="max-w-7xl mx-auto">
    <HeroContent align="left" padding="md">
      <div class="py-12">
        <Badge variant="default">Premium</Badge>
        <HeroTitle as="h2" class="mt-4">Enterprise Solutions</HeroTitle>
        <HeroDescription>
          Scale your business with our enterprise-grade features and dedicated support.
        </HeroDescription>
        <div class="grid grid-cols-2 gap-4 mt-8">
          <Card class="p-4">
            <h3 class="font-semibold">24/7 Support</h3>
            <p class="text-sm text-muted-foreground">Always here to help</p>
          </Card>
          <Card class="p-4">
            <h3 class="font-semibold">Custom Setup</h3>
            <p class="text-sm text-muted-foreground">Tailored to your needs</p>
          </Card>
        </div>
        <HeroActions class="justify-start">
          <Button size="lg" class="mt-8">Contact Sales</Button>
        </HeroActions>
      </div>
    </HeroContent>
    <HeroMedia class="rounded-[2rem] overflow-hidden shadow-2xl mb-12" aspectRatio="auto">
      <img
        :src="placeholderLight"
        class="object-cover w-full h-full dark:hidden"
        alt="Enterprise"
      />
      <img
        :src="placeholderDark"
        class="object-cover w-full h-full hidden dark:block"
        alt="Enterprise"
      />
    </HeroMedia>
  </Hero>
</template> 