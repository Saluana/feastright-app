<script setup lang="ts">
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Recipe } from '@/types/Recipe';
import {
    Clock,
    ExternalLink,
    Star,
    Utensils,
    Clock3,
    Heart,
    Share2,
    Edit,
} from 'lucide-vue-next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { decode } from 'html-entities';
import { useRouter, useRoute } from 'vue-router';
import { onMounted, watch, ref, onUnmounted, computed } from 'vue';
import {
    addFavourite,
    deleteFavouriteByRecipeId,
    db,
    type RecipeData,
    getLiveRecipeById,
} from '@/composables/useDexie';
import LZString from 'lz-string';
import PreviewRecipe from '@/components/sections/dialogues/PreviewRecipe.vue';

interface RecipeCardProps {
    recipe: RecipeData;
    className?: string;
    open?: boolean;
}

const props = defineProps<RecipeCardProps>();
const emit = defineEmits(['update:open']);
const router = useRouter();
const route = useRoute();
const isFavorite = ref(false);
const showCopyNotification = ref(false);
const copyNotificationTimer = ref<number | null>(null);
const showEditDialog = ref(false);
// Initialize liveRecipe with a deep clone of the prop's recipe data
const liveRecipe = ref<RecipeData>(JSON.parse(JSON.stringify(props.recipe)));

// Check if recipe is already a favorite
const checkIfFavorite = async () => {
    if (props.recipe) {
        // Look for a favorite with matching URL
        const favorites = await db.favourites
            .where('url')
            .equals(props.recipe.url)
            .toArray();
        isFavorite.value = favorites.length > 0;
    }
};

// Toggle favorite status
const toggleFavorite = async () => {
    if (props.recipe) {
        if (isFavorite.value && props.recipe.id) {
            console.log('Deleting favorite for recipe', props.recipe.id);
            await deleteFavouriteByRecipeId(props.recipe.id);
        } else {
            console.log('Adding favorite for recipe', props.recipe.id);
            await addFavourite(props.recipe);
        }

        // Update the UI state
        isFavorite.value = !isFavorite.value;
    }
};

// Subscription for live recipe updates
let liveRecipeSubscription: { unsubscribe: () => void } | null = null;

onMounted(() => {
    checkIfFavorite();

    if (props.recipe.id) {
        const liveRecipeObservable = getLiveRecipeById(props.recipe.id);
        liveRecipeSubscription = liveRecipeObservable.subscribe(
            (recipeUpdate?: RecipeData) => {
                if (recipeUpdate) {
                    // Update properties of the existing liveRecipe.value object
                    Object.assign(liveRecipe.value, recipeUpdate);
                    console.log(
                        'Live recipe updated (properties assigned):',
                        liveRecipe.value
                    );
                } else {
                    // Recipe not found in DB (e.g., deleted), revert to initial prop data
                    Object.assign(
                        liveRecipe.value,
                        JSON.parse(JSON.stringify(props.recipe))
                    );
                    console.log(
                        'Live recipe not found, using prop data:',
                        liveRecipe.value
                    );
                }
            }
        );
    } else {
        // For new recipes without an ID, liveRecipe is already initialized from props.recipe
        // No further action needed here unless props.recipe itself could change reactively
        // and needs to be re-cloned into liveRecipe. For now, assuming props.recipe is stable initial data.
        console.log(
            'Using initial recipe from prop (no ID):',
            liveRecipe.value
        );
    }
});

onUnmounted(() => {
    if (liveRecipeSubscription) {
        liveRecipeSubscription.unsubscribe();
        liveRecipeSubscription = null;
    }

    // Reset state
    liveRecipe.value = props.recipe;

    if (copyNotificationTimer.value) {
        clearTimeout(copyNotificationTimer.value);
    }
    isFavorite.value = false;
});

const updateOpen = (value: boolean) => {
    emit('update:open', value);

    // If the modal is being closed, navigate back to the home page
    if (!value) {
        router.push('/');
    }
};

// Update URL when the modal is opened
watch(
    () => props.open,
    (newValue) => {
        if (newValue && props.recipe) {
            // If the modal is opened and we're not already on the recipe route
            if (!route.path.includes('/recipe/')) {
                router.push(`/recipe/${encodeURIComponent(props.recipe.url)}`);
            }

            checkIfFavorite();
        }
    }
);

