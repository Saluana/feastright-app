<script setup lang="ts">
import Modal from '@/components/sections/modal/modal.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCollections, updateCollection, getCollectionById } from '@/composables/useDexie'
import { BookmarkIcon, CheckIcon, PlusIcon, MagnifyingGlassIcon } from '@radix-icons/vue'
import { ref, computed, onMounted, watch } from 'vue'
import NewCollection from './NewCollection.vue'

const props = defineProps<{
  open?: boolean
  recipeId?: number
}>()

const emit = defineEmits(['update:open', 'collection-selected'])

const collections = ref<any[]>([])
const searchQuery = ref('')
const isLoading = ref(true)
const selectedCollectionId = ref<number | null>(null)
const isSubmitting = ref(false)
const successMessage = ref('')
const newCollectionOpen = ref(false)

// Fetch collections when component mounts
onMounted(async () => {
  try {
    collections.value = await getCollections()
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching collections:', error)
    isLoading.value = false
  }
})

// Filter collections based on search query
const filteredCollections = computed(() => {
  if (!searchQuery.value.trim()) {
    return collections.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return collections.value.filter(collection => 
    collection.name.toLowerCase().includes(query)
  )
})

// Handle collection selection
const selectCollection = (collectionId: number) => {
  selectedCollectionId.value = collectionId
}

// Reset the form
const resetForm = () => {
  searchQuery.value = ''
  selectedCollectionId.value = null
  isSubmitting.value = false
  successMessage.value = ''
}

// Handle the submission
const handleSubmit = async () => {
  if (!selectedCollectionId.value || !props.recipeId) {
    return
  }
  
  isSubmitting.value = true
  successMessage.value = ''
  
  try {
    // Get the selected collection
    const collection = await getCollectionById(selectedCollectionId.value)
    
    if (!collection) {
      throw new Error('Collection not found')
    }
    
    // Check if recipe is already in the collection
    if (collection.recipes.includes(props.recipeId)) {
      successMessage.value = 'Recipe is already in this collection.'
      isSubmitting.value = false
      return
    }
    
    // Add the recipe to the collection
    const updatedCollection = {
      ...collection,
      recipes: [...collection.recipes, props.recipeId],
      updatedAt: new Date()
    }
    
    await updateCollection(updatedCollection)
    
    successMessage.value = `Recipe added to "${collection.name}".`
    
    // Emit event and close dialog after a short delay
    setTimeout(() => {
      emit('collection-selected', selectedCollectionId.value)
      emit('update:open', false)
      resetForm()
    }, 1000)
  } catch (error) {
    console.error('Error adding recipe to collection:', error)
    isSubmitting.value = false
  }
}

// Handle new collection created
const handleCollectionCreated = async () => {
  // Refresh collections list
  try {
    collections.value = await getCollections()
    // Select the most recently created collection (last in the array)
    if (collections.value.length > 0) {
      selectedCollectionId.value = collections.value[collections.value.length - 1].id
    }
  } catch (error) {
    console.error('Error refreshing collections:', error)
  }
}
</script>

<template>
  <Modal
    :open="open"
    title="Add to Collection"
    description="Choose a collection to save this recipe."
    @update:open="$emit('update:open', $event)"
  >
    <template #trigger-content>
      <slot name="trigger">
        <Button variant="outline" size="sm" class="gap-1">
          <BookmarkIcon class="h-4 w-4" />
          Add to Collection
        </Button>
      </slot>
    </template>
    
    <div class="space-y-4">
      <!-- Search Bar -->
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search collections..."
          class="pl-9"
          :disabled="isLoading"
        />
      </div>
      
      <!-- Collections List -->
      <div class="max-h-[300px] overflow-y-auto rounded-md border border-border p-1">
        <div v-if="isLoading" class="flex items-center justify-center p-4">
          <div class="animate-spin text-muted-foreground">↻</div>
        </div>
        
        <div v-else-if="filteredCollections.length === 0 && !searchQuery" class="p-4 text-center text-muted-foreground">
          <p>You don't have any collections yet.</p>
          <p class="text-sm">Create your first collection below.</p>
        </div>
        
        <div v-else-if="filteredCollections.length === 0 && searchQuery" class="p-4 text-center text-muted-foreground">
          <p>No collections match your search.</p>
        </div>
        
        <div v-else class="space-y-1">
          <button
            v-for="collection in filteredCollections"
            :key="collection.id"
            @click="selectCollection(collection.id)"
            class="w-full flex items-center px-3 py-2 rounded-md text-left transition-colors"
            :class="{
              'bg-primary text-primary-foreground': selectedCollectionId === collection.id,
              'hover:bg-muted': selectedCollectionId !== collection.id
            }"
          >
            <BookmarkIcon class="h-4 w-4 mr-2" />
            <div class="flex-1 truncate">{{ collection.name }}</div>
            <div v-if="selectedCollectionId === collection.id" class="ml-2">
              <CheckIcon class="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
      
      <!-- Success Message -->
      <div v-if="successMessage" class="rounded-md bg-green-50 dark:bg-green-950 p-3 text-sm border border-green-200 dark:border-green-800">
        <p class="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckIcon class="h-4 w-4" />
          {{ successMessage }}
        </p>
      </div>
      
      <!-- Create New Collection Button -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Can't find what you're looking for?
        </div>
        <NewCollection
          v-model:open="newCollectionOpen"
          :recipe-id="props.recipeId"
          @collection-created="handleCollectionCreated"
        >
          <template #trigger>
            <Button variant="outline" size="sm" class="gap-1">
              <PlusIcon class="h-4 w-4" />
              New Collection
            </Button>
          </template>
        </NewCollection>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          variant="outline"
          @click="$emit('update:open', false)"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          @click="handleSubmit"
          :disabled="!selectedCollectionId || isSubmitting"
          :class="{ 'opacity-70': isSubmitting }"
        >
          <span v-if="isSubmitting" class="inline-block animate-spin mr-2">↻</span>
          {{ isSubmitting ? 'Adding...' : 'Add to Collection' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>