<script setup lang="ts">
import { ref } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    PlusCircle,
    FileText,
    Image,
    X,
    UploadCloud,
    Loader2,
} from 'lucide-vue-next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { getRecipeFromText, getRecipeFromImage } from '@/composables/useManualRecipeEntry';
import { type Recipe } from '@/types/Recipe';
import PreviewRecipe from './PreviewRecipe.vue';
import { isOnline } from '@/composables/useState';

const { toast } = useToast();
const activeTab = ref('text');
const recipeText = ref('');
const recipeName = ref('');
const recipeImage = ref<File | null>(null);
const previewImage = ref<string | null>(null);
const isSubmitting = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Method to trigger file input click
const triggerFileInput = () => {
    if (fileInputRef.value) {
        fileInputRef.value.click();
    }
};
const isPreviewOpen = ref(false);
const processedRecipe = ref<Recipe | null>(null);

// Props and emits for dialog control
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

// Handle image upload
const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        recipeImage.value = input.files[0];
        previewImage.value = URL.createObjectURL(input.files[0]);
    }
};

// Clear the image
const clearImage = () => {
    recipeImage.value = null;
    previewImage.value = null;
    if (fileInputRef.value) fileInputRef.value.value = '';
};

// Submit the recipe
const submitRecipe = async () => {
    try {
        isSubmitting.value = true;

        if (activeTab.value === 'text' && !recipeText.value.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter your recipe text',
                variant: 'destructive',
            });
            return;
        }

        if (activeTab.value === 'image' && !recipeImage.value) {
            toast({
                title: 'Error',
                description: 'Please upload a recipe image',
                variant: 'destructive',
            });
            return;
        }

        // Process recipe based on input method
        if (activeTab.value === 'text') {
            // Add recipe name if provided
            const finalText = recipeName.value 
                ? `${recipeName.value}\n\n${recipeText.value}` 
                : recipeText.value;
                
            const recipe = await getRecipeFromText(finalText);
            processedRecipe.value = recipe;
            isPreviewOpen.value = true; // Open preview dialog
        } else if (activeTab.value === 'image' && recipeImage.value) {
            console.log(recipeImage.value)
            const recipe = await getRecipeFromImage(recipeImage.value);
            processedRecipe.value = recipe;
            isPreviewOpen.value = true; // Open preview dialog
        }
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to process recipe',
            variant: 'destructive',
        });
        console.error(error);
    } finally {
        isSubmitting.value = false;
    }
};

// Reset form after successful submission or cancellation
const resetForm = () => {
    recipeText.value = '';
    recipeName.value = '';
    recipeImage.value = null;
    previewImage.value = null;
    processedRecipe.value = null;
};

// Create a blank recipe template for manual entry
const createBlankRecipe = (): Recipe => {
    return {
        title: '',
        images: [],
        url: '',
        description: '',
        publisher: '',
        servings: 1,
        prepTime: 0,
        cookTime: 0,
        totalTime: 0,
        cuisine: [],
        categories: [],
        nutrition: {},
        ingredients: [
            { name: '', quantity: '', unit: '' }
        ],
        instructions: [''],
        ratings: { ratingValue: '0', ratingCount: '0' },
        meta: {
            includesFullRecipe: true,
            includesImage: false,
            includesNutrition: false,
            includesVideo: false
        },
        favicon: '',
        hostUrl: ''
    };
};

// Open the preview with a blank recipe for manual entry
const openManualEntry = () => {
    processedRecipe.value = createBlankRecipe();
    isPreviewOpen.value = true;
};

// Handle when user wants to edit the recipe
const handleEditRecipe = () => {
    isPreviewOpen.value = false;
    // Keep the form data for editing
};
</script>

