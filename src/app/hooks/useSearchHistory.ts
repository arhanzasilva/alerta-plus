/**
 * useSearchHistory Hook
 *
 * Gerencia histórico de buscas de endereços no localStorage.
 * Salva as buscas recentes do usuário para facilitar acesso rápido.
 */

import { useState, useCallback, useEffect } from 'react';
import type { AddressSuggestion } from '../lib/mapboxService';

const STORAGE_KEY = 'alertaplus_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  id: string;
  label: string;
  address: string;
  lng: number;
  lat: number;
  timestamp: number; // Para ordenar por recente
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        // Sort by timestamp (most recent first)
        const sorted = parsed.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(sorted.slice(0, MAX_HISTORY_ITEMS));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de buscas:', error);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveToStorage = useCallback((items: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }, []);

  /**
   * Adiciona uma busca ao histórico.
   * Remove duplicatas e mantém apenas os N itens mais recentes.
   */
  const addToHistory = useCallback(
    (item: AddressSuggestion) => {
      setHistory((prev) => {
        // Remove duplicatas (mesmo endereço)
        const filtered = prev.filter(
          (h) => h.address.toLowerCase() !== item.address.toLowerCase()
        );

        // Adiciona novo item no topo
        const newHistory: SearchHistoryItem[] = [
          {
            id: item.id,
            label: item.label,
            address: item.address,
            lng: item.lng,
            lat: item.lat,
            timestamp: Date.now(),
          },
          ...filtered,
        ].slice(0, MAX_HISTORY_ITEMS);

        // Salva no localStorage
        saveToStorage(newHistory);

        return newHistory;
      });
    },
    [saveToStorage]
  );

  /**
   * Remove um item específico do histórico.
   */
  const removeFromHistory = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== id);
        saveToStorage(filtered);
        return filtered;
      });
    },
    [saveToStorage]
  );

  /**
   * Limpa todo o histórico.
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  }, []);

  /**
   * Retorna itens do histórico que correspondem a uma query.
   */
  const searchInHistory = useCallback(
    (query: string): SearchHistoryItem[] => {
      if (!query.trim()) return history;

      const q = query.toLowerCase();
      return history.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q)
      );
    },
    [history]
  );

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    searchInHistory,
  };
}
