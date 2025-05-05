<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Recipe } from "@/composables/useRecipeImporter";
import { Clock, ExternalLink, Star, Utensils, Clock3, Heart } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { decode } from 'html-entities';
import { useRouter, useRoute } from 'vue-router';
import { onMounted, watch, ref } from 'vue';
import { addFavourite, db } from '@/composables/useDexie';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
  open?: boolean;
}

const props = defineProps<RecipeCardProps>()
const emit = defineEmits(['update:open'])
const router = useRouter()
const route = useRoute()
const isFavorite = ref(false)

// Check if recipe is already a favorite
const checkIfFavorite = async () => {
  if (props.recipe) {
    // Look for a favorite with matching URL
    const favorites = await db.favourites.where('url').equals(props.recipe.url).toArray()
    isFavorite.value = favorites.length > 0
  }
}

// Toggle favorite status
const toggleFavorite = async () => {
  if (props.recipe) {
    await addFavourite(props.recipe)
    isFavorite.value = true
  }
}

// Check favorite status when component mounts
onMounted(() => {
  checkIfFavorite()
})

const updateOpen = (value: boolean) => {
  emit('update:open', value)
  
  // If the modal is being closed, navigate back to the home page
  if (!value) {
    router.push('/')
  }
}

// Update URL when the modal is opened
watch(() => props.open, (newValue) => {
  if (newValue && props.recipe) {
    // If the modal is opened and we're not already on the recipe route
    if (!route.path.includes('/recipe/')) {
      router.push(`/recipe/${encodeURIComponent(props.recipe.url)}`)
    }
  }
})

// Set the route when mounted if the modal is open but URL doesn't reflect it
onMounted(() => {
  if (props.open && props.recipe && !route.path.includes('/recipe/')) {
    router.push(`/recipe/${encodeURIComponent(props.recipe.url)}`)
  }
})

// Utility to format decimals as beautiful fractions
function formatFraction(value: number | string): string {
  if (typeof value === 'string') value = parseFloat(value);
  if (isNaN(value)) return '';
  // Map of common fractions
  const fractionMap: Record<number, string> = {
    0.25: '¼',
    0.33: '⅓', 0.333: '⅓', 0.334: '⅓',
    0.5: '½',
    0.66: '⅔', 0.667: '⅔', 0.666: '⅔',
    0.75: '¾',
    0.2: '⅕', 0.4: '⅖', 0.6: '⅗', 0.8: '⅘',
    0.125: '⅛', 0.375: '⅜', 0.625: '⅝', 0.875: '⅞',
  };
  const intPart = Math.floor(value);
  const decPart = value - intPart;
  // Find closest fraction
  let closest = null;
  let minDiff = 1;
  for (const [frac, symbol] of Object.entries(fractionMap)) {
    const diff = Math.abs(decPart - Number(frac));
    if (diff < 0.02 && diff < minDiff) {
      closest = symbol;
      minDiff = diff;
    }
  }
  if (intPart && closest) return `${intPart} ${closest}`;
  if (closest) return closest;
  if (decPart) {
    // Fallback: show as fraction string
    const denominator = 8;
    const numerator = Math.round(decPart * denominator);
    if (numerator === 0) return intPart ? intPart.toString() : '';
    return intPart ? `${intPart} ${numerator}/${denominator}` : `${numerator}/${denominator}`;
  }
  return intPart.toString();
}
</script>

