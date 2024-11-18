<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import Section from '@/components/layout/Section.vue'
import Container from '@/components/layout/Container.vue'
import { heroVariants } from './variants'

interface Props {
  align?: 'left' | 'center' | 'right'
  size?: 'sm' | 'md' | 'lg'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  align: 'center',
  size: 'lg'
})
</script>

<template>
  <Section :class="cn(heroVariants({ align: props.align, size: props.size }), props.class)">
    <Container>
      <slot />
    </Container>
  </Section>
</template> 