import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ShoppingListItem from "./shoppingListItem";

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
  onSubmitItem: (item: ShoppingListItem) => void;
  defaultData: ShoppingListItem | null;
  mode: "add" | "edit";
}

export default function Modal({
  setIsOpen,
  onSubmitItem,
  defaultData,
  mode,
}: ModalProps) {
  const [newItem, setNewItem] = useState<ShoppingListItem>({ name: "" });

  useEffect(() => {
    if (defaultData) {
      setNewItem({ name: defaultData.name });
    }
  }, [defaultData]);

  const handleSubmitItem = (
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    onSubmitItem: (item: ShoppingListItem) => void
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
