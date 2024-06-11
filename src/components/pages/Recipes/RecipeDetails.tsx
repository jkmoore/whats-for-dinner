import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Ingredient from "./ingredient";
import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, firestore } from "../../../firebase";
import { User } from "firebase/auth";
import ConfirmModal from "./ConfirmModal";
import { RecipeType } from "./searchModifierTypes";
import RecipeHeader from "./RecipeHeader";
import RecipeContents from "./RecipeContents";

const RecipeDetailsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: #f2f2f2;
  background-image: linear-gradient(#f2f2f2, white);
  height: 100vh;
`;
interface RecipeDetailsProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string | null;
}

export default function RecipeDetails({ setIsOpen, id }: RecipeDetailsProps) {
  const [recipeId, setRecipeId] = useState<string | null>(id);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [recipeName, setRecipeName] = useState<string>("");
  const [recipeType, setRecipeType] = useState<RecipeType | null>(null);
  const [recipeTime, setRecipeTime] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [preEditIngredients, setPreEditIngredients] = useState<Ingredient[]>(
    []
  );
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [loadingBasicInfo, setLoadingBasicInfo] = useState<boolean>(false);
  const [loadingIngredients, setLoadingIngredients] = useState<boolean>(false);
  const user: User | null = auth.currentUser;

  useEffect(() => {
    if (!id) {
      return;
    }
    const fetchRecipe = async () => {
      setLoadingBasicInfo(true);
      setLoadingIngredients(true);
      try {
        const recipeDoc = await getDoc(
          doc(collection(firestore, "recipes"), id)
        );
        if (recipeDoc.exists()) {
          const data = recipeDoc.data();
          setRecipeName(data.name);
          setRecipeType(data.type);
          setRecipeTime(data.time);
          setNotes(data.notes);
          setLoadingBasicInfo(false);

          const ingredientsQuerySnapshot = await getDocs(
            query(
              collection(firestore, "ingredients"),
              where("recipeId", "==", id)
            )
          );
          const foundIngredients: Ingredient[] = [];
          ingredientsQuerySnapshot.forEach((doc) => {
            const data = doc.data();
            const ingredient: Ingredient = {
              id: doc.id,
              name: data.name,
              quantity: data.quantity,
            };
            foundIngredients.push(ingredient);
          });
          setIngredients(foundIngredients);
          setLoadingIngredients(false);
        } else {
          console.error("Recipe does not exist");
          setLoadingBasicInfo(false);
          setLoadingIngredients(false);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        setLoadingBasicInfo(false);
        setLoadingIngredients(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const ingredientsUnchanged = useCallback(
    (preEdit: Ingredient[], postEdit: Ingredient[]): boolean => {
      return (
        preEdit.length === postEdit.length &&
        preEdit.every(
          (ingredient, index) =>
            ingredient.id === postEdit[index].id &&
            ingredient.name === postEdit[index].name &&
            ingredient.quantity === postEdit[index].quantity
        )
      );
    },
    []
  );

  const handleSaveRecipeDetails = useCallback(async () => {
    let currentRecipeId = recipeId;
    try {
      if (!recipeId) {
        const recipeDocRef = await addDoc(collection(firestore, "recipes"), {
          name: recipeName,
          lowercaseName: recipeName.toLowerCase(),
          notes: notes,
          type: recipeType,
          time: recipeTime,
          userId: user?.uid,
        });
        setRecipeId(recipeDocRef.id);
        currentRecipeId = recipeDocRef.id;
      } else {
        await updateDoc(doc(firestore, "recipes", recipeId), {
          name: recipeName,
          lowercaseName: recipeName.toLowerCase(),
          notes: notes,
          type: recipeType,
          time: recipeTime,
        });
      }

      if (!ingredientsUnchanged(preEditIngredients, ingredients)) {
        const ingredientsRef = collection(firestore, "ingredients");
        const q = query(
          ingredientsRef,
          where("recipeId", "==", currentRecipeId)
        );
        const existingIngredientsSnapshot = await getDocs(q);
        const existingIngredientIds: Set<string> = new Set<string>();
        existingIngredientsSnapshot.forEach(
          (doc: QueryDocumentSnapshot<DocumentData>) => {
            existingIngredientIds.add(doc.data().id);
          }
        );

        const ingredientsToAdd: Ingredient[] = [];
        const ingredientsToUpdate: Ingredient[] = [];
        const ingredientsToDelete: string[] = [];

        ingredients.forEach((ingredient) => {
          if (existingIngredientIds.has(ingredient.id)) {
            ingredientsToUpdate.push(ingredient);
          } else {
            ingredientsToAdd.push(ingredient);
          }
          existingIngredientIds.delete(ingredient.id);
        });

        existingIngredientIds.forEach((id: string) => {
          ingredientsToDelete.push(id);
        });

        const batch = writeBatch(firestore);

        ingredientsToAdd.forEach((ingredient) => {
          batch.set(doc(ingredientsRef), {
            recipeId: currentRecipeId,
            lowercaseName: ingredient.name.toLowerCase(),
            ...ingredient,
            userId: user?.uid,
          });
        });

        for (const ingredient of ingredientsToUpdate) {
          const queryRef = query(
            ingredientsRef,
            where("id", "==", ingredient.id)
          );
          const querySnapshot = await getDocs(queryRef);
          querySnapshot.forEach((doc) => {
            batch.update(doc.ref, {
              lowercaseName: ingredient.name.toLowerCase(),
              name: ingredient.name,
              quantity: ingredient.quantity,
            });
          });
        }

        for (const id of ingredientsToDelete) {
          const queryRef = query(ingredientsRef, where("id", "==", id));
          const querySnapshot = await getDocs(queryRef);
          querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
        }

        await batch.commit();
      }

      setEditMode(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  }, [
    ingredients,
    ingredientsUnchanged,
    notes,
    preEditIngredients,
    recipeId,
    recipeName,
    recipeTime,
    recipeType,
    user?.uid,
  ]);

  const handleDeleteRecipe = async () => {
    if (!recipeId) {
      setIsOpen(false);
    } else {
      try {
        const recipeRef = doc(collection(firestore, "recipes"), recipeId);
        await deleteDoc(recipeRef);
        setIsOpen(false);
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  };

  const handleRecipeTypeChange = useCallback((newType: string) => {
    if (
      newType === "main" ||
      newType === "side" ||
      newType === "dessert" ||
      newType === "beverage"
    ) {
      setRecipeType(newType);
    }
    if (newType === "") {
      setRecipeType(null);
    }
  }, []);

  const handleClickEdit = useCallback(() => {
    setEditMode(true);
    setPreEditIngredients(ingredients.map((ingredient) => ({ ...ingredient })));
  }, [ingredients]);

  return (
    <>
      {confirmModalOpen && (
        <ConfirmModal
          mainText={"Delete recipe?"}
          confirmText={"Delete"}
          onConfirm={handleDeleteRecipe}
          setIsOpen={setConfirmModalOpen}
        />
      )}
      <RecipeDetailsContainer>
        <RecipeHeader
          editMode={editMode}
          onClickEdit={handleClickEdit}
          setIsOpen={setIsOpen}
          recipeName={recipeName}
          setRecipeName={setRecipeName}
          recipeType={recipeType}
          recipeTime={recipeTime}
          setRecipeTime={setRecipeTime}
          onRecipeTypeChange={handleRecipeTypeChange}
          setConfirmModalOpen={setConfirmModalOpen}
          onSaveRecipeDetails={handleSaveRecipeDetails}
          loadingBasicInfo={loadingBasicInfo}
          loadingIngredients={loadingIngredients}
        />
        <RecipeContents
          editMode={editMode}
          loadingBasicInfo={loadingBasicInfo}
          loadingIngredients={loadingIngredients}
          notes={notes}
          setNotes={setNotes}
          ingredients={ingredients}
          setIngredients={setIngredients}
        />
      </RecipeDetailsContainer>
    </>
  );
}
