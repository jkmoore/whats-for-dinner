import React from "react";
import { DocumentData } from "firebase/firestore";
import styled from "styled-components";

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

const DeleteItemButton = styled.img`
  cursor: pointer;
  border: none;
  height: 1.2rem;
  width: 1.2rem;
  margin-right: 0.5rem;
  opacity: 0.3;
  border-radius: 50%;
  &:hover {
    opacity: 0.7;
    background-color: #ccc;
  }
`;

const StyledSpan = styled.span<{ $urgent?: boolean }>`
  margin: 0 1rem;
  color: ${(props) => (props.$urgent ? "crimson" : "inherit")};
`;

interface InventoryListProps {
  items: DocumentData[];
  onDeleteItem: (itemId: string | undefined) => void;
  onClickItem: (item: DocumentData) => void;
}

export default function InventoryList({
  items,
  onDeleteItem,
  onClickItem
}: InventoryListProps) {
  const isUrgent = (expirationDate: Date): boolean => {
    const today = new Date();
    const differenceInDays = Math.floor(
      (expirationDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
    );
    return differenceInDays < 3;
  };

  return (
    <StyledList>
      {items.map((item) => (
        <StyledListItem
          key={item.id}
          onClick={() => onClickItem(item)}
        >
          <DeleteItemButton
            src={process.env.PUBLIC_URL + "/buttonDeleteItem.svg"}
            alt="Remove Item"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item.id);
            }}
          />
          {item.name}
          {item.expiration && (
            <StyledSpan $urgent={isUrgent(item.expiration.toDate())}>
              {item.expiration.toDate().toISOString().slice(0, 10)}
            </StyledSpan>
          )}
        </StyledListItem>
      ))}
    </StyledList>
  );
}
