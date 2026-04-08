import { Ingredient, IngredientUnit, Product } from '../models';

const PORTION_FALLBACK_LABEL = 'Порція уточнюється';

export class ProductHelper {
  static getProductIngredientBreakdown(product: Product, translate: (key: string) => string): Ingredient[] {
    return product.ingredients.map((ingredient: Ingredient) => ({
      ...ingredient,
      quantity_label: ProductHelper.formatQuantity(ingredient.quantity, ingredient.unit, translate)
    }));
  }

  static getProductPortionLabel(product: Product, translate: (key: string) => string): string {
    const totalsByUnit = product.ingredients.reduce<Record<IngredientUnit, number>>(
      (accumulator, ingredient: Ingredient) => {
        accumulator[ingredient.unit] += ingredient.quantity;

        return accumulator;
      },
      { g: 0, ml: 0 }
    );

    const portionLabel = (Object.entries(totalsByUnit) as Array<[IngredientUnit, number]>)
      .filter(([, total]) => total > 0)
      .map(([unit, total]) => ProductHelper.formatQuantity(total, unit, translate))
      .join(' + ');

    return portionLabel || PORTION_FALLBACK_LABEL;
  }

  private static formatQuantity(quantity: number, unit: IngredientUnit, translate: (key: string) => string): string {
    const formattedQuantity = Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(1);

    return `${formattedQuantity} ${translate('ui.itemDetail.' + unit)}`;
  }
}

