export type ExerciseItem = {
  type: "exercise";
  id: string;
  exercise: string;
  series?: number;
  reps?: string;
  weight?: number;
  restSec?: number;
};

export type SectionItem = {
  type: "section";
  id: string;
  title: string;
};

export type Item = ExerciseItem | SectionItem;

export const LOCAL_STORAGE_KEY = "gymlist:v1";

