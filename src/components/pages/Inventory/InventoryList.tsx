import styled from "styled-components";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DropResult,
  DroppableProvided,
} from "@hello-pangea/dnd";
import deleteIcon from "assets/icons/button-delete-item.svg";
import { InventoryItemDTO } from "./InventoryItem";

const URGENT_THRESHOLD_DAYS = 3;

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

const ItemExpirationSpan = styled.span<{ $urgent?: boolean }>`
  margin: 0 1rem;
  color: ${(props) => (props.$urgent ? "crimson" : "inherit")};
`;

const ItemNameSpan = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

interface InventoryListProps {
  items: InventoryItemDTO[];
  onDeleteItem: (itemId: string) => void;
  onClickItem: (item: InventoryItemDTO) => void;
  onMoveItem: (itemId: string, source: number, destination: number) => void;
  isDndEnabled: boolean;
}

const isUrgent = (expirationDate: Date): boolean => {
  const today = new Date();
  const differenceInDays = Math.floor(
    (expirationDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );
  return differenceInDays < URGENT_THRESHOLD_DAYS;
};

export default function InventoryList({
  items,
  onDeleteItem,
  onClickItem,
  onMoveItem,
  isDndEnabled,
}: InventoryListProps) {

  const onDragEnd = (result: DropResult) => {
    if (result.destination) {
      onMoveItem(
        result.draggableId,
        result.source.index,
        result.destination.index
      );
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
                    onClick={() => onClickItem(item)}
                  >
                    <DeleteItemButton
                      src={deleteIcon}
                      alt="Remove Item"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                    />
                    <ItemNameSpan>{item.name}</ItemNameSpan>
                    {item.expiration && (
                      <ItemExpirationSpan
                        $urgent={isUrgent(item.expiration)}
                      >
                        {item.expiration.toISOString().slice(0, 10)}
                      </ItemExpirationSpan>
                    )}
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
        <StyledListItem key={item.id} onClick={() => onClickItem(item)}>
          <DeleteItemButton
            src={deleteIcon}
            alt="Remove Item"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item.id);
            }}
          />
          <ItemNameSpan>{item.name}</ItemNameSpan>
          {item.expiration && (
            <ItemExpirationSpan $urgent={isUrgent(item.expiration)}>
              {item.expiration.toISOString().slice(0, 10)}
            </ItemExpirationSpan>
          )}
        </StyledListItem>
      ))}
    </StyledList>
  );
}
