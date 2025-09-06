import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

export interface CalculatorInputs {
  stockName: string;
  riskAmount: string;
  entryPrice: string;
  stopLossPrice: string;
  accountBalance: string;
  targetPrice: string;
}

export interface CalculationResults {
  sharesToBuy: number;
  totalPositionSize: number;
  positionPercentage: number | null;
  riskRewardRatio: number | null;
  riskPerShare: number;
  riskPercent: number | null;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  stockName: string;
  entryPrice: number;
  stopLossPrice: number;
  targetPrice?: number;
  riskAmount: number;
  shares: number;
  positionSize: number;
  positionPercentage?: number;
  riskRewardRatio?: number;
  riskPercent?: number;
  tradeDirection: 'long' | 'short';
}

const STORAGE_KEY = 'calculator_inputs';
const HISTORY_KEY = 'calculator_history';

export const [CalculatorProvider, useCalculator] = createContextHook(() => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    stockName: '',
    riskAmount: '',
    entryPrice: '',
    stopLossPrice: '',
    accountBalance: '',
    targetPrice: '',
  });
  
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedInputs, storedHistory] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_KEY)
      ]);
      
      if (storedInputs) {
        const parsedInputs = JSON.parse(storedInputs);
        setInputs(parsedInputs);
      }
      
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.log('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveInputs = async (newInputs: CalculatorInputs) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newInputs));
    } catch (error) {
      console.log('Error saving inputs:', error);
    }
  };

  const saveHistory = async (newHistory: HistoryRecord[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.log('Error saving history:', error);
    }
  };

  const updateInput = useCallback((field: keyof CalculatorInputs, value: string) => {
    // Replace comma with dot for numeric fields
    const numericFields = ['riskAmount', 'entryPrice', 'stopLossPrice', 'accountBalance', 'targetPrice'];
    const processedValue = numericFields.includes(field) ? value.replace(',', '.') : value;
    
    const newInputs = { ...inputs, [field]: processedValue };
    setInputs(newInputs);
    saveInputs(newInputs);
    
    if (error) {
      setError(null);
    }
  }, [inputs, error]);

  const validateInputs = useCallback((): string | null => {
    // Check stock name
    if (!inputs.stockName.trim()) {
      return 'Stock name/ticker is required';
    }

    // Check if required fields are filled
    if (!inputs.riskAmount.trim() || !inputs.entryPrice.trim() || !inputs.stopLossPrice.trim()) {
      return 'Please fill in all required fields (Stock Name, Risk Amount, Entry Price, Stop Loss Price)';
    }

    const riskAmount = parseFloat(inputs.riskAmount);
    const entryPrice = parseFloat(inputs.entryPrice);
    const stopLossPrice = parseFloat(inputs.stopLossPrice);

    // Check for valid numbers
    if (isNaN(riskAmount) || isNaN(entryPrice) || isNaN(stopLossPrice)) {
      return 'Please enter valid numbers for all required fields';
    }

    // Check for positive values
    if (riskAmount <= 0) {
      return 'Risk amount must be greater than zero';
    }

    if (entryPrice <= 0) {
      return 'Entry price must be greater than zero';
    }

    if (stopLossPrice <= 0) {
      return 'Stop loss price must be greater than zero';
    }

    if (entryPrice === stopLossPrice) {
      return 'Entry price and stop loss price cannot be the same';
    }

    // Validate optional fields if provided
    if (inputs.accountBalance.trim() && (isNaN(parseFloat(inputs.accountBalance)) || parseFloat(inputs.accountBalance) <= 0)) {
      return 'Account balance must be a valid number greater than zero';
    }

    // Check if risk amount exceeds account balance
    if (inputs.accountBalance.trim()) {
      const accountBalance = parseFloat(inputs.accountBalance);
      if (riskAmount > accountBalance) {
        return 'Risk amount exceeds account balance';
      }
    }

    if (inputs.targetPrice.trim() && (isNaN(parseFloat(inputs.targetPrice)) || parseFloat(inputs.targetPrice) <= 0)) {
      return 'Target price must be a valid number greater than zero';
    }

    // Check risk per share
    const riskPerShare = Math.abs(entryPrice - stopLossPrice);
    if (riskPerShare <= 0) {
      return 'Risk per share must be greater than zero';
    }

    return null;
  }, [inputs]);

  const calculate = useCallback(() => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setResults(null);
      return;
    }

    const riskAmount = parseFloat(inputs.riskAmount);
    const entryPrice = parseFloat(inputs.entryPrice);
    const stopLossPrice = parseFloat(inputs.stopLossPrice);
    const accountBalance = inputs.accountBalance.trim() ? parseFloat(inputs.accountBalance) : null;
    const targetPrice = inputs.targetPrice.trim() ? parseFloat(inputs.targetPrice) : null;

    const riskPerShare = Math.abs(entryPrice - stopLossPrice);
    
    if (riskPerShare === 0) {
      setError('Entry price and stop loss price cannot be the same');
      setResults(null);
      return;
    }

    const sharesToBuy = riskAmount / riskPerShare;
    const totalPositionSize = sharesToBuy * entryPrice;

    // Check if position is too small
    if (sharesToBuy < 0.0001) {
      setError('Risk too small or stop too far away for this trade.');
      setResults(null);
      return;
    }

    const positionPercentage = accountBalance ? (totalPositionSize / accountBalance) * 100 : null;
    const riskPercent = accountBalance ? (riskAmount / accountBalance) * 100 : null;
    
    // Determine trade direction
    const isLongPosition = entryPrice > stopLossPrice;
    
    let riskRewardRatio: number | null = null;
    if (targetPrice) {
      if (isLongPosition) {
        // Long position: target should be above entry
        if (targetPrice <= entryPrice) {
          setError('For long positions (Entry > Stop), Target Price should be above Entry Price');
          setResults(null);
          return;
        }
        const reward = targetPrice - entryPrice;
        riskRewardRatio = reward / riskPerShare;
      } else {
        // Short position: target should be below entry
        if (targetPrice >= entryPrice) {
          setError('For short positions (Entry < Stop), Target Price should be below Entry Price');
          setResults(null);
          return;
        }
        const reward = entryPrice - targetPrice;
        riskRewardRatio = reward / riskPerShare;
      }
    }

    const calculationResults = {
      sharesToBuy,
      totalPositionSize,
      positionPercentage,
      riskRewardRatio,
      riskPerShare,
      riskPercent,
    };

    setResults(calculationResults);
    setError(null);

    // Save to history
    const historyRecord: HistoryRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      stockName: inputs.stockName.trim(),
      entryPrice,
      stopLossPrice,
      targetPrice: targetPrice || undefined,
      riskAmount,
      shares: sharesToBuy,
      positionSize: totalPositionSize,
      positionPercentage: positionPercentage || undefined,
      riskRewardRatio: riskRewardRatio || undefined,
      riskPercent: riskPercent || undefined,
      tradeDirection: isLongPosition ? 'long' : 'short',
    };

    const newHistory = [historyRecord, ...history];
    setHistory(newHistory);
    saveHistory(newHistory);
  }, [inputs, validateInputs, history]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    saveHistory(newHistory);
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return useMemo(() => ({
    inputs,
    results,
    error,
    isLoading,
    history,
    updateInput,
    calculate,
    clearResults,
    deleteHistoryItem,
    clearHistory,
  }), [inputs, results, error, isLoading, history, updateInput, calculate, clearResults, deleteHistoryItem, clearHistory]);
});