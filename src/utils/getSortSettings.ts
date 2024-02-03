import { SORT_COLUMNS, SORT_DIRECTION } from "src/config/constants";
import { ISortSetting } from "src/types/ISortSettings";

export function getSortSettings(
  sortBy: string | undefined,
  direction: string | undefined
) {
  const result: Partial<ISortSetting> = {};
  if (sortBy && SORT_COLUMNS.has(sortBy))
    result.column = SORT_COLUMNS.get(sortBy);
  if (direction && SORT_DIRECTION.has(direction))
    result.direction = SORT_DIRECTION.get(direction);
  return result;
}
