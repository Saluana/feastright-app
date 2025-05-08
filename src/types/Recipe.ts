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
    meta: {
      includesFullRecipe: boolean;
      includesImage: boolean;
      includesNutrition: boolean;
      includesVideo: boolean;
    }
    favicon: string;
    hostUrl: string;
  }