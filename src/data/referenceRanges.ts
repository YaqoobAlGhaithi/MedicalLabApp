import { Sex, TestDefinition } from '../types';

export const TEST_DEFINITIONS: TestDefinition[] = [
  // =================== HEMATOLOGY LEFT ===================
  {
    id: 'hb',
    name: 'Hb',
    category: 'hematology_left',
    unit: 'g/dL',
    normalRangeText: 'M: 13.0 - 18.0\nF: 11.5 - 16.0',
    maleMin: 13.0, maleMax: 18.0,
    femaleMin: 11.5, femaleMax: 16.0
  },
  {
    id: 'pcv',
    name: 'PCV',
    category: 'hematology_left',
    unit: '%',
    normalRangeText: 'M: 40 - 54\nF: 37 - 47',
    maleMin: 40, maleMax: 54,
    femaleMin: 37, femaleMax: 47
  },
  {
    id: 'wbc',
    name: 'WBC',
    category: 'hematology_left',
    unit: '× 10³/L',
    normalRangeText: '4.0 - 11.0',
    min: 4.0, max: 11.0
  },
  {
    id: 'neutrophil',
    name: 'Neutrophil',
    category: 'hematology_left',
    unit: '%',
    normalRangeText: '40 - 70',
    min: 40, max: 70
  },
  {
    id: 'lymphocyte',
    name: 'Lymphocyte',
    category: 'hematology_left',
    unit: '%',
    normalRangeText: '20 - 45',
    min: 20, max: 45
  },
  {
    id: 'monocyte',
    name: 'Monocyte',
    category: 'hematology_left',
    unit: '%',
    normalRangeText: '0 - 8',
    min: 0, max: 8
  },
  {
    id: 'eosinophil',
    name: 'Eosinophil',
    category: 'hematology_left',
    unit: '%',
    normalRangeText: '0 - 5',
    min: 0, max: 5
  },
  {
    id: 'basophil',
    name: 'Basophil',
    category: 'hematology_left',
    unit: '%',
    normalRangeText: '0 - 2',
    min: 0, max: 2
  },
  {
    id: 'esr',
    name: 'ESR',
    category: 'hematology_left',
    unit: 'mm/hr',
    normalRangeText: '1st hr: up to 20 mm/hr\n2nd hr: up to 50 mm/hr',
    max: 20
  },

  // =================== HEMATOLOGY RIGHT ===================
  {
    id: 'rbc',
    name: 'RBC',
    category: 'hematology_right',
    unit: '× 10⁶/µL',
    normalRangeText: 'M: 4.5 - 5.5\nF: 3.8 - 4.8',
    maleMin: 4.5, maleMax: 5.5,
    femaleMin: 3.8, femaleMax: 4.8
  },
  {
    id: 'mcv',
    name: 'MCV',
    category: 'hematology_right',
    unit: 'fl',
    normalRangeText: '76 - 96',
    min: 76, max: 96
  },
  {
    id: 'mchc',
    name: 'MCHC',
    category: 'hematology_right',
    unit: 'g/dL',
    normalRangeText: '30 - 35',
    min: 30, max: 35
  },
  {
    id: 'mch',
    name: 'MCH',
    category: 'hematology_right',
    unit: 'pg',
    normalRangeText: '27 - 32',
    min: 27, max: 32
  },
  {
    id: 'retics',
    name: 'Retics',
    category: 'hematology_right',
    unit: '%',
    normalRangeText: 'Adult: 0.5 - 2.5\nInfant: 2.0 - 6.0',
    min: 0.5, max: 2.5
  },
  {
    id: 'bleeding_time',
    name: 'Bleeding Time',
    category: 'hematology_right',
    unit: 'Min. Sec.',
    normalRangeText: 'up to 10 min',
    max: 10
  },
  {
    id: 'clotting_time',
    name: 'Clotting Time',
    category: 'hematology_right',
    unit: 'Min. Sec.',
    normalRangeText: 'Lee white up to 11 min',
    max: 11
  },
  {
    id: 'platelets',
    name: 'Platelets',
    category: 'hematology_right',
    unit: '× 10⁹/L',
    normalRangeText: '150 - 400 × 10⁹ /L',
    min: 150, max: 400
  },

  // =================== BIOCHEMICAL ===================
  { id: 'fbsugar', name: 'F.B.Sugar', category: 'biochemical', unit: 'mg/dl', normalRangeText: '70 - 120', min: 70, max: 120 },
  { id: 'hrsugar', name: 'H.R Sugar', category: 'biochemical', unit: 'mg/dl', normalRangeText: '120 - 180', min: 120, max: 180 },
  { id: 'hba1c', name: 'HB A1C', category: 'biochemical', unit: '%', normalRangeText: '4 - 6 %', min: 4, max: 6 },
  { id: 'creat', name: 'CREAT', category: 'biochemical', unit: 'mg/dl', normalRangeText: '0.7 - 1.3', min: 0.7, max: 1.3 },
  { id: 'urea', name: 'UREA', category: 'biochemical', unit: 'mg/dl', normalRangeText: '20 - 40', min: 20, max: 40 },
  { id: 'amylase', name: 'AMYLASE', category: 'biochemical', unit: 'IU/L', normalRangeText: '60 - 120 IU/L', min: 60, max: 120 },
  { 
    id: 'ua', 
    name: 'U.A', 
    category: 'biochemical', 
    unit: 'mg/dl', 
    normalRangeText: 'M: 3.5 - 7.0\nF: 2.5 - 6.0',
    maleMin: 3.5, maleMax: 7.0,
    femaleMin: 2.5, femaleMax: 6.0
  },
  { id: 'bilt', name: 'BIL.T', category: 'biochemical', unit: 'mg/dl', normalRangeText: '0.3 - 1.0', min: 0.3, max: 1.0 },
  { id: 'bild', name: 'BIL.D', category: 'biochemical', unit: 'mg/dl', normalRangeText: '0.0 - 0.4', min: 0.0, max: 0.4 },
  { id: 'bilindirect', name: 'BIL.Indirect', category: 'biochemical', unit: 'mg/dl', normalRangeText: '0.1 - 1.0', min: 0.1, max: 1.0 },
  { id: 'got', name: 'GOT', category: 'biochemical', unit: 'U/L', normalRangeText: 'up to 40', max: 40 },
  { id: 'gpt', name: 'GPT', category: 'biochemical', unit: 'U/L', normalRangeText: 'up to 40', max: 40 },
  { id: 'alkph', name: 'ALK.PH', category: 'biochemical', unit: 'IU/L', normalRangeText: '44 - 147', min: 44, max: 147 },
  { id: 'albumin', name: 'ALBUMIN', category: 'biochemical', unit: 'g/dl', normalRangeText: '3.5 - 5.0', min: 3.5, max: 5.0 },
  { id: 'ca', name: 'Ca', category: 'biochemical', unit: 'mg/dl', normalRangeText: '8.1 - 10.4', min: 8.1, max: 10.4 },
  { id: 'k', name: 'K', category: 'biochemical', unit: 'mmol/L', normalRangeText: '3.5 - 5.0', min: 3.5, max: 5.0 },
  { id: 'na', name: 'Na', category: 'biochemical', unit: 'mmol/L', normalRangeText: '135 - 145', min: 135, max: 145 },
  { id: 'trig', name: 'TRIG', category: 'biochemical', unit: 'mg/dl', normalRangeText: '< 150', max: 150 },
  { id: 'chol', name: 'CHOL', category: 'biochemical', unit: 'mg/dl', normalRangeText: '< 200', max: 200 },

  // =================== SEROLOGICAL ===================
  { id: 'widal_t', name: 'WIDAL T', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 's_typhi_o', name: 'S. Typhi O', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 's_typhi_h', name: 'S. Typhi H', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 's_typhi_a', name: 'S. Typhi A', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 's_typhi_b', name: 'S. Typhi B', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 'troponin', name: 'Troponin', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 'aso', name: 'ASO', category: 'serological', unit: '', normalRangeText: '< 200 IU/ml' },
  { id: 'crp', name: 'CRP', category: 'serological', unit: '', normalRangeText: '< 6 mg/L' },
  { id: 'rf', name: 'RF', category: 'serological', unit: '', normalRangeText: '< 14 IU/ml' },
  { id: 'pregnancy', name: 'pregnancy', category: 'serological', unit: '', normalRangeText: 'Negative' },
  
  { id: 'brucella_a', name: 'Brucella.A', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 'brucella_m', name: 'Brucella.M', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 'tox_igg', name: 'TOX.IgG', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 'tox_igm', name: 'TOX.IgM', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 'tb_ab', name: 'T.B Ab', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 'hcv', name: 'HCV', category: 'serological', unit: '', normalRangeText: 'Non-Reactive' },
  { id: 'hbsag', name: 'HBsAg', category: 'serological', unit: '', normalRangeText: 'Non-Reactive' },
  { id: 'hiv', name: 'HIV', category: 'serological', unit: '', normalRangeText: 'Non-Reactive' },
  { id: 'hpylor', name: 'H.pylor', category: 'serological', unit: '', normalRangeText: 'Negative' },
  { id: 'hav', name: 'HAV', category: 'serological', unit: '', normalRangeText: 'Negative' },
];

