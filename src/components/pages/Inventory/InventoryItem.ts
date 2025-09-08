export default interface InventoryItem {
  name: string;
  expiration: Date | null;
}

export type InventoryItemDTO = InventoryItem & {
  id: string;
  order: number;
};
