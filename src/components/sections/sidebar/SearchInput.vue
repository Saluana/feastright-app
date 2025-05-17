<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { Search } from 'lucide-vue-next';
import { createSearchDatabase } from '@/composables/useOrama';
import { isOnline } from '@/composables/useState';
import { makeSearch } from '@/composables/useOrama';

const database = ref<Awaited<ReturnType<typeof createSearchDatabase>> | null>(null);
const dbType = ref<'hybrid' | 'text'>('hybrid')
const searchQuery = ref('');

const emit = defineEmits(['onSearch', 'onChange'])

const handleFocus = async () => {
    if (isOnline.value) {
        dbType.value = 'hybrid';
        console.log('hybrid')
    } else {
        dbType.value = 'text';
        console.log('text')
    }
    
    database.value = await createSearchDatabase();
    console.log(database.value)
};

const handleBlur = () => {
    database.value = null;
    console.log(database.value)
}

const performSearch = async () => {
    if (!searchQuery.value.trim()) return;
    
    if (dbType.value === 'hybrid') {
        const results = await makeSearch(searchQuery.value, 'hybrid', database.value!)
        if (!results) return

        console.log(results)

        const response = results.hits.map((hit) => {
            return {
                recipeId: hit.document.recipeId,
                title: hit.document.title,
            }
        })

        emit('onSearch', response)
    } else {
        const results = await makeSearch(searchQuery.value, 'text', database.value!)
        console.log(results)
        if (!results) return
        const response = results.hits.map((hit) => {
            return {
                recipeId: hit.document.recipeId,
                title: hit.document.title,
            }
        })
        emit('onSearch', response)
    }
};

// Create a debounced version of the search function
const debouncedSearch = useDebounceFn(performSearch, 300);

// Watch for changes in searchQuery and trigger the debounced search
watch(searchQuery, () => {
    debouncedSearch();
    emit('onChange', searchQuery.value)
});
</script>

<template>
            <div class="relative w-full group">
          <input
            type="search"
            class="w-full h-10 pl-10 pr-4 rounded-lg border border-border/60 bg-gradient-to-b from-white/5 to-white/10 dark:from-black/5 dark:to-black/10 backdrop-blur-sm text-sm font-medium placeholder:text-muted-foreground/80 shadow-sm transition-all duration-200 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-border"
            placeholder="Search recipes..."
            autocomplete="off"
            v-model="searchQuery"
            @focus="handleFocus"
            @blur="handleBlur"
          />
          
          <!-- Search icon visually inside the input -->
          <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-all duration-200 group-focus-within:text-emerald-500">
            <Search class="h-4 w-4 text-muted-foreground transition-colors duration-200" />
          </div>
          
          <div class="absolute inset-0 bg-emerald-500/5 rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none group-focus-within:opacity-100"></div>
          
          <!-- Subtle badge indicator in the corner when focused -->
          <div class="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500 opacity-0 scale-0 transition-all duration-200 transform -translate-y-1/2 translate-x-1/2 group-focus-within:opacity-100 group-focus-within:scale-100"></div>
        </div>
</template>