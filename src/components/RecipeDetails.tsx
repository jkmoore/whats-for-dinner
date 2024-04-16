import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TextareaAutosize from "react-textarea-autosize";
import Ingredient from "./ingredient";
import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { User } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

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

const RecipeHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 5rem;
  width: 100%;
  border-bottom: 1px solid #d9d9d9;
  background-color: white;
  box-sizing: border-box;
  padding: 1rem;
`;

const RecipeContents = styled.div`
  display: flex;
  flex-direction: row;
  position: absolute;
  top: 5rem;
  left: 0;
  right: 0;
  bottom: 0rem;
`;

const IngredientsContainer = styled.div`
  padding: 2rem;
  width: 50%;
  height: 100%;
  overflow-wrap: break-word;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const IngredientsList = styled.ul`
  overflow-y: auto;
  margin: 0rem;
`;

const IngredientsEditorContainer = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const NotesContainer = styled.div`
  padding: 2rem;
  width: 50%;
  height: 100%;
  overflow-wrap: break-word;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const NotesText = styled.p`
  overflow-y: auto;
  margin: 0rem;
`;

const RecipeName = styled.h1`
  margin: 0rem;
`;

const NotesTextArea = styled(TextareaAutosize)`
  font-family: inherit;
`;

interface RecipeDetailsProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string | null;
}

export default function RecipeDetails({ setIsOpen, id }: RecipeDetailsProps) {
  const [recipeId, setRecipeId] = useState<string | null>(id);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [recipeName, setRecipeName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const user: User | null = auth.currentUser;

  useEffect(() => {
    if (!id) {
      return;
    }
    const fetchRecipe = async () => {
      try {
        const recipeDoc = await getDoc(
          doc(collection(firestore, "recipes"), id)
        );
        if (recipeDoc.exists()) {
          setRecipeName(recipeDoc.data().name);
          setNotes(recipeDoc.data().notes);

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
              required: data.required,
            };
            foundIngredients.push(ingredient);
          });
          setIngredients(foundIngredients);
        } else {
          console.error("Recipe does not exist");
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSaveRecipeDetails = async () => {
    let currentRecipeId = recipeId;
    try {
      if (!recipeId) {
        const recipeDocRef = await addDoc(collection(firestore, "recipes"), {
          name: recipeName,
          notes: notes,
          userId: user?.uid,
        });
        setRecipeId(recipeDocRef.id);
        currentRecipeId = recipeDocRef.id;
      } else {
        await updateDoc(doc(firestore, "recipes", recipeId), {
          name: recipeName,
          notes: notes,
        });
      }

      const ingredientsRef = collection(firestore, "ingredients");
      const q = query(ingredientsRef, where("recipeId", "==", currentRecipeId));
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
          ...ingredient,
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
            name: ingredient.name,
            quantity: ingredient.quantity,
            required: ingredient.required,
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

      setEditMode(false);

      console.log("success");
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <RecipeDetailsContainer>
      {editMode ? (
        <>
          <RecipeHeader>
            <button onClick={() => setIsOpen(false)}>{"<"}</button>
            <input
              placeholder={"Recipe name (100 characters max)"}
              value={recipeName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRecipeName(e.target.value)
              }
              maxLength={100}
            />
            <button onClick={handleSaveRecipeDetails}>Save</button>
          </RecipeHeader>
          <RecipeContents>
            <IngredientsContainer>
              <h2>Ingredients</h2>
              <IngredientsEditorContainer>
                {ingredients.map((ingredient: Ingredient, index: number) => (
                  <div key={index}>
                    <input
                      value={ingredient.name}
                      placeholder={"Ingredient name (50 characters max)"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newIngredients = [...ingredients];
                        newIngredients[index].name = e.target.value;
                        setIngredients(newIngredients);
                      }}
                      maxLength={50}
                    />
                    <input
                      value={ingredient.quantity}
                      placeholder={"Quantity (50 characters max)"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newIngredients = [...ingredients];
                        newIngredients[index].quantity = e.target.value;
                        setIngredients(newIngredients);
                      }}
                      maxLength={50}
                    />
                    <input
                      type="checkbox"
                      checked={ingredient.required}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newIngredients = [...ingredients];
                        newIngredients[index].required = e.target.checked;
                        setIngredients(newIngredients);
                      }}
                    />
                    <button
                      onClick={() =>
                        setIngredients(
                          ingredients.filter((_, i) => i !== index)
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setIngredients([
                      ...ingredients,
                      { id: uuidv4(), name: "", quantity: "", required: true },
                    ])
                  }
                >
                  + Add ingredient
                </button>
              </IngredientsEditorContainer>
            </IngredientsContainer>
            <NotesContainer>
              <h2>Notes</h2>
              <NotesTextArea
                placeholder={"Add your notes (steps, tips, etc.)"}
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNotes(e.target.value)
                }
              />
            </NotesContainer>
          </RecipeContents>
        </>
      ) : (
        <>
          <RecipeHeader>
            <button onClick={() => setIsOpen(false)}>{"<"}</button>
            <RecipeName>{recipeName ? recipeName : "Untitled"}</RecipeName>
            <button onClick={() => setEditMode(true)}>Edit</button>
          </RecipeHeader>
          <RecipeContents>
            <IngredientsContainer>
              <h2>Ingredients</h2>
              <IngredientsList>
                {ingredients.map((ingredient: Ingredient, index: number) => (
                  <li key={index}>
                    {!ingredient.required && "(optional) "}
                    {ingredient.name.length > 0
                      ? ingredient.name
                      : "New ingredient"}
                    {ingredient.quantity && " - " + ingredient.quantity}
                  </li>
                ))}
              </IngredientsList>
            </IngredientsContainer>
            <NotesContainer>
              <h2>Notes</h2>
              <NotesText>{notes}</NotesText>
            </NotesContainer>
          </RecipeContents>
        </>
      )}
    </RecipeDetailsContainer>
  );
}
