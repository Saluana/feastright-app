import { Recipe } from "@/types/Recipe";
import { findRecipeIdsWithoutEmbedding, batchGetRecipes, batchAddRecipeEmbeddings, RecipeEmbedding } from "@/composables/useDexie";

export async function getRecipeEmbedding (recipe: Recipe) {
    const res = await fetch('http://localhost:4200/embedding', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({recipe: recipe})
    })

    if (!res.ok) {
        throw new Error('Failed to get recipe embedding')
    }


    const data = await res.json()

    const embedding = data.data as {recipeId: number, embedding: number[]}
    return embedding
}

export async function ensureEmbeddingsExistForRecipes (recipeIds: number[]) {
    const recipesWithoutEmbeddings = await findRecipeIdsWithoutEmbedding(recipeIds);
    console.log('[recipesWithoutEmbeddings]', recipesWithoutEmbeddings);
    
    if (recipesWithoutEmbeddings.length > 0) {
      const recipes = await batchGetRecipes(recipesWithoutEmbeddings);
      console.log('[recipesWithoutEmbeddings full]', recipes);
    
      const now = new Date(); // Use Date object directly
    
      // Define the expected shape of a successfully resolved embedding object
      type ResolvedEmbedding = {
        recipeId: number;
        title: string;
        embedding: number[];
        createdAt: Date;
        updatedAt: Date;
      };
    
      const embeddings = await Promise.allSettled(
        recipes.map(async (recipe): Promise<ResolvedEmbedding | undefined> => { // Explicit return type
          if (!recipe || !recipe.id) return undefined;
    
          const embeddingResponse = await getRecipeEmbedding(recipe);
    
          // Check if the response has the required properties directly
          if (embeddingResponse && embeddingResponse.recipeId && embeddingResponse.embedding) {
            return {
              recipeId: embeddingResponse.recipeId,
              title: recipe.title,
              embedding: embeddingResponse.embedding,
              createdAt: now, // Assign Date object
              updatedAt: now, // Assign Date object
            };
          }
          return undefined;
        })
      );
    
      // Type guard for filtering and mapping
      const toAdd = embeddings
        .filter((result): result is PromiseFulfilledResult<ResolvedEmbedding> =>
          result.status === 'fulfilled' && result.value !== undefined
        )
        .map(result => result.value); // result.value is now correctly typed as ResolvedEmbedding
    
      if (toAdd.length > 0) {
        // Ensure toAdd matches the expected RecipeEmbedding[] type for batchAddRecipeEmbeddings
        await batchAddRecipeEmbeddings(toAdd as RecipeEmbedding[]); // Cast if ResolvedEmbedding structurally matches RecipeEmbedding
      }
    }
}