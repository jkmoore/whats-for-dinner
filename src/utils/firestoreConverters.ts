import { QueryDocumentSnapshot } from "firebase/firestore";
import { InventoryItemDTO } from "components/pages/Inventory/InventoryItem";
import { ShoppingListItemDTO } from "components/pages/ShoppingList/ShoppingListItem";

export function firestoreDocToInventoryItemDTO(
  doc: QueryDocumentSnapshot
): InventoryItemDTO {
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name,
    expiration: data.expiration?.toDate() ?? null,
    order: data.order ?? 0,
  };
}

export function firestoreDocToShoppingListItemDTO(
  doc: QueryDocumentSnapshot
): ShoppingListItemDTO {
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name,
    order: data.order ?? 0,
  };
}
