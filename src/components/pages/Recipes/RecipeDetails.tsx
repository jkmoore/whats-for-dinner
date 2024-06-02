import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TextareaAutosize from "react-textarea-autosize";
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
import { v4 as uuidv4 } from "uuid";
import ConfirmModal from "./ConfirmModal";
import { RecipeType } from "./searchModifierTypes";

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
  height: 7rem;
  width: 100%;
  border-bottom: 1px solid #d9d9d9;
  background-color: white;
  box-sizing: border-box;
  padding: 1rem;
`;

const RecipeTypeTag = styled.p`
  border: 1px solid #ccc;
  border-radius: 1rem;
  padding: 0.1rem 0.3rem 0.1rem 0.3rem;
  font-size: 0.9rem;
  margin: 0rem;
`;

const RecipeTimeTag = styled.p`
  border: 1px solid #ccc;
  border-radius: 1rem;
  padding: 0.1rem 0.3rem 0.1rem 0.3rem;
  font-size: 0.9rem;
  margin: 0rem;
`;

const HeaderEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const TypeTimeEditorContainer = styled.div`
  display: flex;
  flex-direction: row;
  ${({ theme }) => theme.breakpoints.down("sm")} {
    flex-direction: column;
  }
  gap: 0.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  ${({ theme }) => theme.breakpoints.down("sm")} {
    flex-direction: column;
  }
  gap: 0.25rem;
`;

const RecipeContents = styled.div`
  display: flex;
  flex-direction: row;
  ${({ theme }) => theme.breakpoints.down("sm")} {
    flex-direction: column;
  }
  position: absolute;
  top: 7rem;
  left: 0;
  right: 0;
  bottom: 0rem;
`;

const IngredientsContainer = styled.div`
  padding: 2rem;
  width: 50%;
  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 1rem;
  }
  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 100%;
  }
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
  gap: 0.5rem;
`;

const IngredientEditorContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`;

const DeleteIngredientButton = styled.img`
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  border-radius: 50%;
  border: solid 0.5px grey;
  padding: 0.1rem;
  box-sizing: border-box;
  &:hover {
    opacity: 0.7;
    background-color: #ccc;
  }
`;

const StyledIngredientInput = styled.input`
  flex: 1 1 auto; /* Allows the input to grow and shrink */
  min-width: 5rem; /* Set a reasonable minimum width for the input */
`;

const NotesContainer = styled.div`
  padding: 2rem;
  width: 50%;
  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 1rem;
  }
  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 100%;
  }
  height: 100%;
  overflow-wrap: break-word;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const NotesText = styled.p`
  overflow-y: auto;
  white-space: pre-wrap;
`;

const RecipeNameAndTags = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0rem;
  display: flex;
  flex-direction: column;
`;

const RecipeName = styled.h1`
  margin: 0.5rem;
  align-self: center;
`;

const TagContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
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
  const [recipeType, setRecipeType] = useState<RecipeType | null>(null);
  const [recipeTime, setRecipeTime] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
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

  const handleSaveRecipeDetails = async () => {
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

      setEditMode(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

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

  const handleRecipeTypeChange = (newType: string) => {
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
  };

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
        {editMode ? (
          <>
            <RecipeHeader>
              <button onClick={() => setIsOpen(false)}>{"<"}</button>
              <HeaderEditorContainer>
                <input
                  placeholder={"Recipe name (100 characters max)"}
                  value={recipeName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRecipeName(e.target.value)
                  }
                  maxLength={100}
                />
                <TypeTimeEditorContainer>
                  <select
                    value={recipeType ? recipeType : ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleRecipeTypeChange(e.target.value)
                    }
                  >
                    <option value="">Select a recipe type</option>
                    <option value="main">Main</option>
                    <option value="side">Side</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                  </select>
                  <input
                    type="number"
                    placeholder={"Prep time (min)"}
                    value={recipeTime ? recipeTime : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRecipeTime(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.value.length > 3) {
                        e.target.value = e.target.value.slice(0, 3);
                      }
                    }}
                  />
                </TypeTimeEditorContainer>
              </HeaderEditorContainer>
              <ButtonContainer>
                <button onClick={handleSaveRecipeDetails}>Save</button>
                <button onClick={() => setConfirmModalOpen(true)}>
                  Delete
                </button>
              </ButtonContainer>
            </RecipeHeader>
            <RecipeContents>
              <IngredientsContainer>
                <h2>Ingredients</h2>
                <IngredientsEditorContainer>
                  {ingredients.map((ingredient: Ingredient, index: number) => (
                    <IngredientEditorContainer key={index}>
                      <StyledIngredientInput
                        value={ingredient.name}
                        placeholder={"Ingredient name"}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newIngredients = [...ingredients];
                          newIngredients[index].name = e.target.value;
                          setIngredients(newIngredients);
                        }}
                        maxLength={50}
                      />
                      <StyledIngredientInput
                        value={ingredient.quantity}
                        placeholder={"Quantity"}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newIngredients = [...ingredients];
                          newIngredients[index].quantity = e.target.value;
                          setIngredients(newIngredients);
                        }}
                        maxLength={50}
                      />
                      <DeleteIngredientButton
                        src={process.env.PUBLIC_URL + "/buttonDeleteMeal.svg"}
                        alt="Delete ingredient"
                        onClick={() =>
                          setIngredients(
                            ingredients.filter((_, i) => i !== index)
                          )
                        }
                      />
                    </IngredientEditorContainer>
                  ))}
                  <button
                    onClick={() =>
                      setIngredients([
                        ...ingredients,
                        {
                          id: uuidv4(),
                          name: "",
                          quantity: "",
                        },
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
              <RecipeNameAndTags>
                {loadingBasicInfo ? (
                  <RecipeName>Loading...</RecipeName>
                ) : (
                  <>
                    <RecipeName>
                      {recipeName ? recipeName : "Untitled"}
                    </RecipeName>
                    <TagContainer>
                      <RecipeTypeTag>
                        {recipeType
                          ? recipeType.charAt(0).toUpperCase() +
                            recipeType.slice(1)
                          : "No type"}
                      </RecipeTypeTag>
                      <RecipeTimeTag>
                        {recipeTime ? recipeTime + " min" : "No prep time"}
                      </RecipeTimeTag>
                    </TagContainer>
                  </>
                )}
              </RecipeNameAndTags>
              <ButtonContainer>
                <button
                  disabled={loadingBasicInfo || loadingIngredients}
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
                <button onClick={() => setConfirmModalOpen(true)}>
                  Delete
                </button>
              </ButtonContainer>
            </RecipeHeader>
            <RecipeContents>
              <IngredientsContainer>
                <h2>Ingredients</h2>
                {loadingIngredients ? (
                  <p>Loading...</p>
                ) : (
                  <IngredientsList>
                    {ingredients.map(
                      (ingredient: Ingredient, index: number) => (
                        <li key={index}>
                          {ingredient.name.length > 0
                            ? ingredient.name
                            : "New ingredient"}
                          {ingredient.quantity && " - " + ingredient.quantity}
                        </li>
                      )
                    )}
                  </IngredientsList>
                )}
              </IngredientsContainer>
              <NotesContainer>
                <h2>Notes</h2>
                {loadingBasicInfo ? (
                  <p>Loading...</p>
                ) : (
                  <NotesText>{notes}</NotesText>
                )}
              </NotesContainer>
            </RecipeContents>
          </>
        )}
      </RecipeDetailsContainer>
    </>
  );
}
