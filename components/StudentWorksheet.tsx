import React, { useState, useEffect, useRef } from 'react';
import { User, Question, QuestionResult, AppState } from '../types';
import * as GeminiService from '../services/geminiService';
import { syncProgressToSheet } from '../services/sheetService';
import { Play, Mic, Send, RefreshCw, Volume2, Star, ArrowRight, Lightbulb } from 'lucide-react';

interface StudentWorksheetProps {
  user: User;
}

const StudentWorksheet: React.FC<StudentWorksheetProps> = ({ user }) => {
  const [topic, setTopic] = useState<string>("Greetings");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [culturalTip, setCulturalTip] = useState<string>("");
  const hasFetchedRef = useRef(false);

  // Initial Fetch
  useEffect(() => {
    if (!hasFetchedRef.current) {
      startSession();
      hasFetchedRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    setAppState(AppState.LOADING);
    const newQuestions = await GeminiService.generateQuestions(topic, 5); // Fetch batch of 5
    const tip = await GeminiService.getCulturalContext(topic);
    setCulturalTip(tip);
    setQuestions(newQuestions);
    setResults([]);
    setCurrentQIndex(0);
    setUserAnswer("");
    setAppState(AppState.ANSWERING);
  };

  const handleSpeakQuestion = () => {
    if (questions[currentQIndex]) {
      GeminiService.speakText(questions[currentQIndex].text);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setAppState(AppState.GRADING);
    const currentQ = questions[currentQIndex];

    const assessment = await GeminiService.gradeAnswer(currentQ.text, userAnswer);

    const result: QuestionResult = {
      questionId: currentQ.id,
      questionText: currentQ.text,
      userAnswer: userAnswer,
      assessment: assessment,
      timestamp: Date.now()
    };

    setResults([...results, result]);
    
    // Sync to sheet
    await syncProgressToSheet(user, result);

    setAppState(AppState.REVIEW);
    
    // Auto speak the correction if score is low, or praise if high
    if (assessment.score < 8) {
       GeminiService.speakText(`Correct answer is: ${assessment.correction}`);
    } else {
       GeminiService.speakText(assessment.praise);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setUserAnswer("");
      setAppState(AppState.ANSWERING);
    } else {
      setAppState(AppState.COMPLETE);
    }
  };

  const loadMoreQuestions = async () => {
    setAppState(AppState.LOADING);
    // Logic to increase difficulty could go here
    const newQuestions = await GeminiService.generateQuestions(topic, 5);
    setQuestions(newQuestions);
    setResults([]); // Clear previous batch results from UI, but they are already in Sheet
    setCurrentQIndex(0);
    setUserAnswer("");
    setAppState(AppState.ANSWERING);
  };

  if (appState === AppState.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-indigo-600">
        <RefreshCw className="animate-spin mb-4" size={48} />
        <p className="text-xl font-medium animate-pulse">AI đang soạn bài tập cho bạn...</p>
      </div>
    );
  }

  if (appState === AppState.COMPLETE) {
    const avgScore = results.reduce((acc, curr) => acc + curr.assessment.score, 0) / results.length;
    
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Star className="text-yellow-500 fill-yellow-500" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Hoàn thành xuất sắc!</h2>
        <p className="text-slate-600 mb-8">Bạn đã hoàn thành bộ câu hỏi chủ đề <span className="font-bold text-indigo-600">{topic}</span>.</p>
        
        <div className="bg-slate-50 rounded-xl p-6 mb-8">
          <p className="text-sm text-slate-500 uppercase tracking-wide font-bold mb-2">Điểm trung bình</p>
          <p className="text-4xl font-extrabold text-indigo-600">{avgScore.toFixed(1)} <span className="text-lg text-slate-400">/ 10</span></p>
        </div>

        <button 
          onClick={loadMoreQuestions}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={20} />
          Làm bài tiếp theo (Câu hỏi mới)
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const currentResult = results.find(r => r.questionId === currentQ?.id);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Chủ đề: {topic}</h2>
          <p className="text-slate-500">Câu hỏi {currentQIndex + 1} / {questions.length}</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg text-indigo-700 font-semibold border border-indigo-100">
          Beginner Level
        </div>
      </div>
      
      {culturalTip && (
         <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg flex items-start gap-3">
             <Lightbulb className="text-blue-500 mt-1 flex-shrink-0" size={20} />
             <div>
                <p className="font-semibold text-blue-800 text-sm mb-1">Góc văn hóa (Search Grounding)</p>
                <p className="text-blue-700 text-sm italic">{culturalTip}</p>
             </div>
         </div>
      )}

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-8 pb-12 relative">
          <button 
            onClick={handleSpeakQuestion}
            className="absolute top-6 right-6 p-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full transition-colors"
            title="Nghe câu hỏi"
          >
            <Volume2 size={24} />
          </button>
          
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Câu hỏi</h3>
          <p className="text-3xl font-medium text-slate-800 leading-tight mb-2">
            {currentQ?.text}
          </p>
          {currentQ?.context && (
            <p className="text-slate-500 italic mt-2">({currentQ.context})</p>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-slate-50 p-8 border-t border-slate-100">
           {appState === AppState.ANSWERING || appState === AppState.GRADING ? (
             <div className="space-y-4">
               <label className="block text-sm font-medium text-slate-700">Câu trả lời của bạn:</label>
               <div className="relative">
                 <textarea
                   value={userAnswer}
                   onChange={(e) => setUserAnswer(e.target.value)}
                   disabled={appState === AppState.GRADING}
                   placeholder="Type your answer here..."
                   className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-lg text-slate-800 shadow-sm"
                   onKeyDown={(e) => {
                     if(e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       submitAnswer();
                     }
                   }}
                 />
                 <div className="absolute bottom-4 right-4 flex gap-2">
                   <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Sử dụng micro (chưa khả dụng)">
                     <Mic size={20} />
                   </button>
                 </div>
               </div>
               
               <button
                 onClick={submitAnswer}
                 disabled={!userAnswer.trim() || appState === AppState.GRADING}
                 className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md
                   ${!userAnswer.trim() || appState === AppState.GRADING
                     ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                     : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
                   }`}
               >
                 {appState === AppState.GRADING ? (
                   <>
                     <RefreshCw className="animate-spin" size={20} /> Đang chấm điểm...
                   </>
                 ) : (
                   <>
                     Gửi câu trả lời <Send size={20} />
                   </>
                 )}
               </button>
             </div>
           ) : (
             // Review State
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {currentResult && (
                 <>
                   <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                        ${currentResult.assessment.score >= 8 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {currentResult.assessment.score}
                     </div>
                     <div>
                       <p className="text-sm text-slate-500">Đánh giá</p>
                       <p className="font-bold text-slate-800">{currentResult.assessment.praise}</p>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Câu trả lời của bạn</p>
                        <p className="text-lg text-slate-700 p-3 bg-slate-100 rounded-lg">{currentResult.userAnswer}</p>
                     </div>
                     
                     <div>
                        <p className="text-xs font-bold text-green-600 uppercase mb-1">Câu trả lời gợi ý (Sửa lỗi)</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg text-green-700 font-medium p-3 bg-green-50 rounded-lg w-full border border-green-100">
                            {currentResult.assessment.correction}
                          </p>
                          <button 
                            onClick={() => GeminiService.speakText(currentResult.assessment.correction)}
                            className="p-3 bg-white border border-green-200 text-green-600 rounded-lg hover:bg-green-50"
                          >
                             <Volume2 size={20} />
                          </button>
                        </div>
                     </div>

                     <div>
                        <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Lời khuyên</p>
                        <p className="text-md text-slate-600 p-4 bg-indigo-50 rounded-lg border border-indigo-100 italic">
                          "{currentResult.assessment.feedback}"
                        </p>
                     </div>
                   </div>

                   <button
                     onClick={nextQuestion}
                     className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
                   >
                     Câu tiếp theo <ArrowRight size={20} />
                   </button>
                 </>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StudentWorksheet;