// Set the route when mounted if the modal is open but URL doesn't reflect it
onMounted(() => {
    if (props.open && props.recipe && !route.path.includes('/recipe/')) {
        router.push(`/recipe/${encodeURIComponent(props.recipe.url)}`);
        checkIfFavorite();
    }
});

onUnmounted(() => {
    isFavorite.value = false;

    // Clear any pending timers
    if (copyNotificationTimer.value) {
        clearTimeout(copyNotificationTimer.value);
    }
});

// Utility to format decimals as beautiful fractions
function formatFraction(value: number | string): string {
    if (typeof value === 'string') value = parseFloat(value);
    if (isNaN(value)) return '';
    // Map of common fractions
    const fractionMap: Record<number, string> = {
        0.25: '¼',
        0.33: '⅓',
        0.333: '⅓',
        0.334: '⅓',
        0.5: '½',
        0.66: '⅔',
        0.667: '⅔',
        0.666: '⅔',
        0.75: '¾',
        0.2: '⅕',
        0.4: '⅖',
        0.6: '⅗',
        0.8: '⅘',
        0.125: '⅛',
        0.375: '⅜',
        0.625: '⅝',
        0.875: '⅞',
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
        return intPart
            ? `${intPart} ${numerator}/${denominator}`
            : `${numerator}/${denominator}`;
    }
    return intPart.toString();
}

function createShareableRecipe() {
    // Compress the recipe data
    const recipeString = LZString.compressToBase64(
        JSON.stringify(props.recipe)
    );

    // Make sure to encode the parameter for URLs
    const encodedRecipeString = encodeURIComponent(recipeString);

    // Create a full URL including the protocol, hostname, and port
    const fullUrl = `${window.location.origin}/share/${encodedRecipeString}`;

    // Copy to clipboard
    navigator.clipboard.writeText(fullUrl).then(() => {
        // Show the notification
        showCopyNotification.value = true;

        // Clear any existing timer
        if (copyNotificationTimer.value) {
            clearTimeout(copyNotificationTimer.value);
        }

        // Set a timer to hide the notification after 2 seconds
        copyNotificationTimer.value = setTimeout(() => {
            showCopyNotification.value = false;
            copyNotificationTimer.value = null;
        }, 2000) as unknown as number;
    });
}
</script>

