<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  as?: string
}>()
</script>

<template>
  <component
    :is="props.as || 'section'"
    :class="cn('py-12 md:py-16 lg:py-24', props.class)"
  >
    <slot />
  </component>
</template> 