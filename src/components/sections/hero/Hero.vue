<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import Section from '@/components/layout/Section.vue'
import { heroVariants } from './variants'

interface Props {
  align?: 'left' | 'center' | 'right'
  layout?: 'default' | 'split' | 'splitBox' | 'centered' | 'asymmetric'
  container?: 'none' | 'box' | 'full'
  height?: 'auto' | 'screen' | 'large' | 'medium' | 'nav'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  align: 'center',
  layout: 'default',
  container: 'full',
  height: 'medium',
  spacing: 'none'
})
</script>

<template>
  <Section 
    :class="cn(
      heroVariants({ 
        align: props.align,
        height: props.height,
        spacing: props.spacing 
      }), 
      'flex flex-col',
      props.class
    )"
  >
    <div :class="cn(
      heroVariants({ 
        container: props.container,
        layout: props.layout 
      }),
      'flex-1'
    )">
      <slot />
    </div>
  </Section>
</template> 