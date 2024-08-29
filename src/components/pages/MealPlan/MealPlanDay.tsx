import React, { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import styled from "styled-components";
import {
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
} from "@hello-pangea/dnd";
import MealPlanItem from "./MealPlanItem";

const Day = styled.div`
  display: flex;
  flex-direction: column;
  width: 20rem;
  min-width: 10rem;
  background-color: lightgrey;
  border-radius: 0.25rem;
  padding: 0.5rem;
  box-sizing: border-box;
`;

const DateHeader = styled.p`
  text-align: center;
  margin-bottom: 0.4rem;
`;

const MealsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: lightgrey;
  border-radius: 0.25rem;
  box-sizing: border-box;
`;

const Meal = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 0.5rem;
  box-sizing: border-box;
  position: relative;
  &:hover {
    img {
      display: flex;
    }
  }
`;

const AddMealButton = styled.button`
  margin-top: 0.5rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
  height: 2rem;
`;

const DeleteMealButton = styled.img`
  position: absolute;
  top: 0.2rem;
  right: -0.2rem;
  width: 1rem;
  height: 1rem;
  padding: 0.1rem;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 50%;
  background-color: lightgrey;
  border: solid 0.5px grey;
  display: none;
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
  border-top-right-radius: 0.2rem;
  border-bottom-right-radius: 0.2rem;
  border-top-left-radius: 0rem;
  border-bottom-left-radius: 0rem;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const DragHandle = styled.div`
  border: solid 0.5px grey;
  border-top-left-radius: 0.2rem;
  border-bottom-left-radius: 0.2rem;
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: lightgrey;
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
    <Day>
      <DateHeader>{formatLocaleDateString(date)}</DateHeader>
      <Droppable droppableId={date}>
        {(provided: DroppableProvided) => (
          <MealsContainer {...provided.droppableProps} ref={provided.innerRef}>
            {currentMeals &&
              currentMeals.map((meal, index) => (
                <Draggable key={meal.id} draggableId={meal.id} index={index}>
                  {(dragProvided: DraggableProvided) => (
                    <Meal
                      onMouseDown={() => setAddingMeal(false)}
                      key={meal.id}
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                    >
                      <DeleteMealButton
                        src={process.env.PUBLIC_URL + "/buttonDeleteMeal.svg"}
                        alt="Remove Meal"
                        onClick={() => onDeleteItem(meal.id, date)}
                      />
                      <TextContainer>
                        <DragHandle
                          {...dragProvided.dragHandleProps}
                        ></DragHandle>
                        <StyledTextArea
                          spellCheck={false}
                          maxRows={8}
                          value={currentMeals[index].name}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) =>
                            handleUpdatedMealNameInput(index, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                          }}
                          onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            saveUpdatedMealName(index, e.target.value)
                          }
                        />
                      </TextContainer>
                    </Meal>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </MealsContainer>
        )}
      </Droppable>
      {addingMeal ? (
        <Meal>
          <StyledTextArea
            maxRows={8}
            ref={newMealInputRef}
            placeholder="Enter a new meal"
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            onBlur={saveNewMealName}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewMealName(e.target.value)
            }
          />
        </Meal>
      ) : (
        <AddMealButton onClick={() => setAddingMeal(true)}>
          + Add a meal
        </AddMealButton>
      )}
    </Day>
  );
}
