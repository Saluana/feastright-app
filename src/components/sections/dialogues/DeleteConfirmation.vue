<script setup lang="ts">
import Modal from '@/components/sections/modal/modal.vue'
import { Button } from '@/components/ui/button'
import { AlertTriangleIcon, TrashIcon } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{
  open?: boolean
  title: string
  description: string
  deleteButtonText?: string
  cancelButtonText?: string
}>()

const emit = defineEmits(['update:open', 'confirm', 'cancel'])

const isLoading = ref(false)

const handleConfirm = async () => {
  isLoading.value = true
  try {
    emit('confirm')
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:open', false)
}
</script>

<template>
  <Modal
    :open="open"
    :title="title"
    :description="description"
    @update:open="$emit('update:open', $event)"
  >
    <div class="flex flex-col space-y-4">
      <div class="flex items-start space-x-4 p-4 rounded-md bg-destructive/10 border border-destructive/20">
        <AlertTriangleIcon class="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div class="text-sm text-destructive">
          <p class="font-medium">Warning: This action cannot be undone</p>
          <p class="mt-1">Once deleted, the collection and its organization will be permanently lost.</p>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          variant="outline"
          @click="handleCancel"
          :disabled="isLoading"
        >
          {{ props.cancelButtonText || 'Cancel' }}
        </Button>
        <Button
          variant="destructive"
          @click="handleConfirm"
          :disabled="isLoading"
          class="gap-1"
        >
          <TrashIcon v-if="!isLoading" class="h-4 w-4" />
          <span v-if="isLoading" class="inline-block animate-spin mr-1">↻</span>
          {{ isLoading ? 'Deleting...' : (props.deleteButtonText || 'Delete') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
