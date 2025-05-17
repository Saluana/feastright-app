<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MainNavigation } from '@/components/sections/navbar'
import { useRoute } from 'vue-router'
import {
  Hero,
  HeroContent,
  HeroActions,
  HeroTitle,
  HeroDescription
} from '@/components/sections/hero'
import { useToast } from '@/components/ui/toast';
const { toast } = useToast();
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {ChefHat, Hamburger, Shrimp, Salad, Link2, ClipboardPaste, Clipboard} from 'lucide-vue-next'
import { getRecipeFromUrl } from '@/composables/useRecipeImporter'
import { isOnline } from '@/composables/useState'
import RecipeCard from '@/components/sections/cards/RecipeCard.vue'
import { addRecipe, addHistory, getRecipeByURL, RecipeData } from '@/composables/useDexie'
import AddRecipe from '@/components/sections/dialogues/AddRecipe.vue'
import { ensureEmbeddingsExistForRecipes } from '@/composables/useEmbeddings'

const route = useRoute()
const recipeUrl = ref('')
const recipe = ref<RecipeData | null>(null)
const isRecipeModalOpen = ref(false)
const isAddRecipeModalOpen = ref(false)

const importRecipe = async () => {
  try {
  const recipeData = await getRecipeFromUrl(recipeUrl.value)

  console.log(recipeData)
  // Open the modal when a recipe is imported
  if (recipeData) {
    isRecipeModalOpen.value = true
    const recipeId = await addRecipe(recipeData)
    recipe.value = { ...recipeData, id: recipeId }
    
    if (recipeId) {
      await addHistory({ ...recipe.value, id: recipeId })
      ensureEmbeddingsExistForRecipes([recipeId])
    }

  } else {
    toast({
      title: 'Error',
      description: 'Failed to import recipe',
      variant: 'destructive',
      
    })
  }
} catch (error) {
  toast({
    title: 'Error',
    description: 'Failed to import recipe',
    variant: 'destructive',
  })
}
}

const handlePaste = async () => {
  try {
    const clipboardText = await navigator.clipboard.readText()
    if (clipboardText && clipboardText.trim() !== '') {
      recipeUrl.value = clipboardText.trim()
    }
  } catch (error) {
    console.error('Failed to read clipboard contents:', error)
  }
}

const openRecipeFromUrl = async () => {
  if (route.params.url) {
    const url = decodeURIComponent(route.params.url as string)
    console.log('Opening recipe from URL:', url)
    
    // First check if we have it locally
    const localRecipe = await getRecipeByURL(url)
    if (localRecipe.length > 0) {
      recipe.value = localRecipe[0]
      isRecipeModalOpen.value = true
    } else {
      // Otherwise fetch it
      recipe.value = await getRecipeFromUrl(url)
      if (recipe.value) {
        const recipeId = await addRecipe(recipe.value)
        if (recipeId) {
          recipe.value.id = recipeId
          addHistory({ ...recipe.value, id: recipeId })
        }
      }
    }
  }

  if (recipe.value) {
    isRecipeModalOpen.value = true
    return true
  } else {
    return false
  }
}

import LZString from 'lz-string'

const openRecipeFromShareableString = async () => {
  try {
    if (route.params.lzString) {
      // First decode the URL parameter
      const lzString = decodeURIComponent(route.params.lzString as string)
      console.log('Processing lzString param:', lzString.substring(0, 50) + '...')
      
      // Then decompress it
      const recipeString = LZString.decompressFromBase64(lzString)
      if (!recipeString) {
        console.error('Failed to decompress recipe string')
        return
      }
      
      // Parse the JSON
      const parsedRecipe = JSON.parse(recipeString)

      if (parsedRecipe) {
        console.log('Successfully parsed recipe:', parsedRecipe.title || 'Unnamed recipe')
        const recipeId = await addRecipe(parsedRecipe)
        
        // Assign to the component's recipe ref
        recipe.value = { ...parsedRecipe, id: recipeId }
        
        if (recipeId) {
          addHistory({ ...parsedRecipe, id: recipeId })
        }
        
      }

      if (recipe.value) {
        isRecipeModalOpen.value = true
        return true
      } else {
        return false
      }
    }
  } catch (error) {
    console.error('Error processing shared recipe:', error)
    return false
  }
}

// Use async IIFE (Immediately Invoked Function Expression) in onMounted
onMounted(async () => {
  // Check URL param first
  if (route.params.url) {
    await openRecipeFromUrl()
  } 
  // If no URL param, or if it didn't result in an opened recipe, try lzString param
  else if (route.params.lzString) {
    await openRecipeFromShareableString()
  }
})
</script>

<template>
  <main>
    <MainNavigation />
    <router-view />
    <Hero sectionKey="build_your_next_landing_page_with_shadcn_vue" layout="centered" height="nav">
      <HeroContent class="container mx-auto px-4" padding="sm">
        <div class="flex flex-col w-full justify-center items-center">
          <div class="flex items-center justify-center gap-3 mb-2">
            <img src="/Chef/Chef.webp" alt="Recipe Scraper Logo" class="w-32 h-32 " />
          </div>
          <HeroTitle size="2xl" class="flex items-center justify-center gap-2 mb-1 font-semibold drop-shadow-md">Feast<span class="text-primary font-bold">Right</span></HeroTitle>
        </div>
        <HeroDescription class="mb-3 text-lg max-w-2xl mx-auto">Import recipes from the web and save them to your database.</HeroDescription>
        <div class="relative max-w-[42rem] mx-auto w-full mb-3">
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Link2 class="w-5 h-5" />
          </div>
          <Input 
            v-model="recipeUrl" 
            class="max-w-full h-[46px] text-lg pl-10 pr-10 dark:border-gray-600 dark:text-gray-200" 
            placeholder="Enter recipe URL" 
          />
          <div 
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-primary transition-colors"
            @click="handlePaste"
            title="Paste from clipboard"
          >
            <Clipboard class="w-5 h-5" />
          </div>
        </div>
        <HeroActions class="gap-3 mt-1">
          <a @click.prevent="importRecipe">
            <Button :disabled="!isOnline" size="lg" class="text-white font-medium">Import recipe</Button>
          </a>
          <a href="#">
            <Button @click="isAddRecipeModalOpen = true" size="lg" variant="outline" class="font-medium dark:border-gray-600 dark:text-gray-200">Manual Entry</Button>
          </a>
        </HeroActions>
      </HeroContent>
    </Hero>
    <RecipeCard 
      v-if="recipe" 
      :recipe="recipe" 
      :open="isRecipeModalOpen" 
      @update:open="isRecipeModalOpen = $event; recipe = null" 
    />
    <AddRecipe 
      v-if="isAddRecipeModalOpen" 
      :open="isAddRecipeModalOpen" 
      @update:open="isAddRecipeModalOpen = $event" 
    />
  </main>
</template>