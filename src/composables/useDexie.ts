// db.ts
import Dexie, { type EntityTable, liveQuery } from 'dexie';
import { type Recipe } from './useRecipeImporter';

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

const db = new Dexie('RecipeDatabase') as Dexie & {
  recipes: EntityTable<RecipeData, 'id'>
  history: EntityTable<History, 'id'>
  favourites: EntityTable<Favourite, 'id'>
  collections: EntityTable<Collections, 'id'>
};

// Schema declaration:
db.version(1).stores({
  recipes: '++id, title, url, image, description, publisher, video, servings, prepTime, cookTime, totalTime, cuisine, categories, nutrition, ingredients, instructions, ratings, meta, favicon, hostUrl',
  history: '++id, recipeId, url, title, createdAt',
  favourites: '++id, recipeId, title, url, createdAt',
  collections: '++id, name, recipes, createdAt, updatedAt',
});

function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

async function addRecipe(recipe: RecipeData): Promise<number | undefined> {
    const existingRecipe = await getRecipeByURL(recipe.url)
    if (existingRecipe.length > 0) {
        return existingRecipe[0].id; 
    }

    return await db.recipes.add(clone(recipe))
}

async function addHistory(recipe: RecipeData) {
    if (!recipe.id) {
        throw new Error('Recipe ID is required')
    }

    const doesExist = await db.history.where('recipeId').equals(recipe.id).count()
    if (doesExist > 0) {
        return
    }

    await db.history.add({
        recipeId: recipe.id,
        url: recipe.url,
        title: recipe.title,
        createdAt: new Date()
    })
}

async function addFavourite(recipe: RecipeData) {
    if (!recipe.id) {
        throw new Error('Recipe ID is required')
    }

    const doesExist = await db.favourites.where('recipeId').equals(recipe.id).count()
    if (doesExist > 0) {
        return
    }

    await db.favourites.add({
        recipeId: recipe.id,
        title: recipe.title,
        url: recipe.url,
        createdAt: new Date()
    })
}

async function addCollection(collection: Collections) {
    await db.collections.add(clone(collection))
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

async function deleteCollectionById(id: number) {
    return db.collections.delete(id)
}

export type { History, Favourite, RecipeData, Collections, CollectionWithRecipes }
export { db, addRecipe, addHistory, addFavourite, getHistory, getLiveHistory, getFavourites, getLiveFavourites, getRecipes, getRecipeById, getRecipeByURL, deleteRecipeById, deleteHistoryById, deleteFavouriteById, deleteFavouriteByRecipeId, deleteCollectionById, addCollection, getCollections, getLiveCollections, batchGetRecipes, updateCollection, getCollectionById };