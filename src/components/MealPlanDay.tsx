import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import MealPlanItem from "./mealPlanItem";
import TextareaAutosize from "react-textarea-autosize";
import {
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
} from "@hello-pangea/dnd";

const Day = styled.div`
  display: flex;
  flex-direction: column;
  width: 20rem;
  min-width: 10rem;
  background-color: lightgrey;
  border-radius: 0.25rem;
  padding: 0.5rem;
  box-sizing: border-box;
  gap: 0.5rem;
`;

const Meal = styled.div`
  width: 100%;
`;

const StyledTextArea = styled(TextareaAutosize)`
  width: 100%;
  box-sizing: border-box;
  background-color: #f2f2f2;
  padding: 0.5rem;
  border: none;
  resize: none;
  font-family: inherit;
  &:focus {
    outline: none;
    box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.2);
  }
`;

interface MealPlanDayProps {
  date: string;
  meals: MealPlanItem[];
  addingEnabled: boolean;
  onAddItem: (name: string, date: string) => void;
  onEditItem: (id: string, name: string) => void;
  onDeleteItem: (id: string, date: string) => void;
}

export default function MealPlanDay({
  date,
  meals,
  addingEnabled,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: MealPlanDayProps) {
  const newMealInputRef = useRef<HTMLTextAreaElement>(null);
  const [currentMeals, setCurrentMeals] = useState<MealPlanItem[]>([]);
  const [newMealName, setNewMealName] = useState<string>("");
  const [addingMeal, setAddingMeal] = useState<boolean>(false);
  const formatLocaleDateString = (localeDateString: string): string => {
    const date = new Date(localeDateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

    return `${formattedDate} (${dayOfWeek})`;
  };

  useEffect(() => {
    if (!addingEnabled) {
      setAddingMeal(false);
    }
  }, [addingEnabled]);

  useEffect(() => {
    if (meals) {
      const copiedMeals = meals.map((meal) => {
        return {
          ...meal,
        };
      });
      setCurrentMeals(copiedMeals);
    } else {
      setCurrentMeals([]);
    }
  }, [meals]);

  useEffect(() => {
    if (addingMeal && newMealInputRef.current) {
      newMealInputRef.current.focus();
    }
  }, [addingMeal]);

  const saveNewMealName = async () => {
    setAddingMeal(false);
    if (newMealName.trim().length > 0) {
      await onAddItem(newMealName, date);
    }
    setNewMealName("");
  };

  const handleUpdatedMealNameInput = (index: number, name: string) => {
    const updatedMeals = [...currentMeals];
    updatedMeals[index].name = name;
    setCurrentMeals(updatedMeals);
  };

  const saveUpdatedMealName = async (index: number, name: string) => {
    if (name.trim().length > 0) {
      const id = meals[index].id;
      await onEditItem(id, name);
    } else {
      const updatedMeals = JSON.parse(JSON.stringify(currentMeals));
      updatedMeals[index].name = meals[index].name;
      setCurrentMeals(updatedMeals);
    }
  };

  return (
    <Droppable droppableId={date}>
      {(provided: DroppableProvided) => (
        <Day {...provided.droppableProps} ref={provided.innerRef}>
          <p>{formatLocaleDateString(date)}</p>
          {currentMeals &&
            currentMeals.map((meal, index) => (
              <Draggable key={meal.id} draggableId={meal.id} index={index}>
                {(dragProvided: DraggableProvided) => (
                  <Meal
                    onMouseDown={() => setAddingMeal(false)}
                    key={meal.id}
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <StyledTextArea
                      maxRows={8}
                      value={currentMeals[index].name}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleUpdatedMealNameInput(index, e.target.value)
                      }
                      onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        saveUpdatedMealName(index, e.target.value)
                      }
                    />
                    <button onClick={() => onDeleteItem(meal.id, date)}>
                      Delete
                    </button>
                  </Meal>
                )}
              </Draggable>
            ))}
          {addingEnabled &&
            (addingMeal ? (
              <Meal>
                <StyledTextArea
                  maxRows={8}
                  ref={newMealInputRef}
                  placeholder="Enter a new meal"
                  onBlur={saveNewMealName}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewMealName(e.target.value)
                  }
                />
              </Meal>
            ) : (
              <button onClick={() => setAddingMeal(true)}>Add a meal</button>
            ))}
          {provided.placeholder}
        </Day>
      )}
    </Droppable>
  );
}
