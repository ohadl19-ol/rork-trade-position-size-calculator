import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, FlatList } from 'react-native';
import { TrendingUp, Clock, Eye, Trash2, X, TrendingDown } from 'lucide-react-native';
import { useCalculator, HistoryRecord } from '@/providers/calculator-provider';

export default function HistoryScreen() {
  const { history, deleteHistoryItem, clearHistory } = useCalculator();
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatShares = (num: number): string => {
    return parseFloat(num.toFixed(4)).toLocaleString('en-US');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteHistoryItem(id)
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all history records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => clearHistory()
        },
      ]
    );
  };

  const openDetail = (record: HistoryRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const renderHistoryItem = ({ item }: { item: HistoryRecord }) => (
    <View style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <View style={styles.stockInfo}>
          <Text style={styles.stockName}>{item.stockName}</Text>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.directionBadge}>
          {item.tradeDirection === 'long' ? (
            <TrendingUp size={16} color="#059669" />
          ) : (
            <TrendingDown size={16} color="#dc2626" />
          )}
          <Text style={[
            styles.directionText,
            item.tradeDirection === 'long' ? styles.longText : styles.shortText
          ]}>
            {item.tradeDirection.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.itemGrid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Entry</Text>
          <Text style={styles.gridValue}>${formatNumber(item.entryPrice)}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Stop</Text>
          <Text style={styles.gridValue}>${formatNumber(item.stopLossPrice)}</Text>
        </View>
        {item.targetPrice && (
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Target</Text>
            <Text style={styles.gridValue}>${formatNumber(item.targetPrice)}</Text>
          </View>
        )}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Risk</Text>
          <Text style={styles.gridValue}>${formatNumber(item.riskAmount)}</Text>
        </View>
      </View>

      <View style={styles.itemSummary}>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Shares: </Text>
          {formatShares(item.shares)}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Position: </Text>
          ${formatNumber(item.positionSize)}
        </Text>
        {item.positionPercentage && (
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Position %: </Text>
            {formatNumber(item.positionPercentage)}%
          </Text>
        )}
        {item.riskPercent && (
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Risk %: </Text>
            {formatNumber(item.riskPercent, 2)}%
          </Text>
        )}
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => openDetail(item)}
        >
          <Eye size={18} color="#1e40af" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={18} color="#dc2626" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TrendingUp size={28} color="#1e40af" />
            <Text style={styles.title}>Trade History</Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Trash2 size={20} color="#dc2626" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Trade History Yet</Text>
            <Text style={styles.emptyDescription}>
              Your calculated trades will appear here once you start using the calculator.
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trade Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {selectedRecord && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Stock Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Stock/Ticker:</Text>
                    <Text style={styles.detailValue}>{selectedRecord.stockName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Timestamp:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedRecord.timestamp)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Direction:</Text>
                    <Text style={[
                      styles.detailValue,
                      selectedRecord.tradeDirection === 'long' ? styles.longText : styles.shortText
                    ]}>
                      {selectedRecord.tradeDirection.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Price Levels</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Entry Price:</Text>
                    <Text style={styles.detailValue}>${formatNumber(selectedRecord.entryPrice, 4)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Stop Loss:</Text>
                    <Text style={styles.detailValue}>${formatNumber(selectedRecord.stopLossPrice, 4)}</Text>
                  </View>
                  {selectedRecord.targetPrice && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Target Price:</Text>
                      <Text style={styles.detailValue}>${formatNumber(selectedRecord.targetPrice, 4)}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Position Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Risk Amount:</Text>
                    <Text style={styles.detailValue}>${formatNumber(selectedRecord.riskAmount)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Shares/Units:</Text>
                    <Text style={styles.detailValue}>{formatShares(selectedRecord.shares)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Position Size:</Text>
                    <Text style={styles.detailValue}>${formatNumber(selectedRecord.positionSize)}</Text>
                  </View>
                  {selectedRecord.positionPercentage && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Position % of Account:</Text>
                      <Text style={styles.detailValue}>{formatNumber(selectedRecord.positionPercentage)}%</Text>
                    </View>
                  )}
                  {selectedRecord.riskPercent && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Risk % of Account:</Text>
                      <Text style={styles.detailValue}>{formatNumber(selectedRecord.riskPercent, 2)}%</Text>
                    </View>
                  )}
                  {selectedRecord.riskRewardRatio && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Risk/Reward:</Text>
                      <Text style={styles.detailValue}>1:{formatNumber(selectedRecord.riskRewardRatio)}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#dc2626',
    marginLeft: 4,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  directionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  longText: {
    color: '#059669',
  },
  shortText: {
    color: '#dc2626',
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  gridItem: {
    minWidth: 80,
  },
  gridLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  itemSummary: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  summaryLabel: {
    fontWeight: '600',
    color: '#64748b',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 6,
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});