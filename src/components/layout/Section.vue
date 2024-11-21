<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const sectionVariants = cva(
  'relative w-full',
  {
    variants: {
      spacing: {
        none: '',
        sm: 'py-8 md:py-12',
        md: 'py-12 md:py-16',
        lg: 'py-16 md:py-24',
        xl: 'py-24 md:py-32'
      },
      background: {
        none: '',
        light: 'bg-muted/50 dark:bg-muted/10',
        dark: 'bg-muted dark:bg-muted/20'
      }
    },
    defaultVariants: {
      spacing: 'none',
      background: 'none'
    }
  }
)

type SectionVariants = VariantProps<typeof sectionVariants>

interface Props extends /* @vue-ignore */ SectionVariants {
  class?: HTMLAttributes['class']
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  as: 'section'
})

defineExpose({
  sectionVariants
})
</script>

<template>
  <component
    :is="props.as"
    :class="cn(sectionVariants({ spacing: props.spacing, background: props.background }), props.class)"
  >
    <slot />
  </component>
</template>