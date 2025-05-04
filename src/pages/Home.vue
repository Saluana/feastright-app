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
import {ChefHat, Hamburger, Shrimp, Salad} from 'lucide-vue-next'
import { getRecipeFromUrl } from '@/composables/useRecipeImporter'
import { Recipe } from '@/composables/useRecipeImporter'
import RecipeCard from '@/components/sections/cards/RecipeCard.vue'
import { addRecipe, addHistory, getRecipeByURL } from '@/composables/useDexie'

const route = useRoute()
const recipeUrl = ref('')
const recipe = ref<Recipe | null>(null)
const isRecipeModalOpen = ref(false)

const importRecipe = async () => {
  recipe.value = await getRecipeFromUrl(recipeUrl.value)
  console.log(recipe.value)
  // Open the modal when a recipe is imported
  if (recipe.value) {
    isRecipeModalOpen.value = true
    const recipeId = await addRecipe(recipe.value)
    
    if (recipeId) {
      addHistory({ ...recipe.value, id: recipeId })
    }
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
      <HeroContent class="container mx-auto" padding="md">
        <div class="flex flex-col w-full justify-center items-center">
          <Salad class=" w-8 h-8 text-gray-600 dark:text-gray-200 !mb-2" />
          <div class="flex items-center justify-center gap-2 mb-4">
            <Hamburger class=" w-8 h-8 text-gray-600 dark:text-gray-200 !mb-0" />
          <ChefHat class=" w-16 h-16 text-primary !mb-0" />
          <Shrimp class=" w-8 h-8 text-gray-600 dark:text-gray-200 !mb-0" />
          </div>
          <HeroTitle size="2xl" class="flex items-center justify-center gap-2">Recipe Importer</HeroTitle>
        </div>
        <HeroDescription>Import recipes from the web and save them to your database.</HeroDescription>
        <Input v-model="recipeUrl" class="max-w-[42rem] h-[48px] text-lg" placeholder="Enter recipe URL" />
        <HeroActions>
          <a  @click.prevent="importRecipe">
            <Button size="lg" class="text-white">Import recipe</Button>
          </a>
          <a href="#">
            <Button size="lg" variant="outline">I'm feeling lucky</Button>
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
  </main>
</template>