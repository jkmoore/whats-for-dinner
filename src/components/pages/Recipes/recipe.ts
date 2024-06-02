import { RecipeType } from "./searchModifierTypes";

export default interface Recipe {
  id: string;
  name: string;
  type: RecipeType | null;
  time: number;
}
