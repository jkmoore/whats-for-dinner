import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { User } from "firebase/auth";
import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, firestore } from "../../../firebase";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import MealPlanDay from "./MealPlanDay";
import MealPlanItem from "./MealPlanItem";

const NUM_DAYS_ON_SCREEN = 7;

const StyledContainer = styled.div`
  display: flex;
  overflow-x: auto;
  padding: 2rem;
  box-sizing: border-box;
  gap: 0.5rem;
  height: 100%;
`;

interface MealsByDate {
  [date: string]: MealPlanItem[];
}

interface MaxOrdersByDate {
  [date: string]: number;
}

export default function MealPlan() {
  const [maxOrdersByDate, setMaxOrdersByDate] = useState<MaxOrdersByDate>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [meals, setMeals] = useState<MealsByDate>({});
  const [addingEnabled, setAddingEnabled] = useState<boolean>(true);
  const user: User | null = auth.currentUser;
  const days: string[] = [];
  for (let i = 0; i < NUM_DAYS_ON_SCREEN; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date.toLocaleDateString());
  }

  const handleAddItem = async (name: string, date: string) => {
    await addDoc(collection(firestore, "mealPlan"), {
      name: name,
      date: date,
      order: maxOrdersByDate[date] ? maxOrdersByDate[date] + 1 : 1,
      userId: user?.uid,
    }).catch((error) => {
      console.error("Error adding item:", error);
    });
  };

  const handleEditItem = async (id: string, name: string) => {
    await updateDoc(doc(firestore, "mealPlan", id), {
      name: name,
    }).catch((error) => {
      console.error("Error updating item:", error);
    });
  };

  const handleDeleteItem = async (itemId: string, date: string) => {
    try {
      const itemRef = doc(collection(firestore, "mealPlan"), itemId);
      await deleteDoc(itemRef);
      setMeals((prevMeals) => ({
        ...prevMeals,
        [date]: prevMeals[date]
          ? prevMeals[date].filter((item) => item.id !== itemId)
          : [],
      }));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleMoveItem = async (
    itemId: string,
    sourceDate: string,
    destDate: string,
    sourceIndex: number,
    destIndex: number
  ) => {
    if (!meals[sourceDate]) {
      return;
    }
    const currentMealsByDate = JSON.parse(JSON.stringify(meals));
    const updatedMealsByDate = JSON.parse(JSON.stringify(meals));
    const [movedItem] = updatedMealsByDate[sourceDate].splice(sourceIndex, 1);
    if (!updatedMealsByDate[destDate]) {
      updatedMealsByDate[destDate] = [];
    }
    updatedMealsByDate[destDate].splice(destIndex, 0, movedItem);
    setMeals(updatedMealsByDate);
    const updatedOrders = updatedMealsByDate[destDate].map(
      (item: MealPlanItem, index: number) => ({
        id: item.id,
        order: index,
      })
    );
    try {
      await Promise.all(
        updatedOrders.map(({ id, order }: { id: string; order: number }) => {
          if (id === itemId) {
            return updateDoc(doc(firestore, "mealPlan", id), {
              order: order,
              date: destDate,
            });
          } else {
            return updateDoc(doc(firestore, "mealPlan", id), { order: order });
          }
        })
      );
    } catch (error) {
      console.error("Error updating orders in Firestore:", error);
      setMeals(currentMealsByDate);
    }
  };

  const onDragStart = () => {
    setAddingEnabled(false);
  };

  const onDragEnd = async (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (
      source &&
      destination &&
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    if (destination) {
      await handleMoveItem(
        draggableId,
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index
      );
    }
    setAddingEnabled(true);
  };

  useEffect(() => {
    const mealPlanRef = query(
      collection(firestore, "mealPlan"),
      orderBy("date"),
      orderBy("order"),
      where("userId", "==", user?.uid)
    );
    setLoading(true);
    const unsubscribe = onSnapshot(
      mealPlanRef,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const newMeals: MealsByDate = {};
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          const meal = {
            id: doc.id,
            name: data.name,
            date: data.date,
            order: data.order,
          };
          if (newMeals[meal.date]) {
            newMeals[meal.date].push(meal);
          } else {
            newMeals[meal.date] = [meal];
          }
        });
        setMeals(newMeals);
        Object.keys(newMeals).forEach((date) => {
          const maxOrderOnDate =
            newMeals[date].length > 0
              ? newMeals[date][newMeals[date].length - 1].order
              : 0;
          setMaxOrdersByDate((prevState) => ({
            ...prevState,
            [date]: maxOrderOnDate,
          }));
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching meals:", error);
        setLoading(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const emptyMealsList = useMemo(() => [], []);

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <StyledContainer>
        {loading ? (
          <p>Loading...</p>
        ) : (
          days.map((day) => (
            <MealPlanDay
              key={day}
              date={day}
              meals={meals[day] ? meals[day] : emptyMealsList}
              addingEnabled={addingEnabled}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          ))
        )}
      </StyledContainer>
    </DragDropContext>
  );
}
