/**
 * usePlannedRoutes Hook
 *
 * Gerencia rotas planejadas (Casa, Trabalho, etc.) no localStorage.
 * Compartilhado entre MapView (atalhos) e Routes (rotas planejadas).
 */

import { useState, useEffect, useCallback } from 'react';

export type PlannedRouteCategory = "home" | "work" | "gym" | "school" | "custom";

export interface PlannedRoute {
  id: string;
  name: string;
  category: PlannedRouteCategory;
  origin: string;
  destination: string;
  scheduledTime: string;
  days: string[];
  isActive: boolean;
  createdAt: number;
}

const STORAGE_KEY = "alertaplus_planned_routes";

function loadPlannedRoutes(): PlannedRoute[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed || [];
    }
    return [];
  } catch {
    return [];
  }
}

function savePlannedRoutes(routes: PlannedRoute[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

export function usePlannedRoutes() {
  const [plannedRoutes, setPlannedRoutes] = useState<PlannedRoute[]>(loadPlannedRoutes);

  // Save to localStorage whenever routes change
  useEffect(() => {
    savePlannedRoutes(plannedRoutes);
  }, [plannedRoutes]);

  /**
   * Adiciona uma nova rota planejada
   */
  const addPlannedRoute = useCallback((route: Omit<PlannedRoute, 'id' | 'createdAt'>) => {
    const newRoute: PlannedRoute = {
      ...route,
      id: `planned-${Date.now()}`,
      createdAt: Date.now(),
    };
    setPlannedRoutes(prev => [...prev, newRoute]);
    return newRoute;
  }, []);

  /**
   * Atualiza uma rota planejada existente
   */
  const updatePlannedRoute = useCallback((id: string, updates: Partial<PlannedRoute>) => {
    setPlannedRoutes(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  }, []);

  /**
   * Remove uma rota planejada
   */
  const deletePlannedRoute = useCallback((id: string) => {
    setPlannedRoutes(prev => prev.filter(r => r.id !== id));
  }, []);

  /**
   * Ativa/desativa uma rota planejada
   */
  const togglePlannedActive = useCallback((id: string) => {
    setPlannedRoutes(prev =>
      prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
    );
  }, []);

  /**
   * Busca rotas por categoria
   */
  const getRoutesByCategory = useCallback((category: PlannedRouteCategory) => {
    return plannedRoutes.filter(r => r.category === category && r.isActive);
  }, [plannedRoutes]);

  /**
   * Busca a rota mais recente de uma categoria
   */
  const getLatestByCategory = useCallback((category: PlannedRouteCategory) => {
    const routes = getRoutesByCategory(category);
    return routes.sort((a, b) => b.createdAt - a.createdAt)[0] || null;
  }, [getRoutesByCategory]);

  return {
    plannedRoutes,
    setPlannedRoutes,
    addPlannedRoute,
    updatePlannedRoute,
    deletePlannedRoute,
    togglePlannedActive,
    getRoutesByCategory,
    getLatestByCategory,
  };
}
