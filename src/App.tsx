import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BarChart, BrainCircuit, FileText, Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  runResearchAgent,
  runAnalysisAgent,
  runDecisionAgent,
  runReportAgent,
} from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

interface AgentState {
  id: string;
  name: string;
  icon: React.ElementType;
  status: AgentStatus;
  output: string | null;
  error: string | null;
}

const INITIAL_AGENTS: AgentState[] = [
  { id: 'research', name: 'Research Agent', icon: Search, status: 'idle', output: null, error: null },
  { id: 'analysis', name: 'Analysis Agent', icon: BarChart, status: 'idle', output: null, error: null },
  { id: 'decision', name: 'Decision Agent', icon: BrainCircuit, status: 'idle', output: null, error: null },
  { id: 'report', name: 'Report Agent', icon: FileText, status: 'idle', output: null, error: null },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('report');

  const updateAgent = (id: string, updates: Partial<AgentState>) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const startWorkflow = async () => {
    if (!query.trim()) return;

    setIsWorkflowRunning(true);
    setAgents(INITIAL_AGENTS);
    setActiveTab('research');

    try {
      // 1. Research Agent
      updateAgent('research', { status: 'running' });
      const researchOutput = await runResearchAgent(query);
      updateAgent('research', { status: 'completed', output: researchOutput });
      setActiveTab('analysis');

      // 2. Analysis Agent
      updateAgent('analysis', { status: 'running' });
      const analysisOutput = await runAnalysisAgent(query, researchOutput);
      updateAgent('analysis', { status: 'completed', output: analysisOutput });
      setActiveTab('decision');

      // 3. Decision Agent
      updateAgent('decision', { status: 'running' });
      const decisionOutput = await runDecisionAgent(query, analysisOutput);
      updateAgent('decision', { status: 'completed', output: decisionOutput });
      setActiveTab('report');

      // 4. Report Agent
      updateAgent('report', { status: 'running' });
      const reportOutput = await runReportAgent(query, researchOutput, analysisOutput, decisionOutput);
      updateAgent('report', { status: 'completed', output: reportOutput });

    } catch (error: any) {
      console.error("Workflow error:", error);
      // Find the currently running agent and mark it as error
      setAgents((prev) =>
        prev.map((a) =>
          a.status === 'running'
            ? { ...a, status: 'error', error: error.message || 'An error occurred' }
            : a
        )
      );
    } finally {
      setIsWorkflowRunning(false);
    }
  };

  const activeAgent = agents.find(a => a.id === activeTab);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Multi-Agent AI System</h1>
              <p className="text-sm text-zinc-500">Collaborative problem-solving workflow</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Workflow Status */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">User Task</h2>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the complex problem you want the agents to solve..."
              className="w-full h-32 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition-all"
              disabled={isWorkflowRunning}
            />
            <button
              onClick={startWorkflow}
              disabled={!query.trim() || isWorkflowRunning}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 px-4 rounded-xl font-medium transition-colors"
            >
              {isWorkflowRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Agents Working...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Workflow
                </>
              )}
            </button>
          </div>

          {/* Workflow Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">Agent Pipeline</h2>
            <div className="flex flex-col gap-4 relative">
              {/* Connecting Line */}
              <div className="absolute left-[1.125rem] top-4 bottom-4 w-0.5 bg-zinc-100 -z-10" />

              {agents.map((agent, index) => (
                <button
                  key={agent.id}
                  onClick={() => setActiveTab(agent.id)}
                  className={cn(
                    "flex items-start gap-4 text-left p-2 rounded-xl transition-colors",
                    activeTab === agent.id ? "bg-indigo-50/50" : "hover:bg-zinc-50",
                    agent.status === 'idle' && "opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 bg-white transition-colors",
                    agent.status === 'completed' ? "border-emerald-500 text-emerald-600" :
                    agent.status === 'running' ? "border-indigo-500 text-indigo-600" :
                    agent.status === 'error' ? "border-red-500 text-red-600" :
                    "border-zinc-200 text-zinc-400"
                  )}>
                    {agent.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                     agent.status === 'running' ? <Loader2 className="w-5 h-5 animate-spin" /> :
                     agent.status === 'error' ? <AlertCircle className="w-5 h-5" /> :
                     <agent.icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <h3 className={cn(
                      "text-sm font-medium",
                      activeTab === agent.id ? "text-indigo-900" : "text-zinc-700"
                    )}>
                      {agent.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5 capitalize">
                      {agent.status === 'idle' ? 'Pending' : agent.status}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Output Viewer */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 h-full min-h-[600px] flex flex-col overflow-hidden">
            {/* Output Header */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
              {activeAgent && <activeAgent.icon className="w-5 h-5 text-zinc-500" />}
              <h2 className="font-medium text-zinc-800">
                {activeAgent?.name} Output
              </h2>
              {activeAgent?.status === 'running' && (
                <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Processing
                </span>
              )}
            </div>

            {/* Output Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeAgent?.status === 'idle' ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3">
                      <activeAgent.icon className="w-12 h-12 opacity-20" />
                      <p>Waiting for workflow to reach this stage...</p>
                    </div>
                  ) : activeAgent?.status === 'running' ? (
                    <div className="h-full flex flex-col items-center justify-center text-indigo-400 gap-4">
                      <Loader2 className="w-10 h-10 animate-spin" />
                      <p className="text-indigo-600 font-medium animate-pulse">
                        {activeAgent.name} is analyzing data...
                      </p>
                    </div>
                  ) : activeAgent?.status === 'error' ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-500 gap-3">
                      <AlertCircle className="w-12 h-12 opacity-50" />
                      <p className="font-medium">Error executing agent</p>
                      <p className="text-sm text-red-400">{activeAgent.error}</p>
                    </div>
                  ) : (
                    <div className="prose prose-zinc max-w-none prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
                      <Markdown>{activeAgent?.output || ''}</Markdown>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