<template>
    <Dialog class="rounded-none" :open="open" @update:open="updateOpen">
        <DialogContent
            class="DialogContent px-0 h-screen w-screen md:min-w-[90vw] md:min-h-[99vh] md:max-w-[90vw] md:max-h-[90vh] rounded-none flex flex-col items-center overflow-y-auto scrollbar-thin pt-8"
        >
            <DialogHeader class="pb-4">
                <DialogTitle
                    class="hidden text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-center"
                >
                    {{ decode(liveRecipe?.title) }}
                </DialogTitle>
                <DialogDescription class="hidden">
                    Detailed recipe information for "{{
                        decode(liveRecipe?.title)
                    }}".
                </DialogDescription>
            </DialogHeader>

            <Card
                class="w-full"
                :class="[
                    'max-w-[840px] h-auto rounded-xl border-none',
                    'bg-gradient-to-b from-background to-background/80',
                    'shadow-[0_8px_30px_rgb(0,0,0,0.08)]',
                    'transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
                    props.className,
                ]"
            >
                <!-- Hero image with overlaid information -->
                <div
                    class="relative overflow-hidden rounded-t-xl"
                    style="min-height: 360px"
                >
                    <div class="absolute inset-0">
                        <img
                            :src="
                                liveRecipe?.images &&
                                liveRecipe.images.length > 0
                                    ? liveRecipe.images[0]
                                    : '/recipe-placeholder.webp'
                            "
                            :alt="liveRecipe?.title"
                            class="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                            loading="lazy"
                        />
                    </div>
                    <!-- Gradient overlay for text readability that preserves image visibility -->
                    <div
                        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"
                    ></div>

                    <!-- Content overlay -->
                    <div
                        class="absolute inset-0 flex flex-col justify-end p-6 text-white"
                    >
                        <!-- Extra text background gradient for better readability -->
                        <div
                            class="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"
                        ></div>
                        <!-- Title & Rating -->
                        <div
                            class="space-y-2 mb-3 mr-[140px] sm:mr-[160px] md:mr-[180px]"
                        >
                            <h2
                                class="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md"
                            >
                                {{ decode(liveRecipe?.title) }}
                            </h2>
                            <div
                                v-if="
                                    liveRecipe?.ratings &&
                                    liveRecipe.ratings.ratingValue
                                "
                                class="flex items-center gap-0.5"
                            >
                                <template v-for="(_, i) in Array(5)" :key="i">
                                    <Star
                                        :size="20"
                                        :class="[
                                            'transition-all duration-300 filter drop-shadow-md',
                                            i <
                                            Math.round(
                                                parseFloat(
                                                    liveRecipe?.ratings
                                                        .ratingValue
                                                )
                                            )
                                                ? 'fill-yellow-300 text-yellow-300'
                                                : 'text-gray-300',
                                        ]"
                                    />
                                </template>
                                <span
                                    class="ml-2 text-sm font-bold text-white drop-shadow-md"
                                >
                                    {{ liveRecipe?.ratings.ratingValue }}
                                    <span
                                        v-show="liveRecipe?.ratings.ratingCount"
                                        >({{
                                            liveRecipe?.ratings.ratingCount
                                        }})</span
                                    >
                                </span>
                            </div>
                        </div>

                        <!-- Meta badges -->
                        <div class="relative flex flex-wrap gap-2 mb-4">
                            <Badge
                                v-if="liveRecipe?.publisher"
                                class="bg-primary text-white border-none text-sm py-1 px-3 font-semibold shadow-lg"
                            >
                                {{ decode(liveRecipe?.publisher) }}
                            </Badge>
                            <Badge
                                v-if="liveRecipe?.servings"
                                class="bg-black/75 text-white border-none text-sm py-1 px-3 font-semibold shadow-lg gap-1.5"
                            >
                                <Utensils class="h-4 w-4" />
                                {{ liveRecipe?.servings }} servings
                            </Badge>
                            <Badge
                                v-if="liveRecipe?.totalTime"
                                class="bg-black/75 text-white border-none text-sm py-1 px-3 font-semibold shadow-lg gap-1.5"
                            >
                                <Clock class="h-4 w-4" />
                                {{ liveRecipe?.totalTime }} min total
                            </Badge>
                            <Badge
                                v-if="
                                    liveRecipe?.prepTime && liveRecipe?.cookTime
                                "
                                class="bg-black/75 text-white border-none text-sm py-1 px-3 font-semibold shadow-lg gap-1.5"
                            >
                                <Clock3 class="h-4 w-4" />
                                {{ liveRecipe?.prepTime }}+{{
                                    liveRecipe?.cookTime
                                }}
                                min
                            </Badge>
                            <Badge
                                v-if="
                                    liveRecipe?.cuisine &&
                                    liveRecipe?.cuisine.length > 0
                                "
                                v-for="c in liveRecipe?.cuisine"
                                :key="c"
                                class="bg-primary text-white border-none text-sm py-1 px-3 font-semibold shadow-lg"
                            >
                                {{ c }}
                            </Badge>
                            <Badge
                                v-if="
                                    liveRecipe?.categories &&
                                    liveRecipe?.categories.length > 0
                                "
                                v-for="c in liveRecipe?.categories"
                                :key="c"
                                class="bg-secondary text-black dark:text-white border-none text-sm py-1 px-3 font-semibold shadow-lg"
                            >
                                {{ c }}
                            </Badge>
                        </div>

                        <!-- Description -->
                        <p
                            v-if="liveRecipe?.description"
                            class="text-sm text-gray-200 leading-snug line-clamp-2 drop-shadow-sm"
                        >
                            {{ decode(liveRecipe?.description) }}
                        </p>

                        <!-- Source link, share, favorite, and edit buttons -->
                        <div
                            class="absolute top-4 right-4 flex flex-wrap gap-1 px-2 sm:gap-2 sm:px-3"
                        >
                            <button
                                @click="toggleFavorite"
                                class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium shadow-md transition-colors"
                                :class="{ 'bg-red-600': isFavorite }"
                            >
                                <Heart
                                    class="h-4 w-4"
                                    :class="{ 'fill-white': isFavorite }"
                                />
                                <span>{{
                                    isFavorite ? 'Saved' : 'Favorite'
                                }}</span>
                            </button>
                            <div class="relative">
                                <button
                                    @click="createShareableRecipe"
                                    class="bg-violet-500 hover:bg-violet-600 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium shadow-md transition-colors"
                                >
                                    <Share2 class="h-4 w-4" />
                                    <span>Share</span>
                                </button>

                                <!-- Copy notification tooltip -->
                                <div
                                    v-show="showCopyNotification"
                                    class="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg z-50 font-medium animate-in fade-in zoom-in-95 duration-300"
                                >
                                    <div class="flex items-center gap-1.5">
                                        <svg
                                            class="h-4 w-4 text-green-500"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M20 6L9 17L4 12"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            />
                                        </svg>
                                        <span>Copied to clipboard!</span>
                                    </div>
                                    <div
                                        class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black/90 rotate-45"
                                    ></div>
                                </div>
                            </div>
                            <a
                                v-if="liveRecipe?.url"
                                :href="liveRecipe?.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium shadow-md transition-colors"
                            >
                                <ExternalLink class="h-3.5 w-3.5" />
                                Source
                            </a>
                            <button
                                @click="showEditDialog = true"
                                class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium shadow-md transition-colors"
                            >
                                <Edit class="h-3.5 w-3.5" />
                                Edit
                            </button>
                        </div>
                    </div>
                </div>

                <CardContent class="py-6 px-2 lg:p-6 space-y-6">
                    <Separator class="my-2" />

                    <!-- Ingredients -->
                    <div class="bg-background/50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 text-primary">
                            Ingredients
                        </h3>
                        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <li
                                v-for="(
                                    { name, quantity, unit }, idx
                                ) in liveRecipe?.ingredients"
                                :key="idx"
                                class="flex items-center gap-3"
                            >
                                <span
                                    class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs"
                                >
                                    {{ idx + 1 }}
                                </span>
                                <span>
                                    <span class="font-medium">{{
                                        formatFraction(quantity)
                                    }}</span>
                                    {{ unit?.trim() || '' }}
                                    <span class="text-muted-foreground">{{
                                        name
                                    }}</span>
                                </span>
                            </li>
                        </ul>
                    </div>

                    <!-- Instructions -->
                    <div class="bg-background/50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 text-primary">
                            Instructions
                        </h3>
                        <ol class="space-y-4">
                            <li
                                v-for="(step, idx) in liveRecipe?.instructions"
                                :key="idx"
                                class="flex gap-4 pb-4 border-b border-border/40 last:border-0 last:pb-0"
                            >
                                <span
                                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium"
                                >
                                    {{ idx + 1 }}
                                </span>
                                <span class="leading-relaxed">{{
                                    decode(step)
                                }}</span>
                            </li>
                        </ol>
                    </div>

                    <!-- Nutrition -->
                    <div
                        v-if="
                            liveRecipe?.nutrition &&
                            Object.keys(liveRecipe?.nutrition).length > 0
                        "
                        class="bg-background/50 p-4 rounded-lg"
                    >
                        <h3 class="text-lg font-semibold mb-3 text-primary">
                            Nutrition (per serving)
                        </h3>
                        <div
                            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                        >
                            <template
                                v-for="[k, v] in Object.entries(
                                    liveRecipe?.nutrition
                                )"
                                :key="k"
                            >
                                <div
                                    v-if="v"
                                    class="bg-background rounded p-3 shadow-sm"
                                >
                                    <span
                                        class="block text-xs text-muted-foreground capitalize mb-1"
                                    >
                                        {{ decode(k.replace(/Content$/i, '')) }}
                                    </span>
                                    <span class="text-lg font-medium">{{
                                        decode(v)
                                    }}</span>
                                </div>
                            </template>
                        </div>
                    </div>
                </CardContent>

                <CardFooter class="p-6 pt-0 flex justify-end">
                    <a
                        v-if="liveRecipe?.url"
                        :href="liveRecipe?.url"
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

    <!-- Edit Recipe Dialog -->
    <PreviewRecipe v-model:open="showEditDialog" :recipe="liveRecipe" />
</template>

<style>
/* Specific styles for the dialog content */
.DialogContent::-webkit-scrollbar {
    width: 8px;
}

.DialogContent::-webkit-scrollbar-track {
    background: transparent;
}

.DialogContent::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50px;
}

.DialogContent::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

/* Firefox scrollbar */
.DialogContent {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}
</style>
