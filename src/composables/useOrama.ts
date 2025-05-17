import { create, insertMultiple, search } from '@orama/orama'
import { getHistory, getRecipeEmbeddings } from './useDexie'
import { isOnline } from './useState'

async function createSearchDatabaseOnline () {
    const db = create({
        schema: {
          title: 'string',        
          embedding: 'vector[512]', 
        }
      })

      const embeddings = await getRecipeEmbeddings()

      const searchData = embeddings.map((embedding) => {
        return {
            title: embedding.title,
            embedding: embedding.embedding
        }
      })

      insertMultiple(db, searchData)

      return db
}

async function createSearchDatabaseOffline () {
    const db = create({
        schema: {
          title: 'string',        
        }
      })

      const history = await getHistory()

      const searchData = history.map((history) => {
        return {
            title: history.title,
        }
      })

      insertMultiple(db, searchData)

      return db
}

export async function createSearchDatabase () {
    if (isOnline.value) {
        return createSearchDatabaseOnline()
    } else {
        return createSearchDatabaseOffline()
    }
}


/*
const results = search(db, {
  mode: 'hybrid',
  term: 'The Prestige',
  vector: {
    value: [0.938292, 0.284961, 0.248264, 0.748276, 0.264720],
    property: 'embedding',
  },
  similarity: 0.85,      // Minimum vector search similarity. Defaults to `0.8`
  includeVectors: true,  // Defaults to `false`
  limit: 10,             // Defaults to `10`
  offset: 0,             // Defaults to `0`
})*/