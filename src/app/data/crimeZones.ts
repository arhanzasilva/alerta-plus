/**
 * Dados de zonas de risco em Manaus - baseados em estatísticas públicas
 * da SSP-AM (Anuário Estatístico de Segurança Pública 2025) e
 * Policia24h / SSP-AM ranking H1 2025.
 *
 * Atualizado: março/2025
 * Fonte: https://www.ssp.am.gov.br/ssp-dados/
 */

export interface CrimeZone {
  id: string;
  name: string;
  /** Coordenada central do bairro */
  lat: number;
  lng: number;
  /** Raio aproximado da zona em metros */
  radiusMeters: number;
  /** Nível de risco geral */
  riskLevel: "critical" | "high" | "medium" | "low";
  /** Principais tipos de ocorrência */
  crimeTypes: string[];
  /** Ocorrências estimadas (mensal) */
  monthlyIncidents: number;
  /** Zona da cidade */
  zone: "Centro-Sul" | "Norte" | "Leste" | "Oeste" | "Sul" | "Centro-Oeste";
  /** Dica de segurança */
  safetyTip: string;
  /** Horários de maior risco */
  peakHours: string;
}

export const CRIME_ZONES: CrimeZone[] = [
  // ===== ZONA CENTRO-SUL =====
  {
    id: "centro-historico",
    name: "Centro Histórico",
    lat: -3.1190,
    lng: -60.0217,
    radiusMeters: 800,
    riskLevel: "critical",
    crimeTypes: ["Roubo", "Furto", "Assalto a transeunte"],
    monthlyIncidents: 187,
    zone: "Centro-Sul",
    safetyTip: "Evite andar sozinho(a) à noite. Mantenha objetos de valor guardados.",
    peakHours: "18h - 23h",
  },
  {
    id: "cachoeirinha",
    name: "Cachoeirinha",
    lat: -3.1145,
    lng: -60.0310,
    radiusMeters: 600,
    riskLevel: "high",
    crimeTypes: ["Roubo", "Tráfico", "Homicídio"],
    monthlyIncidents: 95,
    zone: "Centro-Sul",
    safetyTip: "Prefira vias principais e bem iluminadas.",
    peakHours: "20h - 02h",
  },
  {
    id: "sao-jose",
    name: "São José Operário",
    lat: -3.0578,
    lng: -59.9630,
    radiusMeters: 700,
    riskLevel: "high",
    crimeTypes: ["Roubo de veículo", "Assalto", "Homicídio"],
    monthlyIncidents: 112,
    zone: "Leste",
    safetyTip: "Evite ruas secundárias após o anoitecer.",
    peakHours: "19h - 01h",
  },
  {
    id: "compensa",
    name: "Compensa",
    lat: -3.1095,
    lng: -60.0555,
    radiusMeters: 700,
    riskLevel: "critical",
    crimeTypes: ["Homicídio", "Tráfico", "Roubo"],
    monthlyIncidents: 134,
    zone: "Oeste",
    safetyTip: "Zona com histórico de violência. Evite transitar à noite.",
    peakHours: "21h - 04h",
  },
  {
    id: "educandos",
    name: "Educandos",
    lat: -3.1340,
    lng: -60.0150,
    radiusMeters: 500,
    riskLevel: "high",
    crimeTypes: ["Roubo", "Furto", "Tráfico"],
    monthlyIncidents: 78,
    zone: "Sul",
    safetyTip: "Cuidado redobrado próximo ao porto e áreas ribeirinhas.",
    peakHours: "18h - 00h",
  },
  // ===== ZONA NORTE =====
  {
    id: "cidade-nova",
    name: "Cidade Nova",
    lat: -3.0356,
    lng: -60.0222,
    radiusMeters: 700,
    riskLevel: "high",
    crimeTypes: ["Roubo", "Furto de celular", "Homicídio"],
    monthlyIncidents: 102,
    zone: "Norte",
    safetyTip: "Uma das 3 áreas com maior concentração de crimes. Atenção em paradas de ônibus.",
    peakHours: "17h - 23h",
  },
  {
    id: "novo-aleixo",
    name: "Novo Aleixo",
    lat: -3.0549,
    lng: -59.9647,
    radiusMeters: 650,
    riskLevel: "high",
    crimeTypes: ["Roubo a transeunte", "Assalto", "Tráfico"],
    monthlyIncidents: 107,
    zone: "Norte",
    safetyTip: "2º bairro mais perigoso de Manaus em 2025. Evite transitar sozinho à noite.",
    peakHours: "18h - 02h",
  },
  {
    id: "colonia-terra-nova",
    name: "Colônia Terra Nova",
    lat: -2.9850,
    lng: -60.0350,
    radiusMeters: 800,
    riskLevel: "high",
    crimeTypes: ["Homicídio", "Tráfico", "Roubo"],
    monthlyIncidents: 76,
    zone: "Norte",
    safetyTip: "Evite transitar em áreas descampadas à noite.",
    peakHours: "20h - 03h",
  },
  {
    id: "novo-israel",
    name: "Novo Israel",
    lat: -3.0250,
    lng: -60.0070,
    radiusMeters: 500,
    riskLevel: "medium",
    crimeTypes: ["Furto de veículo", "Roubo", "Assalto"],
    monthlyIncidents: 54,
    zone: "Norte",
    safetyTip: "Mantenha veículos trancados e não deixe objetos à vista.",
    peakHours: "18h - 23h",
  },
  // ===== ZONA LESTE =====
  {
    id: "joao-paulo-ii",
    name: "João Paulo II",
    lat: -3.0279,
    lng: -59.9293,
    radiusMeters: 850,
    riskLevel: "critical",
    crimeTypes: ["Roubo a transeunte", "Assalto", "Furto"],
    monthlyIncidents: 229,
    zone: "Leste",
    safetyTip: "Bairro com maior índice de criminalidade de Manaus (H1 2025). Máxima atenção.",
    peakHours: "16h - 23h",
  },
  {
    id: "jorge-teixeira",
    name: "Jorge Teixeira",
    lat: -3.0480,
    lng: -59.9420,
    radiusMeters: 900,
    riskLevel: "critical",
    crimeTypes: ["Homicídio", "Tráfico", "Roubo", "Assalto"],
    monthlyIncidents: 156,
    zone: "Leste",
    safetyTip: "Uma das zonas mais perigosas. Evite à noite.",
    peakHours: "19h - 04h",
  },
  {
    id: "zumbi-palmares",
    name: "Zumbi dos Palmares",
    lat: -3.0620,
    lng: -59.9550,
    radiusMeters: 700,
    riskLevel: "high",
    crimeTypes: ["Homicídio", "Roubo", "Tráfico"],
    monthlyIncidents: 98,
    zone: "Leste",
    safetyTip: "Prefira avenidas principais. Evite atalhos.",
    peakHours: "20h - 03h",
  },
  {
    id: "armando-mendes",
    name: "Armando Mendes",
    lat: -3.0700,
    lng: -59.9680,
    radiusMeters: 500,
    riskLevel: "medium",
    crimeTypes: ["Furto", "Roubo de veículo"],
    monthlyIncidents: 45,
    zone: "Leste",
    safetyTip: "Cuidado com estacionamentos não vigiados.",
    peakHours: "18h - 22h",
  },
  // ===== ZONA OESTE =====
  {
    id: "santo-agostinho",
    name: "Santo Agostinho",
    lat: -3.1020,
    lng: -60.0680,
    radiusMeters: 500,
    riskLevel: "high",
    crimeTypes: ["Tráfico", "Homicídio", "Roubo"],
    monthlyIncidents: 82,
    zone: "Oeste",
    safetyTip: "Área com disputas territoriais. Extrema cautela.",
    peakHours: "21h - 05h",
  },
  {
    id: "gloria",
    name: "Glória",
    lat: -3.1180,
    lng: -60.0450,
    radiusMeters: 400,
    riskLevel: "medium",
    crimeTypes: ["Furto", "Roubo"],
    monthlyIncidents: 41,
    zone: "Oeste",
    safetyTip: "Atenção ao transitar próximo a becos e vielas.",
    peakHours: "19h - 23h",
  },
  // ===== ZONA SUL =====
  {
    id: "cidade-de-deus",
    name: "Cidade de Deus",
    lat: -3.0187,
    lng: -59.9504,
    radiusMeters: 600,
    riskLevel: "high",
    crimeTypes: ["Homicídio", "Tráfico", "Roubo"],
    monthlyIncidents: 88,
    zone: "Norte",
    safetyTip: "Alta incidência de homicídios ligados ao tráfico. Evite à noite.",
    peakHours: "21h - 05h",
  },
  {
    id: "colonia-oliveira-machado",
    name: "Colônia Oliveira Machado",
    lat: -3.1450,
    lng: -60.0280,
    radiusMeters: 600,
    riskLevel: "high",
    crimeTypes: ["Roubo", "Tráfico", "Homicídio"],
    monthlyIncidents: 76,
    zone: "Sul",
    safetyTip: "Evite áreas próximas ao igarapé à noite.",
    peakHours: "20h - 02h",
  },
  {
    id: "mauazinho",
    name: "Mauazinho",
    lat: -3.1380,
    lng: -59.9950,
    radiusMeters: 500,
    riskLevel: "high",
    crimeTypes: ["Homicídio", "Tráfico", "Assalto"],
    monthlyIncidents: 71,
    zone: "Sul",
    safetyTip: "Região ribeirinha com acesso limitado. Cuidado redobrado.",
    peakHours: "19h - 03h",
  },
  // ===== ZONA CENTRO-OESTE =====
  {
    id: "alvorada",
    name: "Alvorada",
    lat: -3.0920,
    lng: -60.0400,
    radiusMeters: 600,
    riskLevel: "medium",
    crimeTypes: ["Furto", "Roubo de celular", "Assalto"],
    monthlyIncidents: 58,
    zone: "Centro-Oeste",
    safetyTip: "Cuidado em áreas de grande circulação de pessoas.",
    peakHours: "17h - 22h",
  },
  {
    id: "petropolis",
    name: "Petrópolis",
    lat: -3.1030,
    lng: -60.0320,
    radiusMeters: 400,
    riskLevel: "low",
    crimeTypes: ["Furto de veículo", "Furto"],
    monthlyIncidents: 28,
    zone: "Centro-Oeste",
    safetyTip: "Área relativamente segura, mas mantenha atenção.",
    peakHours: "22h - 02h",
  },
  {
    id: "coroado",
    name: "Coroado",
    lat: -3.0880,
    lng: -59.9730,
    radiusMeters: 600,
    riskLevel: "medium",
    crimeTypes: ["Roubo", "Furto", "Assalto"],
    monthlyIncidents: 52,
    zone: "Leste",
    safetyTip: "Atenção próximo à UFAM no período noturno.",
    peakHours: "19h - 00h",
  },
];

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine.
 * @returns distância em metros
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // raio da Terra em metros
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Retorna as zonas de risco próximas a uma localização.
 * @param lat latitude do usuário
 * @param lng longitude do usuário
 * @param maxDistanceMeters distância máxima para considerar "próximo"
 */
