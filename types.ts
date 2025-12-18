
export enum WorkCategory {
  INTERIOR = 'Interior',
  CIVIL = 'Civil',
  ELECTRICAL = 'Electrical',
  PLUMBING = 'Plumbing',
  OTHER = 'Other',
}

export enum UnitType {
  SQFT = 'sqft',
  SQM = 'sqm',
  CUBIC_METER = 'm³',
  PIECES = 'pcs',
  RUNNING_METER = 'rm',
  LUMPSUM = 'lumpsum',
  NOS = 'nos',
}

export enum WorkStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export interface SubWork {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface WorkItem {
  id:string;
  name: string;
  category: WorkCategory;
  subWorks: SubWork[];
  designPreference: string;
  color: string;
  colorFileName?: string;
  length: number;
  width: number;
  depth: number;
  units: number;
  unitMultiplier?: number;
  unitType: UnitType;
  quantity: number;
  status: WorkStatus;
}

export interface Area {
  id: string;
  name: string;
  workItems: WorkItem[];
  imageUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  areas: Area[];
}