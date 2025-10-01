import React, { useState, useRef } from 'react';
import { marked } from 'marked';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

// --- SVG Icons for the new UI ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;

// --- MAIN APP COMPONENT ---
function App() {
  const [view, setView] = useState<'analyzer' | 'generator'>('analyzer');
  return ( <div className="min-h-screen bg-gray-900 text-gray-200" style={{ fontFamily: "'Montserrat', sans-serif" }}> <style>{` @media print { .printable-hide { display: none; } #resume-output { position: absolute; left: 0; top: 0; width: 100%; margin: 0; border: none; box-shadow: none; } } .form-input:focus { outline: none; box-shadow: 0 0 0 2px #ef4444; } `}</style> <div className="printable-hide"> <header className="bg-gray-800 shadow-lg"> <div className="container mx-auto px-4 py-6"> <h1 className="text-3xl font-bold text-center text-red-500 tracking-wider">AI RESUME BUILDER</h1> <p className="text-center text-gray-400 mt-1">Craft and Analyze Resumes with the Power of AI</p> </div> </header> <main className="container mx-auto px-4 py-8"> <div className="flex justify-center border-b-2 border-gray-700 mb-8"> <button onClick={() => setView('analyzer')} className={`px-6 py-3 font-bold rounded-t-lg transition-colors duration-300 ${view === 'analyzer' ? 'border-b-4 border-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`}>Resume Analyzer</button> <button onClick={() => setView('generator')} className={`px-6 py-3 font-bold rounded-t-lg transition-colors duration-300 ${view === 'generator' ? 'border-b-4 border-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`}>Resume Generator</button> </div> </main> </div> <div className="container mx-auto px-4 pb-8"> {view === 'analyzer' ? <AnalyzerView /> : <GeneratorView />} </div> </div> );
}

