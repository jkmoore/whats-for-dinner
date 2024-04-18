import React, { useEffect, useState } from "react";
import styled from "styled-components";
import InventoryItem from "./inventoryItem";

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
  border-radius: 1rem;
  z-index: 1000;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

const StyledSpan = styled.span`
  display: flex;
  gap: 0.5rem;
`;

const StyledButton = styled.button<{ type: "button" | "submit" }>`
  cursor: pointer;
  width: 8rem;
  border-radius: 0.25rem;
  ${(props) =>
    props.type === "submit"
      ? `
        background-color: #4285F4;
        color: white;
        border: none;
      `
      : `
        background-color: white;
        color: black;
        border: 0.5px solid black;
      `}
`;

interface ModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmitItem: (item: InventoryItem) => void;
  defaultData: InventoryItem | null;
  mode: "add" | "edit";
}

export default function Modal({
  setIsOpen,
  onSubmitItem,
  defaultData,
  mode,
}: ModalProps) {
  const [newItem, setNewItem] = useState<InventoryItem>({
    name: "",
    expiration: null,
  });

  useEffect(() => {
    if (defaultData) {
      if (defaultData.expiration) {
        setNewItem({
          name: defaultData.name,
          expiration: defaultData.expiration,
        });
      } else {
        setNewItem({ name: defaultData.name, expiration: null });
      }
    }
  }, [defaultData]);

  const handleSubmitItem = (
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    onSubmitItem: (item: InventoryItem) => void
  ) => {
    onSubmitItem(newItem);
    setIsOpen(false);
  };

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
            placeholder="Item (50 characters max)"
            value={newItem.name}
            required
            maxLength={50}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewItem({ ...newItem, name: e.target.value })
            }
          />
          <label htmlFor="expiration">Expiration Date</label>
          <style>{`input::-webkit-calendar-picker-indicator { cursor: pointer; }`}</style>
          <input
            type="date"
            id="expiration"
            min={"1900-01-01"}
            max={"2099-12-31"}
            value={
              newItem.expiration
                ? newItem.expiration.toISOString().slice(0, 10)
                : ""
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const enteredDate = e.target.value
                ? new Date(e.target.value)
                : null;
              setNewItem((prevItem) => ({
                ...prevItem,
                expiration: enteredDate,
              }));
            }}
          />
          <StyledSpan>
            <StyledButton type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </StyledButton>
            <StyledButton type="submit">
              {mode === "add" ? "Add Item" : "Save Changes"}
            </StyledButton>
          </StyledSpan>
        </StyledForm>
      </ModalWindow>
    </>
  );
}
