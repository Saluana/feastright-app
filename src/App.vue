<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import content from './App.json'
import { getStyles, getButtonStyles } from '@/utils/styles'

const isDarkTheme = ref(false)

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  document.body.classList.toggle('dark', isDarkTheme.value)
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
}

// Load theme from local storage
const savedTheme = localStorage.getItem('theme')
if (savedTheme) {
  isDarkTheme.value = savedTheme === 'dark'
  document.body.classList.toggle('dark', isDarkTheme.value)
}

const openWindow = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div :class="[getStyles('app'), getStyles('app__background')]">
    <Card :class="getStyles('card')">
      <h1 :class="getStyles('card__title')">
        {{ content.hero.title }}
      </h1>
      <p :class="getStyles('card__description')">
        {{ content.hero.description }}
      </p>
      <div :class="getStyles('card__actions')">
        <Button 
          variant="default" 
          :class="getButtonStyles('primary')"
          @click="openWindow(content.buttons.primary.url)"
        >
          {{ content.buttons.primary.text }}
        </Button>
        <Button 
          variant="default" 
          :class="getButtonStyles('secondary')"
          @click="openWindow(content.buttons.secondary.url)"
        >
          {{ content.buttons.secondary.text }}
        </Button>
      </div>
    </Card>
    <Button 
      variant="link" 
      :class="getButtonStyles('theme')"
      size="icon" 
      @click="toggleTheme"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun !w-5 !h-5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
    </Button>
  </div>
</template>

<style scoped>
/* Additional styles can be added here */
</style>