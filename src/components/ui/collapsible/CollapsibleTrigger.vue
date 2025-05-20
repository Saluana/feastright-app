<script setup lang="ts">
import { CollapsibleTrigger, type CollapsibleTriggerProps } from 'reka-ui'

const props = defineProps<CollapsibleTriggerProps>()
</script>

<template>
  <CollapsibleTrigger class="min-h-[38px] !text-[16px]" v-bind="props">
    <slot />
  </CollapsibleTrigger>
</template>
