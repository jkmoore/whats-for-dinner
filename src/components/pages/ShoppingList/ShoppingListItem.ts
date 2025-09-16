export default interface ShoppingListItem {
  name: string;
}

export type ShoppingListItemDTO = ShoppingListItem & {
  id: string;
  order: number;
};
