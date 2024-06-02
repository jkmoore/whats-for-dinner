import React, { useCallback, useEffect, useState } from "react";
import RecipeDetails from "./RecipeDetails";
import styled from "styled-components";
import { User } from "firebase/auth";
import { auth, firestore } from "../../../firebase";
import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import SearchModifiers from "./SearchModifiers";
import { RecipeTime, RecipeType, SearchMode } from "./searchModifierTypes";
import Recipe from "./recipe";

const INGREDIENT_SEARCH_CHUNK_SIZE = 30;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0rem;
  margin: 0.5rem 0;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  height: 2.5rem;
`;

const SearchTermsContainer = styled.div`
  display: flex;
  margin-top: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

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

const SearchBar = styled.input`
  height: 100%;
  box-sizing: border-box;
  padding: 0.625rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  outline: none;
  width: 100%;
  margin-left: 0.5rem;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  font-size: 1rem;
  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 0.9rem;
  }
  ::placeholder {
    color: #ccc;
  }
  &:focus {
    outline: 0.1rem solid #ccc;
  }
`;

const PageContainer = styled.div`
  padding-top: 2rem;
  padding-bottom: 2rem;
  padding-left: 3rem;
  padding-right: 3rem;
  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 1rem;
    font-size: 0.9rem;
  }
  ${({ theme }) => theme.breakpoints.up("xl")} {
    padding-left: 8rem;
    padding-right: 8rem;
  }
  ${({ theme }) => theme.breakpoints.up("xxl")} {
    padding-left: 15rem;
    padding-right: 15rem;
  }
`;

const RecipesListContainer = styled.ul`
  padding: 0rem;
`;

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
  gap: 0.5rem;
  height: 3rem;
  box-sizing: border-box;
`;

const DeleteButton = styled.img`
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
  &:hover {
    opacity: 0.7;
    background-color: #ccc;
  }
`;

const SearchTerm = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  padding: 0.25rem;
`;

const RecipeTimeTag = styled.p`
  border: 1px solid #ccc;
  border-radius: 1rem;
  padding: 0.1rem 0.3rem 0.1rem 0.3rem;
  font-size: 0.9rem;
  margin: 0rem;
`;

