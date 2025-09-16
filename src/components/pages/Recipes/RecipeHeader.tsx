import styled from "styled-components";
import { RecipeType } from "./SearchModifierTypes";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
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
  padding: 0.1rem 0.3rem;
  font-size: 0.9rem;
  margin: 0;
`;

const RecipeTimeTag = styled.p`
  border: 1px solid #ccc;
  border-radius: 1rem;
  padding: 0.1rem 0.3rem;
  font-size: 0.9rem;
  margin: 0;
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
  flex: 0 0 auto;
`;

const RecipeNameAndTags = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
`;

const RecipeName = styled.h1`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  white-space: normal;
  margin: 0.5rem 2rem;
  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 1rem;
    -webkit-line-clamp: 3;
  }
`;

const TagContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: center;
`;

const CloseButton = styled.button`
  flex: 0 0 auto;
`;

interface RecipeHeaderProps {
  editMode: boolean;
  onClickEdit: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  recipeName: string;
  setRecipeName: React.Dispatch<React.SetStateAction<string>>;
  recipeType: RecipeType | null;
  recipeTime: number | null;
  setRecipeTime: React.Dispatch<React.SetStateAction<number | null>>;
  onRecipeTypeChange: (newType: string) => void;
  setConfirmModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSaveRecipeDetails: () => void;
  loadingBasicInfo: boolean;
  loadingIngredients: boolean;
  saving: boolean;
}

export default function RecipeHeader({
  editMode,
  onClickEdit,
  setIsOpen,
  recipeName,
  setRecipeName,
  recipeType,
  recipeTime,
  setRecipeTime,
  onRecipeTypeChange,
  setConfirmModalOpen,
  onSaveRecipeDetails,
  loadingBasicInfo,
  loadingIngredients,
  saving,
}: RecipeHeaderProps) {
  return (
    <>
      {editMode ? (
        <Container>
          <CloseButton onClick={() => setIsOpen(false)}>{"<"}</CloseButton>
          <HeaderEditorContainer>
            <input
              placeholder={"Recipe name (50 characters max)"}
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
              maxLength={50}
            />
            <TypeTimeEditorContainer>
              <select
                value={recipeType ? recipeType : ""}
                onChange={e => onRecipeTypeChange(e.target.value)}
              >
                <option value="">Select a recipe type</option>
                <option value="main">Main</option>
                <option value="side">Side</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
              </select>
              <input
                type="number"
                placeholder="Prep time (min)"
                value={recipeTime ?? ""}
                onChange={e => {
                  const value = e.target.value;
                  if (value.length <= 3) {
                    const num = parseInt(value);
                    setRecipeTime(!isNaN(num) ? num : null);
                  }
                }}
                min={0}
                max={999}
              />
            </TypeTimeEditorContainer>
          </HeaderEditorContainer>
          {saving ? (
            "Saving..."
          ) : (
            <ButtonContainer>
              <button onClick={onSaveRecipeDetails}>Save</button>
              <button onClick={() => setConfirmModalOpen(true)}>Delete</button>
            </ButtonContainer>
          )}
        </Container>
      ) : (
        <Container>
          <CloseButton onClick={() => setIsOpen(false)}>{"<"}</CloseButton>
          <RecipeNameAndTags>
            {loadingBasicInfo ? (
              <RecipeName>Loading...</RecipeName>
            ) : (
              <>
                <RecipeName>{recipeName ? recipeName : "Untitled"}</RecipeName>
                <TagContainer>
                  <RecipeTypeTag>
                    {recipeType
                      ? recipeType.charAt(0).toUpperCase() + recipeType.slice(1)
                      : "No type"}
                  </RecipeTypeTag>
                  <RecipeTimeTag>
                    {recipeTime ? recipeTime + " min" : "No prep time"}
                  </RecipeTimeTag>
                </TagContainer>
              </>
            )}
          </RecipeNameAndTags>
          {saving ? (
            "Saving..."
          ) : (
            <ButtonContainer>
              <button
                disabled={loadingBasicInfo || loadingIngredients}
                onClick={onClickEdit}
              >
                Edit
              </button>
              <button onClick={() => setConfirmModalOpen(true)}>Delete</button>
            </ButtonContainer>
          )}
        </Container>
      )}
    </>
  );
}
