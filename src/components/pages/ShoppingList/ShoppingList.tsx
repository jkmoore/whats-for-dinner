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
import ShoppingListModal from "./ShoppingListModal";
import ShoppingListList from "./ShoppingListList";
import ShoppingListItem, { ShoppingListItemDTO } from "./ShoppingListItem";
import addIcon from "assets/icons/button-add-item.svg";
import { firestoreDocToShoppingListItemDTO } from "utils/firestoreConverters";
import {
  AddItemButton,
  SearchBar,
  StyledDiv,
  StyledHeader
} from "styles/ItemList.styles";

type ModalMode = "add" | "edit";

export default function ShoppingList() {
  const [loading, setLoading] = useState(true);
  const [maxOrder, setMaxOrder] = useState(0);
  const [shoppingList, setShoppingList] = useState<ShoppingListItemDTO[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [itemToEdit, setItemToEdit] = useState<string | null>(null);
  const [selectedItemData, setSelectedItemData] = useState<ShoppingListItem | null>(null);
  const [searchResults, setSearchResults] = useState<ShoppingListItemDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const user: User | null = auth.currentUser;

  useEffect(() => {
    if (showModal === false) {
      setSelectedItemData(null);
    }
  }, [showModal]);

  const handleSubmitItem = (newItem: ShoppingListItem) => {
    if (modalMode === "add") {
      handleAddItem(newItem);
    } else {
      setSelectedItemData(null);
      handleEditItem(newItem);
    }
  };

  const handleAddItem = async (newItem: ShoppingListItem) => {
    const lowercaseName = newItem.name.toLowerCase();
    addDoc(collection(firestore, "shoppingList"), {
      ...newItem,
      lowercaseName: lowercaseName,
      order: maxOrder + 1,
      userId: user?.uid,
    }).catch((error) => {
      console.error("Error adding item:", error);
    });
  };

  const handleEditItem = async (newItem: ShoppingListItem) => {
    try {
      if (itemToEdit) {
        const lowercaseName = newItem.name.toLowerCase();
        await updateDoc(doc(firestore, "shoppingList", itemToEdit), {
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
      const itemRef = doc(firestore, "shoppingList", itemId);
      await deleteDoc(itemRef);
      setShoppingList((prevShoppingList) =>
        prevShoppingList.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleClickItem = (item: ShoppingListItemDTO) => {
    setModalMode("edit");
    setItemToEdit(item.id);
    setSelectedItemData({ name: item.name });
    setShowModal(true);
  };

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const queryInputValue = event.target.value.trim().toLowerCase();

    if (queryInputValue) {
      setIsSearching(true);
      const searchRef = query(
        collection(firestore, "shoppingList"),
        where("userId", "==", user?.uid),
        where("lowercaseName", ">=", queryInputValue),
        where("lowercaseName", "<=", queryInputValue + "\uf8ff")
      );

      try {
        const querySnapshot = await getDocs(searchRef);
        const results = querySnapshot.docs.map(firestoreDocToShoppingListItemDTO);
        const sortedResults = results.sort((a, b) => a.order - b.order);
        setSearchResults(sortedResults);
      } catch (error) {
        console.error("Error searching shopping list:", error);
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
    const updatedShoppingList = [...shoppingList];
    const currentShoppingList = [...shoppingList];
    const movedItem = currentShoppingList.find((item) => item.id === itemId);
    if (!movedItem) {
      console.error(`Error: no item ${itemId} found at position ${source}`);
      return;
    }
    updatedShoppingList.splice(source, 1);
    updatedShoppingList.splice(destination, 0, movedItem);
    setShoppingList(updatedShoppingList);
    const updatedOrders = updatedShoppingList.map((item, index) => ({
      id: item.id,
      order: index,
    }));
    try {
      await Promise.all(
        updatedOrders.map(({ id, order }) =>
          updateDoc(doc(firestore, "shoppingList", id), { order })
        )
      );
    } catch (error) {
      console.error("Error updating orders in Firestore:", error);
      setShoppingList(currentShoppingList);
    }
  };

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const inventoryRef = query(
      collection(firestore, "shoppingList"),
      orderBy("order"),
      where("userId", "==", user.uid)
    );

    setLoading(true);

    const unsubscribe = onSnapshot(
      inventoryRef,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const items = querySnapshot.docs.map(doc => firestoreDocToShoppingListItemDTO(doc));
        setShoppingList(items);
        const currentMaxOrder =
          items.length > 0 ? items[items.length - 1].order : 0;
        setMaxOrder(currentMaxOrder);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching shopping list:", error);
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
        <ShoppingListModal
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
      ) : shoppingList.length === 0 ? (
        <p>No items in your inventory.</p>
      ) : (
        <ShoppingListList
          items={isSearching ? searchResults : shoppingList}
          onClickItem={handleClickItem}
          onDeleteItem={handleDeleteItem}
          onMoveItem={handleMoveItem}
          isDndEnabled={!isSearching}
        />
      )}
    </StyledDiv>
  );
}
