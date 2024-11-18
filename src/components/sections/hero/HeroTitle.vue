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
    :is="props.as || 'h1'"
    :class="cn(
      'text-4xl font-bold tracking-tight text-foreground dark:text-foreground sm:text-5xl md:text-6xl lg:text-7xl',
      props.class
    )"
  >
    <slot />
  </component>
</template> 