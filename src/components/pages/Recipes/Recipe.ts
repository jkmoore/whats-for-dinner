import { RecipeType } from "./SearchModifierTypes";

export default interface Recipe {
  id: string;
  name: string;
  type: RecipeType | null;
  time: number;
  subtext?: string;
}
