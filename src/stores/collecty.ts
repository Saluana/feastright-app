import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

interface CollectionItem {
  id: string
  content: string
  path: string
  timestamp: number
}

export const useCollectyStore = defineStore('collecty', () => {
  const collection = ref<CollectionItem[]>([])

  // Загружаем сохраненную коллекцию при инициализации
  const loadCollection = () => {
    try {
      const saved = localStorage.getItem('ui-collection')
      if (saved) {
        collection.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading collection:', error)
      collection.value = []
    }
  }

  // Автоматически сохраняем при изменениях
  watch(
    collection,
    (newCollection) => {
      try {
        localStorage.setItem('ui-collection', JSON.stringify(newCollection))
      } catch (error) {
        console.error('Error saving collection:', error)
      }
    },
    { deep: true }
  )

  const isInCollection = (id: string): boolean => {
    return collection.value.some(item => item.id === id)
  }

  const addToCollection = (item: CollectionItem) => {
    if (!isInCollection(item.id)) {
      collection.value.push(item)
    }
  }

  const removeFromCollection = (id: string) => {
    collection.value = collection.value.filter(item => item.id !== id)
  }

  // Загружаем коллекцию сразу при создании store
  loadCollection()

  return {
    collection,
    isInCollection,
    addToCollection,
    removeFromCollection
  }
}) 