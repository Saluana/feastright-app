<script setup lang="ts">
import {
    ref,
    defineProps,
    defineEmits,
    watch,
    computed,
    reactive,
    toRaw,
} from 'vue';
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
import { Save, Plus, Trash, EditIcon, Upload } from 'lucide-vue-next';
import { type Recipe } from '@/types/Recipe';
import {
    addOrUpdateRecipe,
    type RecipeData,
    addHistory,
    addOrUpdateHistory,
    getFavouriteByRecipeId,
    updateFavourite,
} from '@/composables/useDexie';
import { useToast } from '@/components/ui/toast';
import { ensureEmbeddingsExistForRecipes } from '@/composables/useEmbeddings';

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
watch(
    () => props.recipe,
    (newRecipe) => {
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
    },
    { immediate: true }
);

// Computed property for cuisine string
const cuisineString = computed({
    get: () => {
        if (
            editableRecipe.value &&
            Array.isArray(editableRecipe.value.cuisine)
        ) {
            return editableRecipe.value.cuisine.join(', ');
        }
        return '';
    },
    set: (newValue: string) => {
        if (editableRecipe.value) {
            editableRecipe.value.cuisine = newValue
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item !== '');
        }
    },
});

const publisherString = computed({
    get: () => {
        if (editableRecipe.value) {
            return editableRecipe.value.publisher;
        }
        return '';
    },
    set: (newValue: string) => {
        if (editableRecipe.value) {
            editableRecipe.value.publisher = newValue;
        }
    },
});

