import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DropResult,
  DroppableProvided,
} from "@hello-pangea/dnd";
import deleteIcon from "assets/icons/button-delete-item.svg";
import { ShoppingListItemDTO } from "./ShoppingListItem";
import {
  DeleteItemButton,
  ItemNameSpan,
  StyledList,
  StyledListItem
} from "styles/ItemList.styles";

interface ShoppingListListProps {
  items: ShoppingListItemDTO[];
  onDeleteItem: (itemId: string) => void;
  onClickItem: (item: ShoppingListItemDTO) => void;
  onMoveItem: (itemId: string, source: number, destination: number) => void;
  isDndEnabled: boolean;
}

export default function ShoppingListList({
  items,
  onDeleteItem,
  onClickItem,
  onMoveItem,
  isDndEnabled,
}: ShoppingListListProps) {

  const onDragEnd = async (result: DropResult) => {
    if (result.destination) {
      await onMoveItem(
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
        </StyledListItem>
      ))}
    </StyledList>
  );
}
