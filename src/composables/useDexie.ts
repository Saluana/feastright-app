// db.ts
import Dexie, { type EntityTable, liveQuery } from 'dexie';
import { type Recipe } from '@/types/Recipe';


interface History {
    id?: number;
    recipeId: number;
    url: string;
    title: string;
    createdAt: Date;
}

interface Favourite {
    id?: number;
    recipeId: number;
    title: string;
    url: string;
    createdAt: Date;
}

interface RecipeData extends Recipe {
    id?: number;
}

interface Collections {
    id?: number;
    name: string;
    recipes: number[];
    createdAt: Date;
    updatedAt: Date;
}

interface CollectionWithRecipes {
    id?: number;
    name: string;
    recipes: {id: number, title: string, url: string}[];
    createdAt: Date;
    updatedAt: Date;
}

interface RecipeEmbedding {
    id?: number;
    recipeId: number;
    embedding: number[];
    createdAt: Date;
    updatedAt: Date
}

const db = new Dexie('RecipeDatabase') as Dexie & {
  recipes: EntityTable<RecipeData, 'id'>
  history: EntityTable<History, 'id'>
  favourites: EntityTable<Favourite, 'id'>
  collections: EntityTable<Collections, 'id'>
  embeddings: EntityTable<RecipeEmbedding, 'id'>
};

// Schema declaration:
// Incremented version number due to schema change for 'recipes' table
db.version(3).stores({
  recipes: '++id, title, url, *images, description, publisher, servings, prepTime, cookTime, totalTime, *cuisine, *categories, favicon, hostUrl', // Corrected 'image' to '*images', made 'cuisine' and 'categories' multiEntry, removed complex objects (video, nutrition, ingredients, instructions, ratings, meta) from direct indexing.
  history: '++id, recipeId, url, title, createdAt',
  favourites: '++id, recipeId, title, url, createdAt',
  collections: '++id, name, recipes, createdAt, updatedAt',
  embeddings: '++id, recipeId, embedding, createdAt, updatedAt'
}).upgrade(tx => {
  console.log("Upgrading Dexie schema from version 1 to 2 for 'RecipeDatabase'.");
  // This is a basic upgrade path. If specific data migration for the 'recipes' table
  // (e.g., renaming 'image' to 'images' and moving data) was needed, it would go here.
  // Given the console log showed 'images: Array(0)', it's likely 'image' was an unused or incorrect index.
  // If you had data under an old 'image' field and it should now be 'images',
  // you would need to modify each record: 
  // return tx.table('recipes').toCollection().modify(recipe => {
  //   if (recipe.image && !recipe.images) { // Example: if 'image' was a string
  //     recipe.images = [recipe.image];
  //     delete recipe.image;
  //   }
  // });
});

function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

async function addOrUpdateRecipe(recipe: RecipeData): Promise<number | undefined> {
    // Clone the recipe to ensure we're working with a plain object
    const recipeToSave = clone(recipe);
    
    // If it's a new recipe (no ID), use addRecipe which handles duplicates
    if (!recipeToSave.id) {
        return addRecipe(recipeToSave);
    }
    
    // For existing recipes, use put() which will update the record
    try {
        return await db.recipes.put(recipeToSave);
    } catch (error) {
        console.error("Error updating recipe:", error);
        return undefined;
    }
}

