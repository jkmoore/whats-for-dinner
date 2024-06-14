import React from "react";
import styled from "styled-components";
import TextareaAutosize from "react-textarea-autosize";
import Ingredient from "./ingredient";
import { v4 as uuidv4 } from "uuid";

const Container = styled.div`
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

const NotesTextArea = styled(TextareaAutosize)`
  font-family: inherit;
`;

const ContentsHeader = styled.h2`
  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 1rem;
  }
`;

interface RecipeContentsProps {
  editMode: boolean;
  loadingBasicInfo: boolean;
  loadingIngredients: boolean;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
}

export default function RecipeContents({
  editMode,
  loadingBasicInfo,
  loadingIngredients,
  notes,
  setNotes,
  ingredients,
  setIngredients,
}: RecipeContentsProps) {
  return (
    <>
      {editMode ? (
        <Container>
          <IngredientsContainer>
            <ContentsHeader>Ingredients</ContentsHeader>
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
                      setIngredients(ingredients.filter((_, i) => i !== index))
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
            <ContentsHeader>Notes</ContentsHeader>
            <NotesTextArea
              placeholder={"Add your notes (steps, tips, etc.)"}
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
            />
          </NotesContainer>
        </Container>
      ) : (
        <Container>
          <IngredientsContainer>
            <ContentsHeader>Ingredients</ContentsHeader>
            {loadingIngredients ? (
              <p>Loading...</p>
            ) : (
              <IngredientsList>
                {ingredients.map((ingredient: Ingredient, index: number) => (
                  <li key={index}>
                    {ingredient.name.length > 0
                      ? ingredient.name
                      : "New ingredient"}
                    {ingredient.quantity && " - " + ingredient.quantity}
                  </li>
                ))}
              </IngredientsList>
            )}
          </IngredientsContainer>
          <NotesContainer>
            <ContentsHeader>Notes</ContentsHeader>
            {loadingBasicInfo ? (
              <p>Loading...</p>
            ) : (
              <NotesText>{notes}</NotesText>
            )}
          </NotesContainer>
        </Container>
      )}
    </>
  );
}
