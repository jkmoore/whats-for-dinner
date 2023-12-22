import React, { useEffect, useState } from "react";
import { auth, firestore } from "../firebase";
import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { User } from "firebase/auth";
import InventoryModal from "../components/InventoryModal";
import Item from "../components/item";

type ModalMode = "add" | "edit";

export default function Inventory() {
  const [loading, setLoading] = useState<boolean>(true);
  const [maxOrder, setMaxOrder] = useState<number>(0);
  const [inventory, setInventory] = useState<DocumentData[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [itemToEdit, setItemToEdit] = useState<string | null>(null);

  const user: User | null = auth.currentUser;

  const handleSubmitItem = (newItem: Item) => {
    if (modalMode === "add") {
      handleAddItem(newItem);
    }
    else {
      handleEditItem(newItem);
    }
  }

  const handleAddItem = async (newItem: Item) => {
    addDoc(collection(firestore, "inventory"), {
      ...newItem,
      order: maxOrder + 1,
      userId: user?.uid,
    })
      .catch((error) => {
        console.error("Error adding item:", error);
      });
  };

  const handleEditItem = async (newItem: Item) => {
    try {
      if (itemToEdit) {
        await updateDoc(doc(firestore, "inventory", itemToEdit), { ...newItem });
        setItemToEdit(null);
      }
      else {
        console.error("Error updating item: item id is null");
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (itemId: string | undefined) => {
    try {
      const itemRef = doc(collection(firestore, "inventory"), itemId);
      await deleteDoc(itemRef);
      setInventory((prevInventory) =>
        prevInventory.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  useEffect(() => {
    const inventoryRef = query(
      collection(firestore, "inventory"),
      orderBy("order"),
      where("userId", "==", user?.uid)
    );

    setLoading(true);

    const unsubscribe = onSnapshot(
      inventoryRef,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const items: DocumentData[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const item = { id: doc.id, ...doc.data() };
          items.push(item);
        });
        setInventory(items);
        const currentMaxOrder =
          items.length > 0 ? items[items.length - 1].order : 0;
        setMaxOrder(currentMaxOrder);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching inventory:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  return (
    <div>
      <button style={{ cursor: 'pointer' }} onClick={() => { setModalMode("add"); setShowModal(true); }}>
        Add Item
      </button>
      {showModal && <InventoryModal setIsOpen={setShowModal} onSubmitItem={handleSubmitItem} mode={modalMode} />}
      {loading ? (
        <p>Loading...</p>
      ) : inventory.length === 0 ? (
        <p>No items in the inventory.</p>
      ) : (
        <ul>
          {inventory.map((item) => (
            <li key={item.id} style={{ cursor: 'pointer' }} onClick={() => { setModalMode("edit"); setItemToEdit(item.id); setShowModal(true); }}>
              {item.name}
              {item.expiration && (
                <span>
                  {' - '}
                  {item.expiration.toDate().toISOString().split('T')[0]}
                </span>
              )}
              <button style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
