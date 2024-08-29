import React from "react";
import styled from "styled-components";
import { RecipeTime, RecipeType, SearchMode } from "./SearchModifierTypes";

type Position = "left" | "right";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 1rem;
  width: 100%;
  gap: 1rem;
`;

const StyledButton = styled.button<{
  $selected: boolean;
  $position?: Position;
}>`
  background-color: ${(props) => (props.$selected ? "#ccc" : "initial")};
  height: 1.5rem;
  border: 1px solid #ccc;
  ${(props) =>
    props.$position === "left" &&
    `
    border-radius: 0.5rem 0 0 0.5rem;
  `}
  ${(props) =>
    props.$position === "right" &&
    `
    border-radius: 0 0.5rem 0.5rem 0;
  `}
  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 0.8rem;
  }
`;

interface SearchModifiersProps {
  searchMode: SearchMode;
  onSetSearchMode: (newSearchMode: SearchMode) => void;
  selectedTypes: RecipeType[];
  onSelectTypeFilter: (type: RecipeType) => void;
  selectedTime: RecipeTime | null;
  onSelectTimeFilter: (time: RecipeTime) => void;
}

export default function SearchModifiers({
  searchMode,
  onSetSearchMode,
  selectedTypes,
  onSelectTypeFilter,
  selectedTime,
  onSelectTimeFilter,
}: SearchModifiersProps) {
  return (
    <Container>
      <div>
        <StyledButton
          onClick={() => onSetSearchMode("recipes")}
          $selected={searchMode === "recipes"}
          $position="left"
        >
          Search by recipe name
        </StyledButton>
        <StyledButton
          onClick={() => onSetSearchMode("ingredients")}
          $selected={searchMode === "ingredients"}
          $position="right"
        >
          Search by ingredient
        </StyledButton>
      </div>
      <div>
        <StyledButton
          onClick={() => onSelectTypeFilter("main")}
          $selected={selectedTypes.includes("main")}
          $position="left"
        >
          Main
        </StyledButton>
        <StyledButton
          onClick={() => onSelectTypeFilter("side")}
          $selected={selectedTypes.includes("side")}
        >
          Side
        </StyledButton>
        <StyledButton
          onClick={() => onSelectTypeFilter("dessert")}
          $selected={selectedTypes.includes("dessert")}
        >
          Dessert
        </StyledButton>
        <StyledButton
          onClick={() => onSelectTypeFilter("beverage")}
          $selected={selectedTypes.includes("beverage")}
          $position="right"
        >
          Beverage
        </StyledButton>
      </div>
      <div>
        <StyledButton
          onClick={() => onSelectTimeFilter("15")}
          $selected={selectedTime === "15"}
          $position="left"
        >
          {"≤15 min"}
        </StyledButton>
        <StyledButton
          onClick={() => onSelectTimeFilter("30")}
          $selected={selectedTime === "30"}
        >
          {"≤30 min"}
        </StyledButton>
        <StyledButton
          onClick={() => onSelectTimeFilter("45")}
          $selected={selectedTime === "45"}
        >
          {"≤45 min"}
        </StyledButton>
        <StyledButton
          onClick={() => onSelectTimeFilter("60")}
          $selected={selectedTime === "60"}
          $position="right"
        >
          {"≤60 min"}
        </StyledButton>
      </div>
    </Container>
  );
}