export function getNearbyZones(
  lat: number,
  lng: number,
  maxDistanceMeters: number = 2000
): (CrimeZone & { distance: number })[] {
  return CRIME_ZONES.map((zone) => ({
    ...zone,
    distance: haversineDistance(lat, lng, zone.lat, zone.lng),
  }))
    .filter((z) => z.distance <= maxDistanceMeters)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Verifica se o usuário está dentro de alguma zona de risco.
 */
export function isInsideDangerZone(
  lat: number,
  lng: number
): (CrimeZone & { distance: number }) | null {
  for (const zone of CRIME_ZONES) {
    const dist = haversineDistance(lat, lng, zone.lat, zone.lng);
    if (dist <= zone.radiusMeters) {
      return { ...zone, distance: dist };
    }
  }
  return null;
}

/**
 * Cor associada ao nível de risco
 */
export function getRiskColor(level: CrimeZone["riskLevel"]): string {
  switch (level) {
    case "critical":
      return "#ef4444"; // red-500
    case "high":
      return "#f97316"; // orange-500
    case "medium":
      return "#eab308"; // yellow-500
    case "low":
      return "#22c55e"; // green-500
  }
}

export function getRiskLabel(level: CrimeZone["riskLevel"]): string {
  switch (level) {
    case "critical":
      return "Risco Crítico";
    case "high":
      return "Risco Alto";
    case "medium":
      return "Risco Médio";
    case "low":
      return "Risco Baixo";
  }
}