async function addRecipe(recipe: RecipeData): Promise<number | undefined> {
    console.log("[addRecipe] input:", recipe);
    // It's crucial that the object passed to Dexie is a plain JavaScript object.
    // Vue's Proxy objects can sometimes cause issues with ORMs/libraries expecting plain objects.
    // The clone function (JSON.parse(JSON.stringify(obj))) effectively de-proxifies.
    const recipeToAdd = clone(recipe);
    console.log("[addRecipe] cloned data to add:", recipeToAdd);

    if (recipeToAdd.url) {
        console.log("Checking for existing recipe with URL:", recipeToAdd.url);
        const existingRecipe = await getRecipeByURL(recipeToAdd.url);
        console.log("Existing recipe query result:", existingRecipe);
        if (existingRecipe && existingRecipe.length > 0) {
            console.log("Recipe already exists with ID:", existingRecipe[0].id);
            return existingRecipe[0].id;
        }
    }

    console.log("Attempting to add new recipe to Dexie:", recipeToAdd);
    try {
        const newId = await db.recipes.add(recipeToAdd);
        console.log("Recipe added successfully to Dexie with ID:", newId);
        return newId;
    } catch (error) {
        console.error("DexieError: Error adding recipe to db.recipes:", error);
        if (error instanceof Error) {
            console.error("DexieError name:", error.name);
            console.error("DexieError message:", error.message);
            // Dexie errors often have more specific types or 'inner' errors
            if ('inner' in error) {
                 console.error("DexieError inner error:", (error as any).inner);
            }
            if (error.stack) {
                console.error("DexieError stack:", error.stack);
            }
        }
        return undefined;
    }
}

async function addHistory(recipe: RecipeData) {
    if (!recipe.id) {
        throw new Error('Recipe ID is required')
    }

    const doesExist = await db.history.where('recipeId').equals(recipe.id).count()
    if (doesExist > 0) {
        return
    }

   const newId = await db.history.add({
        recipeId: recipe.id,
        url: recipe.url,
        title: recipe.title,
        createdAt: new Date()
    })
    
    return newId
}

async function addOrUpdateHistory(recipe: RecipeData) {
    if (!recipe.id) {
        throw new Error('Recipe ID is required')
    }
    
    const historyItem = {
        recipeId: recipe.id,
        url: recipe.url,
        title: recipe.title,
        createdAt: new Date()
    }
    
    try {
        const existingItem = await db.history.where('recipeId').equals(recipe.id).first()
        
        if (existingItem) {
            // Update existing item with new timestamp
            return await db.history.update(existingItem.id, {
                ...historyItem,
                createdAt: new Date() // Update timestamp to current time
            })
        } else {
            // Add new history item
            return await db.history.add(historyItem)
        }
    } catch (error) {
        console.error("Error updating history:", error)
        throw error
    }
}

async function addFavourite(recipe: RecipeData) {
    if (!recipe.id) {
        throw new Error('Recipe ID is required')
    }

    const doesExist = await db.favourites.where('recipeId').equals(recipe.id).count()
    if (doesExist > 0) {
        return
    }

    const newId = await db.favourites.add({
        recipeId: recipe.id,
        title: recipe.title,
        url: recipe.url,
        createdAt: new Date()
    })

    return newId
}

async function addCollection(collection: Collections) {
    const newId = await db.collections.add(clone(collection))
    return newId
}

async function updateCollection(collection: Collections) {
    if (!collection.id) {
        throw new Error('Collection ID is required')
    }

    const { id, ...changes } = collection
    // Always update the updatedAt field
    changes.updatedAt = new Date()
    await db.collections.update(id, changes)
}

async function getHistory() {
    return db.history.toArray()
}

// Get live history updates
function getLiveHistory() {
    return liveQuery(() => db.history.toArray())
}

async function getFavourites() {
    return db.favourites.toArray()
}

function getLiveFavourites() {
    return liveQuery(() => db.favourites.toArray())
}

async function getCollections() {
    return db.collections.toArray()
}

async function getCollectionById(id: number) {
    return db.collections.get(id)
}

function getLiveCollections() {
    return liveQuery(() => db.collections.toArray())
}

async function getRecipes() {
    return db.recipes.toArray()
}

async function batchGetRecipes(ids: number[]) {
    return db.recipes.bulkGet(ids)
}

async function getRecipeById(id: number) {
    return db.recipes.get(id)
}

function getLiveRecipeById(id: number) {
    return liveQuery(() => db.recipes.get(id))
}

async function getRecipeByURL(url: string) {
    return db.recipes.where('url').equals(url).toArray()
}

async function deleteRecipeById(id: number) {
    return db.transaction('rw', db.recipes, db.history, db.favourites, async () => {
        await db.recipes.delete(id)
        await db.history.where('recipeId').equals(id).delete()
        await db.favourites.where('recipeId').equals(id).delete()
    })
}

