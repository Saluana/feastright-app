import { Recipe } from "@/types/Recipe"

export async function getRecipeFromText(recipeText: string): Promise<Recipe> {
  const response = await fetch('http://localhost:4200/text-to-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recipeText })
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

export async function getRecipeFromImage(image: File): Promise<Recipe> {
  const formData = new FormData();
  formData.append('recipeImage', image);

  const response = await fetch('http://localhost:4200/image-to-recipe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recipe');
  }

  const data = await response.json();

  if (data.data) {
    return data.data as Recipe;
  } else if (data.error) {
    throw new Error(data.error);
  } else {
    throw new Error('Unknown error');
  }
}


  