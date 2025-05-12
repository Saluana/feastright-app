import { Recipe } from "@/types/Recipe";

export async function getRecipeEmbedding (recipe: Recipe) {
    const res = await fetch('http://localhost:4200/embedding', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipe)
    })

    if (!res.ok) {
        throw new Error('Failed to get recipe embedding')
    }


    const data = await res.json()

    const embedding = data.embedding
    return embedding
}