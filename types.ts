
export interface PatientInfo {
  name: string;
  age: number | string;
  gender: string;
  habits?: {
    smoking: boolean;
    alcohol: boolean;
  };
}

export interface MedicalFile {
  id: string;
  file: File;
  previewUrl: string;
  type: 'prescription' | 'scan' | 'tablet';
  detectedType?: 'xray' | 'mri' | 'blood' | 'ct' | 'generic';
  name: string;
}

export interface AnalysisResult {
  diagnosis: {
    issue: string;
    values: string;
    severity: 'CRITICAL' | 'MODERATE' | 'MILD' | 'NORMAL';
    referenceRange: string;
    assessment: string;
  }[];
  prescriptions: {
    name: string;
    dosage: string;
    frequency: string;
    verification: 'CORRECT' | 'CHECK' | 'ISSUE';
    verificationNote: string;
  }[];
  recommendations: {
    do: string[];
    avoid: string[];
    monitor: string[];
    consult: string;
  };
  confidenceScore: number;
}

export type AppStep = 1 | 2 | 3;
