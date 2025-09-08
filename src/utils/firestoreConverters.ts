import { QueryDocumentSnapshot } from "firebase/firestore";
import { InventoryItemDTO } from "components/pages/Inventory/InventoryItem";

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
