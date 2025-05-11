<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, computed, reactive, toRaw } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Plus, Trash, EditIcon } from 'lucide-vue-next';
import { type Recipe } from '@/types/Recipe';
import { addOrUpdateRecipe, type RecipeData, addHistory, addOrUpdateHistory, getFavouriteByRecipeId, updateFavourite } from '@/composables/useDexie';
import { useToast } from '@/components/ui/toast';

const props = defineProps<{
  open: boolean;
  recipe: Recipe | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const { toast } = useToast();
const activeTab = ref('overview');
const isSaving = ref(false);

// Create editable copy of the recipe
const editableRecipe = ref<Recipe | null>(null);

// Initialize the editable recipe whenever the input recipe changes
watch(() => props.recipe, (newRecipe) => {
  if (newRecipe) {
    // Create a deep copy to avoid modifying the original
    editableRecipe.value = JSON.parse(JSON.stringify(newRecipe));
    // Ensure cuisine and categories are arrays if they might be undefined/null from newRecipe
    if (editableRecipe.value) {
        if (!Array.isArray(editableRecipe.value.cuisine)) {
            editableRecipe.value.cuisine = [];
        }
        if (!Array.isArray(editableRecipe.value.categories)) {
            editableRecipe.value.categories = [];
        }
    }
  } else {
    editableRecipe.value = null;
  }
}, { immediate: true });

// Computed property for cuisine string
const cuisineString = computed({
  get: () => {
    if (editableRecipe.value && Array.isArray(editableRecipe.value.cuisine)) {
      return editableRecipe.value.cuisine.join(', ');
    }
    return '';
  },
  set: (newValue: string) => {
    if (editableRecipe.value) {
      editableRecipe.value.cuisine = newValue.split(',').map(item => item.trim()).filter(item => item !== '');
    }
  }
});

// Computed property for categories string
const categoriesString = computed({
  get: () => {
    if (editableRecipe.value && Array.isArray(editableRecipe.value.categories)) {
      return editableRecipe.value.categories.join(', ');
    }
    return '';
  },
  set: (newValue: string) => {
    if (editableRecipe.value) {
      editableRecipe.value.categories = newValue.split(',').map(item => item.trim()).filter(item => item !== '');
    }
  }
});

// Helper functions for editing recipe data
const formatTime = (minutes: number): string => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  }
  return `${mins}m`;
};

// Parse time string to minutes
const parseTime = (timeString: string): number => {
  if (!timeString || timeString === 'N/A') return 0;
  
  // Handle hours and minutes format (e.g., "1h 30m" or "45m")
  const hoursMatch = timeString.match(/([\d.]+)h/);
  const minutesMatch = timeString.match(/([\d.]+)m/);
  
  let totalMinutes = 0;
  if (hoursMatch && hoursMatch[1]) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }
  if (minutesMatch && minutesMatch[1]) {
    totalMinutes += parseInt(minutesMatch[1]);
  }
  
  return totalMinutes;
};

// Helper function to add a new ingredient
const addIngredient = () => {
  if (!editableRecipe.value) return;
  
  editableRecipe.value.ingredients.push({
    name: '',
    quantity: 0,
    unit: ''
  });
};

// Helper function to remove an ingredient
const removeIngredient = (index: number) => {
  if (!editableRecipe.value) return;
  
  editableRecipe.value.ingredients.splice(index, 1);
};

// Helper function to add a new instruction
const addInstruction = () => {
  if (!editableRecipe.value) return;
  
  editableRecipe.value.instructions.push('');
};

// Helper function to remove an instruction
const removeInstruction = (index: number) => {
  if (!editableRecipe.value) return;
  
  editableRecipe.value.instructions.splice(index, 1);
};

const saveRecipe = async () => {
  if (!editableRecipe.value) return;

  console.log(editableRecipe.value);
  
  try {
    isSaving.value = true;
    
    // Convert Recipe to RecipeData by casting
    const recipeData: RecipeData = editableRecipe.value as RecipeData;
    const isUpdating = recipeData.id !== undefined;
    
    console.log('[saveRecipe] isUpdating', isUpdating);

    // Only generate a new URL if this is a new recipe (no URL)
    if (!recipeData.url) {
      recipeData.url = recipeData.title + '-' + Math.random().toString(8).substring(2, 8);
    }
    
    // Use addOrUpdateRecipe to handle both new and existing recipes
    const id = await addOrUpdateRecipe(recipeData);
    
    if (id) {
      // Add to history
      await addOrUpdateHistory({
        ...recipeData,
        id
      });
      
      toast({
        title: 'Success!',
        description: isUpdating ? 'Recipe updated successfully' : 'Recipe saved to your collection',
      });

      if (isUpdating && recipeData.id) {
        console.log('[saveRecipe] updating favorite');  
        const isFavorite = await getFavouriteByRecipeId(recipeData.id)
        
        if (isFavorite) {
          console.log('[saveRecipe] favorite found', isFavorite);
          await updateFavourite({
            id: isFavorite.id,
            title: recipeData.title,
            url: recipeData.url || isFavorite.url,
            recipeId: recipeData.id,
            createdAt: isFavorite?.createdAt || new Date()
          })
          console.log('[saveRecipe] favorite updated');
        }
      }
      emit('update:open', false);
    }
  } catch (error) {
    console.error('Error saving recipe:', error);
    toast({
      title: 'Error',
      description: 'Failed to save recipe',
      variant: 'destructive',
    });
  } finally {
    isSaving.value = false;
  }
};

