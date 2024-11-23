<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Props {
  class?: HTMLAttributes['class']
  title: string
  description: string
  category?: string
  date?: string
  image?: string
  href?: string
}

const props = defineProps<Props>()

const placeholderLight = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2Q1ZjRkYyIvPjwvc3ZnPg=='
const placeholderDark = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAxMGUwNCIvPjwvc3ZnPg=='
</script>

<template>
  <div :class="cn('group relative overflow-hidden rounded-lg border shadow hover:shadow-xl', props.class)">
    <div class="aspect-video w-full overflow-hidden">
      <img 
        :src="props.image || placeholderLight" 
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 dark:hidden"
        :alt="props.title"
      />
      <img 
        :src="props.image || placeholderDark"
        class="hidden h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 dark:block"
        :alt="props.title"
      />
    </div>
    <div class="absolute inset-0 bg-gradient-to-t from-background/80 to-background/0" />
    <div class="absolute bottom-0 p-6">
      <div class="mb-2 flex items-center gap-2">
        <Badge v-if="props.category" variant="secondary">{{ props.category }}</Badge>
        <span v-if="props.date" class="text-sm text-muted-foreground">{{ props.date }}</span>
      </div>
      <h3 class="mb-2 text-xl font-semibold text-foreground">{{ props.title }}</h3>
      <p class="mb-4 text-sm text-muted-foreground">{{ props.description }}</p>
      <a 
        v-if="props.href"
        :href="props.href"
        class="inline-flex items-center text-sm font-medium text-primary hover:underline"
      >
        Read more
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="ml-1 h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </a>
    </div>
  </div>
</template> 