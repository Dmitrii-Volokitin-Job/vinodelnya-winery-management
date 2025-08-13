export interface Person {
  id?: number;
  name: string;
  note?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Entry {
  id?: number;
  date: string;
  description: string;
  personId: number;
  personName?: string;
  categoryId: number;
  categoryName?: string;
  workHours?: number;
  amountPaid?: number;
  amountDue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id?: number;
  createdTimestamp?: string;
  visitDate: string;
  visitTime: string;
  adultLunchGuests: number;
  adultTastingGuests: number;
  childrenGuests: number;
  extraGuests: number;
  hotDishVegetarian?: string;
  hotDishMeat?: string;
  masterclass: boolean;
  mealExtraInfo?: string;
  company?: string;
  contactName: string;
  contactPhone?: string;
  specialPriceEnabled: boolean;
  specialLunchPrice?: number;
  lunchGroupSize: number;
  lunchRate: number;
  lunchTotal: number;
  specialTastingPrice?: number;
  tastingGroupSize: number;
  tastingRate: number;
  tastingTotal: number;
  lunchAndTastingTotal: number;
  addedWinesCount: number;
  addedWinesValue: number;
  extraChargeComment?: string;
  extraChargeAmount: number;
  grandTotal: number;
  invoiceIssued: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
  pageTotal?: any;
  grandTotal?: any;
}
