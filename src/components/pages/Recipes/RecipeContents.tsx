import TextareaAutosize from "react-textarea-autosize";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import Ingredient from "./Ingredient";
import deleteIcon from "assets/icons/button-delete-meal.svg";

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
  bottom: -7rem;
  padding-bottom: 5rem;
`;

const SectionContainer = styled.div`
  padding: 2rem;
  width: 50%;
  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 1rem;
  }
  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 100%;
    height: 50%;
  }
  height: 100%;
  overflow-wrap: break-word;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const IngredientsList = styled.ul`
  overflow-y: auto;
  margin: 0;
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
  flex: 1 1 auto;
  min-width: 5rem;
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
  const handleIngredientChange = (id: string, field: "name" | "quantity", value: string) => {
    setIngredients(prev =>
      prev.map(ingredient =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    );
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
  };

  const handleAddIngredient = () => {
    setIngredients(prev => [...prev, { id: uuidv4(), name: "", quantity: "" }]);
  };

  return (
    <Container>
      <SectionContainer>
        <ContentsHeader>Ingredients</ContentsHeader>
        {editMode ? (
          <IngredientsEditorContainer>
            {ingredients.map(ingredient => (
              <IngredientEditorContainer key={ingredient.id}>
                <StyledIngredientInput
                  value={ingredient.name}
                  placeholder="Ingredient name"
                  onChange={e => handleIngredientChange(ingredient.id, "name", e.target.value)}
                  maxLength={50}
                />
                <StyledIngredientInput
                  value={ingredient.quantity}
                  placeholder="Quantity"
                  onChange={e => handleIngredientChange(ingredient.id, "quantity", e.target.value)}
                  maxLength={50}
                />
                <DeleteIngredientButton
                  src={deleteIcon}
                  alt="Delete ingredient"
                  onClick={() => handleDeleteIngredient(ingredient.id)}
                />
              </IngredientEditorContainer>
            ))}
            <button onClick={handleAddIngredient}>+ Add ingredient</button>
          </IngredientsEditorContainer>
        ) : loadingIngredients ? (
          <p>Loading...</p>
        ) : (
          <IngredientsList>
            {ingredients.map(ingredient => (
              <li key={ingredient.id}>
                {ingredient.name || "New ingredient"}
                {ingredient.quantity && ` - ${ingredient.quantity}`}
              </li>
            ))}
          </IngredientsList>
        )}
      </SectionContainer>

      <SectionContainer>
        <ContentsHeader>Notes</ContentsHeader>
        {editMode ? (
          <NotesTextArea
            placeholder="Add your notes (steps, tips, etc.)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        ) : loadingBasicInfo ? (
          <p>Loading...</p>
        ) : (
          <NotesText>{notes}</NotesText>
        )}
      </SectionContainer>
    </Container>
  );
}
