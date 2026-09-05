export type Sex = 'M' | 'F';

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  phone?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty?: string;
}

export type TestCategory = 'hematology_left' | 'hematology_right' | 'biochemical' | 'serological';

export interface TestDefinition {
  id: string;
  name: string;
  category: TestCategory;
  unit: string;
  normalRangeText: string;
  // Numerical bounds for automatic flag detection
  min?: number;
  max?: number;
  maleMin?: number;
  maleMax?: number;
  femaleMin?: number;
  femaleMax?: number;
  qualitativeNormal?: string[]; // e.g. ["Negative", "Non-Reactive", "Normal"]
}

export interface TestResultItem {
  testId: string;
  testName: string;
  result: string;
  unit: string;
  normalRange: string;
  isAbnormal: boolean;
}

export interface LabReport {
  id: string;
  labNumber: string; // e.g. LAB-000532
  patientId?: string;
  patientName: string;
  patientPhone?: string;
  patientAge: number;
  patientSex: Sex;
  doctorName: string;
  reportDate: string; // YYYY-MM-DD
  status: 'completed' | 'pending' | 'draft';
  hematologyLeft: TestResultItem[];
  hematologyRight: TestResultItem[];
  biochemical: TestResultItem[];
  serological: Record<string, string>; // testId -> result text (e.g. "Negative", "Positive", "1/80")
  notes?: string;
}

export interface LabSettings {
  labNameAr: string;
  labNameEn: string;
  subtitle: string;
  phone1: string;
  phone2: string;
  address: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'blue';
  defaultPrinter: string;
  autoBackup: boolean;
  backupIntervalDays: number;
  logoUrl?: string;
  headerBannerUrl?: string;
}

export type ActiveScreen = 
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'add_invoice'
  | 'report_view'
  | 'reports_list'
  | 'patient_profile'
  | 'backup_settings';
