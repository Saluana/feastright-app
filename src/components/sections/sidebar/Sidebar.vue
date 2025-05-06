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
import { MoreHorizontal, ChevronDown, BookHeart, BookPlus, Album } from 'lucide-vue-next'
import { getLiveHistory, getLiveFavourites, Favourite, getLiveCollections, CollectionWithRecipes, batchGetRecipes, updateCollection, getCollectionById, RecipeData } from '@/composables/useDexie'
import { ref, onMounted } from 'vue'
import { Plus, Heart, History as HistoryIcon, Bookmark as BookmarkIcon } from 'lucide-vue-next'
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
  <Sidebar variant="sidebar" class="border-r border-border bg-card/30 dark:bg-card/10">
    <SidebarHeader class="p-4 border-b border-border/50">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-md bg-emerald-600/90 flex items-center justify-center text-white font-bold">R</div>
        <div class="font-semibold text-lg">Recipe Scraper</div>
      </div>
    </SidebarHeader>
    <SidebarContent class="px-2 py-1 space-y-6">
      <SidebarGroup class="pb-3">
        <SidebarGroupLabel class="text-sm font-semibold text-foreground mb-2 px-1">Favourites</SidebarGroupLabel>
        <SidebarGroupContent class="list-none w-full space-y-1 pl-0">
          <div v-if="favourites.length === 0" class="px-2 py-3 text-center rounded-md bg-muted/40">
            <div class="text-sm text-muted-foreground">No favorites yet</div>
            <div class="text-xs text-muted-foreground mt-1">Heart a recipe to save it here</div>
          </div>
          <SidebarMenuItem v-for="item in favourites" :key="item.id" class="list-none w-full mb-1 last:mb-0">
            <SidebarMenuButton class="w-full px-2 py-1.5 rounded-md hover:bg-muted text-sm group">
              <router-link class="w-full flex items-center gap-2 truncate" :to="`/recipe/${encodeURIComponent(item.url)}`" @click="openRecipe(item.url)"><Heart class="h-3.5 w-3.5 flex-shrink-0 fill-emerald-500 text-emerald-500/80 group-hover:text-emerald-600" /> <span class="truncate">{{ item.title }}</span></router-link>
            </SidebarMenuButton>
            <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <SidebarMenuAction class="h-6 w-6 hover:bg-muted rounded-sm opacity-70 hover:opacity-100">
        <MoreHorizontal class="h-3.5 w-3.5" />
      </SidebarMenuAction>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="right" align="start" class="w-48">
      <DropdownMenuItem @click="handleRecipeSelected(item); selectCollectionOpen = true" class="cursor-pointer">
        <BookPlus class="h-3.5 w-3.5 mr-2 text-muted-foreground" />
        <span>Add to Collection</span>
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer text-destructive focus:text-destructive">
        <Heart class="h-3.5 w-3.5 mr-2" />
        <span>Remove Favourite</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup class="pb-3">
    <div class="flex items-center justify-between mb-2 ">
      <SidebarGroupLabel class="text-sm font-semibold text-foreground">Collections</SidebarGroupLabel>
      <SidebarGroupAction @click="isCollectionModalOpen = true" title="Add Collection" class="h-5 w-5 hover:bg-muted rounded-sm">
        <Plus class="h-4 w-4" /> <span class="sr-only">Add Collection</span>
      </SidebarGroupAction>
    </div>
    <SidebarGroupContent class="space-y-1 pl-0">
      <div v-if="collections.length === 0" class="px-2 py-3 text-center rounded-md bg-muted/40">
        <div class="text-sm text-muted-foreground">No collections yet</div>
        <div class="text-xs text-muted-foreground mt-1">Create a collection to organize recipes</div>
      </div>
      <Collapsible v-for="collection in collections" :key="collection.id" defaultOpen class="group/collapsible mb-1 !w-full last:mb-0">
    <SidebarGroup class="!p-0 border-l-0 border-r-0 border-t-0 border-b border-border/30 pb-1 mb-1 last:border-b-0 last:mb-0 last:pb-0">
      <SidebarGroupLabel asChild>
        <CollapsibleTrigger class="flex items-center w-full px-2 py-1.5 rounded-md hover:bg-muted text-sm font-medium">
          <Album class="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          {{ collection.name }}
          <ChevronDown class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
      </SidebarGroupLabel>
      <CollapsibleContent>
        <div class="pt-0.5 -mx-2"> <!-- Reset padding and margin to align perfectly -->
          <SidebarGroupContent class="list-none space-y-1 pl-0">
            <SidebarMenuItem v-for="recipe in collection.recipes" :key="recipe.id" class="list-none w-full mb-1 last:mb-0">
              <SidebarMenuButton class="w-full px-2 py-1.5 rounded-md hover:bg-muted text-sm">
                <router-link class="w-full flex items-center gap-2 truncate" :to="`/recipe/${encodeURIComponent(recipe.url)}`" @click="openRecipe(recipe.url)">
                  <div class="w-3.5 h-3.5 invisible flex-shrink-0"></div>
                  <span class="truncate">{{ recipe.title }}</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </div>
      </CollapsibleContent>
    </SidebarGroup>
  </Collapsible>
    </SidebarGroupContent>
  </SidebarGroup>
      <SidebarGroup class="pb-3">
        <SidebarGroupLabel class="text-sm font-semibold text-foreground mb-2 px-1">History</SidebarGroupLabel>
        <SidebarGroupContent class="list-none space-y-1 pl-0">
          <div v-if="history.length === 0" class="px-2 py-3 text-center rounded-md bg-muted/40">
            <div class="text-sm text-muted-foreground">No history yet</div>
            <div class="text-xs text-muted-foreground mt-1">View recipes to see them here</div>
          </div>
          <SidebarMenuItem v-for="item in history" :key="item.id" class="list-none w-full mb-1 last:mb-0">
            <SidebarMenuButton class="w-full px-2 py-1.5 rounded-md hover:bg-muted text-sm">
              <router-link class="w-full flex items-center gap-2 truncate" :to="`/recipe/${encodeURIComponent(item.url)}`" @click="openRecipe(item.url)"><HistoryIcon class="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" /> <span class="truncate">{{ item.title }}</span></router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup />
    </SidebarContent>
    <SidebarFooter class="p-4 border-t border-border/50 mt-auto">
      <div class="flex items-center justify-between">
        <div class="text-xs text-muted-foreground">Recipe Scraper v1.0</div>
        <div class="text-xs flex items-center gap-1.5">
          <a href="#" class="text-muted-foreground hover:text-foreground transition-colors">Help</a>
          <span class="text-border">•</span>
          <a href="#" class="text-muted-foreground hover:text-foreground transition-colors">About</a>
        </div>
      </div>
    </SidebarFooter>
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