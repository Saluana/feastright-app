<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Palette, CopyCheck, PanelLeftOpen, LoaderCircle } from 'lucide-vue-next'
import { initializeTheme, currentTheme, applyThemeClass, generateTailwindStyles } from './themeManager'
import { useFont } from '@/composables/useFont'
import { useRouter } from 'vue-router'

const router = useRouter()

const formatRadius = (value: string) => value.replace('em', '')

const isOpen = ref(false)

const sheetContent = {
  header: {
    title: 'Settings & Collections',
    description: 'Manage application appearance and UI collections access.'
  },
  collections: {
    title: 'UI Collections',
    items: [
      {
        id: 'getStarted',
        icon: CopyCheck,
        label: 'Get UI Blocks',
        action: () => {
          // Implement your collection saving logic here
          isOpen.value = false
        },
      },
      {
        icon: PanelLeftOpen,
        label: 'Go to BuildY',
        action: () => router.push('/buildy'),
      },
      {
        icon: LoaderCircle,
        label: 'Reset Settings',
        action: () => router.push('/reset'),
      }
    ]
  },
  theme: {
    title: 'Theme Settings',
    sections: [
      {
        label: 'Color Scheme',
        type: 'colors',
        options: ['red', 'rose', 'orange', 'green', 'blue', 'violet']
      },
      {
        label: 'Corner Radius',
        type: 'radius',
        options: ['0', '0.3em', '0.5em', '0.75em', '1em']
      },
      {
        label: 'Font Family',
        type: 'font',
        options: [
          'Nunito', 'Inter', 'Roboto', 'Lato', 'Lexend', 'Urbanist',
          'Kanit', 'Fira Sans', 'Karla', 'Prompt', 'Saira', 'Geologica', 'Bai Jamjuree', 'Niramit', 'Livvic', 'Exo', 'K2D', 'Montserrat', 'Open Sans', 'Rubik', 'Work Sans', 'Mulish', 'Barlow', 'Heebo', 'Titillium Web', 'Libre Franklin', 'Josefin Sans', 'Jost', 'Outfit', 'Figtree', 'Overpass', 'Chivo', 'Alegreya Sans', 'Fahkwang'
        ]
      }
    ]
  }
}

const selectedFont = ref(
  JSON.parse(localStorage.getItem('currentState') || '{}')?.sceleton?.config?.theme?.fontFamily?.sans?.[0] || 'Nunito'
)
const selectedColor = ref(currentTheme.value || 'green')
const selectedRadius = ref(JSON.parse(localStorage.getItem('currentState') || '{}')?.sceleton?.radius || '0.5rem')

const { loadFont, updateFontLink } = useFont()

const updateTheme = async () => {
  const currentState = JSON.parse(localStorage.getItem('currentState') || '{}')
  
  if (!currentState.sceleton) currentState.sceleton = {}
  if (!currentState.sceleton.config) currentState.sceleton.config = {}
  
  currentState.sceleton.config = {
    ...currentState.sceleton.config,
    theme: {
      fontFamily: { sans: [selectedFont.value, 'sans-serif'] }
    },
    darkMode: 'class'
  }
  
  currentTheme.value = selectedColor.value
  currentState.sceleton.theme = selectedColor.value
  currentState.sceleton.radius = selectedRadius.value
  currentState.sceleton.tailwindStyles = generateTailwindStyles(selectedColor.value, selectedRadius.value)
  
  updateFontLink(selectedFont.value)
  await loadFont(selectedFont.value)
  
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
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button variant="ghost" class="rounded-full p-3">
        <Palette />
      </Button>
    </SheetTrigger>
    
    <SheetContent class="w-full sm:w-[400px] max-w-[calc(100vw-32px)] p-0">
      <ScrollArea class="h-full">
        <div class="p-6">
          <SheetHeader>
            <SheetTitle>{{ sheetContent.header.title }}</SheetTitle>
            <SheetDescription>
              {{ sheetContent.header.description }}
            </SheetDescription>
          </SheetHeader>
          
          <div class="space-y-6 py-6">
            <!-- Collections Section -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium">{{ sheetContent.collections.title }}</h4>
              <div class="grid gap-2">
                <Button 
                  v-for="item in sheetContent.collections.items"
                  :key="item.label"
                  :id="item.id"
                  variant="outline"
                  class="justify-start"
                  @click="item.action"
                >
                  <component :is="item.icon" class="mr-2 h-4 w-4" />
                  <span>{{ item.label }}</span>
                </Button>
              </div>
            </div>

            <Separator />

            <!-- Theme Settings Section -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium">{{ sheetContent.theme.title }}</h4>
              <div class="space-y-4">
                <template v-for="section in sheetContent.theme.sections" :key="section.label">
                  <div class="space-y-2">
                    <Label>{{ section.label }}</Label>
                    
                    <div v-if="section.type === 'colors'" class="grid grid-cols-2 gap-2">
                      <Button 
                        v-for="color in section.options"
                        :key="color"
                        variant="outline"
                        class="relative pl-8"
                        :class="{ 'border-2 border-primary': selectedColor === color }"
                        @click="selectedColor = color; updateTheme()"
                      >
                        <span 
                          class="absolute left-2 h-4 w-4 rounded-full"
                          :class="`bg-${color}-500`"
                        />
                        <span class="flex-1 text-center capitalize">{{ color }}</span>
                      </Button>
                    </div>

                    <div v-else-if="section.type === 'radius'" class="grid grid-cols-5 gap-2">
                      <Button
                        v-for="radius in section.options"
                        :key="radius"
                        variant="outline"
                        :class="{ 'border-2 border-primary': selectedRadius === radius }"
                        @click="selectedRadius = radius; updateTheme()"
                      >
                        {{ formatRadius(radius) }}
                      </Button>
                    </div>

                    <Select 
                      v-else-if="section.type === 'font'"
                      v-model="selectedFont"
                      @update:modelValue="updateTheme"
                    >
                      <SelectTrigger class="w-full">
                        <SelectValue :placeholder="selectedFont" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem 
                          v-for="font in section.options"
                          :key="font"
                          :value="font"
                        >
                          <span :style="{ fontFamily: font }">{{ font }}</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
</template>