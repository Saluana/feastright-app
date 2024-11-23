<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { blogVariants } from './variants'
import Section from '@/components/layout/Section.vue'

interface Props {
  class?: HTMLAttributes['class']
  layout?: 'default' | 'grid' | 'featured' | 'list'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  columns?: 1 | 2 | 3 | 4
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'grid',
  padding: 'md',
  columns: 3
})
</script>

<template>
  <Section>
    <div 
      :class="cn(
        blogVariants({ 
          layout: props.layout,
          padding: props.padding,
          columns: props.columns
        }),
        props.class
      )"
    >
      <slot />
    </div>
  </Section>
</template> 