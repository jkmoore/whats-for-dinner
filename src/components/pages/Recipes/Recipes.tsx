import React, { useEffect, useState } from "react";
import RecipeDetails from "./RecipeDetails";
import styled from "styled-components";
import { User } from "firebase/auth";
import { auth, firestore } from "../../../firebase";
import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Recipe from "./recipe";

const AddRecipeButton = styled.img`
  height: 2rem;
  width: 2rem;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  &:hover {
    filter: brightness(95%);
  }
`;

const PageContainer = styled.div`
  padding: 2rem 3rem;
`;

const RecipesListContainer = styled.div``;

const RecipeContainer = styled.div`
  padding: 0.75rem;
  border: solid 1px #ccc;
  cursor: pointer;
  border-radius: 0.5rem;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  background-color: #fafafa;
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
`;

export default function Recipes() {
  const [loading, setLoading] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showRecipe, setShowRecipe] = useState<boolean>(false);
  const [idOfRecipeToOpen, setIdOfRecipeToOpen] = useState<string | null>(null);
  const user: User | null = auth.currentUser;

  useEffect(() => {
    setLoading(true);
    const recipeRef = query(
      collection(firestore, "recipes"),
      where("userId", "==", user?.uid),
      orderBy("name")
    );
    const unsubscribe = onSnapshot(
      recipeRef,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const newRecipes: Recipe[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          const recipe = {
            id: doc.id,
            name: data.name,
          };
          newRecipes.push(recipe);
        });
        setRecipes(newRecipes);
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

  return (
    <>
      {showRecipe ? (
        <RecipeDetails setIsOpen={setShowRecipe} id={idOfRecipeToOpen} />
      ) : (
        <PageContainer>
          <AddRecipeButton
            src={process.env.PUBLIC_URL + "/buttonAddItem.svg"}
            onClick={() => {
              setIdOfRecipeToOpen(null);
              setShowRecipe(true);
            }}
          />
          <RecipesListContainer>
            {loading ? (
              <p>Loading...</p>
            ) : (
              recipes.map((recipe, index) => (
                <RecipeContainer
                  key={index}
                  onClick={() => {
                    setIdOfRecipeToOpen(recipe.id);
                    setShowRecipe(true);
                  }}
                >
                  {recipe.name}
                </RecipeContainer>
              ))
            )}
          </RecipesListContainer>
        </PageContainer>
      )}
    </>
  );
}
