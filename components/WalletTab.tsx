import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { WalletPayoutService } from '../lib/services/WalletPayoutService';
import { Wallet } from '../lib/models/Wallet';
import { WalletTransaction } from '../lib/models/WalletTransaction';
import { toast } from '../lib/toast';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings, 
  CreditCard, 
  Smartphone,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react-native';

const formatPrice = (value: number) => {
  return `${value.toLocaleString('fr-FR')} FCFA`;
};

export default function WalletTab() {
  const [balance, setBalance] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutNetwork, setPayoutNetwork] = useState('ORANGE');

  const fetchBalance = async () => {
    setIsBalanceLoading(true);
    try {
      const data = await WalletPayoutService.getBalance();
      setBalance(data);
    } catch (err) {
      console.error('Error fetching balance:', err);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setIsTransactionsLoading(true);
    try {
      const data = await WalletPayoutService.getTransactionHistory();
      // Sort transactions by date descending (newest first)
      const sorted = (data || []).sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setTransactions(sorted);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }
    if (amount > (balance?.balance || 0)) {
      toast.error('Solde insuffisant');
      return;
    }

    setIsWithdrawing(true);
    try {
      await WalletPayoutService.requestPayout(amount);
      toast.success('Demande de retrait envoyée !');
      setWithdrawAmount('');
      // Refresh balance and transaction history
      await Promise.all([fetchBalance(), fetchTransactions()]);
    } catch (err: any) {
      toast.error('Erreur lors du retrait');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!payoutPhone.trim()) {
      toast.error('Numéro requis');
      return;
    }

    setIsUpdatingSettings(true);
    try {
      await WalletPayoutService.updatePayoutSettings(payoutPhone, payoutNetwork);
      toast.success('Informations de retrait mises à jour');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View className="gap-6 pb-12">
        {/* Solde Card */}
        <View className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm relative overflow-hidden">
          <Text className="font-sans text-[9px] uppercase tracking-[0.25em] font-black text-muted mb-2">Solde Disponible</Text>
          {isBalanceLoading ? (
            <ActivityIndicator color="#C26D5C" size="small" className="self-start py-2" />
          ) : (
            <Text className="font-serif text-3xl font-bold text-accent">
              {formatPrice(balance?.balance || 0)}
            </Text>
          )}
          <View className="flex-row items-center gap-1.5 mt-4 pt-4 border-t border-black/5">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <Text className="font-sans text-[9px] text-muted font-bold uppercase tracking-wider">Compte vérifié</Text>
          </View>
        </View>

        {/* Retrait Form */}
        <View className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm">
          <Text className="font-serif text-lg text-foreground mb-1">Demander un retrait</Text>
          <Text className="font-sans text-xs text-muted leading-relaxed mb-4">
            Les fonds seront transférés sur votre compte Mobile Money configuré sous 24h.
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 relative justify-center">
              <TextInput
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                placeholder="Montant"
                placeholderTextColor="#9A8880"
                className="bg-foreground/[0.03] border border-black/10 rounded-2xl px-5 py-4 font-sans text-sm text-foreground"
              />
              <Text className="absolute right-4 font-sans text-[10px] font-bold text-muted" style={{ position: 'absolute', right: 16, top: '50%', marginTop: -6 }}>XAF</Text>
            </View>
            <TouchableOpacity 
              onPress={handleWithdraw}
              disabled={isWithdrawing || !balance?.balance}
              className="bg-accent px-6 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-90 disabled:opacity-30"
            >
              {isWithdrawing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <ArrowUpRight size={14} color="white" />
                  <Text className="text-white font-sans font-bold uppercase tracking-widest text-[10px]">Retirer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Payout Settings */}
        <View className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm">
          <View className="flex-row items-center gap-2 mb-4">
            <Settings size={16} color="#C26D5C" />
            <Text className="font-serif text-lg text-foreground">Configuration de Retrait</Text>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Text className="font-sans text-[9px] font-bold uppercase tracking-widest text-muted px-1">Réseau</Text>
              <View className="flex-row gap-3">
                {['ORANGE', 'MTN'].map((net) => (
                  <TouchableOpacity
                    key={net}
                    onPress={() => setPayoutNetwork(net)}
                    className={`flex-1 py-3.5 rounded-2xl items-center justify-center border transition-all ${
                      payoutNetwork === net 
                        ? 'bg-foreground border-foreground shadow-sm' 
                        : 'bg-foreground/[0.02] border-black/10'
                    }`}
                  >
                    <Text className={`font-sans text-[10px] font-black tracking-widest ${
                      payoutNetwork === net ? 'text-white' : 'text-muted'
                    }`}>
                      {net} MONEY
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="font-sans text-[9px] font-bold uppercase tracking-widest text-muted px-1">Numéro de téléphone</Text>
              <View className="relative justify-center">
                <TextInput
                  value={payoutPhone}
                  onChangeText={setPayoutPhone}
                  keyboardType="phone-pad"
                  placeholder="6xx xxx xxx"
                  placeholderTextColor="#9A8880"
                  className="bg-foreground/[0.02] border border-black/10 rounded-2xl pl-12 pr-4 py-4 font-sans text-sm text-foreground"
                />
                <Smartphone size={16} color="#9A8880" className="absolute left-4" style={{ position: 'absolute', left: 16, top: '50%', marginTop: -8 }} />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleUpdateSettings}
              disabled={isUpdatingSettings}
              className="bg-ink py-4 rounded-2xl items-center justify-center active:opacity-90 mt-2"
            >
              {isUpdatingSettings ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-sans font-bold uppercase tracking-widest text-[10px]">Enregistrer</Text>
              )}
            </TouchableOpacity>

            <View className="mt-2 bg-accent/5 p-4 rounded-2xl flex-row gap-3 border border-accent/10">
              <AlertCircle size={16} color="#C26D5C" className="mt-0.5 shrink-0" />
              <Text className="font-sans text-[10px] text-accent/80 leading-normal flex-1">
                Assurez-vous que le numéro correspond à un compte Mobile Money actif à votre nom pour éviter tout rejet de virement.
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions History */}
        <View className="gap-4">
          <View className="flex-row justify-between items-baseline px-1">
            <Text className="font-serif text-lg text-foreground">Historique des transactions</Text>
            <Text className="font-sans text-[9px] uppercase tracking-widest font-black text-muted">Flux financier</Text>
          </View>

          <View className="gap-3">
            {isTransactionsLoading ? (
              <ActivityIndicator color="#C26D5C" size="small" className="py-8" />
            ) : !transactions || transactions.length === 0 ? (
              <View className="py-12 items-center justify-center bg-white rounded-[32px] border border-dashed border-black/10">
                <AlertCircle size={28} color="#9A8880" className="opacity-40 mb-2" />
                <Text className="font-sans text-xs text-muted italic">Aucune transaction enregistrée.</Text>
              </View>
            ) : (
              transactions.map((tx) => (
                <View key={tx.id} className="bg-white hover:bg-foreground/[0.01] rounded-[24px] p-4 flex-row items-center gap-4 border border-black/5 shadow-sm">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    tx.type === 'SALE' ? 'bg-emerald-500/10' : 
                    tx.type === 'WITHDRAWAL' ? 'bg-amber-500/10' : 'bg-foreground/5'
                  }`}>
                    {tx.type === 'SALE' ? (
                      <ArrowDownLeft size={20} color="#16A34A" />
                    ) : (
                      <ArrowUpRight size={20} color="#CA8A04" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-baseline mb-1">
                      <Text className="font-sans text-sm font-bold text-foreground max-w-[70%]" numberOfLines={1}>
                        {tx.description || (tx.type === 'SALE' ? "Vente d'œuvre" : "Retrait de fonds")}
                      </Text>
                      <Text className={`font-sans text-sm font-bold ${tx.type === 'SALE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {tx.type === 'SALE' ? '+' : '-'}{formatPrice(tx.amount || 0)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="font-sans text-[8px] text-muted font-bold uppercase tracking-wider">
                        {new Date(tx.createdAt || 0).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </Text>
                      <View className="w-1 h-1 rounded-full bg-black/10" />
                      <Text className="font-sans text-[8px] text-muted">Ref: {tx.id?.slice(0, 8)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