export default function Recipes() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode>("recipes");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showRecipe, setShowRecipe] = useState<boolean>(false);
  const [idOfRecipeToOpen, setIdOfRecipeToOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedIngredients, setSearchedIngredients] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<RecipeType[]>([]);
  const [selectedTime, setSelectedTime] = useState<RecipeTime | null>(null);
  const user: User | null = auth.currentUser;

  useEffect(() => {
    setLoading(true);
    const recipeRef = query(
      collection(firestore, "recipes"),
      where("userId", "==", user?.uid),
      orderBy("lowercaseName")
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
            type: data.type,
            time: data.time,
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

  const searchByIngredients = useCallback(
    async (ingredients: string[]) => {
      setLoading(true);

      const ingredientChunks: string[][] = [];
      for (
        let i = 0;
        i < ingredients.length;
        i += INGREDIENT_SEARCH_CHUNK_SIZE
      ) {
        ingredientChunks.push(
          ingredients.slice(i, i + INGREDIENT_SEARCH_CHUNK_SIZE)
        );
      }

      try {
        const snapshots = await Promise.all(
          ingredientChunks.map(async (chunk) => {
            const searchRef = query(
              collection(firestore, "ingredients"),
              where("userId", "==", user?.uid),
              where("lowercaseName", "in", chunk)
            );
            return await getDocs(searchRef);
          })
        );
        const recipeMatchPercentages: { [key: string]: number } = {};
        const numIngredients = ingredients.length;

        snapshots.forEach((querySnapshot) => {
          querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const recipeId = doc.data().recipeId;
            if (!recipeMatchPercentages[recipeId]) {
              recipeMatchPercentages[recipeId] = 0;
            }
            recipeMatchPercentages[recipeId] += (1 / numIngredients) * 100;
          });
        });
        const sortedResults = Object.keys(recipeMatchPercentages).sort(
          (a, b) => {
            return recipeMatchPercentages[b] - recipeMatchPercentages[a];
          }
        );
        const recipes = await Promise.all(
          sortedResults.map(async (recipeId) => {
            const recipeDoc = await getDoc(doc(firestore, "recipes", recipeId));
            if (recipeDoc.exists()) {
              const data = recipeDoc.data();
              return {
                id: recipeId,
                ...data,
              } as Recipe;
            } else {
              return null;
            }
          })
        );
        setSearchResults(
          recipes.filter((recipe) => recipe !== null) as Recipe[]
        );
        setLoading(false);
      } catch (error) {
        console.error("Error searching recipes:", error);
        setLoading(false);
      }
    },
    [user?.uid]
  );

  useEffect(() => {
    if (searchMode === "ingredients") {
      if (searchedIngredients.length > 0) {
        setIsSearching(true);
        searchByIngredients(searchedIngredients);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }
  }, [searchByIngredients, searchMode, searchedIngredients]);

  const searchByRecipe = (queryInputValue: string) => {
    setLoading(true);
    const searchRef = query(
      collection(firestore, "recipes"),
      where("userId", "==", user?.uid),
      where("lowercaseName", ">=", queryInputValue),
      where("lowercaseName", "<=", queryInputValue + "\uf8ff")
    );

    onSnapshot(
      searchRef,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const results: Recipe[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          const recipe = {
            id: doc.id,
            name: data.name,
            type: data.type,
            time: data.time,
          };
          results.push(recipe);
        });
        const sortedResults = results.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setSearchResults(sortedResults);
        setLoading(false);
      },
      (error) => {
        console.error("Error searching recipes:", error);
        setLoading(false);
      }
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (searchMode === "recipes") {
      const queryInputValue = event.target.value.trim().toLowerCase();
      if (queryInputValue) {
        setIsSearching(true);
        searchByRecipe(queryInputValue);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }
  };

  const handleEnterSearch = () => {
    if (searchMode === "ingredients") {
      const queryInputValue = searchTerm.trim().toLowerCase();
      if (queryInputValue) {
        if (!searchedIngredients.includes(queryInputValue)) {
          setSearchedIngredients((prevIngredients) => [
            ...prevIngredients,
            queryInputValue,
          ]);
          setSearchTerm("");
        }
      }
    }
  };

  const onDeleteSearchTerm = (index: number) => {
    setSearchedIngredients((prevIngredients) =>
      prevIngredients.filter((_, i) => i !== index)
    );
  };

  const handleAddRecipeButtonClicked = () => {
    setIdOfRecipeToOpen(null);
    setShowRecipe(true);
  };

  const handleSetSearchMode = (newSearchMode: SearchMode) => {
    setSearchTerm("");
    setSearchMode(newSearchMode);
    if (newSearchMode === "recipes") {
      setIsSearching(false);
    }
  };

  const handleSelectTypeFilter = (type: RecipeType) => {
    setSelectedTypes((prevSelectedTypes) => {
      if (prevSelectedTypes.includes(type)) {
        return prevSelectedTypes.filter((t) => t !== type);
      } else {
        return [...prevSelectedTypes, type];
      }
    });
  };

  const handleSelectTimeFilter = (time: RecipeTime) => {
    if (selectedTime === time) {
      setSelectedTime(null);
    } else {
      setSelectedTime(time);
    }
  };

  const filteredRecipes = recipes
    .filter(
      (recipe) =>
        !selectedTypes.length ||
        !recipe.type ||
        selectedTypes.includes(recipe.type)
    )
    .filter(
      (recipe) =>
        !selectedTime || !recipe.time || recipe.time <= parseInt(selectedTime)
    );

  const filteredSearchResults = searchResults
    .filter(
      (recipe) =>
        !selectedTypes.length ||
        !recipe.type ||
        selectedTypes.includes(recipe.type)
    )
    .filter(
      (recipe) =>
        !selectedTime || !recipe.time || recipe.time <= parseInt(selectedTime)
    );

  return (
    <>
      {showRecipe ? (
        <RecipeDetails setIsOpen={setShowRecipe} id={idOfRecipeToOpen} />
      ) : (
        <PageContainer>
          <StyledHeader>
            <SearchBarContainer>
              <AddRecipeButton
                src={process.env.PUBLIC_URL + "/buttonAddItem.svg"}
                onClick={handleAddRecipeButtonClicked}
              />
              <SearchBar
                id="search"
                placeholder={
                  searchMode === "recipes"
                    ? "Search for a recipe"
                    : "Search by ingredient name"
                }
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEnterSearch();
                  }
                }}
              />
            </SearchBarContainer>
            <SearchModifiers
              searchMode={searchMode}
              onSetSearchMode={handleSetSearchMode}
              selectedTypes={selectedTypes}
              onSelectTypeFilter={handleSelectTypeFilter}
              selectedTime={selectedTime}
              onSelectTimeFilter={handleSelectTimeFilter}
            />
            {searchMode === "ingredients" && searchedIngredients.length > 0 && (
              <SearchTermsContainer>
                {searchedIngredients &&
                  searchedIngredients.map((ingredient, index) => (
                    <SearchTerm key={index}>
                      <DeleteButton
                        src={process.env.PUBLIC_URL + "/buttonDeleteMeal.svg"}
                        alt="Remove search term"
                        onClick={() => onDeleteSearchTerm(index)}
                      />
                      <div>{ingredient}</div>
                    </SearchTerm>
                  ))}
              </SearchTermsContainer>
            )}
          </StyledHeader>
          <RecipesListContainer>
            {loading ? (
              <p>Loading...</p>
            ) : isSearching && filteredSearchResults.length === 0 ? (
              <p>No recipes found.</p>
            ) : filteredRecipes.length === 0 ? (
              <p>No recipes found.</p>
            ) : isSearching && searchResults.length > 0 ? (
              filteredSearchResults.map((recipe, index) => (
                <RecipeContainer
                  key={index}
                  onClick={() => {
                    setIdOfRecipeToOpen(recipe.id);
                    setShowRecipe(true);
                  }}
                >
                  {recipe.name}
                  {recipe.type && <RecipeTimeTag>{recipe.type}</RecipeTimeTag>}
                  {recipe.time && (
                    <RecipeTimeTag>{recipe.time + " min"}</RecipeTimeTag>
                  )}
                </RecipeContainer>
              ))
            ) : (
              filteredRecipes.map((recipe, index) => (
                <RecipeContainer
                  key={index}
                  onClick={() => {
                    setIdOfRecipeToOpen(recipe.id);
                    setShowRecipe(true);
                  }}
                >
                  {recipe.name}
                  {recipe.type && <RecipeTimeTag>{recipe.type}</RecipeTimeTag>}
                  {recipe.time && (
                    <RecipeTimeTag>{recipe.time + " min"}</RecipeTimeTag>
                  )}
                </RecipeContainer>
              ))
            )}
          </RecipesListContainer>
        </PageContainer>
      )}
    </>
  );
}
