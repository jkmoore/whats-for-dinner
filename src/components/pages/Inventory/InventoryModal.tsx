import { useEffect, useState } from "react";
import styled from "styled-components";
import InventoryItem from "./InventoryItem";
import {
  Background,
  ModalWindow,
  StyledButton,
  StyledForm,
  StyledSpan
} from "styles/ItemModal.styles";

const DateInput = styled.input`
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`;

interface ModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmitItem: (item: InventoryItem) => void;
  defaultData: InventoryItem | null;
  mode: "add" | "edit";
}

export default function InventoryModal({
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
      setNewItem({
        name: defaultData.name,
        expiration: defaultData.expiration ?? null,
      });
    }
  }, [defaultData]);

  const handleSubmitItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmitItem(newItem);
    setIsOpen(false);
  };

  return (
    <>
      <Background onClick={() => setIsOpen(false)} />
      <ModalWindow>
        <h2>{mode === "add" ? "New Item" : "Edit Item"}</h2>
        <StyledForm onSubmit={handleSubmitItem}>
          <label htmlFor="item">Item</label>
          <input
            type="text"
            id="item"
            placeholder="Item (50 characters max)"
            value={newItem.name}
            required
            maxLength={50}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          />
          <label htmlFor="expiration">Expiration Date</label>
          <DateInput
            type="date"
            id="expiration"
            min={"1900-01-01"}
            max={"2099-12-31"}
            value={
              newItem.expiration
                ? newItem.expiration.toISOString().slice(0, 10)
                : ""
            }
            onChange={e => {
              const enteredDate = e.target.value ? new Date(e.target.value) : null;
              setNewItem((prevItem) => ({...prevItem, expiration: enteredDate}));
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
