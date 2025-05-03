export async function getRecipeFromUrl(url: string): Promise<Recipe> {
  const response = await fetch('http://localhost:4200/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  })

  if (!response.ok) {
    throw new Error('Failed to fetch recipe')
  }

  const data = await response.json()

  if (data.data) {
    return data.data as Recipe
  } else if (data.error) {
    throw new Error(data.error)
  } else {
    throw new Error('Unknown error')
  }
}

export interface Ingredient {
    name: string;
    quantity: number | string;
    unit: string | null;
  }
  
  export interface Recipe {
    title: string;
    images: string[];
    url: string;
    description: string;
    publisher: string;
    video?: { url: string; description: string };
    servings: number;
    prepTime: number;
    cookTime: number;
    totalTime: number;
    cuisine: string[];
    categories: string[];
    nutrition: Record<string, string>;
    ingredients: Ingredient[];
    instructions: string[];
    ratings: { ratingValue: string; ratingCount: string };
  }
  