// Close dialog if recipe is null
watch(() => props.recipe, (newValue) => {
  if (!newValue && props.open) {
    emit('update:open', false);
  }
}, { immediate: true });
</script>

<template>
  <Dialog :open="open" @update:open="(value) => emit('update:open', value)">
    <DialogContent class="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-2xl font-bold mb-2">
          <Input 
            v-if="editableRecipe" 
            v-model="editableRecipe.title" 
            class="text-2xl font-bold" 
            placeholder="Recipe Title"
          />
          <span v-else>Recipe Preview</span>
        </DialogTitle>
        <div v-if="editableRecipe" class="mb-2">
          <Textarea 
            v-model="editableRecipe.description" 
            placeholder="Add a brief description of your recipe"
            class="resize-none"
            rows="2"
          />
        </div>
      </DialogHeader>

      <div v-if="editableRecipe" class="py-4">
        <!-- Recipe image and overview -->
        <div class="mb-6 flex flex-col sm:flex-row gap-6">
          <div class="sm:w-1/3">
            <div 
              v-if="editableRecipe.images && editableRecipe.images.length > 0" 
              class="overflow-hidden rounded-lg aspect-square mb-4 relative group"
            >
              <img 
                :src="editableRecipe.images[0]" 
                :alt="editableRecipe.title" 
                class="object-cover w-full h-full"
              />
              <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="outline" size="sm" class="text-white border-white hover:bg-white hover:bg-opacity-20">
                  <EditIcon class="h-4 w-4 mr-2" /> Change Image
                </Button>
              </div>
            </div>
            <div 
              v-else 
              class="overflow-hidden rounded-lg aspect-square mb-4 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 gap-2"
            >
              <span>No image available</span>
              <Button variant="outline" size="sm">
                <Plus class="h-4 w-4 mr-2" /> Add Image
              </Button>
            </div>
          </div>

          <div class="sm:w-2/3 space-y-4">
            <!-- Recipe quick facts -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <Label for="servings">Servings</Label>
                  <Input 
                    id="servings" 
                    v-model="editableRecipe.servings" 
                    type="number" 
                    min="1"
                    placeholder="e.g., 4"
                  />
                </div>
                
                <div class="space-y-1">
                  <Label for="prepTime">Prep Time (minutes)</Label>
                  <Input 
                    id="prepTime" 
                    v-model="editableRecipe.prepTime" 
                    type="number" 
                    min="0"
                    placeholder="e.g., 15"
                  />
                </div>
                
                <div class="space-y-1">
                  <Label for="cookTime">Cook Time (minutes)</Label>
                  <Input 
                    id="cookTime" 
                    v-model="editableRecipe.cookTime" 
                    type="number" 
                    min="0"
                    placeholder="e.g., 30"
                  />
                </div>
                
                <div class="space-y-1">
                  <Label for="totalTime">Total Time (minutes)</Label>
                  <Input 
                    id="totalTime" 
                    v-model="editableRecipe.totalTime" 
                    type="number" 
                    min="0"
                    placeholder="e.g., 45"
                  />
                </div>
              </div>
            </div>

            <!-- Cuisine field -->
            <div class="space-y-1">
              <Label>Cuisine (comma-separated)</Label>
              <Input 
                v-model="cuisineString" 
                placeholder="e.g., Italian, Mediterranean"
              />
            </div>
            
            <!-- Categories field -->
            <div class="space-y-1">
              <Label>Categories (comma-separated)</Label>
              <Input 
                v-model="categoriesString" 
                placeholder="e.g., Dinner, Pasta"
              />
            </div>
          </div>
        </div>

        <!-- Recipe details tabs -->
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <!-- Overview Tab -->
          <TabsContent value="overview" class="space-y-4">
            <!-- Nutrition info section -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-lg">Nutrition Information</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  @click="editableRecipe.meta.includesNutrition = !editableRecipe.meta.includesNutrition"
                >
                  {{ editableRecipe.meta.includesNutrition ? 'Hide Nutrition' : 'Show Nutrition' }}
                </Button>
              </div>
              
              <div v-if="editableRecipe.meta.includesNutrition" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="(value, key) in editableRecipe.nutrition" :key="key" class="space-y-1">
                  <Label :for="`nutrition-${key}`" class="capitalize text-sm">
                    {{ key.replace('Content', '') }}
                  </Label>
                  <Input 
                    :id="`nutrition-${key}`"
                    v-model="editableRecipe.nutrition[key]" 
                    placeholder="e.g., 200 kcal"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Ingredients Tab -->
          <TabsContent value="ingredients" class="space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold text-lg">Ingredients</h3>
              <Button size="sm" variant="outline" @click="addIngredient" class="flex items-center gap-1">
                <Plus class="h-4 w-4" /> Add Ingredient
              </Button>
            </div>
            
            <div class="space-y-4">
              <div 
                v-for="(ingredient, index) in editableRecipe.ingredients" 
                :key="index"
                class="p-3 border rounded-md relative group"
              >
                <div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    class="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                    @click="removeIngredient(index)"
                  >
                    <Trash class="h-4 w-4" />
                  </Button>
                </div>
                
                <div class="grid grid-cols-12 gap-3">
                  <div class="col-span-3">
                    <Label :for="`quantity-${index}`" class="text-xs">Quantity</Label>
                    <Input 
                      :id="`quantity-${index}`"
                      v-model.number="ingredient.quantity"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="e.g., 2"
                    />
                  </div>
                  
                  <div class="col-span-3">
                    <Label :for="`unit-${index}`" class="text-xs">Unit</Label>
                    <Input 
                      :id="`unit-${index}`"
                      v-if="ingredient.unit !== null"
                      v-model="ingredient.unit"
                      placeholder="e.g., tsp"
                    />
                    <Input 
                      :id="`unit-${index}-null`"
                      v-else
                      @input="ingredient.unit = $event.target.value"
                      placeholder="e.g., tsp"
                    />
                  </div>
                  
                  <div class="col-span-6">
                    <Label :for="`ingredient-${index}`" class="text-xs">Ingredient</Label>
                    <Input 
                      :id="`ingredient-${index}`"
                      v-if="ingredient.name !== null"
                      v-model="ingredient.name"
                      placeholder="e.g., Salt"
                    />
                    <Input 
                      :id="`ingredient-${index}-null`"
                      v-else
                      @input="ingredient.name = $event.target.value"
                      placeholder="e.g., Salt"
                    />
                  </div>
                </div>
              </div>
              
              <div v-if="editableRecipe.ingredients.length === 0" class="text-center py-8 text-slate-500">
                <p>No ingredients added yet. Click the button above to add one.</p>
              </div>
            </div>
          </TabsContent>

          <!-- Instructions Tab -->
          <TabsContent value="instructions" class="space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold text-lg">Instructions</h3>
              <Button size="sm" variant="outline" @click="addInstruction" class="flex items-center gap-1">
                <Plus class="h-4 w-4" /> Add Step
              </Button>
            </div>
            
            <div class="space-y-4">
              <div 
                v-for="(instruction, index) in editableRecipe.instructions" 
                :key="index"
                class="p-3 border rounded-md relative group"
              >
                <div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    class="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                    @click="removeInstruction(index)"
                  >
                    <Trash class="h-4 w-4" />
                  </Button>
                </div>
                
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    {{ index + 1 }}
                  </div>
                  <Textarea 
                    v-if="editableRecipe.instructions[index] !== null"
                    v-model="editableRecipe.instructions[index]" 
                    placeholder="Describe this step..." 
                    class="flex-grow resize-none"
                    rows="2"
                  />
                  <Textarea 
                    v-else
                    @input="editableRecipe.instructions[index] = $event.target.value"
                    placeholder="Describe this step..." 
                    class="flex-grow resize-none"
                    rows="2"
                  />
                </div>
              </div>
              
              <div v-if="editableRecipe.instructions.length === 0" class="text-center py-8 text-slate-500">
                <p>No instructions added yet. Click the button above to add a step.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter>
        <Button 
          @click="emit('update:open', false)"
          variant="outline"
          class="mr-2"
        >
          Cancel
        </Button>
        <Button 
          @click="saveRecipe"
          :disabled="isSaving"
          class="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Save class="mr-2 h-4 w-4" v-if="!isSaving" />
          <span v-else class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          {{ isSaving ? 'Saving...' : 'Save Recipe' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>