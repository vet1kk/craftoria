import { inject, Injectable } from '@angular/core';

import { Category, Ingredient, IngredientUnit, MenuItem, NutritionFacts, ResolvedMenuItemIngredient } from '../models';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly dataService = inject(DataService);

  getMenuItemById(itemId: string): MenuItem | undefined {
    return this.dataService.menuItems().find((item) => item.id === itemId);
  }

  getMenuItemBySlug(slug: string): MenuItem | undefined {
    return this.dataService.menuItems().find((item) => item.slug === slug);
  }

  getCategoryById(categoryId: string): Category | undefined {
    return this.dataService.categories().find((category) => category.id === categoryId);
  }

  getIngredientById(ingredientId: string): Ingredient | undefined {
    return this.dataService.ingredientsCatalog().find((ingredient) => ingredient.id === ingredientId);
  }

  getMenuItemIngredientBreakdown(item: MenuItem): ResolvedMenuItemIngredient[] {
    return [...item.ingredients]
      .sort((left, right) => left.position - right.position)
      .map((itemIngredient) => {
        const ingredient = this.requireIngredient(itemIngredient.ingredientId);

        return {
          ingredient,
          quantity: itemIngredient.quantity,
          quantityLabel: this.formatQuantity(itemIngredient.quantity, ingredient.unit),
          nutrition: this.roundNutrition(this.scaleNutrition(ingredient.nutritionPer100, itemIngredient.quantity))
        };
      });
  }

  getMenuItemNutrition(item: MenuItem): NutritionFacts {
    if (item.nutritionTotals) {
      return this.roundNutrition(item.nutritionTotals);
    }

    const totals = item.ingredients.reduce<NutritionFacts>(
      (accumulator, itemIngredient) => {
        const ingredient = this.requireIngredient(itemIngredient.ingredientId);
        const nutrition = this.scaleNutrition(ingredient.nutritionPer100, itemIngredient.quantity);

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

  getMenuItemPortionLabel(item: MenuItem): string {
    const totalsByUnit = item.ingredients.reduce<Record<IngredientUnit, number>>(
      (accumulator, itemIngredient) => {
        const ingredient = this.requireIngredient(itemIngredient.ingredientId);

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