export const SEROLOGY_LEFT_KEYS = [
  'widal_t', 's_typhi_o', 's_typhi_h', 's_typhi_a', 's_typhi_b',
  'troponin', 'aso', 'crp', 'rf', 'pregnancy'
];

export const SEROLOGY_RIGHT_KEYS = [
  'brucella_a', 'brucella_m', 'tox_igg', 'tox_igm', 'tb_ab',
  'hcv', 'hbsag', 'hiv', 'hpylor', 'hav'
];

export const SEROLOGY_QUICK_OPTIONS = [
  'Negative', 'Positive', 'Non-Reactive', 'Reactive', 'Normal', 'Trace', '1/40', '1/80', '1/160', '1/320'
];

/**
 * Automatically evaluates whether a numerical or text result is outside the reference normal range
 */
export function evaluateAbnormal(testId: string, resultStr: string, sex: Sex = 'M'): boolean {
  if (!resultStr || resultStr.trim() === '' || resultStr.trim() === '-') return false;
  
  const def = TEST_DEFINITIONS.find(t => t.id === testId);
  if (!def) return false;

  const cleanStr = resultStr.trim();

  // If qualitative (e.g. Serological or qualitative test)
  if (def.category === 'serological' || isNaN(parseFloat(cleanStr))) {
    const lower = cleanStr.toLowerCase();
    if (lower.includes('positive') || lower.includes('reactive') || lower.includes('high') || lower.includes('abnormal')) {
      return true;
    }
    return false;
  }

  // Parse numeric
  const val = parseFloat(cleanStr);
  if (isNaN(val)) return false;

  // Gender specific bounds
  if (sex === 'M' && (def.maleMin !== undefined || def.maleMax !== undefined)) {
    if (def.maleMin !== undefined && val < def.maleMin) return true;
    if (def.maleMax !== undefined && val > def.maleMax) return true;
    return false;
  }
  if (sex === 'F' && (def.femaleMin !== undefined || def.femaleMax !== undefined)) {
    if (def.femaleMin !== undefined && val < def.femaleMin) return true;
    if (def.femaleMax !== undefined && val > def.femaleMax) return true;
    return false;
  }

  // Standard bounds
  if (def.min !== undefined && val < def.min) return true;
  if (def.max !== undefined && val > def.max) return true;

  return false;
}
