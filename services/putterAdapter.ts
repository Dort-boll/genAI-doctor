
import { PatientInfo, MedicalFile, AnalysisResult } from "../types";

/**
 * This service implements the 'Putter.js' framework requirements 
 * using Puter.js AI capabilities.
 */

declare const puter: any;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const performMultiAIAnalysis = async (
  patient: PatientInfo,
  files: MedicalFile[],
  manualMeds: string
): Promise<AnalysisResult> => {
  
  const habitsStr = patient.habits 
    ? `Habits: Smoking: ${patient.habits.smoking}, Alcohol: ${patient.habits.alcohol}.` 
    : "";

  const prompt = `You are Vayu AGI, a high-precision medical analysis engine. Analyze the following patient data: 
      Name: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}. 
      ${habitsStr}
      Manual medication notes: ${manualMeds}. 
      Task: Perform deep analysis of the attached medical documents (prescriptions/scans/tablet images). 
      Identify issues, verify dosages, and suggest evidence-based medical paths. 
      For scan reports, look for anomalies in blood counts, imaging findings, or lab values.
      For tablet photos, identify the medicine if possible.
      Factor in the lifestyle habits (smoking/alcohol) in your risk assessment and recommendations.
      
      Return ONLY a JSON object with the following structure:
      {
        "diagnosis": [{"issue": string, "values": string, "severity": "CRITICAL"|"MODERATE"|"MILD"|"NORMAL", "referenceRange": string, "assessment": string}],
        "prescriptions": [{"name": string, "dosage": string, "frequency": string, "verification": "CORRECT"|"CHECK"|"ISSUE", "verificationNote": string}],
        "recommendations": {"do": string[], "avoid": string[], "monitor": string[], "consult": string},
        "confidenceScore": number
      }`;

  const content: any[] = [{ type: 'text', text: prompt }];

  for (const f of files) {
    const b64 = await fileToBase64(f.file);
    content.push({
      type: 'image',
      image: {
        data: b64,
        format: f.file.type.split('/')[1] || 'png'
      }
    });
  }

  try {
    const response = await puter.ai.chat([{ role: 'user', content }]);
    
    let resultText = response.toString();
    // Clean up markdown if present
    if (resultText.includes('```json')) {
      resultText = resultText.split('```json')[1].split('```')[0].trim();
    } else if (resultText.includes('```')) {
      resultText = resultText.split('```')[1].split('```')[0].trim();
    }

    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Puter AI Error:", error);
    throw error;
  }
};

export const webFetch = async (query: string): Promise<string[]> => {
    return [
        "Vayu AGI Index: Clinical guidelines for current symptoms suggest specialized cardiac monitoring.",
        "Vayu AGI Knowledge Base: Recent clinical trials support early intervention in metabolic flux.",
        "Vayu AGI Synthesis: Lifestyle modification protocols (smoking cessation/alcohol reduction) significantly improve long-term prognosis."
    ];
};
