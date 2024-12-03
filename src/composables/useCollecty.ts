import { ref, watch, computed } from 'vue'

interface CollectyItem {
  id: string
  path: string
  timestamp: number
}

// Создаем глобальное состояние вне функции
const STORAGE_KEY = 'ui-collection'
const globalCollection = ref<CollectyItem[]>([])
let isInitialized = false

export function useCollecty() {
  const loadCollection = () => {
    if (isInitialized) {
      console.log('Collection already initialized')
      return
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const items = JSON.parse(saved) as CollectyItem[]
        console.log('Loading collection:', items)
        globalCollection.value = items
      }
    } catch (error) {
      console.error('Failed to load collection:', error)
      globalCollection.value = []
    }
    isInitialized = true
  }

  const saveCollection = () => {
    console.log('Saving collection:', globalCollection.value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalCollection.value))
  }

  watch(
    globalCollection,
    () => {
      saveCollection()
    },
    { deep: true }
  )

  const isInCollection = (id: string): boolean => {
    const exists = globalCollection.value.some(item => item.id === id)
    console.log(`Checking if ${id} is in collection:`, exists)
    return exists
  }

  const addToCollection = (id: string, path: string) => {
    console.log('Current collection:', [...globalCollection.value])
    console.log(`Adding to collection:`, { id, path })

    if (!isInCollection(id)) {
      globalCollection.value = [
        ...globalCollection.value,
        {
          id,
          path,
          timestamp: Date.now()
        }
      ]
      console.log('Collection after add:', [...globalCollection.value])
    } else {
      console.log(`Item ${id} already exists in collection`)
    }
  }

  const removeFromCollection = (id: string) => {
    console.log('Current collection:', [...globalCollection.value])
    console.log(`Removing from collection: ${id}`)
    
    globalCollection.value = globalCollection.value.filter(item => item.id !== id)
    console.log('Collection after remove:', [...globalCollection.value])
  }

  const clearCollection = () => {
    console.log('Clearing collection')
    globalCollection.value = []
    saveCollection()
  }

  // Загружаем коллекцию только при первой инициализации
  loadCollection()

  return {
    collection: computed(() => globalCollection.value),
    isInCollection,
    addToCollection,
    removeFromCollection,
    clearCollection
  }
} 