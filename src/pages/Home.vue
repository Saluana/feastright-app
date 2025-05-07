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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {ChefHat, Hamburger, Shrimp, Salad, Link2, ClipboardPaste, Clipboard} from 'lucide-vue-next'
import { getRecipeFromUrl } from '@/composables/useRecipeImporter'
import { Recipe } from '@/composables/useRecipeImporter'
import RecipeCard from '@/components/sections/cards/RecipeCard.vue'
import { addRecipe, addHistory, getRecipeByURL, RecipeData } from '@/composables/useDexie'
import AddRecipe from '@/components/sections/dialogues/AddRecipe.vue'

const route = useRoute()
const recipeUrl = ref('')
const recipe = ref<RecipeData | null>(null)
const isRecipeModalOpen = ref(false)
const isAddRecipeModalOpen = ref(false)

const importRecipe = async () => {
  const recipeData = await getRecipeFromUrl(recipeUrl.value)

  console.log(recipeData)
  // Open the modal when a recipe is imported
  if (recipeData) {
    isRecipeModalOpen.value = true
    const recipeId = await addRecipe(recipeData)
    recipe.value = { ...recipeData, id: recipeId }
    
    if (recipeId) {
      addHistory({ ...recipe.value, id: recipeId })
    }
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
        isRecipeModalOpen.value = true
        const recipeId = await addRecipe(recipe.value)
        if (recipeId) {
          recipe.value.id = recipeId
          addHistory({ ...recipe.value, id: recipeId })
        }
      }
    }
  }
}

onMounted(() => {
  openRecipeFromUrl()
})
</script>

<template>
  <main>
    <MainNavigation />
    <router-view />
    <Hero sectionKey="build_your_next_landing_page_with_shadcn_vue" layout="centered" height="nav">
      <HeroContent class="container mx-auto px-4" padding="sm">
        <div class="flex flex-col w-full justify-center items-center">
          <Salad class="w-8 h-8 text-gray-600 dark:text-gray-200 mb-1" />
          <div class="flex items-center justify-center gap-3 mb-2">
            <Hamburger class="w-8 h-8 text-gray-600 dark:text-gray-200" />
            <ChefHat class="w-16 h-16 text-primary" />
            <Shrimp class="w-8 h-8 text-gray-600 dark:text-gray-200" />
          </div>
          <HeroTitle size="2xl" class="flex items-center justify-center gap-2 mb-1">Recipe Importer</HeroTitle>
        </div>
        <HeroDescription class="mb-3 text-lg max-w-2xl mx-auto">Import recipes from the web and save them to your database.</HeroDescription>
        <div class="relative max-w-[42rem] mx-auto w-full mb-3">
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Link2 class="w-5 h-5" />
          </div>
          <Input 
            v-model="recipeUrl" 
            class="max-w-full h-[46px] text-lg pl-10 pr-10" 
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
            <Button size="lg" class="text-white font-medium">Import recipe</Button>
          </a>
          <a href="#">
            <Button @click="isAddRecipeModalOpen = true" size="lg" variant="outline" class="font-medium">Manual Entry</Button>
          </a>
        </HeroActions>
      </HeroContent>
    </Hero>
    <RecipeCard 
      v-if="recipe" 
      :recipe="recipe" 
      :open="isRecipeModalOpen" 
      @update:open="isRecipeModalOpen = $event" 
    />
    <AddRecipe 
      v-if="isAddRecipeModalOpen" 
      :open="isAddRecipeModalOpen" 
      @update:open="isAddRecipeModalOpen = $event" 
    />
  </main>
</template>