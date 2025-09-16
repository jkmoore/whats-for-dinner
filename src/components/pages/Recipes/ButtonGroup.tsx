import { styled } from "styled-components";

type Position = "left" | "right";

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

export default function ButtonGroup<T extends string | number | symbol>({
  items,
  selectedValues,
  onSelect
}: {
  items: { label: string; value: T }[];
  selectedValues: T[] | T | null;
  onSelect: (value: T) => void;
}) {
  const isSelected = (value: T) =>
    Array.isArray(selectedValues)
      ? selectedValues.includes(value)
      : selectedValues === value;

  return (
    <>
      {items.map((item, i) => (
        <StyledButton
          key={item.value.toString()}
          $selected={isSelected(item.value)}
          $position={i === 0 ? "left" : i === items.length - 1 ? "right" : undefined}
          onClick={() => onSelect(item.value)}
        >
          {item.label}
        </StyledButton>
      ))}
    </>
  );
}