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
import { Clock, ExternalLink, Star, X, Utensils, Clock3 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
  open?: boolean;
}

const props = defineProps<RecipeCardProps>()
const emit = defineEmits(['update:open'])

const updateOpen = (value: boolean) => {
  emit('update:open', value)
}

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
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent 
      class="sm:max-w-6xl max-h-[90vh] overflow-y-auto"
      :closeButton="false"
    >
      <DialogHeader class="flex justify-between items-center">
        <DialogTitle class="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {{ props.recipe?.title }}
        </DialogTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          @click="updateOpen(false)" 
          class="absolute right-4 top-4 rounded-full p-2 hover:bg-primary/10 transition-colors"
        >
          <X class="h-5 w-5" />
        </Button>
      </DialogHeader>

      <Card
        :class="[
          'w-full overflow-hidden rounded-xl border-none',
          'bg-gradient-to-b from-background to-background/80',
          'shadow-[0_8px_30px_rgb(0,0,0,0.08)]',
          'transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
          props.className
        ]"
      >
        <CardHeader class="p-0 relative group">
          <a :href="props.recipe.url" target="_blank" rel="noopener noreferrer" class="block overflow-hidden">
            <AspectRatio :ratio="16 / 9" class="overflow-hidden">
              <img
                :src="props.recipe.images[0]"
                :alt="props.recipe.title"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70"></div>
            </AspectRatio>
            <div class="absolute bottom-4 right-4">
              <Badge class="bg-white/90 text-primary hover:bg-white shadow-sm">
                <ExternalLink class="h-3.5 w-3.5 mr-1" />
                View Source
              </Badge>
            </div>
          </a>
        </CardHeader>

        <CardContent class="p-8 space-y-6">
          <!-- Title & Rating -->
          <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-bold tracking-tight">{{ props.recipe.title }}</h2>
            <div class="flex items-center gap-0.5">
              <template v-for="(_, i) in Array(5)" :key="i">
                <Star
                  :size="20"
                  :class="[
                    'transition-all duration-300',
                    i < Math.round(parseFloat(props.recipe.ratings.ratingValue)) 
                      ? 'fill-yellow-500 text-yellow-500' 
                      : 'text-gray-300'
                  ]"
                />
              </template>
              <span class="ml-2 text-sm font-medium text-muted-foreground">
                {{ props.recipe.ratings.ratingValue }} ({{ props.recipe.ratings.ratingCount }})
              </span>
            </div>
          </div>

          <!-- Meta -->
          <div class="flex flex-wrap gap-3 py-2">
            <Badge variant="secondary" class="px-3 py-1 bg-primary/10 text-primary border-primary/20 font-medium">
              {{ props.recipe.publisher }}
            </Badge>
            <Badge variant="outline" class="px-3 py-1 gap-1.5 hover:bg-background/80">
              <Utensils class="h-3.5 w-3.5" />
              {{ props.recipe.servings }} servings
            </Badge>
            <Badge variant="outline" class="px-3 py-1 gap-1.5 hover:bg-background/80">
              <Clock class="h-3.5 w-3.5" />
              {{ props.recipe.totalTime }} min total
            </Badge>
            <Badge variant="outline" class="px-3 py-1 gap-1.5 hover:bg-background/80">
              <Clock3 class="h-3.5 w-3.5" />
              {{ props.recipe.prepTime }}+{{ props.recipe.cookTime }} min
            </Badge>
            <Badge 
              v-for="c in props.recipe.cuisine" 
              :key="c"
              class="px-3 py-1 bg-primary/80 hover:bg-primary transition-colors"
            >
              {{ c }}
            </Badge>
            <Badge 
              v-for="c in props.recipe.categories" 
              :key="c" 
              variant="secondary"
              class="px-3 py-1 bg-secondary/80 hover:bg-secondary transition-colors"
            >
              {{ c }}
            </Badge>
          </div>

          <!-- Description -->
          <p class="text-muted-foreground leading-relaxed">{{ props.recipe.description }}</p>

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
                <span class="leading-relaxed">{{ step }}</span>
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
                    {{ k.replace(/Content$/i, "") }}
                  </span>
                  <span class="text-lg font-medium">{{ v }}</span>
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
