import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Item from "./item";

const Background = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 900;
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
  z-index: 1000;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

interface ModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmitItem: (item: Item) => void;
  defaultData: Item | null;
  mode: "add" | "edit";
}

export default function Modal({ setIsOpen, onSubmitItem, defaultData, mode }: ModalProps) {
  const [newItem, setNewItem] = useState<Item>({
    name: "",
    expiration: null,
  });

  useEffect(() => {
    if (defaultData) {
      if (defaultData.expiration) {
        setNewItem({name: defaultData.name, expiration: defaultData.expiration});
      }
      else {
        setNewItem({name: defaultData.name, expiration: null});
      }
    }
  }, [defaultData]);

  const handleSubmitItem = (setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, onSubmitItem: (item: Item) => void) => {
    onSubmitItem(newItem);
    setIsOpen(false);
  }

  return (
    <>
      <Background onClick={() => setIsOpen(false)} />
      <ModalWindow>
        <h2>{mode === "add" ? "New Item" : "Edit Item"}</h2>
        <StyledForm
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleSubmitItem(setIsOpen, onSubmitItem);
          }}
        >
          <label htmlFor="item">Item</label>
          <input
            type="text"
            id="item"
            placeholder="Item"
            value={newItem.name}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, name: e.target.value })
            }
          />
          <label htmlFor="expiration">Expiration Date</label>
          <style>{`input::-webkit-calendar-picker-indicator { cursor: pointer; }`}</style>
          <input
            type="date"
            id="expiration"
            value={newItem.expiration ? newItem.expiration.toISOString().split('T')[0] : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem((prevItem) => ({
                ...prevItem,
                expiration: new Date(e.target.value),
              }))
            }
          />
          <button style={{ cursor: 'pointer' }} type="submit">{mode === "add" ? "Add Item" : "Save Changes"}</button>
        </StyledForm>
      </ModalWindow>
    </>
  );
}