// --- ANALYZER VIEW COMPONENT (Redesigned Feedback) ---
function AnalyzerView() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null); // State now holds an object
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f && f.type === 'application/pdf') { setFile(f); setFeedback(null); setError(''); } else { setError('Please select a valid PDF file.'); setFile(null); } };
  
  const handleAnalyze = async () => { if (!file) { setError('Please upload a file first.'); return; } setIsLoading(true); setError(''); setFeedback(null); try { const data = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data }).promise; let text = ''; for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const content = await page.getTextContent(); text += content.items.map((item: any) => item.str).join(' '); } const aiFeedback = await callFakeAnalyzerAPI(text); setFeedback(aiFeedback); } catch (err: any) { console.error(err); setError(`An error occurred: ${err.message}`); } finally { setIsLoading(false); } };
  
  const callFakeAnalyzerAPI = async (text: string) => {
    // The simulated AI now returns a structured object
    const mockFeedback = {
      overallScore: 88,
      strengths: [
        "**Quantifiable Impact:** Excellent use of numbers (e.g., 'CGPA: 9.37') provides concrete evidence of your performance.",
        "**Strong Project Descriptions:** Your project descriptions are detailed and clearly explain the technologies used and the outcomes.",
        "**Modern Skill Set:** The skills section is well-organized and showcases a highly relevant, modern tech stack (MERN, Data Analysis tools).",
      ],
      areasForImprovement: [
        "**Action Verbs:** The start of some project descriptions could be made more impactful. Instead of 'Designed and implemented', try leading with the result, like 'Improved road safety by designing and implementing...'",
        "**LinkedIn URL:** While included, ensure it's a clickable hyperlink in digital versions of your resume for easy access for recruiters.",
      ],
      actionableSuggestions: [
        "**Add a 'Technical Proficiencies' Summary:** Consider adding a brief, high-level summary of your core technical abilities right below your career objective for quick scanning.",
        "**Tailor for Each Application:** For each job you apply for, slightly re-order your skills or projects to highlight the most relevant experience first.",
      ],
    };
    return new Promise(resolve => setTimeout(() => resolve(mockFeedback), 2500));
  };
  
  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg printable-hide border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">Analyze Your Resume</h2>
      <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-10 text-center mb-8">
        <p className="mb-4 text-gray-400 min-h-[24px]">{file ? `Selected file: ${file.name}` : "Upload resume (PDF) for AI feedback."}</p>
        <button onClick={() => fileInputRef.current?.click()} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105">{file ? 'Change PDF' : 'Upload PDF'}</button>
      </div>
      {file && !feedback && !isLoading && (
        <div className="text-center">
          <button onClick={handleAnalyze} disabled={isLoading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 disabled:bg-gray-500 transition-all transform hover:scale-105">
            {isLoading ? 'Analyzing...' : 'Analyze Now'}
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-center mt-4 p-2 bg-red-900 bg-opacity-50 rounded-md">{error}</p>}
      
      {isLoading && <p className="text-center text-gray-400 animate-pulse text-lg">Analyzing your resume, please wait...</p>}
      {feedback && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-200 text-center">Overall Score</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full" style={{ width: `${feedback.overallScore}%` }}></div>
              </div>
              <p className="text-center text-2xl font-bold mt-2 text-red-500">{feedback.overallScore} / 100</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border border-green-500/30">
              <div className="flex items-center mb-3">
                <CheckCircleIcon />
                <h4 className="font-bold text-lg ml-2 text-green-400">Strengths</h4>
              </div>
              <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
                {feedback.strengths.map((item: string, index: number) => <li key={index} dangerouslySetInnerHTML={{ __html: marked(item) as string }} />)}
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/30">
              <div className="flex items-center mb-3">
                <XCircleIcon />
                <h4 className="font-bold text-lg ml-2 text-yellow-400">Areas for Improvement</h4>
              </div>
              <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
                {feedback.areasForImprovement.map((item: string, index: number) => <li key={index} dangerouslySetInnerHTML={{ __html: marked(item) as string }} />)}
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-blue-500/30">
            <div className="flex items-center mb-3">
              <LightbulbIcon />
              <h4 className="font-bold text-lg ml-2 text-blue-400">Actionable Suggestions</h4>
            </div>
            <ul className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
              {feedback.actionableSuggestions.map((item: string, index: number) => <li key={index} dangerouslySetInnerHTML={{ __html: marked(item) as string }} />)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// --- GENERATOR VIEW COMPONENT (Unchanged) ---
function GeneratorView() {
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', linkedin: '', careerObjective: '', education: { university: '', degree: '', period: '', gpa: '' }, skills: [{ category: '', list: '' }], projects: [{ title: '', description: '' }], certifications: '', });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, education: { ...formData.education, [e.target.name]: e.target.value } });
  const handleListChange = (listName: 'skills' | 'projects', index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const newList = [...formData[listName]]; newList[index] = { ...newList[index], [e.target.name]: e.target.value }; setFormData({ ...formData, [listName]: newList }); };
  const addToList = (listName: 'skills' | 'projects') => { const newItem = listName === 'skills' ? { category: '', list: '' } : { title: '', description: '' }; setFormData({ ...formData, [listName]: [...formData[listName], newItem] }); };
  const handleGenerate = async () => { setIsLoading(true); setGeneratedResume(''); const result = await callFakeGeneratorAPI(formData); setGeneratedResume(result); setIsLoading(false); };
  const callFakeGeneratorAPI = (data: typeof formData) => { const resumeHTML = ` <div style="padding: 2.5rem; background-color: white; color: #111827; font-family: 'Montserrat', sans-serif; font-size: 10.5pt; line-height: 1.6;"> <header style="text-align: center; margin-bottom: 2rem;"><h1 style="font-size: 2.5rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">${data.fullName}</h1><p style="font-size: 0.8rem; margin-top: 0.5rem; letter-spacing: 0.05em;">${data.phone} | ${data.email} | ${data.linkedin}</p></header> <section><h2 style="font-size: 0.9rem; font-weight: 700; letter-spacing: 0.1em; border-bottom: 1.5px solid black; padding-bottom: 4px; margin-bottom: 0.75rem; text-transform: uppercase;">CAREER OBJECTIVE</h2><p>${data.careerObjective}</p></section> <section style="margin-top: 1.5rem;"><div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid black; padding-bottom: 4px; margin-bottom: 0.75rem;"><h2 style="font-size: 0.9rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">EDUCATION</h2><p style="font-weight: 700;">${data.education.period}</p></div><div style="display: flex; justify-content: space-between;"><div><h3 style="font-weight: 700;">${data.education.university}</h3><p>${data.education.degree}</p></div><p style="font-weight: 700;">${data.education.gpa}</p></div></section> <section style="margin-top: 1.5rem;"><h2 style="font-size: 0.9rem; font-weight: 700; letter-spacing: 0.1em; border-bottom: 1.5px solid black; padding-bottom: 4px; margin-bottom: 0.75rem; text-transform: uppercase;">SKILLS</h2><ul style="list-style-type: disc; list-style-position: inside; padding-left: 0;">${data.skills.map(skill => `<li><strong style="font-weight: 700;">${skill.category}:</strong> ${skill.list}</li>`).join('')}</ul></section> <section style="margin-top: 1.5rem;"><h2 style="font-size: 0.9rem; font-weight: 700; letter-spacing: 0.1em; border-bottom: 1.5px solid black; padding-bottom: 4px; margin-bottom: 0.75rem; text-transform: uppercase;">PROJECTS</h2>${data.projects.map(proj => `<div style="margin-bottom: 1rem;"><h3 style="font-weight: 700;">${proj.title}</h3><p>${proj.description}</p></div>`).join('')}</section> <section style="margin-top: 1.5rem;"><h2 style="font-size: 0.9rem; font-weight: 700; letter-spacing: 0.1em; border-bottom: 1.5px solid black; padding-bottom: 4px; margin-bottom: 0.75rem; text-transform: uppercase;">CERTIFICATIONS</h2><ul style="list-style-type: disc; list-style-position: inside; padding-left: 0;">${data.certifications.split('\n').map(cert => cert.trim() ? `<li>${cert.trim()}</li>` : '').join('')}</ul></section> </div>`; return new Promise<string>(resolve => setTimeout(() => resolve(resumeHTML.trim()), 1000)); };
  const handlePrint = () => { window.print(); };
  return ( <> <div className="bg-gray-800 p-8 rounded-xl shadow-lg printable-hide border border-gray-700"> <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">Generate a New Resume</h2> <div className="space-y-6"> <div className="p-4 border border-gray-700 rounded-lg bg-gray-900"><h3 className="font-semibold mb-2">Personal Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="fullName" placeholder="Full Name" onChange={handleChange} className="p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /><input name="email" placeholder="Email" onChange={handleChange} className="p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /><input name="phone" placeholder="Phone" onChange={handleChange} className="p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /><input name="linkedin" placeholder="LinkedIn URL" onChange={handleChange} className="p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /></div><textarea name="careerObjective" placeholder="Career Objective" onChange={handleChange} className="w-full mt-4 p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" rows={4}></textarea></div> <div className="p-4 border border-gray-700 rounded-lg bg-gray-900"><h3 className="font-semibold mb-2">Education</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="university" placeholder="University/College" onChange={handleEducationChange} className="p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /><input name="degree" placeholder="Degree (e.g., B.Tech)" onChange={handleEducationChange} className="p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /><input name="period" placeholder="Time Period (e.g., 2022-2026)" onChange={handleEducationChange} className="p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /><input name="gpa" placeholder="CGPA or Grade" onChange={handleEducationChange} className="p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /></div></div> <div className="p-4 border border-gray-700 rounded-lg bg-gray-900"><h3 className="font-semibold mb-2">Skills</h3>{formData.skills.map((skill, index) => (<div key={index} className="flex gap-4 mb-2 p-2 border-t border-gray-700"><input name="category" value={skill.category} placeholder="Category" onChange={(e) => handleListChange('skills', index, e)} className="w-1/3 p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /><input name="list" value={skill.list} placeholder="Skills" onChange={(e) => handleListChange('skills', index, e)} className="w-2/3 p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /></div>))}<button onClick={() => addToList('skills')} className="text-sm text-red-500 hover:underline font-semibold">+ Add Skill</button></div> <div className="p-4 border border-gray-700 rounded-lg bg-gray-900"><h3 className="font-semibold mb-2">Projects</h3>{formData.projects.map((proj, index) => (<div key={index} className="space-y-2 mb-4 p-2 border-t border-gray-700"><input name="title" value={proj.title} placeholder="Project Title" onChange={(e) => handleListChange('projects', index, e)} className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" /><textarea name="description" value={proj.description} placeholder="Description" onChange={(e) => handleListChange('projects', index, e)} className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" rows={3}></textarea></div>))}<button onClick={() => addToList('projects')} className="text-sm text-red-500 hover:underline font-semibold">+ Add Project</button></div> <div className="p-4 border border-gray-700 rounded-lg bg-gray-900"><h3 className="font-semibold mb-2">Certifications</h3><textarea name="certifications" placeholder="List certs (one per line)" onChange={handleChange} className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md form-input" rows={4}></textarea></div> </div> <div className="text-center mt-8"><button onClick={handleGenerate} disabled={isLoading} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-all transform hover:scale-105">{isLoading ? 'Generating...' : 'Generate Resume'}</button></div> </div> {generatedResume && (<div className="mt-8"><div className="flex justify-between items-center mb-4 printable-hide"><h3 className="font-bold text-lg">Your Professional Resume:</h3><button onClick={handlePrint} className="bg-gray-600 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-gray-700">Print / Save as PDF</button></div><div id="resume-output" className="border border-gray-700 rounded-lg shadow-2xl bg-white" dangerouslySetInnerHTML={{ __html: generatedResume }} /></div>)} </> );
    }

    export default App;