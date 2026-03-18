import { inject, Injectable } from '@angular/core';

import { Category, Ingredient, IngredientUnit, NutritionFacts, Product, ResolvedProductIngredient } from '../models';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly dataService = inject(DataService);

  getProductById(itemId: string): Product | undefined {
    return this.dataService.products().find((item) => item.id === itemId);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.dataService.products().find((item) => item.slug === slug);
  }

  getCategoryById(categoryId: string): Category | undefined {
    return this.dataService.categories().find((category) => category.id === categoryId);
  }

  getIngredientById(ingredientId: string): Ingredient | undefined {
    return this.dataService.ingredientsCatalog().find((ingredient) => ingredient.id === ingredientId);
  }

  getProductIngredientBreakdown(item: Product): ResolvedProductIngredient[] {
    return [...item.ingredients]
      .sort((left, right) => left.position - right.position)
      .map((itemIngredient) => {
        const ingredient = this.requireIngredient(itemIngredient.ingredient_id);

        return {
          ingredient,
          quantity: itemIngredient.quantity,
          quantity_label: this.formatQuantity(itemIngredient.quantity, ingredient.unit),
          nutrition: this.roundNutrition(this.scaleNutrition(ingredient.nutrition_per_100, itemIngredient.quantity))
        };
      });
  }

  getProductNutrition(item: Product): NutritionFacts {
    if (item.nutrition_totals) {
      return this.roundNutrition(item.nutrition_totals);
    }

    const totals = item.ingredients.reduce<NutritionFacts>(
      (accumulator, itemIngredient) => {
        const ingredient = this.requireIngredient(itemIngredient.ingredient_id);
        const nutrition = this.scaleNutrition(ingredient.nutrition_per_100, itemIngredient.quantity);

        return {
          calories: accumulator.calories + nutrition.calories,
          proteins: accumulator.proteins + nutrition.proteins,
          fats: accumulator.fats + nutrition.fats,
          carbs: accumulator.carbs + nutrition.carbs
        };
      },
      { calories: 0, proteins: 0, fats: 0, carbs: 0 }
    );

    return this.roundNutrition(totals);
  }

  getProductPortionLabel(item: Product): string {
    const totalsByUnit = item.ingredients.reduce<Record<IngredientUnit, number>>(
      (accumulator, itemIngredient) => {
        const ingredient = this.requireIngredient(itemIngredient.ingredient_id);

        accumulator[ingredient.unit] += itemIngredient.quantity;

        return accumulator;
      },
      { g: 0, ml: 0 }
    );

    const portionLabel = (Object.entries(totalsByUnit) as Array<[IngredientUnit, number]>)
      .filter(([, total]) => total > 0)
      .map(([unit, total]) => this.formatQuantity(total, unit))
      .join(' + ');

    return portionLabel || 'Порція уточнюється';
  }

  private requireIngredient(ingredientId: string): Ingredient {
    const ingredient = this.getIngredientById(ingredientId);

    if (!ingredient) {
      throw new Error(`Ingredient with id "${ingredientId}" was not found in the ingredient catalog.`);
    }

    return ingredient;
  }

  private scaleNutrition(nutrition: NutritionFacts, quantity: number): NutritionFacts {
    const multiplier = quantity / 100;

    return {
      calories: nutrition.calories * multiplier,
      proteins: nutrition.proteins * multiplier,
      fats: nutrition.fats * multiplier,
      carbs: nutrition.carbs * multiplier
    };
  }

  private roundNutrition(nutrition: NutritionFacts): NutritionFacts {
    return {
      calories: Math.round(nutrition.calories),
      proteins: Math.round(nutrition.proteins * 10) / 10,
      fats: Math.round(nutrition.fats * 10) / 10,
      carbs: Math.round(nutrition.carbs * 10) / 10
    };
  }

  private formatQuantity(quantity: number, unit: IngredientUnit): string {
    const formattedQuantity = Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(1);

    return `${formattedQuantity} ${unit}`;
  }
}
