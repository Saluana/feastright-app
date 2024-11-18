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
    :is="props.as || 'div'"
    :class="cn(
      'mx-auto w-full max-w-screen-xl px-4 md:px-6 lg:px-8',
      props.class
    )"
  >
    <slot />
  </component>
</template> 