import { Recipe } from "@/types/Recipe"
import { host } from "@/composables/useState";

export async function getRecipeFromText(recipeText: string): Promise<Recipe> {
  const response = await fetch(`${host.value}/text-to-recipe`, {
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

  try {
    console.log('Uploading image:', image.name, 'Size:', image.size, 'Type:', image.type);
    
    const response = await fetch(`${host.value}/image-to-recipe`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });

    console.log('Upload response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Failed to fetch recipe: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.data) {
      return data.data as Recipe;
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      throw new Error('Unknown error');
    }
  } catch (error) {
    console.error('Error during image upload:', error);
    throw error;
  }
}


  