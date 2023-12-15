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
  query,
  where,
} from "firebase/firestore";
import { User } from "firebase/auth";

interface Item {
  name: string;
}

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<DocumentData[]>([]);
  const [newItem, setNewItem] = useState<Item>({
    name: "",
  });

  const user: User | null = auth.currentUser;

  const handleAddItem = () => {
    addDoc(collection(firestore, "inventory"), {
      ...newItem,
      userId: user?.uid,
    })
      .then(() => {
        setNewItem({
          name: "",
        });
      })
      .catch((error) => {
        console.error("Error adding item:", error);
      });
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
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleAddItem();
        }}
      >
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <button type="button" onClick={handleAddItem}>
          Add Item
        </button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : inventory.length === 0 ? (
        <p>No items in the inventory.</p>
      ) : (
        <ul>
          {inventory.map((item) => (
            <li key={item.id}>
              {item.name}
              <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
