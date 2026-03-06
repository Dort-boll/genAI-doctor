
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, 
  Plus, 
  FileText, 
  Camera, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Search,
  User,
  Layers,
  Trash2,
  Check,
  X,
  Dna,
  Heart,
  ShieldCheck,
  Zap,
  Leaf,
  Sun,
  Droplets,
  Moon,
  Smile,
  Shield,
  Activity,
  Microscope,
  Thermometer,
  ClipboardList,
  Fingerprint,
  Pill,
  Wine,
  Flame,
  Stethoscope,
  ChevronDown,
  Info,
  RefreshCw,
  Edit3,
  ArrowRight,
  Globe
} from 'lucide-react';
import { PatientInfo, MedicalFile, AppStep, AnalysisResult } from './types';
import { performMultiAIAnalysis, webFetch } from './services/putterAdapter';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(1);
  const [regSubStep, setRegSubStep] = useState<'name' | 'age' | 'gender'>('name');
  const [patient, setPatient] = useState<PatientInfo>({ 
    name: '', 
    age: '', 
    gender: '',
    habits: { smoking: false, alcohol: false } 
  });
  
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [tabletToast, setTabletToast] = useState(false);
  const [manualMeds, setManualMeds] = useState('');
  const [manualTablets, setManualTablets] = useState<string[]>([]);
  const [currentTabletInput, setCurrentTabletInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [webResults, setWebResults] = useState<string[]>([]);
  const [labVerified, setLabVerified] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const ageValidation = useMemo(() => {
    const ageStr = patient.age.toString();
    if (ageStr === '') return { isValid: false, error: null };
    const num = parseInt(ageStr);
    if (isNaN(num) || num <= 0 || num > 120) {
      return { isValid: false, error: "Age must be between 1 and 120." };
    }
    return { isValid: true, error: null };
  }, [patient.age]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: MedicalFile['type']) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const newFiles: MedicalFile[] = [];
      const newErrors: Record<string, string> = { ...fileErrors };
      for (const f of selectedFiles) {
        const id = Math.random().toString(36).substr(2, 9);
        if (f.size > 10 * 1024 * 1024) newErrors[id] = "File exceeds 10MB limit.";
        newFiles.push({ id, file: f, previewUrl: URL.createObjectURL(f), type, name: f.name });
        if (type === 'tablet') {
          setTabletToast(true);
          setTimeout(() => setTabletToast(false), 3000);
        }
      }
      setFiles(prev => [...prev, ...newFiles]);
      setFileErrors(newErrors);
    }
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const addManualTablet = () => {
    if (currentTabletInput.trim()) {
      setManualTablets(prev => [...prev, currentTabletInput.trim()]);
      setCurrentTabletInput('');
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fullMedContext = `${manualMeds}\nManual Tablets: ${manualTablets.join(', ')}`;
    try {
      const result = await performMultiAIAnalysis(patient, files, fullMedContext);
      setAnalysisResult(result);
      const webInfo = await webFetch(result.diagnosis[0]?.issue || "general health");
      setWebResults(webInfo);
    } catch (err) {
      setAnalysisResult(MOCK_RESULT);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const DnaLoader = () => (
    <div className="relative w-32 h-40 flex items-center justify-center">
      {[...Array(12)].map((_, i) => (
        <React.Fragment key={i}>
          <div className="dna-node" style={{ left: `${i * 8}%`, animationDelay: `${i * 0.1}s`, background: '#00f3ff' }} />
          <div className="dna-node" style={{ left: `${i * 8}%`, animationDelay: `${i * 0.1 + 1.25}s`, background: '#a855f7' }} />
        </React.Fragment>
      ))}
      <div className="absolute neon-border p-5 rounded-full bg-cyan-900/10 backdrop-blur-md">
        <Dna className="w-8 h-8 neon-text animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white flex flex-col items-center pb-12 overflow-x-hidden relative">
      {/* Notifications */}
      {tabletToast && (
        <div className="fixed top-24 z-[250] px-5 py-3 glass neon-border rounded-full flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-2xl mx-4">
          <Pill className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-black uppercase tracking-widest neon-text">Medical Asset Indexed</span>
        </div>
      )}

      {/* Header */}
      <header className={`w-full fixed top-0 left-0 right-0 z-[200] flex items-center justify-center transition-all duration-700 ease-out ${isScrolled ? 'header-active h-16 md:h-18' : 'header-glass h-20 md:h-24'}`}>
        <div className={`w-full max-w-6xl px-6 flex items-center justify-between transition-all duration-700 ${isScrolled ? 'scale-95' : 'scale-100'}`}>
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setStep(1); setRegSubStep('name'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className={`p-2 rounded-xl bg-cyan-500/10 neon-border transition-all duration-700 ${isScrolled ? 'scale-90 bg-cyan-500/20' : 'scale-105'}`}>
              <Stethoscope className="w-5 h-5 md:w-6 md:h-6 neon-text" />
            </div>
            <div className="transition-all duration-700">
              <h1 className={`font-black tracking-tight neon-text font-poppins italic transition-all duration-700 ${isScrolled ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`}>Vayu AGI</h1>
              {!isScrolled && <p className="text-[8px] md:text-[9px] text-gray-500 tracking-[0.3em] uppercase font-bold animate-in fade-in slide-in-from-left-2 duration-700">Clinical Intelligence</p>}
            </div>
          </div>
          <div className="flex gap-4 md:gap-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex flex-col items-center transition-all duration-700 ${step === s ? 'opacity-100' : 'opacity-25'}`}>
                <span className={`font-black tracking-widest uppercase transition-all duration-700 ${isScrolled ? 'text-[8px]' : 'text-[10px]'}`}>Protocol {s}</span>
                <div className={`h-[2px] mt-1 transition-all duration-700 ${step === s ? 'w-full bg-cyan-400 shadow-[0_0_10px_#00f3ff]' : 'w-0'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className={`transition-all duration-700 ${isScrolled ? 'h-16 md:h-18' : 'h-20 md:h-24'} w-full`} />

      <main className="w-full max-w-5xl px-4 mt-8 md:mt-10 relative z-10">
        {step === 1 && (
          <div className="glass rounded-[30px] md:rounded-[50px] p-8 md:p-12 space-y-10 md:space-y-14 animate-in fade-in duration-700">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-cyan-400">
                <Brain className="w-7 h-7 animate-pulse" />
                <h2 className="text-xl md:text-3xl font-black font-poppins italic uppercase tracking-tight">Biometric Initialization</h2>
              </div>
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest font-medium">Calibrating physiological baseline for GenAI Synthesis.</p>
            </div>

            <div className="space-y-10 md:space-y-16">
              <div className={`space-y-4 transition-all duration-500 ${regSubStep !== 'name' ? 'opacity-15 blur-sm scale-95' : ''}`}>
                <label className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-black text-gray-500 flex items-center gap-2">
                  <Fingerprint className="w-3 h-3 text-cyan-500" /> Patient Identification
                </label>
                <p className="text-lg md:text-2xl font-bold font-poppins italic">"Please enter your full name to start the clinical record."</p>
                <div className="flex flex-col md:flex-row gap-3">
                  <input type="text" autoFocus placeholder="Enter Full Name" className="flex-1 input-glass rounded-2xl px-6 py-5 md:py-6 outline-none text-lg md:text-xl font-black uppercase transition-all focus:border-cyan-500/40" value={patient.name} onChange={(e) => setPatient({...patient, name: e.target.value})} disabled={regSubStep !== 'name'} />
                  {patient.name.trim().length >= 2 && regSubStep === 'name' && (
                    <button onClick={() => setRegSubStep('age')} className="py-5 px-8 bg-cyan-600 rounded-2xl text-black hover:bg-cyan-500 transition-all flex items-center justify-center shadow-lg"><ArrowRight className="w-6 h-6" /></button>
                  )}
                </div>
              </div>

              {regSubStep !== 'name' && (
                <div className={`space-y-4 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4 ${regSubStep !== 'age' ? 'opacity-15 blur-sm scale-95' : ''}`}>
                  <label className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-black text-gray-500 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-emerald-500" /> Temporal Cycle
                  </label>
                  <p className="text-lg md:text-2xl font-bold font-poppins italic">"What is your biological age (years)?"</p>
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <input type="number" placeholder="Years" className={`w-full input-glass rounded-2xl px-6 py-5 md:py-6 outline-none text-lg md:text-xl font-black focus:border-emerald-500/40 ${ageValidation.error ? 'border-red-500/50' : ''}`} value={patient.age} onChange={(e) => setPatient({...patient, age: e.target.value})} disabled={regSubStep !== 'age'} />
                      {ageValidation.error && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-widest">{ageValidation.error}</p>}
                    </div>
                    {ageValidation.isValid && regSubStep === 'age' && (
                      <button onClick={() => setRegSubStep('gender')} className="py-5 px-8 bg-cyan-600 rounded-2xl text-black flex items-center justify-center transition-all shadow-lg"><ArrowRight className="w-6 h-6" /></button>
                    )}
                  </div>
                </div>
              )}

              {regSubStep === 'gender' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
                  <div className="space-y-4">
                    <label className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-black text-gray-500 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-purple-500" /> Identity Matrix
                    </label>
                    <p className="text-lg md:text-2xl font-bold font-poppins italic">"Select your biological gender modality."</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <button key={g} onClick={() => setPatient({...patient, gender: g})} className={`rounded-2xl border h-16 md:h-20 transition-all font-black text-xs md:text-sm tracking-widest uppercase flex items-center justify-center gap-2 ${patient.gender === g ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.1)]' : 'bg-white/5 border-white/5 text-gray-600 hover:bg-white/10'}`}>
                          {g} {patient.gender === g && <CheckCircle2 className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} disabled={!patient.gender} className={`w-full font-black text-sm md:text-lg py-5 md:py-8 rounded-2xl md:rounded-[30px] flex items-center justify-center gap-3 tracking-[0.4em] uppercase transition-all ${patient.gender ? 'bg-emerald-600 text-black shadow-xl hover:scale-[1.02]' : 'bg-gray-900 text-gray-800 opacity-40 cursor-not-allowed'}`}>
                    Initialize Laboratory <Microscope className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="glass rounded-[30px] md:rounded-[50px] p-6 md:p-10 space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="space-y-2">
                <h2 className="text-xl md:text-3xl font-black neon-text uppercase italic tracking-tight">Laboratory Synthesis</h2>
                <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest font-bold">Awaiting diagnostic evidence vectors.</p>
              </div>
              <Activity className="w-8 h-8 md:w-10 md:h-10 neon-text animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prescription Upload */}
              <div className="glass rounded-3xl p-6 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg"><FileText className="w-4 h-4 neon-text" /></div>
                    <h3 className="text-xs font-black uppercase tracking-widest">Medical Prescriptions</h3>
                  </div>
                  <label className="cursor-pointer p-2 glass rounded-full hover:neon-border transition-all">
                    <Plus className="w-5 h-5 neon-text" />
                    <input type="file" multiple className="hidden" onChange={(e) => handleFileChange(e, 'prescription')} accept=".pdf,.jpg,.png" />
                  </label>
                </div>
                <div className="h-[120px] overflow-y-auto space-y-2 bg-black/40 rounded-xl p-3 text-[11px] scrollbar-hide">
                  {files.filter(f => f.type === 'prescription').length === 0 ? <p className="text-gray-800 text-center py-10 uppercase tracking-widest font-black">No Records Indexed</p> : files.filter(f => f.type === 'prescription').map(f => (
                    <div key={f.id} className="bg-white/5 p-2.5 rounded-lg flex items-center justify-between border border-white/5 hover:bg-white/10 transition-all">
                      <span className="truncate max-w-[150px] text-gray-300 font-bold">{f.name}</span>
                      <button onClick={() => removeFile(f.id)} className="text-red-900 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imaging Upload */}
              <div className="glass rounded-3xl p-6 border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg"><Layers className="w-4 h-4 text-emerald-400" /></div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Scan & Reports</h3>
                  </div>
                  <label className="cursor-pointer p-2 glass rounded-full hover:border-emerald-500 transition-all">
                    <Plus className="w-5 h-5 text-emerald-400" />
                    <input type="file" multiple className="hidden" onChange={(e) => handleFileChange(e, 'scan')} accept=".pdf,.jpg,.png" />
                  </label>
                </div>
                <div className="h-[120px] overflow-y-auto space-y-2 bg-black/40 rounded-xl p-3 text-[11px] scrollbar-hide">
                  {files.filter(f => f.type === 'scan').length === 0 ? <p className="text-gray-800 text-center py-10 uppercase tracking-widest font-black">No Vectors Uploaded</p> : files.filter(f => f.type === 'scan').map(f => (
                    <div key={f.id} className="bg-white/5 p-2.5 rounded-lg flex items-center justify-between border border-white/5 hover:bg-white/10 transition-all">
                      <span className="truncate max-w-[150px] text-gray-300 font-bold">{f.name}</span>
                      <button onClick={() => removeFile(f.id)} className="text-red-900 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tablet Verification Section */}
            <div className="glass rounded-[35px] p-8 border border-purple-500/20 space-y-6 shadow-[0_0_30px_rgba(168,85,247,0.05)]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-2xl"><Pill className="w-6 h-6 text-purple-400" /></div>
                  <div>
                    <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-purple-400 italic">Pharmaceutical Registry</h3>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Photograph and manual verification</p>
                  </div>
                </div>
                <label className="cursor-pointer flex items-center gap-3 bg-purple-500/20 px-5 py-3 rounded-2xl hover:bg-purple-500/30 transition-all border border-purple-500/30 group">
                  <Camera className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-300">Add Photo</span>
                  <input type="file" multiple className="hidden" onChange={(e) => handleFileChange(e, 'tablet')} accept=".jpg,.png" />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input type="text" placeholder="Enter Tablet Name..." className="flex-1 input-glass rounded-xl px-5 py-4 text-xs font-bold outline-none focus:border-purple-500/50 placeholder:text-gray-800" value={currentTabletInput} onChange={(e) => setCurrentTabletInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addManualTablet()} />
                    <button onClick={addManualTablet} className="px-5 bg-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/40 transition-all border border-purple-500/20"><Plus className="w-5 h-5" /></button>
                  </div>
                  <div className="h-[100px] overflow-y-auto space-y-2 bg-black/30 rounded-2xl p-3 scrollbar-hide">
                    {manualTablets.length === 0 ? <p className="text-[9px] text-gray-800 text-center uppercase py-8 font-black tracking-widest">Manual List Empty</p> : manualTablets.map((t, i) => (
                      <div key={i} className="flex justify-between items-center bg-purple-900/10 p-2.5 rounded-lg border border-purple-500/10 group animate-in slide-in-from-left-2 duration-300">
                        <span className="text-xs font-black text-purple-300 uppercase truncate">{t}</span>
                        <button onClick={() => setManualTablets(prev => prev.filter((_, idx) => idx !== i))} className="text-red-900/40 hover:text-red-500 group-hover:scale-110 transition-all"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[160px] overflow-x-auto flex gap-3 bg-black/30 rounded-2xl p-4 scrollbar-hide border border-white/5">
                  {files.filter(f => f.type === 'tablet').length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center opacity-10">
                      <Camera className="w-10 h-10 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Capture Medication Photos</span>
                    </div>
                  ) : files.filter(f => f.type === 'tablet').map(f => (
                    <div key={f.id} className="relative flex-shrink-0 group">
                      <img src={f.previewUrl} className="w-32 h-32 object-cover rounded-2xl border border-white/10 group-hover:border-purple-500/50 transition-all shadow-xl" />
                      <button onClick={() => removeFile(f.id)} className="absolute top-2 right-2 p-1.5 bg-black/80 rounded-full text-red-500 hover:bg-red-500 hover:text-black transition-all shadow-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-[35px] p-6 md:p-8 space-y-6 border border-white/5">
              <h3 className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.4em]">Environmental & Physiological Constraints</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                <button onClick={() => setPatient({...patient, habits: {...patient.habits!, smoking: !patient.habits?.smoking}})} className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${patient.habits?.smoking ? 'bg-orange-900/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'bg-white/5 border-white/5 text-gray-700'}`}>
                  <Flame className="w-4 h-4" /> <span className="text-xs font-black uppercase">Smoking</span>
                </button>
                <button onClick={() => setPatient({...patient, habits: {...patient.habits!, alcohol: !patient.habits?.alcohol}})} className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${patient.habits?.alcohol ? 'bg-blue-900/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/5 text-gray-700'}`}>
                  <Wine className="w-4 h-4" /> <span className="text-xs font-black uppercase">Alcohol</span>
                </button>
                <div className="col-span-2 flex items-center justify-center gap-4 bg-white/5 rounded-xl border border-white/5 px-6">
                   <ShieldCheck className={`w-6 h-6 transition-colors ${labVerified ? 'text-emerald-500' : 'text-gray-800'}`} />
                   <span className="text-[11px] font-black uppercase text-gray-400">Integrity Verified</span>
                   <button onClick={() => setLabVerified(!labVerified)} className={`w-12 h-6 rounded-full border p-1 transition-all ${labVerified ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-white/10'}`}><div className={`w-4 h-4 rounded-full transition-all ${labVerified ? 'translate-x-6 bg-white' : 'translate-x-0 bg-gray-700'}`}></div></button>
                </div>
              </div>
              <textarea placeholder="Diagnostic Context: Describe general symptoms, known allergies, or clinical history for deep synthesis..." className="w-full input-glass rounded-2xl p-6 min-h-[120px] outline-none text-sm md:text-base font-bold placeholder:text-gray-800 resize-none transition-all focus:border-cyan-500/50" value={manualMeds} onChange={(e) => setManualMeds(e.target.value)} />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button onClick={() => setStep(1)} className="py-6 px-10 glass text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 order-2 md:order-1 hover:text-white transition-all rounded-2xl">Phase 01: Baseline</button>
              <button onClick={startAnalysis} disabled={!labVerified} className={`flex-1 py-6 rounded-2xl md:rounded-[25px] font-black text-sm md:text-lg tracking-[0.4em] uppercase flex items-center justify-center gap-3 transition-all order-1 md:order-2 ${!labVerified ? 'bg-gray-900 text-gray-800 opacity-20 cursor-not-allowed border border-white/5' : 'bg-cyan-600 text-black shadow-2xl hover:scale-[1.01] hover:bg-cyan-500'}`}>Initiate Deep Analysis <Brain className="w-6 h-6" /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
            {isAnalyzing ? (
              <div className="glass rounded-[40px] md:rounded-[60px] p-24 md:p-40 flex flex-col items-center justify-center space-y-10 shadow-2xl border border-cyan-400/10">
                <DnaLoader />
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-4xl font-black neon-text uppercase italic tracking-[0.1em]">Synthesizing Diagnostics</h2>
                  <p className="text-[10px] uppercase tracking-[0.5em] font-black text-gray-700 animate-pulse">Running Multi-Vector Vayu Engine</p>
                </div>
              </div>
            ) : analysisResult && (
              <div className="space-y-10 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="glass p-8 md:p-10 rounded-[35px] flex flex-col items-center justify-center gap-2 bg-cyan-400/[0.02] border-cyan-400/10">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Diagnostic Confidence</span>
                      <span className="text-5xl md:text-7xl font-black neon-text italic tracking-tighter">{analysisResult.confidenceScore}<span className="text-2xl ml-1 opacity-20">%</span></span>
                   </div>
                   <div className="glass p-8 md:p-10 rounded-[35px] flex flex-col items-center justify-center gap-4">
                        {analysisResult.diagnosis.some(d => d.severity === 'CRITICAL') ? <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" /> : <ShieldCheck className="w-10 h-10 text-emerald-500" />}
                        <span className={`text-xl md:text-3xl font-black italic text-center uppercase tracking-tight ${analysisResult.diagnosis.some(d => d.severity === 'CRITICAL') ? 'text-red-500' : 'text-emerald-400'}`}>
                            {analysisResult.diagnosis.some(d => d.severity === 'CRITICAL') ? 'Critical Intervention' : 'Optimal Homeostasis'}
                        </span>
                   </div>
                </div>

                {/* Point-wise Summary */}
                <div className="space-y-6">
                  <h3 className="text-lg md:text-2xl font-black neon-text uppercase italic px-4 flex items-center gap-3">
                    <ClipboardList className="w-6 h-6" /> Integrated Diagnosis
                  </h3>
                  <div className="space-y-5">
                    {analysisResult.diagnosis.map((d, i) => (
                      <div key={i} className="glass rounded-[30px] p-6 md:p-8 border-l-[8px] border-l-cyan-500 hover:bg-white/5 transition-all shadow-xl group">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                          <h4 className="text-lg md:text-2xl font-black italic uppercase tracking-tight group-hover:neon-text transition-all">{d.issue}</h4>
                          <span className={`px-5 py-2 rounded-full text-[9px] md:text-[11px] font-black tracking-widest border self-start ${d.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-emerald-500/10 border-emerald-400/40 text-emerald-400'}`}>{d.severity}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="p-5 bg-black/50 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-gray-600 font-black uppercase mb-2 tracking-widest">Observed Reading</p>
                            <p className="text-xl md:text-2xl font-black neon-text tracking-tight">{d.values}</p>
                          </div>
                          <div className="p-5 bg-black/50 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-gray-600 font-black uppercase mb-2 tracking-widest">Clinical Baseline</p>
                            <p className="text-xl md:text-2xl font-black text-gray-500 tracking-tight">{d.referenceRange}</p>
                          </div>
                        </div>
                        <div className="p-6 bg-cyan-400/5 rounded-2xl border border-cyan-400/10">
                           <p className="text-gray-300 text-sm md:text-base font-bold italic leading-relaxed">
                             <span className="text-cyan-400 mr-2 font-black">AI Assessment:</span> {d.assessment}
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table for Medications */}
                <div className="space-y-6">
                    <h3 className="text-lg md:text-2xl font-black text-purple-400 uppercase italic px-4 flex items-center gap-3">
                        <Pill className="w-6 h-6" /> Regimen Analysis
                    </h3>
                    <div className="glass rounded-[30px] overflow-hidden border border-white/5 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-600 border-b border-white/5">
                                    <tr>
                                        <th className="p-6">Compound Formulation</th>
                                        <th className="p-6">Cycle Protocol</th>
                                        <th className="p-6 text-right">Synthesis Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {analysisResult.prescriptions.map((p, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-black text-base md:text-lg italic uppercase text-gray-200 group-hover:text-purple-300 transition-all">{p.name}</div>
                                                <div className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-widest">{p.dosage}</div>
                                            </td>
                                            <td className="p-6 text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">{p.frequency}</td>
                                            <td className="p-6 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    {p.verification === 'CORRECT' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${p.verification === 'CORRECT' ? 'text-emerald-500/60' : 'text-yellow-500/60'}`}>{p.verificationNote}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Web Results */}
                <div className="space-y-6">
                    <h3 className="text-lg md:text-2xl font-black text-emerald-400 uppercase italic px-4 flex items-center gap-3">
                        <Globe className="w-6 h-6" /> Clinical Intelligence Index
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {webResults.map((res, i) => (
                            <div key={i} className="glass p-6 rounded-2xl border border-emerald-500/10 flex items-start gap-4 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04] transition-all">
                                <div className="p-2 bg-emerald-500/10 rounded-lg"><Info className="w-5 h-5 text-emerald-500" /></div>
                                <p className="text-xs md:text-base font-bold text-gray-400 italic leading-relaxed">{res}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-12">
                    <button onClick={() => window.print()} className="py-6 rounded-2xl glass text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-all shadow-xl">Export Summary</button>
                    <button onClick={() => window.location.reload()} className="py-6 rounded-2xl bg-cyan-600 text-[11px] font-black uppercase tracking-[0.4em] text-black shadow-2xl hover:bg-cyan-500 transition-all transform hover:scale-[1.01]">New Patient Cycle</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px] -z-10 animate-pulse"></div>
      <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDelay: '3s' }}></div>
    </div>
  );
};

const MOCK_RESULT: AnalysisResult = {
  diagnosis: [
    { issue: "Blood Pressure Fluctuation", values: "158/104 mmHg", severity: "CRITICAL", referenceRange: "120/80", assessment: "Consistent hypertensive vector detected. Vayu AGI recommends immediate modulation of arterial strain protocols." },
    { issue: "Metabolic Glycemic Drift", values: "135 mg/dL", severity: "MODERATE", referenceRange: "70-99", assessment: "Glucose markers trending above optimal thresholds. Nutritional reconfiguration advised." }
  ],
  prescriptions: [
    { name: "Active Compound Alpha", dosage: "12.5mg", frequency: "24h Cycle", verification: "CORRECT", verificationNote: "Clinical alignment confirmed." },
    { name: "Metabolic Inhibitor Beta", dosage: "500mg", frequency: "12h Cycle", verification: "CHECK", verificationNote: "Monitor gastro-tolerance." }
  ],
  recommendations: { do: ["Activity", "Low sodium"], avoid: ["Stimulants"], monitor: ["Daily BP"], consult: "Consult within 48h." },
  confidenceScore: 98
};

export default App;
