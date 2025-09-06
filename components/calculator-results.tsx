import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp, DollarSign, Percent, Target, Save, AlertTriangle } from 'lucide-react-native';
import { useCalculator } from '@/providers/calculator-provider';

export function CalculatorResults() {
  const { results } = useCalculator();

  if (!results) {
    return null;
  }

  const formatNumber = (num: number | null | undefined, decimals: number = 2): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return 'N/A';
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatCurrency = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return 'N/A';
    }
    return `${formatNumber(num, 2)}`;
  };

  const formatShares = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return 'N/A';
    }
    // Show up to 4 decimal places for shares, but remove trailing zeros
    return parseFloat(num.toFixed(4)).toLocaleString('en-US');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calculation Results</Text>
        
        <View style={styles.resultGrid}>
          <View style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <TrendingUp size={20} color="#059669" />
              <Text style={styles.resultLabel}>Shares to Buy</Text>
            </View>
            <Text style={styles.resultValue}>{formatShares(results.sharesToBuy)}</Text>
            <Text style={styles.resultSubtext}>units/shares</Text>
          </View>

          <View style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <DollarSign size={20} color="#1e40af" />
              <Text style={styles.resultLabel}>Position Size</Text>
            </View>
            <Text style={styles.resultValue}>{formatCurrency(results.totalPositionSize)}</Text>
            <Text style={styles.resultSubtext}>total investment</Text>
          </View>

          {results.positionPercentage !== null && (
            <View style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Percent size={20} color="#7c3aed" />
                <Text style={styles.resultLabel}>Account %</Text>
              </View>
              <Text style={styles.resultValue}>{formatNumber(results.positionPercentage, 2)}%</Text>
              <Text style={styles.resultSubtext}>of account balance</Text>
            </View>
          )}

          <View style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <AlertTriangle size={20} color="#dc2626" />
              <Text style={styles.resultLabel}>Risk % of Account</Text>
            </View>
            {results.riskPercent !== null ? (
              <Text style={styles.resultValue}>{formatNumber(results.riskPercent, 2)}%</Text>
            ) : (
              <Text style={styles.resultValueNA}>N/A</Text>
            )}
            <Text style={styles.resultSubtext}>
              {results.riskPercent !== null ? 'of account balance' : 'enter account balance'}
            </Text>
          </View>

          {results.riskRewardRatio !== null && (
            <View style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Target size={20} color="#ea580c" />
                <Text style={styles.resultLabel}>Risk/Reward</Text>
              </View>
              <Text style={styles.resultValue}>1:{formatNumber(results.riskRewardRatio, 2)}</Text>
              <Text style={styles.resultSubtext}>ratio</Text>
            </View>
          )}
        </View>

        <View style={styles.additionalInfo}>
          <Text style={styles.infoTitle}>Additional Information</Text>
          <Text style={styles.infoText}>
            Risk per share: {formatCurrency(results.riskPerShare)}
          </Text>
          <Text style={styles.infoText}>
            Total risk: {formatCurrency(
              results.sharesToBuy && results.riskPerShare 
                ? parseFloat((results.sharesToBuy * results.riskPerShare).toFixed(2))
                : null
            )}
          </Text>
        </View>

        <View style={styles.saveNote}>
          <Save size={16} color="#059669" />
          <Text style={styles.saveNoteText}>Calculation saved to history</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  resultGrid: {
    gap: 16,
  },
  resultItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  resultSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  additionalInfo: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  saveNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveNoteText: {
    fontSize: 14,
    color: '#059669',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  resultValueNA: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginBottom: 4,
  },
});