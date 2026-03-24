export interface University {
  id: string;
  name: string;
  nameKr: string;
  visaTop: number;
  address: string;
  rank: string;
  majors: string;
  admissionRequirements: string;
  tuitionD4: string;
  tuitionD2_2: string;
  tuitionD2_3: string;
  scholarship: string;
  dormitory: string;
  jobOpportunities: string;
  calcTuitionD4: number;
  calcTuitionD2_2: number;
  calcTuitionD2_3: number;
  image: string;
  minGpaD4: number;
  minGpaD2: number;
}

export const KRW_TO_VND = 18.5;

export const UNIVERSITIES: University[] = [];

export const VISA_TYPES = [
  { id: 'd4-1', label: 'D4-1: Hệ tiếng', multiplier: 1.0, field: 'calcTuitionD4' },
  { id: 'd2-1', label: 'D2-1: Hệ Cao Đẳng', multiplier: 1.0, field: 'calcTuitionD2_1' },
  { id: 'd2-2', label: 'D2-2: Hệ Đại Học', multiplier: 1.0, field: 'calcTuitionD2_2' },
  { id: 'd2-3', label: 'D2-3: Hệ Thạc Sĩ', multiplier: 1.0, field: 'calcTuitionD2_3' },
];

export const TOPIK_LEVELS = [
  { id: '0', label: 'TOPIK 0 (Chưa có chứng chỉ)', discount: 0 },
  { id: '1', label: 'TOPIK 1', discount: 0 },
  { id: '2', label: 'TOPIK 2', discount: 0 },
  { id: '3', label: 'TOPIK 3', discount: 0.3 },
  { id: '4', label: 'TOPIK 4', discount: 0.5 },
  { id: '5', label: 'TOPIK 5', discount: 0.7 },
  { id: '6', label: 'TOPIK 6', discount: 1.0 },
];
