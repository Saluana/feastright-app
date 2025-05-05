<script setup lang="ts">
import Modal from '@/components/sections/modal/modal.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addCollection } from '@/composables/useDexie'
import { PlusIcon, BookmarkIcon, CheckIcon } from '@radix-icons/vue'
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  open?: boolean
  recipeId?: number
}>()

const emit = defineEmits(['update:open', 'collection-created'])

const collectionName = ref('')
const isSubmitting = ref(false)
const nameError = ref('')
const successMessage = ref('')

watch([collectionName, isSubmitting, successMessage], () => {
  console.log('collectionName:', collectionName.value)
  console.log('isValid:', isValid.value)
  console.log('isSubmitting:', isSubmitting.value)
  console.log('successMessage:', successMessage.value)
})

const recipes = computed(() => {
  return props.recipeId ? [props.recipeId] : []
})

const isValid = computed(() => {
  return collectionName.value.trim().length > 0
})

const resetForm = () => {
  collectionName.value = ''
  nameError.value = ''
  successMessage.value = ''
  isSubmitting.value = false
}

const handleSubmit = async () => {
  if (!isValid.value) {
    nameError.value = 'Please enter a collection name'
    return
  }
  
  isSubmitting.value = true
  nameError.value = ''
  successMessage.value = ''
  
  try {
    await addCollection({
      name: collectionName.value.trim(),
      recipes: recipes.value,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    successMessage.value = `"${collectionName.value}" has been created successfully.`
    
    // Emit event and close dialog after a short delay to show success message
    setTimeout(() => {
      emit('collection-created')
      emit('update:open', false)
      resetForm()
    }, 1500)
  } catch (error) {
    console.error('Error creating collection:', error)
    nameError.value = 'Failed to create collection. Please try again.'
    isSubmitting.value = false
  }
}
</script>

<template>
  <Modal
    :open="open"
    title="Create New Collection"
    description="Create a new collection to organize your favorite recipes."
    @update:open="$emit('update:open', $event)"
  >
    <template #trigger-content>
      <slot name="trigger">
        <Button variant="outline" size="sm" class="gap-1">
          <PlusIcon class="h-4 w-4" />
          New Collection
        </Button>
      </slot>
    </template>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-2">
        <Label for="collection-name" class="text-sm font-medium">Collection Name</Label>
        <div class="relative">
          <BookmarkIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="collection-name"
            v-model="collectionName"
            placeholder="My Favorite Recipes"
            class="pl-9"
            :class="{ 'border-destructive': nameError }"
            autofocus
          />
        </div>
        <p v-if="nameError" class="text-sm text-destructive">{{ nameError }}</p>
      </div>
      
      <div v-if="successMessage" class="rounded-md bg-green-50 dark:bg-green-950 p-3 text-sm border border-green-200 dark:border-green-800">
        <p class="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckIcon class="h-4 w-4" />
          {{ successMessage }}
        </p>
      </div>
      
      <div v-if="props.recipeId" class="rounded-md bg-muted/50 p-3 text-sm">
        <p class="flex items-center gap-2 text-muted-foreground">
          <BookmarkIcon class="h-4 w-4" />
          This recipe will be added to your new collection.
        </p>
      </div>
    </form>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          variant="outline"
          @click="$emit('update:open', false)"
          :disabled="isSubmitting || successMessage"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          @click="handleSubmit"
          :disabled="!isValid "
          :class="{ 'opacity-70': isSubmitting }"
        >
          <span v-if="isSubmitting" class="inline-block animate-spin mr-2">↻</span>
          {{ isSubmitting ? 'Creating...' : 'Create Collection' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>