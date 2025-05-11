<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

defineProps<{
  title?: string
  description?: string
  open?: boolean
}>()

const emit = defineEmits(['update:open'])

const updateOpen = (value: boolean) => {
  emit('update:open', value)
}
</script>

<template>
  <Dialog :open="open" @update:open="updateOpen">
    <slot name="trigger">
      <DialogTrigger as-child>
        <slot name="trigger-content"></slot>
      </DialogTrigger>
    </slot>
    <DialogContent class="w-screen h-screen sm:min-w-[550px] sm:h-auto sm:max-w-screen sm:max-h-screen overflow-y-auto overflow-x-hidden">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <div class="py-4 flex flex-col max-w-screen overflow-y-scroll md:overflow-hidden">
        <slot></slot>
      </div>
      <DialogFooter>
        <slot name="footer"></slot>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>