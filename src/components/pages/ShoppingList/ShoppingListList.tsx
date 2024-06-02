import React from "react";
import { DocumentData } from "firebase/firestore";
import styled from "styled-components";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DropResult,
  DroppableProvided
} from "@hello-pangea/dnd";

const StyledList = styled.ul`
  padding: 0rem;
`;

const StyledListItem = styled.li`
  background-color: #fafafa;
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  list-style-type: none;
  cursor: pointer;
  margin-top: 0rem;
  height: 3rem;
  box-sizing: border-box;
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

const ItemNameSpan = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

interface ShoppingListListProps {
  items: DocumentData[];
  onDeleteItem: (itemId: string | undefined) => void;
  onClickItem: (item: DocumentData) => void;
  onMoveItem: (itemId: string, source: number, destination: number) => void;
  isDndEnabled: boolean;
}

export default function InventoryList({
  items,
  onDeleteItem,
  onClickItem,
  onMoveItem,
  isDndEnabled
}: ShoppingListListProps) {
  const onDragEnd = async (result: DropResult) => {
    if (result.destination) {
      await onMoveItem(result.draggableId, result.source.index, result.destination.index);
    }
  };

  return isDndEnabled ? (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="inventory">
        {(provided: DroppableProvided) => (
          <StyledList {...provided.droppableProps} ref={provided.innerRef}>
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(dragProvided: DraggableProvided) => (
                  <StyledListItem
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
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
                    <ItemNameSpan>
                      {item.name}
                    </ItemNameSpan>
                  </StyledListItem>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </StyledList>
        )}
      </Droppable>
    </DragDropContext>
  ) : (
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
          <ItemNameSpan>
            {item.name}
          </ItemNameSpan>
        </StyledListItem>
      ))}
    </StyledList>
  );
};
