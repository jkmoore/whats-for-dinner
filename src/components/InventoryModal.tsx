import React, { useState } from "react";
import styled from "styled-components";
import Item from "./item";

const Background = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
`;

const ModalWindow = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 80%;
  background: white;
  padding: 2rem;
  color: black;
  border-radius: 16px;
  box-shadow: 0 5px 20px 0 rgba(0, 0, 0, 0.04);
`;

interface ModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onAddItem: (item: Item) => void;
}

export default function InventoryModal({ setIsOpen, onAddItem }: ModalProps) {
  const [newItem, setNewItem] = useState<Item>({
    name: "",
  });

  const handleAddItem = (setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, onAddItem: (item: Item) => void) => {
    onAddItem(newItem);
    setIsOpen(false);
  }

  return (
    <>
      <Background onClick={() => setIsOpen(false)} />
      <ModalWindow>
        New Item
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleAddItem(setIsOpen, onAddItem);
          }}
        >
          <label htmlFor="item">Item</label>
          <input
            type="text"
            id="item"
            placeholder="Item"
            value={newItem.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, name: e.target.value })
            }
          />
          <button type="submit">Add Item</button>
        </form>
      </ModalWindow>
    </>
  );
}