<template>
  <Dialog class="rounded-none" :open="open" @update:open="updateOpen">
    <DialogContent 
  class="md:min-w-[90vw] md:min-h-[99vh] md:max-w-[90vw] md:max-h-[90vh] rounded-none flex flex-col items-center overflow-y-scroll pt-8"
  :closeButton="false"
    >
      <DialogHeader class="flex justify-between items-center">
        <DialogTitle class="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {{ decode(props.recipe?.title) }}
        </DialogTitle>
  
      </DialogHeader>

      <Card
        :class="[
          'max-w-[840px] h-auto rounded-xl border-none',
          'bg-gradient-to-b from-background to-background/80',
          'shadow-[0_8px_30px_rgb(0,0,0,0.08)]',
          'transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
          props.className
        ]"
      >
        <!-- Hero image with overlaid information -->
        <div class="relative overflow-hidden rounded-t-xl">
          <AspectRatio :ratio="16 / 9" class="overflow-hidden">
            <img
              :src="props.recipe.images[0]"
              :alt="props.recipe.title"
              class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
            <!-- Gradient overlay for text readability that preserves image visibility -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
            
            <!-- Content overlay -->
            <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <!-- Extra text background gradient for better readability -->
              <div class="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
              <!-- Title & Rating -->
              <div class="space-y-2 mb-3">
                <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">{{ decode(props.recipe.title) }}</h2>
                <div class="flex items-center gap-0.5">
                  <template v-for="(_, i) in Array(5)" :key="i">
                    <Star
                      :size="20"
                      :class="[
                        'transition-all duration-300 filter drop-shadow-md',
                        i < Math.round(parseFloat(props.recipe.ratings.ratingValue)) 
                          ? 'fill-yellow-300 text-yellow-300' 
                          : 'text-gray-300'
                      ]"
                    />
                  </template>
                  <span class="ml-2 text-sm font-bold text-white drop-shadow-md">
                    {{ props.recipe.ratings.ratingValue }} ({{ props.recipe.ratings.ratingCount }})
                  </span>
                </div>
              </div>
              
              <!-- Meta badges -->
              <div class="relative flex flex-wrap gap-2 mb-4">
                <Badge class="bg-primary text-white border-none text-sm py-1 px-3 font-semibold shadow-lg">
                  {{ decode(props.recipe.publisher) }}
                </Badge>
                <Badge class="bg-black/75 text-white border-none text-sm py-1 px-3 font-semibold shadow-lg gap-1.5">
                  <Utensils class="h-4 w-4" />
                  {{ props.recipe.servings }} servings
                </Badge>
                <Badge class="bg-black/75 text-white border-none text-sm py-1 px-3 font-semibold shadow-lg gap-1.5">
                  <Clock class="h-4 w-4" />
                  {{ props.recipe.totalTime }} min total
                </Badge>
                <Badge class="bg-black/75 text-white border-none text-sm py-1 px-3 font-semibold shadow-lg gap-1.5">
                  <Clock3 class="h-4 w-4" />
                  {{ props.recipe.prepTime }}+{{ props.recipe.cookTime }} min
                </Badge>
                <Badge 
                  v-for="c in props.recipe.cuisine" 
                  :key="c"
                  class="bg-primary text-white border-none text-sm py-1 px-3 font-semibold shadow-lg"
                >
                  {{ c }}
                </Badge>
                <Badge 
                  v-for="c in props.recipe.categories" 
                  :key="c"
                  class="bg-secondary text-black dark:text-white border-none text-sm py-1 px-3 font-semibold shadow-lg"
                >
                  {{ c }}
                </Badge>
              </div>
              
              <!-- Description -->
              <p class="text-sm text-gray-200 leading-snug line-clamp-2 drop-shadow-sm">{{ decode(props.recipe.description) }}</p>
              
              <!-- Source link and favorite button -->
              <div class="absolute top-4 right-4 flex gap-2">
                <button 
                  @click="toggleFavorite" 
                  class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium shadow-md transition-colors"
                  :class="{ 'bg-red-600': isFavorite }"
                >
                  <Heart class="h-4 w-4" :class="{ 'fill-white': isFavorite }" />
                  <span>{{ isFavorite ? 'Saved' : 'Favorite' }}</span>
                </button>
                <a 
                  :href="props.recipe.url" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium shadow-md transition-colors"
                >
                  <ExternalLink class="h-3.5 w-3.5" />
                  Source
                </a>
              </div>
            </div>
          </AspectRatio>
        </div>
        
        <CardContent class="p-6 space-y-6">

          <Separator class="my-2" />

          <!-- Ingredients -->
          <div class="bg-background/50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-3 text-primary">Ingredients</h3>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li 
                v-for="({ name, quantity, unit }, idx) in props.recipe.ingredients" 
                :key="idx"
                class="flex items-start gap-2"
              >
                <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                  {{ idx + 1 }}
                </span>
                <span>
                  <span class="font-medium">{{ formatFraction(quantity) }}</span>
                  {{ unit?.trim() || "" }} <span class="text-muted-foreground">{{ name }}</span>
                </span>
              </li>
            </ul>
          </div>

          <!-- Instructions -->
          <div class="bg-background/50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-3 text-primary">Instructions</h3>
            <ol class="space-y-4">
              <li 
                v-for="(step, idx) in props.recipe.instructions" 
                :key="idx"
                class="flex gap-4 pb-4 border-b border-border/40 last:border-0 last:pb-0"
              >
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                  {{ idx + 1 }}
                </span>
                <span class="leading-relaxed">{{ decode(step) }}</span>
              </li>
            </ol>
          </div>

          <!-- Nutrition -->
          <div class="bg-background/50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-3 text-primary">Nutrition (per serving)</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <template v-for="[k, v] in Object.entries(props.recipe.nutrition)" :key="k">
                <div v-if="v" class="bg-background rounded p-3 shadow-sm">
                  <span class="block text-xs text-muted-foreground capitalize mb-1">
                    {{ decode(k.replace(/Content$/i, "")) }}
                  </span>
                  <span class="text-lg font-medium">{{ decode(v) }}</span>
                </div>
              </template>
            </div>
          </div>
        </CardContent>

        <CardFooter class="p-6 pt-0 flex justify-end">
          <a
            :href="props.recipe.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View full recipe
            <ExternalLink class="h-4 w-4" />
          </a>
        </CardFooter>
      </Card>
    </DialogContent>
  </Dialog>
</template>
