
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';

// Tool identifiers used throughout the app
export type ToolId = 
    | 'image-gen'
    | 'video-gen'
    | 'video-extend'
    | 'scenario-modeler'
    | 'diff-diagnosis'
    | 'plant-identifier'
    | 'ration-calculator'
    | 'script-analyzer'
    | 'field-notes-analyzer';

// Configuration for each tool's cost and free limits
const TOOL_CONFIG: Record<ToolId, { cost: number; dailyFreeLimit: number }> = {
    'image-gen': { cost: 20, dailyFreeLimit: 2 },
    'video-gen': { cost: 0, dailyFreeLimit: 0 }, // Uses user's own API key
    'video-extend': { cost: 0, dailyFreeLimit: 0 }, // Uses user's own API key
    'scenario-modeler': { cost: 50, dailyFreeLimit: 1 },
    'diff-diagnosis': { cost: 25, dailyFreeLimit: 3 },
    'plant-identifier': { cost: 15, dailyFreeLimit: 3 },
    'ration-calculator': { cost: 25, dailyFreeLimit: 2 },
    'script-analyzer': { cost: 20, dailyFreeLimit: 3 },
    'field-notes-analyzer': { cost: 30, dailyFreeLimit: 2 },
};

// Shape of the daily usage tracker
type DailyUsage = {
    [key in ToolId]?: {
        date: string; // YYYY-MM-DD
        used: number;
    }
};

interface CreditContextType {
    credits: number;
    consume: (toolId: ToolId) => void;
    canUse: (toolId: ToolId) => boolean;
    getCost: (toolId: ToolId) => number;
    getUsageInfo: (toolId: ToolId) => { used: number; limit: number; hasFreeUsesLeft: boolean } | null;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const useCredits = () => {
    const context = useContext(CreditContext);
    if (!context) {
        throw new Error('useCredits must be used within a CreditProvider');
    }
    return context;
};

const getTodayString = () => new Date().toISOString().split('T')[0];

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [credits, setCredits] = useState<number>(() => {
        try {
            const storedCredits = localStorage.getItem('userCredits');
            return storedCredits ? parseInt(storedCredits, 10) : 1000; // Start with 1000 credits
        } catch {
            return 1000;
        }
    });

    const [dailyUsage, setDailyUsage] = useState<DailyUsage>(() => {
        try {
            const storedUsage = localStorage.getItem('dailyUsage');
            return storedUsage ? JSON.parse(storedUsage) : {};
        } catch {
            return {};
        }
    });
    
    // Persist credits and usage to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('userCredits', credits.toString());
        } catch (error) {
            console.error("Failed to save credits to localStorage:", error);
        }
    }, [credits]);

    useEffect(() => {
        try {
            localStorage.setItem('dailyUsage', JSON.stringify(dailyUsage));
        } catch (error) {
            console.error("Failed to save daily usage to localStorage:", error);
        }
    }, [dailyUsage]);

    const getUsageInfo = useCallback((toolId: ToolId) => {
        const config = TOOL_CONFIG[toolId];
        if (config.dailyFreeLimit === 0) return null;

        const today = getTodayString();
        const usage = dailyUsage[toolId];

        const usedToday = (usage && usage.date === today) ? usage.used : 0;
        
        return {
            used: usedToday,
            limit: config.dailyFreeLimit,
            hasFreeUsesLeft: usedToday < config.dailyFreeLimit,
        };
    }, [dailyUsage]);

    const canUse = useCallback((toolId: ToolId) => {
        const usageInfo = getUsageInfo(toolId);
        if (usageInfo?.hasFreeUsesLeft) {
            return true;
        }
        return credits >= TOOL_CONFIG[toolId].cost;
    }, [credits, getUsageInfo]);

    const consume = useCallback((toolId: ToolId) => {
        const config = TOOL_CONFIG[toolId];
        // If the tool is handled outside the credit system (e.g., user API key), do nothing.
        if (config.cost === 0 && config.dailyFreeLimit === 0) return;

        const today = getTodayString();
        const usage = dailyUsage[toolId];
        
        const usageInfo = getUsageInfo(toolId);
        
        if (usageInfo?.hasFreeUsesLeft) {
            // Use a free attempt
            const usedToday = (usage && usage.date === today) ? usage.used : 0;
            setDailyUsage(prev => ({
                ...prev,
                [toolId]: {
                    date: today,
                    used: usedToday + 1,
                }
            }));
        } else {
            // Consume credits
            setCredits(prev => Math.max(0, prev - config.cost));
        }
    }, [dailyUsage, getUsageInfo]);
    
    const getCost = useCallback((toolId: ToolId) => {
        return TOOL_CONFIG[toolId].cost;
    }, []);

    const value = useMemo(() => ({
        credits,
        consume,
        canUse,
        getCost,
        getUsageInfo
    }), [credits, consume, canUse, getCost, getUsageInfo]);

    return (
        <CreditContext.Provider value={value}>
            {children}
        </CreditContext.Provider>
    );
};
