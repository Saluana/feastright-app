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
import { Star } from "lucide-vue-next";

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

const props = defineProps<RecipeCardProps>()

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
  <Card
  :class="['max-w-4xl w-full overflow-hidden rounded-2xl shadow-lg', props.className]"
>
  <CardHeader class="p-0">
    <a :href="props.recipe.url" target="_blank" rel="noopener noreferrer">
      <AspectRatio :ratio="16 / 9">
        <img
          :src="props.recipe.images[0]"
          :alt="props.recipe.title"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </AspectRatio>
    </a>
  </CardHeader>

  <CardContent class="p-6 space-y-4">
    <!-- Title & Rating -->
    <div class="flex flex-col gap-1">
      <h2 class="text-2xl font-semibold tracking-tight">{{ props.recipe.title }}</h2>
      <div class="flex items-center gap-1 text-sm text-yellow-600">
        <template v-for="(_, i) in Array(5)" :key="i">
          <Star
            :size="18"
            :class="i < Math.round(parseFloat(props.recipe.ratings.ratingValue)) ? 'fill-yellow-500' : 'stroke-yellow-500'"
          />
        </template>
        <span class="ml-2 text-muted-foreground">
          {{ props.recipe.ratings.ratingValue }} ({{ props.recipe.ratings.ratingCount }})
        </span>
      </div>
    </div>

    <!-- Meta -->
    <div class="flex flex-wrap gap-2 text-sm">
      <Badge variant="secondary">{{ props.recipe.publisher }}</Badge>
      <Badge variant="outline">{{ props.recipe.servings }} servings</Badge>
      <Badge variant="outline">⏱️ {{ props.recipe.totalTime }} min total</Badge>
      <Badge variant="outline">Prep {{ props.recipe.prepTime }} min</Badge>
      <Badge variant="outline">Cook {{ props.recipe.cookTime }} min</Badge>
      <Badge 
        v-for="c in props.recipe.cuisine" 
        :key="c"
      >
        {{ c }}
      </Badge>
      <Badge 
        v-for="c in props.recipe.categories" 
        :key="c" 
        variant="secondary"
      >
        {{ c }}
      </Badge>
    </div>

    <!-- Description -->
    <p class="text-muted-foreground">{{ props.recipe.description }}</p>

    <Separator />

    <!-- Ingredients -->
    <div>
      <h3 class="mb-2 font-medium">Ingredients</h3>
      <ul class="list-disc list-inside space-y-1">
        <li v-for="({ name, quantity, unit }, idx) in props.recipe.ingredients" :key="idx">
          <span class="font-medium">{{ formatFraction(quantity) }}</span>
          {{ unit?.trim() || "" }} {{ name }}
        </li>
      </ul>
    </div>

    <!-- Instructions -->
    <div>
      <h3 class="mb-2 font-medium">Instructions</h3>
      <ol class="list-decimal list-inside space-y-2">
        <li v-for="(step, idx) in props.recipe.instructions" :key="idx">{{ step }}</li>
      </ol>
    </div>

    <!-- Nutrition -->
    <div>
      <h3 class="mb-2 font-medium">Nutrition (per serving)</h3>
      <ul class="flex flex-wrap gap-4 text-sm">
        <template v-for="[k, v] in Object.entries(props.recipe.nutrition)" :key="k">
          <li v-if="v" class="flex flex-col">
            <span class="font-semibold capitalize">
              {{ k.replace(/Content$/i, "") }}
            </span>
            <span>{{ v }}</span>
          </li>
        </template>
      </ul>
    </div>
  </CardContent>

  <CardFooter class="p-6 flex justify-end">
    <a
      :href="props.recipe.url"
      target="_blank"
      rel="noopener noreferrer"
      class="text-primary hover:underline"
    >
      View full recipe →
    </a>
  </CardFooter>
</Card>
</template>
