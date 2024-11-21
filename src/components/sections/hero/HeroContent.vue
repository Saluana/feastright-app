<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'

const contentVariants = cva(
  'flex flex-col text-foreground',
  {
    variants: {
      align: {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right'
      },
      spacing: {
        none: 'gap-0',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6'
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-8 md:p-12',
        lg: 'p-8 md:p-12 lg:p-16'
      },
      width: {
        auto: '',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'w-full'
      }
    },
    defaultVariants: {
      align: 'center',
      spacing: 'md',
      padding: 'none',
      width: 'auto'
    }
  }
)

interface Props {
  class?: HTMLAttributes['class']
  align?: 'left' | 'center' | 'right'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  width?: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'center',
  spacing: 'md',
  padding: 'none',
  width: 'auto'
})

defineExpose({
  contentVariants
})
</script>

<template>
  <div :class="cn(contentVariants({ align: props.align, spacing: props.spacing, padding: props.padding, width: props.width }), props.class)">
    <slot />
  </div>
</template> 