// Computed property for categories string
const categoriesString = computed({
    get: () => {
        if (
            editableRecipe.value &&
            Array.isArray(editableRecipe.value.categories)
        ) {
            return editableRecipe.value.categories.join(', ');
        }
        return '';
    },
    set: (newValue: string) => {
        if (editableRecipe.value) {
            editableRecipe.value.categories = newValue
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item !== '');
        }
    },
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
        unit: '',
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

const newImageUrl = ref('');

const updateImageUrl = () => {
    if (editableRecipe.value && newImageUrl.value) {
        // Validate URL format
        try {
            new URL(newImageUrl.value);
            editableRecipe.value.images = [newImageUrl.value];
            newImageUrl.value = '';
        } catch (e) {
            toast({
                title: 'Invalid URL',
                description: 'Please enter a valid image URL',
                variant: 'destructive',
            });
        }
    }
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
            recipeData.url =
                recipeData.title +
                '-' +
                Math.random().toString(8).substring(2, 8);
        }

        // Use addOrUpdateRecipe to handle both new and existing recipes
        const id = await addOrUpdateRecipe(recipeData);

        if (id) {
            // Add to history
            await addOrUpdateHistory({
                ...recipeData,
                id,
            });

            await ensureEmbeddingsExistForRecipes([id]);

            toast({
                title: 'Success!',
                description: isUpdating
                    ? 'Recipe updated successfully'
                    : 'Recipe saved to your collection',
            });

            if (isUpdating && recipeData.id) {
                console.log('[saveRecipe] updating favorite');
                const isFavorite = await getFavouriteByRecipeId(recipeData.id);

                if (isFavorite) {
                    console.log('[saveRecipe] favorite found', isFavorite);
                    await updateFavourite({
                        id: isFavorite.id,
                        title: recipeData.title,
                        url: recipeData.url || isFavorite.url,
                        recipeId: recipeData.id,
                        createdAt: isFavorite?.createdAt || new Date(),
                    });
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
watch(
    () => props.recipe,
    (newValue) => {
        if (!newValue && props.open) {
            emit('update:open', false);
        }
    },
    { immediate: true }
);
</script>

<template>
    <Dialog :open="open" @update:open="(value) => emit('update:open', value)">
        <DialogContent
            class="sm:max-w-[700px] max-h-[100vh] lg:max-h-[90vh] overflow-y-auto overflow-x-hidden DialogContent pt-12"
        >
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
                        class="resize-none text-[16px]"
                        rows="2"
                    />
                </div>
            </DialogHeader>

            <div v-if="editableRecipe" class="py-4 flex flex-col">
                <!-- Recipe image section -->
                <div class="mb-8 overflow-hidden">
                    <div class="flex flex-col md:flex-row">
                        <!-- Image Preview -->
                        <div
                            class="relative md:w-1/2 aspect-[4/3] bg-slate-100 dark:bg-slate-700/50"
                        >
                            <div
                                v-if="
                                    editableRecipe.images &&
                                    editableRecipe.images[0]
                                "
                                class="relative h-full w-full group"
                            >
                                <img
                                    :src="editableRecipe.images[0]"
                                    :alt="editableRecipe.title"
                                    class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                />
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                                >
                                    <Button
                                        variant="outline"
                                        @click="editableRecipe.images = []"
                                        size="sm"
                                        class="bg-white/90 hover:bg-white text-slate-800 border-white/50 backdrop-blur-sm"
                                    >
                                        <Trash class="h-4 w-4 mr-2" />
                                        Remove Image
                                    </Button>
                                </div>
                            </div>
                            <div
                                v-else
                                class="h-full flex flex-col items-center justify-center p-6 text-center"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="text-slate-300 dark:text-slate-600 mb-3"
                                >
                                    <rect
                                        width="18"
                                        height="18"
                                        x="3"
                                        y="3"
                                        rx="2"
                                        ry="2"
                                    />
                                    <circle cx="9" cy="9" r="2" />
                                    <path
                                        d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
                                    />
                                </svg>
                                <p
                                    class="text-slate-500 dark:text-slate-400 font-medium mb-1"
                                >
                                    No image selected
                                </p>
                                <p
                                    class="text-sm text-slate-400 dark:text-slate-500"
                                >
                                    Add an image URL below
                                </p>
                            </div>
                        </div>

                        <!-- Image URL Input -->
                        <div
                            class="p-6 md:p-8 flex-1 flex flex-col justify-center"
                        >
                            <div class="space-y-4">
                                <div>
                                    <Label
                                        for="imageUrl"
                                        class="text-base font-medium flex items-center gap-2 text-slate-700 dark:text-slate-200 mb-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <rect
                                                width="18"
                                                height="18"
                                                x="3"
                                                y="3"
                                                rx="2"
                                                ry="2"
                                            />
                                            <circle cx="9" cy="9" r="2" />
                                            <path
                                                d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
                                            />
                                        </svg>
                                        Recipe Image
                                    </Label>
                                    <p
                                        class="text-sm text-slate-500 dark:text-slate-400 mb-3"
                                    >
                                        Add a beautiful image to make your
                                        recipe stand out
                                    </p>
                                </div>

                                <div class="flex flex-col sm:flex-row gap-3">
                                    <div class="flex-1">
                                        <Input
                                            id="imageUrl"
                                            v-model="newImageUrl"
                                            placeholder="https://example.com/your-recipe-image.jpg"
                                            @keyup.enter="updateImageUrl"
                                            class="w-full text-[16px]"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        @click="updateImageUrl"
                                        :disabled="!newImageUrl"
                                        class="whitespace-nowrap"
                                    >
                                        <Upload class="h-4 w-4" />
                                    </Button>
                                </div>
                                <p
                                    class="text-xs text-slate-400 dark:text-slate-500"
                                >
                                    Supports JPG, PNG, and WebP formats. Max
                                    file size 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Recipe Details Section -->
                    <div
                        class="bg-white dark:bg-slate-800 rounded-xl dark:border-slate-700 p-6 mb-8"
                    >
                        <h3
                            class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="text-emerald-500"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Recipe Details
                        </h3>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <!-- Servings -->
                            <div
                                class="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-100 dark:border-slate-700"
                            >
                                <Label
                                    for="servings"
                                    class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 block"
                                    >Servings</Label
                                >
                                <div class="flex items-center">
                                    <Input
                                        id="servings"
                                        :model-value="editableRecipe?.servings"
                                        @update:model-value="
                                            (val) => {
                                                if (editableRecipe)
                                                    editableRecipe.servings =
                                                        Number(val);
                                            }
                                        "
                                        type="number"
                                        min="1"
                                        class="w-20 text-center text-lg font-semibold text-slate-800 dark:text-white bg-transparent border-0 p-0"
                                    />
                                    <span
                                        class="ml-2 text-slate-600 dark:text-slate-300"
                                        >servings</span
                                    >
                                </div>
                            </div>

                            <!-- Prep Time -->
                            <div
                                class="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-100 dark:border-slate-700"
                            >
                                <Label
                                    for="prepTime"
                                    class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 block"
                                    >Prep Time</Label
                                >
                                <div class="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="text-emerald-500 mr-2"
                                    >
                                        <path
                                            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"
                                        />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                    <Input
                                        id="prepTime"
                                        :model-value="editableRecipe?.prepTime"
                                        @update:model-value="
                                            (val) => {
                                                if (editableRecipe)
                                                    editableRecipe.prepTime =
                                                        Number(val);
                                            }
                                        "
                                        type="number"
                                        min="0"
                                        class="w-16 text-center text-lg font-semibold text-slate-800 dark:text-white bg-transparent border-0 p-0"
                                    />
                                    <span
                                        class="ml-1 text-slate-600 dark:text-slate-300"
                                        >mins</span
                                    >
                                </div>
                            </div>

                            <!-- Cook Time -->
                            <div
                                class="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-100 dark:border-slate-700"
                            >
                                <Label
                                    for="cookTime"
                                    class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 block"
                                    >Cook Time</Label
                                >
                                <div class="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="text-amber-500 mr-2"
                                    >
                                        <path
                                            d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"
                                        />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                    <Input
                                        id="cookTime"
                                        :model-value="editableRecipe?.cookTime"
                                        @update:model-value="
                                            (val) => {
                                                if (editableRecipe)
                                                    editableRecipe.cookTime =
                                                        Number(val);
                                            }
                                        "
                                        type="number"
                                        min="0"
                                        class="w-16 text-center text-lg font-semibold text-slate-800 dark:text-white bg-transparent border-0 p-0"
                                    />
                                    <span
                                        class="ml-1 text-slate-600 dark:text-slate-300"
                                        >mins</span
                                    >
                                </div>
                            </div>

                            <!-- Total Time (auto-calculated) -->
                            <div
                                class="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-100 dark:border-slate-700"
                            >
                                <div
                                    class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1"
                                >
                                    Total Time
                                </div>
                                <div class="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="text-rose-500 mr-2"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span
                                        class="text-lg font-semibold text-slate-800 dark:text-white"
                                    >
                                        {{
                                            Number(
                                                editableRecipe?.prepTime || 0
                                            ) +
                                                Number(
                                                    editableRecipe?.cookTime ||
                                                        0
                                                ) || '0'
                                        }}
                                        mins
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-5">
                        <!-- Publisher field -->
                        <div class="space-y-1">
                            <Label>Publisher</Label>
                            <Input
                                class="text-[16px]"
                                v-model="publisherString"
                                placeholder="e.g., Italian, Mediterranean"
                            />
                        </div>

                        <!-- Cuisine field -->
                        <div class="space-y-1">
                            <Label>Cuisine (comma-separated)</Label>
                            <Input
                                class="text-[16px]"
                                v-model="cuisineString"
                                placeholder="e.g., Italian, Mediterranean"
                            />
                        </div>

                        <!-- Categories field -->
                        <div class="space-y-1">
                            <Label>Categories (comma-separated)</Label>
                            <Input
                                class="text-[16px]"
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
                        <TabsTrigger value="ingredients"
                            >Ingredients</TabsTrigger
                        >
                        <TabsTrigger value="instructions"
                            >Instructions</TabsTrigger
                        >
                    </TabsList>

                    <!-- Overview Tab -->
                    <TabsContent value="overview" class="space-y-4">
                        <!-- Nutrition info section -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <h3 class="font-semibold text-lg">
                                    Nutrition Information
                                </h3>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    @click="
                                        editableRecipe.meta.includesNutrition =
                                            !editableRecipe.meta
                                                .includesNutrition
                                    "
                                >
                                    {{
                                        editableRecipe.meta.includesNutrition
                                            ? 'Hide Nutrition'
                                            : 'Show Nutrition'
                                    }}
                                </Button>
                            </div>

                            <div
                                v-if="editableRecipe.meta.includesNutrition"
                                class="grid grid-cols-2 sm:grid-cols-3 gap-3"
                            >
                                <div
                                    v-for="(
                                        value, key
                                    ) in editableRecipe.nutrition"
                                    :key="key"
                                    class="space-y-1"
                                >
                                    <Label
                                        :for="`nutrition-${key}`"
                                        class="capitalize text-sm"
                                    >
                                        {{ key.replace('Content', '') }}
                                    </Label>
                                    <Input
                                        :id="`nutrition-${key}`"
                                        v-model="editableRecipe.nutrition[key]"
                                        placeholder="e.g., 200 kcal"
                                        class="text-[16px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <!-- Ingredients Tab -->
                    <TabsContent value="ingredients" class="space-y-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold text-lg">Ingredients</h3>
                            <Button
                                size="sm"
                                variant="outline"
                                @click="addIngredient"
                                class="flex items-center gap-1"
                            >
                                <Plus class="h-4 w-4" /> Add Ingredient
                            </Button>
                        </div>

                        <div class="space-y-4">
                            <div
                                v-for="(
                                    ingredient, index
                                ) in editableRecipe.ingredients"
                                :key="index"
                                class="p-3 border rounded-md relative group"
                            >
                                <div
                                    class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
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
                                        <Label
                                            :for="`quantity-${index}`"
                                            class="text-xs"
                                            >Quantity</Label
                                        >
                                        <Input
                                            :id="`quantity-${index}`"
                                            v-model.number="ingredient.quantity"
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            placeholder="e.g., 2"
                                            class="text-[16px]"
                                        />
                                    </div>

                                    <div class="col-span-3">
                                        <Label
                                            :for="`unit-${index}`"
                                            class="text-xs"
                                            >Unit</Label
                                        >
                                        <Input
                                            :id="`unit-${index}`"
                                            v-if="ingredient.unit !== null"
                                            v-model="ingredient.unit"
                                            placeholder="e.g., tsp"
                                            class="text-[16px]"
                                        />
                                        <Input
                                            :id="`unit-${index}-null`"
                                            v-else
                                            @input="
                                                ingredient.unit =
                                                    $event.target.value
                                            "
                                            placeholder="e.g., tsp"
                                            class="text-[16px]"
                                        />
                                    </div>

                                    <div class="col-span-6">
                                        <Label
                                            :for="`ingredient-${index}`"
                                            class="text-xs"
                                            >Ingredient</Label
                                        >
                                        <Input
                                            :id="`ingredient-${index}`"
                                            v-if="ingredient.name !== null"
                                            v-model="ingredient.name"
                                            placeholder="e.g., Salt"
                                            class="text-[16px]"
                                        />
                                        <Input
                                            :id="`ingredient-${index}-null`"
                                            v-else
                                            @input="
                                                ingredient.name =
                                                    $event.target.value
                                            "
                                            placeholder="e.g., Salt"
                                            class="text-[16px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div
                                v-if="editableRecipe.ingredients.length === 0"
                                class="text-center py-8 text-slate-500"
                            >
                                <p>
                                    No ingredients added yet. Click the button
                                    above to add one.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <!-- Instructions Tab -->
                    <TabsContent value="instructions" class="space-y-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold text-lg">Instructions</h3>
                            <Button
                                size="sm"
                                variant="outline"
                                @click="addInstruction"
                                class="flex items-center gap-1"
                            >
                                <Plus class="h-4 w-4" /> Add Step
                            </Button>
                        </div>

                        <div class="space-y-4">
                            <div
                                v-for="(
                                    instruction, index
                                ) in editableRecipe.instructions"
                                :key="index"
                                class="p-3 border rounded-md relative group"
                            >
                                <div
                                    class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
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
                                    <div
                                        class="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold mt-1"
                                    >
                                        {{ index + 1 }}
                                    </div>
                                    <Textarea
                                        v-if="
                                            editableRecipe.instructions[
                                                index
                                            ] !== null
                                        "
                                        v-model="
                                            editableRecipe.instructions[index]
                                        "
                                        placeholder="Describe this step..."
                                        class="flex-grow resize-none text-[16px]"
                                        rows="2"
                                    />
                                    <Textarea
                                        v-else
                                        @input="
                                            editableRecipe.instructions[index] =
                                                $event.target.value
                                        "
                                        placeholder="Describe this step..."
                                        class="flex-grow resize-none text-[16px]"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div
                                v-if="editableRecipe.instructions.length === 0"
                                class="text-center py-8 text-slate-500"
                            >
                                <p>
                                    No instructions added yet. Click the button
                                    above to add a step.
                                </p>
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
                    <span
                        v-else
                        class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    ></span>
                    {{ isSaving ? 'Saving...' : 'Save Recipe' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
