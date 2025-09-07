export type Item = {
  id: string;
  exercise: string;
  series?: number;
  reps?: string;
  weight?: number;
  restSec?: number;
};

export const LOCAL_STORAGE_KEY = "gymlist:v1";

