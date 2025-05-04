<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { getHistory } from '@/composables/useDexie'
import { ref, onMounted } from 'vue'
import { type History } from '@/composables/useDexie'
const history = ref<History[]>([])
const recipe = ref<Recipe | null>(null)
const isRecipeModalOpen = ref(false)
import RecipeCard from '@/components/sections/cards/RecipeCard.vue'
import { type Recipe } from '@/composables/useRecipeImporter'
import { getRecipeFromUrl } from '@/composables/useRecipeImporter'
import {getRecipeByURL} from '@/composables/useDexie'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(async () => {
  history.value = await getHistory()

  console.log('route.params', route.params)
  if (route.params.url) {
    openRecipe(route.params.url as string)
  }
})

const openRecipe = async (url: string) => {
  if (url) {
    const localRecipe = await getRecipeByURL(url)
    if (localRecipe[0]) {
      recipe.value = localRecipe[0]
      isRecipeModalOpen.value = true
    } else {
      recipe.value = await getRecipeFromUrl(url)
      isRecipeModalOpen.value = true
    }
  }
}
</script>

<template>
  <Sidebar variant="sidebar">
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>History</SidebarGroupLabel>
        <SidebarGroupContent class="list-none">
          <SidebarMenuItem v-for="item in history" :key="item.id" class="list-none">
            <SidebarMenuButton>
              <router-link :to="`/recipe/${encodeURIComponent(item.url)}`" @click="openRecipe(item.url)">{{ item.title }}</router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup />
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>

  <RecipeCard 
      v-if="recipe" 
      :recipe="recipe" 
      :open="isRecipeModalOpen" 
      @update:open="isRecipeModalOpen = $event" 
    />
</template>

<style scoped>
:deep(li) {
  list-style-type: none;
}
</style>