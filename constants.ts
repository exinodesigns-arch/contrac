
import { WorkCategory, UnitType, WorkStatus } from './types';

export const WORK_CATEGORY_OPTIONS = Object.values(WorkCategory);
export const UNIT_TYPE_OPTIONS = Object.values(UnitType);
export const WORK_STATUS_OPTIONS = Object.values(WorkStatus);

export const STATUS_COLORS: { [key in WorkStatus]: string } = {
  [WorkStatus.PENDING]: 'bg-yellow-500 border-yellow-400',
  [WorkStatus.IN_PROGRESS]: 'bg-blue-500 border-blue-400',
  [WorkStatus.COMPLETED]: 'bg-green-500 border-green-400',
};
