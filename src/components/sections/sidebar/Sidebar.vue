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
  SidebarGroupAction,
  SidebarMenuAction,
} from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { MoreHorizontal, ChevronDown } from 'lucide-vue-next'
import { getLiveHistory, getLiveFavourites, Favourite, getLiveCollections, CollectionWithRecipes, batchGetRecipes, updateCollection, getCollectionById, RecipeData } from '@/composables/useDexie'
import { ref, onMounted } from 'vue'
import { Plus, Heart, History as HistoryIcon } from 'lucide-vue-next'
import { type History } from '@/composables/useDexie'
// Use liveQuery for reactive history updates
const liveHistory = getLiveHistory()
const liveFavourites = getLiveFavourites()
const liveCollections = getLiveCollections()
const history = ref<History[]>([])
const favourites = ref<Favourite[]>([])
const recipe = ref<Recipe | null>(null)
const collections = ref<CollectionWithRecipes[]>([])
const isRecipeModalOpen = ref(false)
import RecipeCard from '@/components/sections/cards/RecipeCard.vue'
import { type Recipe } from '@/composables/useRecipeImporter'
import { getRecipeFromUrl } from '@/composables/useRecipeImporter'
import {getRecipeByURL} from '@/composables/useDexie'
import { useRoute } from 'vue-router'
import NewCollection from '@/components/sections/dialogues/NewCollection.vue'
import SelectCollection from '@/components/sections/dialogues/SelectCollection.vue'
const isCollectionModalOpen = ref(false)
const selectCollectionOpen = ref(false)
const currentRecipe = ref<History| null>(null)
const handleCollectionSelected = (collectionId: number) => {
  selectCollectionOpen.value = false
}
function handleRecipeSelected(recipe: History) {
  currentRecipe.value = recipe
}


const route = useRoute()

// Subscribe to live history updates
onMounted(() => {
  // Initialize with current data
  liveHistory.subscribe(
    (result) => {
      history.value = result.reverse()
    },
    (error) => {
      console.error('Error in history subscription:', error)
    }
  )

  liveFavourites.subscribe(
    (result) => {
      favourites.value = result
    },
    (error) => {
      console.error('Error in favourites subscription:', error)
    }
  )

  liveCollections.subscribe(
    async (result) => {
      collections.value = await Promise.all(result.map(async collection => {
        const col = {...collection} as unknown as CollectionWithRecipes
        col.recipes = []
        const recipes =  await batchGetRecipes(collection.recipes)

        col.recipes = recipes.map(recipe => {
          if (!recipe || recipe.id === undefined) {
            return null
          }

          return {
            id: recipe.id,
            title: recipe.title,
            url: recipe.url
          } 
        }).filter((item): item is {id: number, title: string, url: string} => item !== null)

        return col
      }))
    },
    (error) => {
      console.error('Error in collections subscription:', error)
    }
  )


  // Check for URL parameter to open recipe
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

const addRecipeToCollection = async (recipeId: number, collectionId: number) => {
  const collection = await getCollectionById(collectionId)

  if (!collection) {
    return
  }

  if (!collection.recipes.includes(recipeId)) {
    collection.recipes.push(recipeId)
    await updateCollection(collection)
  }
}
</script>

<template>
  <Sidebar variant="sidebar">
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Favourites</SidebarGroupLabel>
        <SidebarGroupContent class="list-none w-full">
          <SidebarMenuItem v-for="item in favourites" :key="item.id" class="list-none w-full">
            <SidebarMenuButton class="w-full">
              <router-link class="w-full flex items-center gap-2 line-clamp-1" :to="`/recipe/${encodeURIComponent(item.url)}`" @click="openRecipe(item.url)"><Heart class="h-4 w-4 fill-emerald-500 text-emerald-900/50 dark:text-emerald-500/50" /> {{ item.title }}</router-link>
            </SidebarMenuButton>
            <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <SidebarMenuAction>
        <MoreHorizontal />
      </SidebarMenuAction>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="right" align="start">
      <DropdownMenuItem @click="handleRecipeSelected(item)">
        <span>Add to Collection</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <span>Remove Favourite</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
    <SidebarGroupLabel>Collections</SidebarGroupLabel>
    <SidebarGroupAction @click="isCollectionModalOpen = true" title="Add Collection">
      <Plus /> <span class="sr-only">Add Collection</span>
    </SidebarGroupAction>
    <SidebarGroupContent >
      <Collapsible v-for="collection in collections" :key="collection.id" defaultOpen class="group/collapsible">
    <SidebarGroup>
      <SidebarGroupLabel asChild>
        <CollapsibleTrigger>
          {{ collection.name }}
          <ChevronDown class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
        </CollapsibleTrigger>
      </SidebarGroupLabel>
      <CollapsibleContent>
        <SidebarGroupContent v-for="recipe in collection.recipes" :key="recipe.id">
          <SidebarMenuItem>
            <SidebarMenuButton>
              <router-link :to="`/recipe/${encodeURIComponent(recipe.url)}`" @click="openRecipe(recipe.url)">{{ recipe.title }}</router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </CollapsibleContent>
    </SidebarGroup>
  </Collapsible>
    </SidebarGroupContent>
  </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>History</SidebarGroupLabel>
        <SidebarGroupContent class="list-none">
          <SidebarMenuItem v-for="item in history" :key="item.id" class="list-none w-full">
            <SidebarMenuButton class="w-full">
              <router-link class="w-full flex items-center gap-2 line-clamp-1" :to="`/recipe/${encodeURIComponent(item.url)}`" @click="openRecipe(item.url)"><HistoryIcon class="h-4 w-4 text-emerald-900/50 dark:text-emerald-100/50" /> {{ item.title }}</router-link>
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

    <NewCollection 
      :open="isCollectionModalOpen" 
      @update:open="isCollectionModalOpen = $event" 
    />

    <SelectCollection 
    v-if="currentRecipe"
    v-model:open="selectCollectionOpen" 
    :recipe-id="currentRecipe.id" 
    @collection-selected="handleCollectionSelected"
/>
</template>

<style scoped>
:deep(li) {
  list-style-type: none;
}
</style>