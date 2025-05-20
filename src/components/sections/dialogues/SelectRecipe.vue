<script setup lang="ts">
import Modal from '@/components/sections/modal/modal.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getHistory, getFavourites, addHistory, getRecipeByURL, addRecipe } from '@/composables/useDexie'
import { type Recipe } from '@/types/Recipe'
import { MagnifyingGlassIcon, HeartIcon, ClockIcon, GlobeIcon, CheckIcon } from '@radix-icons/vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { host } from '@/composables/useState'

// Helper function to extract hostname from URL
function extractHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    // Fallback for invalid URLs
    return url.replace(/https?:\/\//, '').split('/')[0]
  }
}

const props = defineProps<{
  open?: boolean
}>()

const emit = defineEmits(['update:open', 'recipe-selected', 'onClose'])

watch(() => props.open, (newVal) => {
  if (!newVal) {
    emit('onClose')
  }
})

const router = useRouter()
const activeTab = ref('favorites')
const searchQuery = ref('')
const urlInput = ref('')
const favorites = ref<any[]>([])
const history = ref<any[]>([])
const isLoading = ref(true)
const isFetchingUrl = ref(false)
const urlError = ref('')
const successMessage = ref('')

// Fetch favorites and history when component mounts
onMounted(async () => {
  try {
    favorites.value = await getFavourites()
    history.value = await getHistory()
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    isLoading.value = false
  }
})

