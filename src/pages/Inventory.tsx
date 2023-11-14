import React, { useEffect, useState } from "react";
import { auth, firestore } from "../firebase";
import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export default function Inventory() {
  const [inventory, setInventory] = useState<DocumentData[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
  });

  const user = auth.currentUser;

  const handleAddItem = () => {
    addDoc(collection(firestore, "inventory"), { ...newItem, userId: user?.uid })
      .then(() => {
        setNewItem({
          name: "",
        });
      })
      .catch((error) => {
        console.error("Error adding item:", error);
      });
  };

  useEffect(() => {
    const inventoryRef = query(
      collection(firestore, "inventory"),
      where("userId", "==", user?.uid)
    );

    const unsubscribe = onSnapshot(
      inventoryRef,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const items: DocumentData[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const item = doc.data();
          items.push(item);
        });
        setInventory(items);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  return (
    <div>
      <h1>Inventory</h1>
      <form>
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <button type="button" onClick={handleAddItem}>
          Add Item
        </button>
      </form>
      <ul>
        {inventory.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
