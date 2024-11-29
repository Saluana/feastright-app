<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Palette } from 'lucide-vue-next'
import { initializeTheme, currentTheme, applyThemeClass } from './themeManager'

const colors = [
  /*'zinc',
  'slate', 
  'stone',
  'gray',
  'neutral',*/
  'red',
  'rose',
  'orange',
  'green',
  'blue',
  'violet'
]

const radii = ['0', '0.3rem', '0.5rem', '0.75rem', '1rem']

const selectedColor = ref(currentTheme.value || 'zinc')
const selectedRadius = ref(JSON.parse(localStorage.getItem('currentState') || '{}')?.sceleton?.radius || '0.5rem')

const updateTheme = async () => {
  const currentState = JSON.parse(localStorage.getItem('currentState') || '{}')
  
  if (!currentState.sceleton) currentState.sceleton = {}
  
  currentTheme.value = selectedColor.value
  currentState.sceleton.theme = selectedColor.value
  currentState.sceleton.radius = selectedRadius.value
  
  document.documentElement.style.setProperty('--radius', selectedRadius.value)
  
  localStorage.setItem('currentState', JSON.stringify(currentState))
  applyThemeClass(selectedColor.value)
}

onMounted(() => {
  initializeTheme()
  if (currentTheme.value && currentTheme.value !== selectedColor.value) {
    selectedColor.value = currentTheme.value
    updateTheme()
  }
})
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="ghost" class="rounded-full p-3">
        <Palette />
      </Button>
    </DialogTrigger>
    
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Настройка темы</DialogTitle>
        <DialogDescription>
          Настройте внешний вид приложения, выбрав цветовую схему и радиус скругления углов.
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <Label>Цветовая схема</Label>
          <div class="grid grid-cols-3 gap-2">
            <Button 
              v-for="color in colors"
              :key="color"
              variant="outline"
              :class="{ 'border-2 border-primary': selectedColor === color }"
              @click="selectedColor = color; updateTheme()"
            >
              <span 
                class="h-5 w-5 rounded-full mr-2"
                :class="`bg-${color}-500`"
              />
              <span class="capitalize">{{ color }}</span>
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label>Скругление углов</Label>
          <div class="grid grid-cols-5 gap-2">
            <Button
              v-for="radius in radii" 
              :key="radius"
              variant="outline"
              :class="{ 'border-2 border-primary': selectedRadius === radius }"
              @click="selectedRadius = radius; updateTheme()"
            >
              {{ radius }}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>