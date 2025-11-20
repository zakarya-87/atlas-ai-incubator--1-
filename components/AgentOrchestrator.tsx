import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import type { AnyTool, AgentType, AgentLog } from '../types';
import { TranslationKey } from '../locales';
import AnalysisSkeleton from './AnalysisSkeleton';
import { STORAGE_KEYS, WS_CONFIG, API_CONFIG } from '../utils/constants';
import { logger } from '../utils/logger';

interface AgentOrchestratorProps {
    activeTool: AnyTool;
    ventureId: string;
}

const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({ activeTool, ventureId }) => {
    const { t } = useLanguage();
    const [logs, setLogs] = useState<AgentLog[]>([]);
    const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const logEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const reconnectAttempts = useRef<number>(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Define which agents are involved for each tool type for UI display (active status)
    const getAgentsForTool = (tool: AnyTool): AgentType[] => {
        switch (tool) {
            case 'swot':
            case 'pestel':
            case 'roadmap':
            case 'leanCanvas':
            case 'okrWorkflow':
                return ['Lead Strategist', 'Market Researcher'];
            case 'overview':
            case 'research':
            case 'competitorAnalysis':
            case 'problemValidation':
                return ['Market Researcher', 'Lead Strategist'];
            case 'budgetGenerator':
            case 'financialForecast':
            case 'cashFlowForecast':
            case 'kpiDashboards':
                return ['CFO', 'Lead Strategist'];
            case 'milestones':
            case 'expansionStrategy':
            case 'validationTracker':
                return ['Growth Hacker', 'Market Researcher'];
            case 'pitchDeckGenerator':
            case 'investorDatabase':
            case 'fundraisingRoadmap':
                return ['Venture Capitalist', 'CFO', 'Lead Strategist'];
            case 'ideaValidation':
            case 'customerValidation':
            case 'riskFeasibility':
                return ['Product Owner', 'Market Researcher'];
            case 'brandIdentity':
                return ['Creative Director', 'Product Owner'];
            case 'systemDesign':
                return ['Systems Architect'];
            default:
                return ['Lead Strategist'];
        }
    };

    // Cleanup function for WebSocket and timers
    const cleanup = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    // Connect to WebSocket with authentication
    const connectWebSocket = useCallback(() => {
        cleanup(); // Clean up existing connection

        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        logger.info('Connecting to WebSocket...', { ventureId });
        setConnectionStatus('connecting');

        // Initialize WebSocket with authentication
        socketRef.current = io(API_CONFIG.BACKEND_URL, {
            auth: {
                token: token || '',
            },
            reconnection: false, // We handle reconnection manually
            timeout: WS_CONFIG.CONNECTION_TIMEOUT,
        });

        socketRef.current.on('connect', () => {
            logger.info('WebSocket connected successfully');
            setConnectionStatus('connected');
            reconnectAttempts.current = 0; // Reset on successful connection

            // Join the venture room
            socketRef.current?.emit('joinRoom', ventureId);

            // Start heartbeat
            heartbeatIntervalRef.current = setInterval(() => {
                if (socketRef.current?.connected) {
                    socketRef.current.emit('ping');
                }
            }, WS_CONFIG.HEARTBEAT_INTERVAL);
        });

        socketRef.current.on('connect_error', (error) => {
            logger.error('WebSocket connection error:', error);
            setConnectionStatus('disconnected');
            handleReconnect();
        });

        socketRef.current.on('disconnect', (reason) => {
            logger.warn('WebSocket disconnected:', reason);
            setConnectionStatus('disconnected');

            // Clear heartbeat
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
            }

            // Attempt reconnection if not a manual disconnect
            if (reason !== 'io client disconnect') {
                handleReconnect();
            }
        });

        socketRef.current.on('agentLog', (log: AgentLog) => {
            setActiveAgent(log.agent);
            setLogs(prev => [...prev, log]);
        });

        socketRef.current.on('error', (error) => {
            logger.error('WebSocket error:', error);
        });

        // Fallback: If no logs arrive within 2 seconds, start simulated logs
        const timeoutId = setTimeout(() => {
            if (logs.length === 0 && connectionStatus !== 'connected') {
                logger.warn('WebSocket connection timeout, starting simulated logs');
                startSimulatedLogs();
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [ventureId, connectionStatus, logs.length]);

    // Handle reconnection with exponential backoff
    const handleReconnect = useCallback(() => {
        if (reconnectAttempts.current >= WS_CONFIG.RECONNECT_ATTEMPTS) {
            logger.error('Max reconnection attempts reached. Falling back to simulated logs.');
            startSimulatedLogs();
            return;
        }

        const delay = Math.min(
            WS_CONFIG.RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current),
            30000 // Max 30 seconds
        );

        logger.info(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${WS_CONFIG.RECONNECT_ATTEMPTS})`);

        reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
        }, delay);
    }, [connectWebSocket]);

    // Initialize WebSocket connection
    useEffect(() => {
        connectWebSocket();
        return cleanup;
    }, [ventureId]); // Reconnect when ventureId changes


    const startSimulatedLogs = () => {
        // Fallback for when backend WS isn't reachable or ready
        const sequence = getLogsForToolSimulated(activeTool);
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex < sequence.length) {
                const item = sequence[currentIndex];
                setActiveAgent(item.agent);
                setLogs(prev => [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    agent: item.agent,
                    messageKey: item.messageKey,
                    timestamp: Date.now()
                }]);
                currentIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, 1500);
    };

    const getLogsForToolSimulated = (tool: AnyTool): { agent: AgentType; messageKey: string }[] => {
        // Simulate a "thought process" sequence
        const baseLogs: { agent: AgentType; messageKey: string }[] = [
            { agent: 'Lead Strategist', messageKey: 'agentLogAnalyzingContext' },
        ];

        const agents = getAgentsForTool(tool);
        const mainAgent = agents[0];

        if (['swot', 'pestel'].includes(tool)) {
            baseLogs.push({ agent: 'Market Researcher', messageKey: 'agentLogScanningMarket' });
            baseLogs.push({ agent: 'Lead Strategist', messageKey: 'agentLogIdentifyingFactors' });
            baseLogs.push({ agent: 'Lead Strategist', messageKey: 'agentLogSynthesizing' });
        } else if (['financialForecast', 'budgetGenerator'].includes(tool)) {
            baseLogs.push({ agent: 'CFO', messageKey: 'agentLogReviewingBenchmarks' });
            baseLogs.push({ agent: 'CFO', messageKey: 'agentLogCalculatingProjections' });
            baseLogs.push({ agent: 'CFO', messageKey: 'agentLogOptimizingMargins' });
        } else if (['pitchDeckGenerator', 'investorDatabase'].includes(tool)) {
            baseLogs.push({ agent: 'Venture Capitalist', messageKey: 'agentLogEvaluatingThesis' });
            baseLogs.push({ agent: 'CFO', messageKey: 'agentLogCheckingUnitEconomics' });
            baseLogs.push({ agent: 'Venture Capitalist', messageKey: 'agentLogDraftingNarrative' });
        } else {
            baseLogs.push({ agent: mainAgent, messageKey: 'agentLogProcessingData' });
            baseLogs.push({ agent: mainAgent, messageKey: 'agentLogGeneratingInsights' });
        }

        baseLogs.push({ agent: agents[0], messageKey: 'agentLogFinalizingOutput' });
        return baseLogs;
    };

    // Auto-scroll to bottom of log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const agentAvatars: Record<AgentType, React.ReactNode> = {
        'Lead Strategist': <div className="bg-purple-500 h-full w-full flex items-center justify-center text-white font-bold">LS</div>,
        'Market Researcher': <div className="bg-blue-500 h-full w-full flex items-center justify-center text-white font-bold">MR</div>,
        'CFO': <div className="bg-green-600 h-full w-full flex items-center justify-center text-white font-bold">CF</div>,
        'Growth Hacker': <div className="bg-red-500 h-full w-full flex items-center justify-center text-white font-bold">GH</div>,
        'Product Owner': <div className="bg-orange-500 h-full w-full flex items-center justify-center text-white font-bold">PO</div>,
        'Venture Capitalist': <div className="bg-yellow-500 h-full w-full flex items-center justify-center text-white font-bold">VC</div>,
        'Systems Architect': <div className="bg-slate-500 h-full w-full flex items-center justify-center text-white font-bold">SA</div>,
        'Creative Director': <div className="bg-pink-500 h-full w-full flex items-center justify-center text-white font-bold">CD</div>,
    };

    return (
        <div className="w-full max-w-7xl mx-auto mt-8 space-y-8 animate-fade-in">

            {/* Agent Command Center */}
            <div className="w-full max-w-4xl mx-auto bg-brand-secondary/20 rounded-xl border border-brand-accent/30 overflow-hidden flex flex-col md:flex-row h-[280px] shadow-2xl">
                {/* Left Panel: Active Agents */}
                <div className="w-full md:w-1/3 bg-brand-secondary/50 p-4 border-b md:border-b-0 md:border-r border-brand-accent/30">
                    <h3 className="text-xs font-bold text-brand-light uppercase tracking-widest mb-4">{t('agentBoardroomStatus')}</h3>
                    <div className="space-y-4">
                        {getAgentsForTool(activeTool).map(agent => (
                            <motion.div
                                key={agent}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-center p-2 rounded-lg transition-colors duration-300 ${activeAgent === agent ? 'bg-brand-accent/20 border border-brand-teal/50' : 'opacity-50'}`}
                            >
                                <div className="h-8 w-8 rounded-full overflow-hidden shadow-sm mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0">
                                    {agentAvatars[agent]}
                                </div>
                                <div>
                                    <p className={`text-xs font-bold ${activeAgent === agent ? 'text-brand-teal' : 'text-brand-text'}`}>{t(agent.replace(' ', '') as TranslationKey)}</p>
                                    {activeAgent === agent && (
                                        <div className="flex items-center mt-0.5">
                                            <span className="relative flex h-1.5 w-1.5 mr-2 rtl:ml-2 rtl:mr-0">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-teal"></span>
                                            </span>
                                            <span className="text-[10px] text-brand-light uppercase">Active</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Terminal Log */}
                <div className="w-full md:w-2/3 bg-black/30 p-4 font-mono relative flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-teal/50 to-transparent opacity-50"></div>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {logs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start text-[11px] md:text-xs"
                                >
                                    <span className="text-brand-light/40 mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0 font-light">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                    <div>
                                        <span className="font-bold text-brand-teal mr-1 rtl:ml-1 rtl:mr-0">@{t(log.agent.replace(' ', '') as TranslationKey)}:</span>
                                        <span className="text-brand-text/90">{t(log.messageKey as TranslationKey)}</span>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={logEndRef} />
                        </AnimatePresence>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center text-[10px] text-brand-light/50">
                        {connectionStatus === 'connected' && (
                            <>
                                <span className="relative flex h-2 w-2 mr-2 rtl:ml-2 rtl:mr-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Secure Link: WebSocket Connected
                            </>
                        )}
                        {connectionStatus === 'connecting' && (
                            <>
                                <span className="animate-pulse mr-2 rtl:ml-2 rtl:mr-0">⏳</span>
                                Connecting to Agent Gateway...
                            </>
                        )}
                        {connectionStatus === 'disconnected' && (
                            <>
                                <span className="mr-2 rtl:ml-2 rtl:mr-0">⚠️</span>
                                Disconnected - Using Offline Mode
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Drafting Workspace (Skeleton) */}
            <div className="w-full opacity-70 transition-opacity duration-1000 pointer-events-none">
                <div className="flex items-center gap-3 mb-6 px-2 border-b border-brand-accent/20 pb-2 max-w-7xl mx-auto">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-teal"></span>
                    </div>
                    <span className="text-xs font-mono text-brand-teal uppercase tracking-[0.2em]">Drafting Workspace</span>
                </div>
                <AnalysisSkeleton tool={activeTool} />
            </div>

        </div>
    );
};

export default AgentOrchestrator;
