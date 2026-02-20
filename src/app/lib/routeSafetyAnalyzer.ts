/**
 * Route Safety Analyzer
 *
 * Analisa a segurança de uma rota cruzando sua geometria
 * com as zonas de risco de Manaus (crimeZones.ts).
 */

import { CRIME_ZONES, haversineDistance, type CrimeZone } from '../data/crimeZones';

export interface RouteRisk {
  zone: CrimeZone;
  /** Distância mínima da rota até o centro da zona (metros) */
  distanceToRoute: number;
  /** Se a rota passa dentro do raio da zona */
  passesThrough: boolean;
}

export interface SafetyAnalysis {
  /** Score de segurança (0-100, quanto maior mais seguro) */
  safetyScore: number;
  /** Nível de risco geral da rota */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  /** Zonas de risco que a rota atravessa ou passa perto */
  risks: RouteRisk[];
  /** Número total de avisos */
  warningsCount: number;
  /** Avisos específicos para exibir ao usuário */
  warnings: string[];
}

/**
 * Calcula a distância mínima entre um ponto e uma linha (rota).
 * Usa a aproximação de distância ponto-segmento para cada segmento da rota.
 */
function pointToLineDistance(
  point: [number, number],
  lineCoords: [number, number][]
): number {
  let minDistance = Infinity;

  for (let i = 0; i < lineCoords.length - 1; i++) {
    const p1 = lineCoords[i];
    const p2 = lineCoords[i + 1];

    // Distância do ponto ao segmento de linha
    const dist = pointToSegmentDistance(point, p1, p2);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance;
}

/**
 * Calcula a distância de um ponto a um segmento de linha.
 */
function pointToSegmentDistance(
  point: [number, number],
  segmentStart: [number, number],
  segmentEnd: [number, number]
): number {
  const [px, py] = point;
  const [x1, y1] = segmentStart;
  const [x2, y2] = segmentEnd;

  // Vetor do segmento
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Se o segmento tem comprimento zero
  if (dx === 0 && dy === 0) {
    return haversineDistance(py, px, y1, x1);
  }

  // Parâmetro t da projeção do ponto no segmento
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));

  // Ponto mais próximo no segmento
  const nearestX = x1 + t * dx;
  const nearestY = y1 + t * dy;

  return haversineDistance(py, px, nearestY, nearestX);
}

/**
 * Analisa a segurança de uma rota baseada nas zonas de risco.
 *
 * @param geometry GeoJSON LineString com as coordenadas da rota
 * @returns Análise detalhada da segurança da rota
 */
export function analyzeRouteSafety(geometry: GeoJSON.LineString): SafetyAnalysis {
  const routeCoords = geometry.coordinates as [number, number][];
  const risks: RouteRisk[] = [];
  const warnings: string[] = [];

  // Para cada zona de risco, verificar se a rota passa perto
  for (const zone of CRIME_ZONES) {
    const zonePoint: [number, number] = [zone.lng, zone.lat];
    const distanceToRoute = pointToLineDistance(zonePoint, routeCoords);

    // Se a rota passa dentro ou próximo à zona de risco
    const threshold = zone.radiusMeters + 200; // 200m de buffer adicional
    if (distanceToRoute <= threshold) {
      const passesThrough = distanceToRoute <= zone.radiusMeters;

      risks.push({
        zone,
        distanceToRoute,
        passesThrough,
      });

      // Adicionar avisos para zonas críticas e altas
      if (passesThrough && (zone.riskLevel === 'critical' || zone.riskLevel === 'high')) {
        warnings.push(
          `⚠️ ${zone.name}: ${zone.safetyTip}`
        );
      }
    }
  }

  // Ordenar riscos por severidade e distância
  risks.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aSeverity = severityOrder[a.zone.riskLevel];
    const bSeverity = severityOrder[b.zone.riskLevel];

    if (aSeverity !== bSeverity) {
      return bSeverity - aSeverity; // Mais severo primeiro
    }
    return a.distanceToRoute - b.distanceToRoute; // Mais próximo primeiro
  });

  // Calcular score de segurança (0-100)
  const safetyScore = calculateSafetyScore(risks);

  // Determinar nível de risco geral
  const riskLevel = determineOverallRisk(risks, safetyScore);

  return {
    safetyScore,
    riskLevel,
    risks,
    warningsCount: warnings.length,
    warnings,
  };
}

/**
 * Calcula o score de segurança (0-100) baseado nas zonas de risco encontradas.
 * Quanto maior o score, mais segura a rota.
 */
function calculateSafetyScore(risks: RouteRisk[]): number {
  if (risks.length === 0) {
    return 100; // Rota completamente segura
  }

  let penaltyPoints = 0;

  for (const risk of risks) {
    const { zone, passesThrough, distanceToRoute } = risk;

    // Penalidade base por nível de risco
    const basePenalty = {
      critical: 30,
      high: 20,
      medium: 10,
      low: 5,
    }[zone.riskLevel];

    // Se passa dentro da zona, penalidade máxima
    if (passesThrough) {
      penaltyPoints += basePenalty;
    } else {
      // Se passa perto, penalidade proporcional à distância
      const maxDistance = zone.radiusMeters + 200;
      const proximity = 1 - (distanceToRoute / maxDistance);
      penaltyPoints += basePenalty * proximity * 0.5;
    }
  }

  // Score final (limitado entre 0-100)
  const score = Math.max(0, 100 - penaltyPoints);
  return Math.round(score);
}

/**
 * Determina o nível de risco geral da rota.
 */
function determineOverallRisk(
  risks: RouteRisk[],
  safetyScore: number
): 'low' | 'medium' | 'high' | 'critical' {
  // Se não há riscos, é baixo
  if (risks.length === 0 || safetyScore >= 90) {
    return 'low';
  }

  // Se há zonas críticas atravessadas
  const hasCritical = risks.some(r => r.passesThrough && r.zone.riskLevel === 'critical');
  if (hasCritical || safetyScore < 50) {
    return 'critical';
  }

  // Se há zonas altas atravessadas
  const hasHigh = risks.some(r => r.passesThrough && r.zone.riskLevel === 'high');
  if (hasHigh || safetyScore < 70) {
    return 'high';
  }

  // Caso contrário, médio
  return 'medium';
}

/**
 * Formata os avisos de segurança para exibição.
 */
export function formatSafetyWarnings(analysis: SafetyAnalysis): string[] {
  const warnings: string[] = [];

  // Aviso geral baseado no score
  if (analysis.safetyScore < 50) {
    warnings.push('🚨 Esta rota passa por áreas de alto risco. Considere alternativas.');
  } else if (analysis.safetyScore < 70) {
    warnings.push('⚠️ Mantenha atenção redobrada nesta rota.');
  }

  // Avisos específicos por zona
  warnings.push(...analysis.warnings);

  // Limitar a 5 avisos mais relevantes
  return warnings.slice(0, 5);
}