// Filter favorites based on search query
const filteredFavorites = computed(() => {
  if (!searchQuery.value.trim()) {
    return favorites.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return favorites.value.filter(item => 
    item.title.toLowerCase().includes(query)
  )
})

// Filter history based on search query
const filteredHistory = computed(() => {
  if (!searchQuery.value.trim()) {
    return history.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return history.value.filter(item => 
    item.title.toLowerCase().includes(query)
  )
})

// Handle recipe selection
const selectRecipe = (recipeUrl: string) => {
  emit('recipe-selected', recipeUrl)
  emit('update:open', false)
}

// Handle URL import
const importFromUrl = async () => {
  if (!urlInput.value) {
    urlError.value = 'Please enter a URL'
    return
  }
  
  urlError.value = ''
  isFetchingUrl.value = true
  successMessage.value = ''
  
  try {
    // First check if recipe already exists in database
    const existingRecipe = await getRecipeByURL(urlInput.value)
    
    if (existingRecipe.length > 0) {
      // Use existing recipe
      successMessage.value = `Recipe "${existingRecipe[0].title}" found!`
      
      // Navigate to the recipe after a short delay
      setTimeout(() => {
        selectRecipe(existingRecipe[0].url)
      }, 1000)
    } else {
      // Import from external URL using the Recipe API
      // This would typically be implemented in your backend
      // For example purposes, we'll simulate it
      try {
        // Make API call to fetch recipe
        const response = await fetch(`${host.value}/scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: urlInput.value })
        })
        
        if (!response.ok) throw new Error('Failed to fetch recipe')
        
        const data = await response.json()
        if (data.data) {
          const recipe = data.data
          // Add recipe to database
          const recipeId = await addRecipe(recipe)
          successMessage.value = `Recipe "${recipe.title}" found!`
          
          // Navigate to the recipe after a short delay
          setTimeout(() => {
            selectRecipe(recipe.url)
          }, 1000)
        } else {
          throw new Error(data.error || 'Unknown error')
        }
      } catch (importError) {
        console.error('Error importing from URL:', importError)
        urlError.value = 'Could not find a recipe at this URL. Please try another.'
      }
    }
    
    isFetchingUrl.value = false
  } catch (error) {
    console.error('Error importing recipe:', error)
    urlError.value = 'Could not find a recipe at this URL. Please try another.'
    isFetchingUrl.value = false
  }
}

// Reset form on tab change
const handleTabChange = (tab: string | number) => {
  activeTab.value = String(tab)
  searchQuery.value = ''
  urlInput.value = ''
  urlError.value = ''
  successMessage.value = ''
}
</script>

<template>
  <Modal
    :open="open"
    title="Find a Recipe"
    description="Browse your favorites, history, or import from a URL."
    @update:open="$emit('update:open', $event)"
  >
    <template #trigger-content>
      <slot name="trigger">

      </slot>
    </template>
    
    <Tabs :default-value="activeTab" class="w-full flex flex-col mx-1 overflow-hidden min-h-[412px]" @update:modelValue="handleTabChange">
      <TabsList class="grid mx-1 grid-cols-3 mb-6 rounded-xl bg-slate-100/50 dark:bg-slate-900/50">
        <TabsTrigger value="favorites" >
          <div class="flex items-center gap-1">
            <HeartIcon class="h-3.5 w-3.5" />
            <span>Favorites</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="history" >
          <div class="flex items-center gap-1">
            <ClockIcon class="h-3.5 w-3.5" />
            <span>History</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="url" >
          <div class="flex items-center space-x-2">
            <GlobeIcon class="h-3.5 w-3.5" />
            <span>Import</span>
          </div>
        </TabsTrigger>
      </TabsList>
      
      <!-- Search Bar (for Favorites and History tabs) -->
      <div v-if="activeTab !== 'url'" class="relative mx-2 mb-4">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search..."
          class="pl-9 !text-[16px]"
          :disabled="isLoading"
        />
      </div>
      
      <!-- Favorites Tab -->
      <TabsContent value="favorites" class="mt-0 mx-1">
        <div class="h-[300px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 shadow-sm p-1">
          <div v-if="isLoading" class="flex items-center justify-center p-8">
            <div class="animate-spin text-muted-foreground">↻</div>
          </div>
          
          <div v-else-if="filteredFavorites.length === 0" class="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
            <div>
              <p>No favorites found</p>
              <p v-if="searchQuery" class="text-sm">Try a different search term</p>
            </div>
          </div>
          
          <div v-else class="divide-y divide-slate-200 dark:divide-slate-800">
            <button
              v-for="item in filteredFavorites"
              :key="item.id"
              @click="selectRecipe(item.url)"
              class="w-full flex items-center p-3 hover:bg-slate-100 dark:hover:bg-slate-900 text-left transition"
            >
              <div class="flex-1 min-w-0 overflow-hidden mr-2">
                <h3 class="font-medium truncate">{{ item.title }}</h3>
                <div class="flex justify-between text-sm">
                  <div class="text-muted-foreground flex items-center gap-1 overflow-hidden">
                    <GlobeIcon class="h-3 w-3 flex-shrink-0" />
                    <span class="truncate">{{ extractHostname(item.url) }}</span>
                  </div>
                  <div class="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium flex-shrink-0">
                    <HeartIcon class="h-3 w-3 flex-shrink-0" />
                    <span>Favorite</span>
                  </div>
                </div>
              </div>
              <div class="ml-2 text-slate-300 dark:text-slate-700 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all transform group-hover:translate-x-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </button>
          </div>
        </div>
      </TabsContent>
      
      <!-- History Tab -->
      <TabsContent value="history" class="mt-0 mx-1">
        <div class="h-[300px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 shadow-sm p-1">
          <div v-if="isLoading" class="flex items-center justify-center p-8">
            <div class="animate-spin text-muted-foreground">↻</div>
          </div>
          
          <div v-else-if="history.length === 0" class="p-8 text-center">
            <div class="rounded-full bg-muted/40 h-12 w-12 flex items-center justify-center mx-auto mb-3">
              <ClockIcon class="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 class="text-base font-medium mb-1">No history yet</h3>
            <p class="text-sm text-muted-foreground">View recipes to see them in your history.</p>
          </div>
          
          <div v-else-if="filteredHistory.length === 0" class="p-8 text-center">
            <p class="text-muted-foreground">No history items match your search.</p>
          </div>
          
          <div v-else class="divide-y divide-slate-200 dark:divide-slate-800">
            <button
              v-for="item in filteredHistory"
              :key="item.id"
              @click="selectRecipe(item.url)"
              class="w-full flex items-center p-3 hover:bg-slate-100 dark:hover:bg-slate-900 text-left transition"
            >
              <div class="flex-1 min-w-0 overflow-hidden mr-2">
                <h3 class="font-medium truncate">{{ item.title }}</h3>
                <div class="flex justify-between text-sm">
                  <div class="text-muted-foreground flex items-center gap-1 overflow-hidden">
                    <GlobeIcon class="h-3 w-3 flex-shrink-0" />
                    <span class="truncate">{{ extractHostname(item.url) }}</span>
                  </div>
                  <div class="flex items-center gap-1 text-blue-500 dark:text-blue-400 font-medium flex-shrink-0">
                    <ClockIcon class="h-3 w-3 flex-shrink-0" />
                    <span>{{ formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) }}</span>
                  </div>
                </div>
              </div>
              <div class="text-xs text-muted-foreground flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </button>
          </div>
        </div>
      </TabsContent>
      
      <!-- URL Import Tab -->
      <TabsContent value="url" class="mt-0 mx-1">
        <div class="h-[348px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-900/50 bg-white dark:bg-slate-900/50 shadow-sm p-6 pt-10 space-y-5 flex flex-col justify-center">
          <div class="space-y-2">
            <div class="relative">
              <GlobeIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="urlInput"
                placeholder="https://www.example.com/recipe"
                class="pl-9 !text-[16px]"
                :disabled="isFetchingUrl"
                :class="{ 'border-destructive': urlError }"
              />
            </div>
            <p v-if="urlError" class="text-sm text-destructive">{{ urlError }}</p>
          </div>
          
          <div v-if="successMessage" class="rounded-md bg-green-50 dark:bg-green-950 p-3 text-sm border border-green-200 dark:border-green-800">
            <p class="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckIcon class="h-4 w-4 flex-shrink-0" />
              <span class="break-words">{{ successMessage }}</span>
            </p>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-sm border border-blue-100 dark:border-blue-900/50 shadow-sm">
            <h4 class="font-medium mb-1 flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Tip: Import from URL
            </h4>
            <p class="text-blue-600/70 dark:text-blue-300/70">Enter the URL of a recipe page to import it into your collection.</p>
          </div>
          <p class="text-slate-600 dark:text-slate-400 text-sm mt-2">Paste a link to any recipe online and we'll try to import it. Works with most popular recipe websites.</p>
          <Button 
            type="submit" 
            @click="importFromUrl" 
            :disabled="!urlInput || isFetchingUrl" 
            class="w-full"
            :class="{ 'opacity-70': isFetchingUrl }"
          >
            <span v-if="isFetchingUrl" class="mr-2 inline-block animate-spin">↻</span>
            {{ isFetchingUrl ? 'Importing...' : 'Import Recipe' }}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  </Modal>
</template>
