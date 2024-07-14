import type { SortingState } from "@tanstack/react-table";

type SortBy = {
  sortField?: string;
  sortDesc?: boolean;
};

export const stateToSortBy = (
  sorting: SortingState | undefined,
): SortBy | undefined => {
  if (!sorting || sorting.length === 0)
    return {
      sortField: undefined,
      sortDesc: undefined,
    };

  const sort = sorting[0];

  return {
    sortField: sort.id,
    sortDesc: sort.desc,
  };
};

export const sortByToState = (
  sortBy: Partial<SortBy> | undefined,
): SortingState => {
  if (!sortBy) return [];
  if (!sortBy.sortField) return [];

  return [{ id: sortBy.sortField, desc: sortBy.sortDesc ?? false }];
};
