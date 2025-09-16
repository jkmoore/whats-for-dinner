import { useEffect, useState } from "react";
import {
  DocumentData,
  QuerySnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { auth, firestore } from "services/firebase";
import InventoryList from "./InventoryList";
import InventoryModal from "./InventoryModal";
import InventoryItem, { InventoryItemDTO } from "./InventoryItem";
import addIcon from "assets/icons/button-add-item.svg";
import { firestoreDocToInventoryItemDTO } from "utils/firestoreConverters";
import {
  AddItemButton,
  SearchBar,
  StyledDiv,
  StyledHeader
} from "styles/ItemList.styles";

type ModalMode = "add" | "edit";

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [maxOrder, setMaxOrder] = useState(0);
  const [inventory, setInventory] = useState<InventoryItemDTO[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [itemToEdit, setItemToEdit] = useState<string | null>(null);
  const [selectedItemData, setSelectedItemData] = useState<InventoryItem | null>(null);
  const [searchResults, setSearchResults] = useState<InventoryItemDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const user: User | null = auth.currentUser;

  useEffect(() => {
    if (showModal === false) {
      setSelectedItemData(null);
    }
  }, [showModal]);

  const handleSubmitItem = (newItem: InventoryItem) => {
    if (modalMode === "add") {
      handleAddItem(newItem);
    } else {
      setSelectedItemData(null);
      handleEditItem(newItem);
    }
  };

  const handleAddItem = async (newItem: InventoryItem) => {
    const lowercaseName = newItem.name.toLowerCase();
    addDoc(collection(firestore, "inventory"), {
      ...newItem,
      lowercaseName: lowercaseName,
      order: maxOrder + 1,
      userId: user?.uid,
    }).catch((error) => {
      console.error("Error adding item:", error);
    });
  };

  const handleEditItem = async (newItem: InventoryItem) => {
    try {
      if (itemToEdit) {
        const lowercaseName = newItem.name.toLowerCase();
        await updateDoc(doc(firestore, "inventory", itemToEdit), {
          ...newItem,
          lowercaseName: lowercaseName,
        });
        setItemToEdit(null);
      } else {
        console.error("Error updating item: item id is null");
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const itemRef = doc(firestore, "inventory", itemId);
      await deleteDoc(itemRef);
      setInventory((prevInventory) =>
        prevInventory.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleClickItem = (item: InventoryItemDTO) => {
    setModalMode("edit");
    setItemToEdit(item.id);
    if (item.expiration) {
      setSelectedItemData({
        name: item.name,
        expiration: item.expiration,
      });
    } else {
      setSelectedItemData({ name: item.name, expiration: null });
    }
    setShowModal(true);
  };

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const queryInputValue = event.target.value.trim().toLowerCase();

    if (queryInputValue) {
      setIsSearching(true);
      const searchRef = query(
        collection(firestore, "inventory"),
        where("userId", "==", user?.uid),
        where("lowercaseName", ">=", queryInputValue),
        where("lowercaseName", "<=", queryInputValue + "\uf8ff"),
      );

      try {
        const querySnapshot = await getDocs(searchRef);
        const results = querySnapshot.docs.map(firestoreDocToInventoryItemDTO);
        const sortedResults = results.sort((a, b) => a.order - b.order);
        setSearchResults(sortedResults);
      } catch (error) {
        console.error("Error searching inventory:", error);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleMoveItem = async (
    itemId: string,
    source: number,
    destination: number
  ) => {
    const updatedInventory = [...inventory];
    const currentInventory = [...inventory];
    const movedItem = currentInventory.find((item) => item.id === itemId);
    if (!movedItem) {
      console.error(`Error: no item ${itemId} found at position ${source}`);
      return;
    }
    updatedInventory.splice(source, 1);
    updatedInventory.splice(destination, 0, movedItem);
    setInventory(updatedInventory);
    const updatedOrders = updatedInventory.map((item, index) => ({
      id: item.id,
      order: index,
    }));
    try {
      await Promise.all(
        updatedOrders.map(({ id, order }) =>
          updateDoc(doc(firestore, "inventory", id), { order })
        )
      );
    } catch (error) {
      console.error("Error updating orders in Firestore:", error);
      setInventory(currentInventory);
    }
  };

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const inventoryRef = query(
      collection(firestore, "inventory"),
      orderBy("order"),
      where("userId", "==", user.uid)
    );

    setLoading(true);

    const unsubscribe = onSnapshot(
      inventoryRef,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const items = querySnapshot.docs.map(doc => firestoreDocToInventoryItemDTO(doc));
        setInventory(items);
        const currentMaxOrder =
          items.length > 0 ? items[items.length - 1].order : 0;
        setMaxOrder(currentMaxOrder);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching inventory:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  return (
    <StyledDiv>
      <StyledHeader>
        <AddItemButton
          src={addIcon}
          alt="Add Item"
          onClick={() => {
            setModalMode("add");
            setShowModal(true);
          }}
        />
        <SearchBar
          id="search"
          placeholder="Search for an item"
          onChange={handleSearchChange}
        />
      </StyledHeader>
      {showModal && (
        <InventoryModal
          setIsOpen={setShowModal}
          onSubmitItem={handleSubmitItem}
          defaultData={selectedItemData}
          mode={modalMode}
        />
      )}
      {loading ? (
        <p>Loading...</p>
      ) : isSearching && searchResults.length === 0 ? (
        <p>No matching items found.</p>
      ) : inventory.length === 0 ? (
        <p>No items in your inventory.</p>
      ) : (
        <InventoryList
          items={isSearching ? searchResults : inventory}
          onClickItem={handleClickItem}
          onDeleteItem={handleDeleteItem}
          onMoveItem={handleMoveItem}
          isDndEnabled={!isSearching}
        />
      )}
    </StyledDiv>
  );
}