<template>
    <Dialog :open="open" @update:open="(value) => emit('update:open', value)">
        <DialogTrigger as-child v-if="!open">
            <Button class="bg-emerald-600 hover:bg-emerald-700 text-white">
                <PlusCircle class="mr-2 h-5 w-5" />
                Add Recipe
            </Button>
        </DialogTrigger>

        <DialogContent class="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle class="text-2xl font-bold"
                    >Add New Recipe</DialogTitle
                >
                <DialogDescription>
                    Import a recipe by text or upload an image
                </DialogDescription>
            </DialogHeader>

            <div class="py-4">
                <Tabs v-model="activeTab" class="w-full">
                    <TabsList class="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger
                            value="text"
                            class="flex items-center gap-2"
                        >
                            <div class="flex items-center gap-2">
                                <FileText class="h-5 w-5" />
                                Text Input
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="image"
                            class="flex items-center gap-2"
                        >
                            <div class="flex items-center gap-2">
                                <Image class="h-5 w-5" />
                                Image Upload
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    <!-- Text Input Tab -->
                    <TabsContent value="text" class="space-y-4 min-h-[348px]">
                        <div class="space-y-2">
                            <Label for="recipe-name"
                                >Recipe Name (Optional)</Label
                            >
                            <Input
                                id="recipe-name"
                                v-model="recipeName"
                                placeholder="E.g., Grandma's Apple Pie"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="recipe-text">Recipe Details</Label>
                            <Textarea
                                id="recipe-text"
                                v-model="recipeText"
                                placeholder="Paste your recipe text here including ingredients and instructions..."
                                class="min-h-[200px] resize-y"
                            />
                            <p class="text-xs text-muted-foreground">
                                Tip: Include sections for ingredients and
                                instructions for better parsing
                            </p>
                        </div>
                    </TabsContent>

                    <!-- Image Upload Tab -->
                    <TabsContent value="image" class="space-y-4">
                        <div class="space-y-2">
                            <Label for="recipe-name-img"
                                >Recipe Name (Optional)</Label
                            >
                            <Input
                                id="recipe-name-img"
                                v-model="recipeName"
                                placeholder="E.g., Grandma's Apple Pie"
                            />
                        </div>

                        <Card class="border-dashed border-2">
                            <CardContent class="pt-6 pb-6">
                                <div
                                    v-if="!previewImage"
                                    class="flex flex-col items-center justify-center space-y-4"
                                >
                                    <div class="rounded-full bg-muted p-4">
                                        <Image class="h-8 w-8" />
                                    </div>
                                    <div
                                        class="flex flex-col items-center text-center"
                                    >
                                        <p class="font-medium">
                                            Upload Recipe Image
                                        </p>
                                        <p
                                            class="text-sm text-muted-foreground"
                                        >
                                            Drag and drop or click to browse
                                        </p>
                                    </div>
                                    <input
                                        ref="fileInputRef"
                                        type="file"
                                        accept="image/*"
                                        class="hidden"
                                        @change="handleImageUpload"
                                    />
                                    <Button
                                        variant="outline"
                                        @click="triggerFileInput"
                                    >
                                        Select Image
                                    </Button>
                                </div>

                                <div
                                    v-else
                                    class="flex flex-col items-center space-y-4"
                                >
                                    <img
                                        :src="previewImage"
                                        alt="Recipe preview"
                                        class="max-h-[200px] rounded-md object-contain"
                                    />
                                    <Button
                                        variant="outline"
                                        @click="clearImage"
                                    >
                                        <X class="mr-2 h-4 w-4" />
                                        Remove Image
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <p class="text-sm text-muted-foreground">
                            We'll extract the recipe details from your image
                            using OCR technology
                        </p>
                    </TabsContent>
                </Tabs>
            </div>

            <DialogFooter>
                <Button variant="outline" class="mr-2" @click="openManualEntry">
                    <FileText class="mr-2 h-5 w-5" />
                    Manual Entry
                </Button>
                <Button
                    @click="submitRecipe"
                    :disabled="isSubmitting || !isOnline"
                    class="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <UploadCloud class="mr-2 h-5 w-5" v-if="!isSubmitting" />
                    <Loader2 class="animate-spin mr-2 h-5 w-5" v-else />
                    {{ isSubmitting ? 'Processing...' : 'Process Recipe' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    <!-- Recipe Preview Dialog -->
    <PreviewRecipe
        :open="isPreviewOpen"
        :recipe="processedRecipe"
        @update:open="(value) => { 
            isPreviewOpen = value; 
            if (!value) emit('update:open', false); // Close parent dialog too when preview is closed
            resetForm();
        }"
        @edit-recipe="handleEditRecipe"
    />
</template>
