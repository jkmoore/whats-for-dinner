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
import styled from "styled-components";

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0rem;
  margin: 0.5rem 0;
`;

const SearchBar = styled.input`
  padding: 0.625rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  outline: none;
  width: 100%;
  margin-left: 0.5rem;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  font-size: 1rem;

  ::placeholder {
    color: #ccc;
  }

  &:focus {
    outline: 0.1rem solid #ccc;
  }
`;

const AddItemButton = styled.img`
  height: 2rem;
  width: 2rem;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  &:hover {
    filter: brightness(95%);
  }
`;

const DeleteItemButton = styled.img`
  cursor: pointer;
  border: none;
  height: 1.2rem;
  width: 1.2rem;
  margin-right: 0.5rem;
  opacity: 0.3;
  &:hover {
    opacity: 0.7;
  }
`;

const StyledList = styled.ul`
  padding: 0rem;
`;

const StyledListItem = styled.li`
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  list-style-type: none;
  cursor: pointer;
`;

const StyledSpan = styled.span`
  margin: 0 1rem;
`;

const StyledDiv = styled.div`
  padding-top: 2rem;
  padding-bottom: 2rem;
  padding-left: 3rem;
  padding-right: 3rem;
`;

type ModalMode = "add" | "edit";

export default function Inventory() {
  const [loading, setLoading] = useState<boolean>(true);
  const [maxOrder, setMaxOrder] = useState<number>(0);
  const [inventory, setInventory] = useState<DocumentData[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [itemToEdit, setItemToEdit] = useState<string | null>(null);
  const [selectedItemData, setSelectedItemData] = useState<Item | null>(null);
  const [searchResults, setSearchResults] = useState<DocumentData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const user: User | null = auth.currentUser;

  useEffect(() => {
    if (showModal === false) {
      setSelectedItemData(null);
    }
  }, [showModal]);

  const handleSubmitItem = (newItem: Item) => {
    if (modalMode === "add") {
      handleAddItem(newItem);
    } else {
      setSelectedItemData(null);
      handleEditItem(newItem);
    }
  };

  const handleAddItem = async (newItem: Item) => {
    addDoc(collection(firestore, "inventory"), {
      ...newItem,
      order: maxOrder + 1,
      userId: user?.uid,
    }).catch((error) => {
      console.error("Error adding item:", error);
    });
  };

  const handleEditItem = async (newItem: Item) => {
    try {
      if (itemToEdit) {
        await updateDoc(doc(firestore, "inventory", itemToEdit), {
          ...newItem,
        });
        setItemToEdit(null);
      } else {
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

  const handleClickItem = (item: DocumentData) => {
    setModalMode("edit");
    setItemToEdit(item.id);
    if (item.expiration) {
      setSelectedItemData({
        name: item.name,
        expiration: item.expiration.toDate(),
      });
    } else {
      setSelectedItemData({ name: item.name, expiration: null });
    }
    setShowModal(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const queryInputValue = event.target.value.trim();

    if (queryInputValue) {
      setIsSearching(true);
      const searchRef = query(
        collection(firestore, "inventory"),
        where("userId", "==", user?.uid),
        where("name", ">=", queryInputValue),
        where("name", "<=", queryInputValue + "\uf8ff")
      );

      onSnapshot(
        searchRef,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const results: DocumentData[] = [];
          querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const result = { id: doc.id, ...doc.data() };
            results.push(result);
          });
          setSearchResults(results);
        },
        (error) => {
          console.error("Error searching inventory:", error);
        }
      );
    } else {
      setIsSearching(false);
      setSearchResults([]);
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
    <StyledDiv>
      <StyledHeader>
        <AddItemButton
          src={process.env.PUBLIC_URL + "/buttonAddItem.svg"}
          alt="Add Item"
          onClick={() => {
            setModalMode("add");
            setShowModal(true);
          }}
        />
        <SearchBar
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
      ) : (
        <StyledList>
          {isSearching
            ? searchResults.map((item) => (
                <StyledListItem
                  key={item.id}
                  onClick={() => handleClickItem(item)}
                >
                  <DeleteItemButton
                    src={process.env.PUBLIC_URL + "/buttonDeleteItem.svg"}
                    alt="Remove Item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                  />
                  {item.name}
                  {item.expiration && (
                    <StyledSpan>
                      {item.expiration.toDate().toISOString().slice(0, 10)}
                    </StyledSpan>
                  )}
                </StyledListItem>
              ))
            : inventory.map((item) => (
                <StyledListItem
                  key={item.id}
                  onClick={() => handleClickItem(item)}
                >
                  <DeleteItemButton
                    src={process.env.PUBLIC_URL + "/buttonDeleteItem.svg"}
                    alt="Remove Item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                  />
                  {item.name}
                  {item.expiration && (
                    <StyledSpan>
                      {item.expiration.toDate().toISOString().slice(0, 10)}
                    </StyledSpan>
                  )}
                </StyledListItem>
              ))}
        </StyledList>
      )}
    </StyledDiv>
  );
}
