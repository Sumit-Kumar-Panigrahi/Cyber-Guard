import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Flame,
  Binary,
  Layers,
  Info,
} from 'lucide-react';

import { attackChainService } from '../../services/attackChainService';
import { CyberGraphNode } from '../../components/attackChain/CyberGraphNode';
import { StoryController } from '../../components/attackChain/StoryController';
import { MarkovPredictorCard } from '../../components/attackChain/MarkovPredictorCard';
import { SpeechAlertPlayer } from '../../components/attackChain/SpeechAlertPlayer';
import { ContainmentModal } from '../../components/attackChain/ContainmentModal';

import type {
  AttackStoryState,
  AttackChainDetail,
  AttackChainNode as AttackChainNodeType,
} from '../../types/attackChain';

const nodeTypes = {
  cyberNode: CyberGraphNode,
};

export const AttackChainView: React.FC = () => {
  // Mode: 'story' (15-Step Indian Cyber Fraud Simulation) vs 'live' (Real User Events)
  const [mode, setMode] = useState<'story' | 'live'>('story');

  // Story state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [storyState, setStoryState] = useState<AttackStoryState | null>(null);

  // Live state
  const [liveChain, setLiveChain] = useState<AttackChainDetail | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);

  // Inspector & Modals
  const [selectedNode, setSelectedNode] = useState<AttackChainNodeType | null>(null);
  const [isContainModalOpen, setIsContainModalOpen] = useState<boolean>(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Load Story Step
  const loadStoryStep = useCallback(async (step: number) => {
    try {
      const data = await attackChainService.getStoryStep(step);
      setStoryState(data);
      setCurrentStep(data.current_step);
    } catch (err) {
      console.error('Failed to load story step:', err);
    }
  }, []);

  // Load Live Events Correlation
  const loadLiveCorrelation = useCallback(async () => {
    setIsLoadingLive(true);
    try {
      const data = await attackChainService.correlateEvents();
      setLiveChain(data);
    } catch (err) {
      console.error('Failed to correlate live events:', err);
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (mode === 'story') {
      loadStoryStep(1);
    } else {
      loadLiveCorrelation();
    }
  }, [mode, loadStoryStep, loadLiveCorrelation]);

  // Sync React Flow nodes & edges whenever active data changes
  useEffect(() => {
    const rawNodes = mode === 'story' ? storyState?.nodes : liveChain?.nodes;
    const rawEdges = mode === 'story' ? storyState?.edges : liveChain?.edges;

    if (!rawNodes || rawNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const flowNodes: Node[] = rawNodes.map((n) => ({
      id: n.id,
      type: 'cyberNode',
      position: n.position || { x: 50, y: 150 },
      data: n as unknown as Record<string, unknown>,
    }));

    const flowEdges: Edge[] = (rawEdges || []).map((e) => {
      const isPred = e.is_predicted;
      const strokeColor = isPred ? '#c084fc' : '#22d3ee';

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: strokeColor,
          strokeWidth: isPred ? 2.5 : 2,
          strokeDasharray: isPred ? '6,6' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 18,
          height: 18,
        },
        label: e.relation_type?.replace(/_/g, ' '),
        labelStyle: {
          fill: isPred ? '#d8b4fe' : '#67e8f9',
          fontWeight: 700,
          fontSize: 9,
          fontFamily: 'monospace',
        },
        labelBgStyle: {
          fill: '#020617',
          fillOpacity: 0.9,
          stroke: isPred ? '#7e22ce' : '#0891b2',
          strokeWidth: 1,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);

    // Default select latest node for inspector
    if (rawNodes.length > 0) {
      setSelectedNode(rawNodes[rawNodes.length - 1]);
    }
  }, [storyState, liveChain, mode, setNodes, setEdges]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as unknown as AttackChainNodeType);
  };

  const handleResetStory = async () => {
    try {
      const data = await attackChainService.resetStory();
      setStoryState(data);
      setCurrentStep(1);
    } catch (err) {
      console.error('Failed to reset story:', err);
    }
  };

  const activeStatus = mode === 'story' ? storyState?.status : liveChain?.status;
  const isContained = activeStatus === 'CONTAINED';
  const humanRisk = mode === 'story' ? storyState?.overall_human_risk : liveChain?.human_risk_score;
  const techRisk = mode === 'story' ? storyState?.overall_tech_risk : liveChain?.tech_risk_score;
  const prediction = mode === 'story' ? storyState?.prediction : liveChain?.prediction;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/50">
              PHASE 3 • NETWORKX DAG CORRELATION & MARKOV PREDICTOR
            </span>
            {isContained && (
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/50">
                ATTACK NEUTRALIZED
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2.5">
            <GitBranch className="h-6 w-6 text-cyan-400" />
            <span>Attack Chain Correlation & Predictive Defense</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Correlating fragmented threat signals across SMS, Web, and Calls into a single Directed Acyclic Graph (DAG) and forecasting the attacker's next move.
          </p>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setMode('story')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === 'story'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>15-Step Attack Story</span>
            </button>
            <button
              onClick={() => setMode('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === 'live'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Binary className="h-3.5 w-3.5" />
              <span>Live Telemetry Graph</span>
            </button>
          </div>

          {/* 1-Click Contain Threat Button */}
          {!isContained ? (
            <button
              onClick={() => setIsContainModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/25 hover:from-rose-500 hover:to-red-500 transition animate-pulse"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>1-Click Contain Threat</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-800/80 bg-emerald-950/60 px-3.5 py-2 text-xs font-bold text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Containment Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Threat Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Intrusion Status</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                isContained
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                  : (humanRisk || 0) >= 70
                  ? 'bg-rose-950 text-rose-400 border-rose-800/60'
                  : 'bg-amber-950 text-amber-400 border-amber-800/60'
              }`}
            >
              {activeStatus || 'ACTIVE'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-white">
              {isContained ? 'Threat Neutralized' : 'Active Kill-Chain'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {isContained ? 'Sessions revoked and hostile IPs blocked.' : 'Attack progression monitored in real-time.'}
          </p>
        </div>

        {/* Human Risk Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Human Susceptibility Risk</span>
            <Flame className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{humanRisk ?? 0}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (humanRisk || 0) >= 70 ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${humanRisk || 0}%` }}
            />
          </div>
        </div>

        {/* Technical Risk Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Technical Perimeter Risk</span>
            <Binary className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{techRisk ?? 0}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (techRisk || 0) >= 70 ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${techRisk || 0}%` }}
            />
          </div>
        </div>

        {/* Markov Prediction Confidence */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Markov Next-Step Prediction</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-purple-300">
              {prediction ? `${Math.round(prediction.confidence * 100)}%` : '96%'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Certainty</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-200/90 truncate font-semibold">
            {prediction?.predicted_next_stage || 'Predicted Next Step'}
          </p>
        </div>
      </div>

      {/* Mode-Specific Sub-Controller */}
      {mode === 'story' && storyState && (
        <StoryController
          currentStep={currentStep}
          totalSteps={storyState.total_steps}
          stepDetail={storyState.step_detail}
          onStepChange={loadStoryStep}
          onReset={handleResetStory}
          isCompleted={storyState.is_completed}
        />
      )}

      {mode === 'live' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-xs font-bold text-white">Live Telemetry Graph Synchronization</h3>
              <p className="text-[11px] text-slate-400">
                Correlating real signals ingested via your active SMS, Pay-Safe Browser, and Call Guard permissions.
              </p>
            </div>
          </div>
          <button
            onClick={loadLiveCorrelation}
            disabled={isLoadingLive}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLive ? 'animate-spin' : ''}`} />
            <span>Re-Correlate Live Events</span>
          </button>
        </div>
      )}

      {/* Main React Flow Graph Canvas */}
      <div className="relative rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Canvas Top Bar */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur-md px-3 py-1.5 border border-slate-800 text-xs text-slate-300">
          <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
          <span>Interactive NetworkX Directed Acyclic Graph (DAG)</span>
          <span className="text-slate-500">•</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {nodes.length} Nodes • {edges.length} Causal Edges
          </span>
        </div>

        <div className="h-[460px] w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.5}
          >
            <Background color="#1e293b" gap={20} size={1.5} />
            <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 !rounded-xl" />
            <MiniMap
              className="!bg-slate-900/90 !border-slate-800 !rounded-xl"
              nodeColor={(n) => {
                if (n.data?.is_contained) return '#10b981';
                if (n.data?.is_predicted) return '#a855f7';
                if ((n.data?.risk_score as number) >= 80) return '#f43f5e';
                return '#06b6d4';
              }}
            />
          </ReactFlow>
        </div>
      </div>

      {/* Bottom 3-Column Intelligence & Response Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Col 1: Markov Next-Step Predictor */}
        {prediction && (
          <MarkovPredictorCard prediction={prediction} />
        )}

        {/* Col 2: Bilingual Voice Alert & Explainable Narrative */}
        <div className="space-y-4">
          <SpeechAlertPlayer
            speechTextEn={
              mode === 'story'
                ? storyState?.step_detail.speech_text_en || 'Cyberguard alert active.'
                : liveChain?.explanation_en || 'Cyberguard alert active.'
            }
            speechTextHi={
              mode === 'story'
                ? storyState?.step_detail.speech_text_hi || 'साइबरगार्ड चेतावनी सक्रिय है।'
                : liveChain?.explanation_hi || 'साइबरगार्ड चेतावनी सक्रिय है।'
            }
          />

          {/* Explainable AI Narrative Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              <span>Explainable AI Narrative (Citizen & SOC View)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {mode === 'story' ? storyState?.explanation_en : liveChain?.explanation_en}
            </p>
          </div>
        </div>

        {/* Col 3: Selected Node Telemetry & MITRE ATT&CK Technical Evidence Inspector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Binary className="h-3.5 w-3.5 text-cyan-400" />
              <span>Node Technical Inspector</span>
            </h4>
            {selectedNode && (
              <span className="text-[10px] font-mono text-cyan-400">
                {selectedNode.id}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                  Category / Event:
                </span>
                <p className="font-bold text-white text-xs">{selectedNode.title || selectedNode.category}</p>
                <p className="text-[11px] text-slate-400">Source: {selectedNode.source} • Stage: {selectedNode.stage}</p>
              </div>

              {selectedNode.mitre_technique_id && (
                <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-2.5 space-y-1">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                    MITRE ATT&CK Framework:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-900/80 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-200">
                      {selectedNode.mitre_technique_id}
                    </span>
                    <span className="text-[11px] text-indigo-200 truncate">
                      {selectedNode.mitre_technique_name || selectedNode.mitre_tactic}
                    </span>
                  </div>
                </div>
              )}

              {/* Indicators */}
              {selectedNode.indicators && selectedNode.indicators.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                    Sanitized Security Indicators:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-slate-800"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence JSON */}
              {selectedNode.evidence && Object.keys(selectedNode.evidence).length > 0 && (
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                    Raw Telemetry Evidence:
                  </span>
                  <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedNode.evidence, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Click any node on the graph to inspect technical telemetry
            </div>
          )}
        </div>
      </div>

      {/* 1-Click Containment Modal */}
      <ContainmentModal
        isOpen={isContainModalOpen}
        onClose={() => setIsContainModalOpen(false)}
        chainId={mode === 'story' ? 'simulated-15-step-chain' : liveChain?.id || 'live-chain'}
        onSuccess={() => {
          if (mode === 'story') {
            loadStoryStep(15);
          } else {
            loadLiveCorrelation();
          }
        }}
      />
    </div>
  );
};
