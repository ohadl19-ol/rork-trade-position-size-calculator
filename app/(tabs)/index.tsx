import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Calculator, History } from 'lucide-react-native';
import { CalculatorForm } from '@/components/calculator-form';
import { CalculatorResults } from '@/components/calculator-results';
import { useRouter } from 'expo-router';

export default function CalculatorScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Calculator size={32} color="#1e40af" />
        <Text style={styles.title}>Position Size Calculator</Text>
        <Text style={styles.subtitle}>Calculate your optimal trade size and risk management</Text>
      </View>
      
      <CalculatorForm />
      <CalculatorResults />
      
      <TouchableOpacity 
        style={styles.historyButton} 
        onPress={() => router.push('/history')}
      >
        <History size={20} color="#ffffff" />
        <Text style={styles.historyButtonText}>View History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  historyButton: {
    backgroundColor: '#0891b2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  historyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});