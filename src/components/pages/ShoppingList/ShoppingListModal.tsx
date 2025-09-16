import { useEffect, useState } from "react";
import ShoppingListItem from "./ShoppingListItem";
import {
  Background,
  ModalWindow,
  StyledButton,
  StyledForm,
  StyledSpan
} from "styles/ItemModal.styles";

interface ModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmitItem: (item: ShoppingListItem) => void;
  defaultData: ShoppingListItem | null;
  mode: "add" | "edit";
}

export default function ShoppingListModal({
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
