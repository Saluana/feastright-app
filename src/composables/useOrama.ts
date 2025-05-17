import { create, insertMultiple, search, Orama } from '@orama/orama'
import { getHistory, getRecipeEmbeddings } from './useDexie'
import { isOnline } from './useState'
import { getTextEmbedding } from './useEmbeddings'


const onlineSchema = {
    recipeId: 'number',
    title: 'string',
    embedding: 'vector[512]',
} as const

const offlineSchema = {
    recipeId: 'number',
    title: 'string',
} as const


async function createSearchDatabaseOnline (){
    const db = create({
        schema: onlineSchema
    })

    const embeddings = await getRecipeEmbeddings()

    const searchData = embeddings.map((embedding) => {
        return {
            recipeId: embedding.recipeId,
            title: embedding.title,
            embedding: embedding.embedding
        }
    })

    await insertMultiple(db, searchData)
    return db
}

async function createSearchDatabaseOffline () {
    const db = create({
        schema: offlineSchema
    })

    const history = await getHistory()

    const searchData = history.map((history) => {
        return {
            recipeId: history.recipeId,
            title: history.title,
        }
    })

    await insertMultiple(db, searchData)
    return db
}

export async function createSearchDatabase () {
    if (isOnline.value) {
        return createSearchDatabaseOnline()
    } else {
        return createSearchDatabaseOffline()
    }
}

export const makeSearch = async (text: string, type: 'hybrid' | 'text', db: Orama<typeof onlineSchema | typeof offlineSchema>) => {
    if (type === 'hybrid') {
        const embedding = await getTextEmbedding(text);
       return search(db, {
            mode: 'hybrid',
            term: text,
            vector: {
              value: embedding.embedding,
              property: 'embedding',
            },
            similarity: 0.8,      // Minimum vector search similarity. Defaults to `0.8`
            includeVectors: false,  // Defaults to `false`
            limit: 25,             // Defaults to `10`
            offset: 0,             // Defaults to `0`
          })
    } else {
        return search(db, {
            term: text,
            limit: 25,
            offset: 0,
          });
    }
}