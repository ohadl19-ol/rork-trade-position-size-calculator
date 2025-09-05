import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Calculator, DollarSign, TrendingUp, TrendingDown, Target, Wallet, Hash } from 'lucide-react-native';
import { useCalculator } from '@/providers/calculator-provider';

export function CalculatorForm() {
  const { inputs, updateInput, calculate, error, isLoading } = useCalculator();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleCalculate = () => {
    calculate();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trade Parameters</Text>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Hash size={20} color="#0891b2" />
            <Text style={styles.inputLabel}>Stock Name / Ticker *</Text>
          </View>
          <TextInput
            style={styles.input}
            value={inputs.stockName}
            onChangeText={(value) => updateInput('stockName', value)}
            placeholder="e.g., AAPL, TSLA, BTC"
            placeholderTextColor="#94a3b8"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <DollarSign size={20} color="#1e40af" />
            <Text style={styles.inputLabel}>Risk Amount *</Text>
          </View>
          <TextInput
            style={styles.input}
            value={inputs.riskAmount}
            onChangeText={(value) => updateInput('riskAmount', value.replace(',', '.'))}
            placeholder="Amount you're willing to risk"
            keyboardType="decimal-pad"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <TrendingUp size={20} color="#059669" />
            <Text style={styles.inputLabel}>Entry Price *</Text>
          </View>
          <TextInput
            style={styles.input}
            value={inputs.entryPrice}
            onChangeText={(value) => updateInput('entryPrice', value.replace(',', '.'))}
            placeholder="Price you plan to enter"
            keyboardType="decimal-pad"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <TrendingDown size={20} color="#dc2626" />
            <Text style={styles.inputLabel}>Stop Loss Price *</Text>
          </View>
          <TextInput
            style={styles.input}
            value={inputs.stopLossPrice}
            onChangeText={(value) => updateInput('stopLossPrice', value.replace(',', '.'))}
            placeholder="Price to exit if trade goes wrong"
            keyboardType="decimal-pad"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Wallet size={20} color="#7c3aed" />
            <Text style={styles.inputLabel}>Account Balance</Text>
            <Text style={styles.optionalText}>(optional)</Text>
          </View>
          <TextInput
            style={styles.input}
            value={inputs.accountBalance}
            onChangeText={(value) => updateInput('accountBalance', value.replace(',', '.'))}
            placeholder="Your total account balance"
            keyboardType="decimal-pad"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Target size={20} color="#ea580c" />
            <Text style={styles.inputLabel}>Target Price</Text>
            <Text style={styles.optionalText}>(optional)</Text>
          </View>
          <TextInput
            style={styles.input}
            value={inputs.targetPrice}
            onChangeText={(value) => updateInput('targetPrice', value.replace(',', '.'))}
            placeholder="Your profit target price"
            keyboardType="decimal-pad"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
          <Calculator size={20} color="#ffffff" />
          <Text style={styles.calculateButtonText}>Calculate Position</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  optionalText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  calculateButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});