async function deleteHistoryById(id: number) {
    return db.history.delete(id)
}

async function deleteFavouriteById(id: number) {
    console.log('Deleting favorite by ID', id)
    return db.favourites.delete(id)
}

async function deleteFavouriteByRecipeId(recipeId: number) {
    console.log('Deleting favorite by recipe ID', recipeId)
    // Find the favorite with this recipeId
    const favorites = await db.favourites.where('recipeId').equals(recipeId).toArray()
    
    if (favorites.length > 0) {
        // Delete all matching favorites (should be just one)
        for (const favorite of favorites) {
            if (favorite.id) {
                await db.favourites.delete(favorite.id)
                console.log('Deleted favorite with ID', favorite.id)
            }
        }
        return true
    }
    
    return false
}
async function updateFavourite(favourite: Favourite) {
    if (!favourite.id) {
        throw new Error('Favourite ID is required')
    }

    console.log('[updateFavourite] favourite to update:', favourite)

    const { id, ...changes } = favourite
    await db.favourites.update(id, changes)
}

async function getFavouriteByRecipeId(recipeId: number) {
    return db.favourites.where('recipeId').equals(recipeId).first()
}

async function deleteCollectionById(id: number) {
    return db.collections.delete(id)
}

async function addRecipeEmbedding(embedding: RecipeEmbedding) {
    return db.embeddings.add(clone(embedding))
}

async function batchAddRecipeEmbeddings(embeddings: RecipeEmbedding[]) {
    return db.embeddings.bulkAdd(embeddings)
}

async function updateRecipeEmbedding(embedding: RecipeEmbedding) {
    if (!embedding.id) {
        throw new Error('Embedding ID is required')
    }

    const { id, ...changes } = embedding
    await db.embeddings.update(id, clone(changes))
}

async function deleteRecipeEmbeddingById(id: number) {
    return db.embeddings.delete(id)
}

async function getRecipeEmbeddingById(id: number) {
    return db.embeddings.get(id)
}

async function getRecipeEmbeddingsByRecipeId(recipeId: number) {
    return db.embeddings.where('recipeId').equals(recipeId).toArray()
}

async function getRecipeEmbeddings() {
    return db.embeddings.toArray()
}

async function checkIfEmbeddingDoesExist(recipeId: number) {
    const count = await db.embeddings.where('recipeId').equals(recipeId).count()
    return count > 0
}

async function findRecipeIdsWithoutEmbedding(recipeIds: number[]): Promise<number[]> {
    // Get all embeddings that match any of the provided recipeIds
    const foundEmbeddings = await db.embeddings.where('recipeId').anyOf(recipeIds).primaryKeys();
    // foundEmbeddings will be the primary keys (usually the row id), but we want the recipeIds that were found
    // So instead, we should get the recipeIds that exist:
    const foundRecipeIds = await db.embeddings.where('recipeId').anyOf(recipeIds).toArray();
    const foundIdsSet = new Set(foundRecipeIds.map(e => e.recipeId));
    // Return the recipeIds that are NOT in the found set
    return recipeIds.filter(id => !foundIdsSet.has(id));
}

export type { History, Favourite, RecipeData, Collections, CollectionWithRecipes, RecipeEmbedding }
export { db, addRecipe, addOrUpdateRecipe, addHistory, addFavourite, getHistory, getLiveHistory, getFavourites, getLiveFavourites, getRecipes, getRecipeById, getRecipeByURL, deleteRecipeById, deleteHistoryById, deleteFavouriteById, deleteFavouriteByRecipeId, deleteCollectionById, addCollection, getCollections, getLiveCollections, batchGetRecipes, updateCollection, getCollectionById, addOrUpdateHistory, getFavouriteByRecipeId, updateFavourite, getLiveRecipeById, addRecipeEmbedding, updateRecipeEmbedding, deleteRecipeEmbeddingById, getRecipeEmbeddingById, getRecipeEmbeddingsByRecipeId, getRecipeEmbeddings, checkIfEmbeddingDoesExist, findRecipeIdsWithoutEmbedding, batchAddRecipeEmbeddings };