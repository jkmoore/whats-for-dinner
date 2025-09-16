import styled from "styled-components";
import { RecipeTime, RecipeType, SearchMode } from "./SearchModifierTypes";
import ButtonGroup from "./ButtonGroup";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 1rem;
  width: 100%;
  gap: 1rem;
`;

interface SearchModifiersProps {
  searchMode: SearchMode;
  onSetSearchMode: (newSearchMode: SearchMode) => void;
  selectedTypes: RecipeType[];
  onSelectTypeFilter: (type: RecipeType) => void;
  selectedTime: RecipeTime | null;
  onSelectTimeFilter: (time: RecipeTime) => void;
}

const searchModes = [
  { label: "Search by recipe name", value: "recipes" as SearchMode },
  { label: "Search by ingredient", value: "ingredients" as SearchMode },
];

const recipeTypes = [
  { label: "Main", value: "main" as RecipeType },
  { label: "Side", value: "side" as RecipeType },
  { label: "Dessert", value: "dessert" as RecipeType },
  { label: "Beverage", value: "beverage" as RecipeType },
];

const recipeTimes = [
  { label: "≤15 min", value: "15" as RecipeTime },
  { label: "≤30 min", value: "30" as RecipeTime },
  { label: "≤45 min", value: "45" as RecipeTime },
  { label: "≤60 min", value: "60" as RecipeTime },
];

export default function SearchModifiers(props: SearchModifiersProps) {
  return (
    <Container>
      <div>
        <ButtonGroup
          items={searchModes}
          selectedValues={props.searchMode}
          onSelect={props.onSetSearchMode}
        />
      </div>
      <div>
        <ButtonGroup
          items={recipeTypes}
          selectedValues={props.selectedTypes}
          onSelect={props.onSelectTypeFilter}
        />
      </div>
      <div>
        <ButtonGroup
          items={recipeTimes}
          selectedValues={props.selectedTime}
          onSelect={props.onSelectTimeFilter}
        />
      </div>
    </Container>
  );
}
