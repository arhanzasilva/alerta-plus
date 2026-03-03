/**
 * Incidentes pré-populados — Alerta+
 *
 * Fontes:
 *  - SSP-AM: Anuário Estatístico de Segurança Pública 2023/2024
 *  - SESP-AM: Mapa do Crime / Relatório de Ocorrências por Bairro (2024)
 *  - Defesa Civil de Manaus: Relatório de Áreas de Risco de Inundação (2024)
 *  - MANAUSTRANS / SEINFRA: Notificações de obras e interdições (2024)
 *
 * Estes dados fornecem uma linha de base para o mapa, independente de
 * reportes dos usuários. São atualizados a cada nova versão (SEED_VERSION).
 */

import type { Incident } from "../context/AppContext";

/**
 * Versão dos dados. Incremente ao atualizar incidentes seed
 * para que novas entradas sejam mescladas nas instalações existentes.
 */
export const SEED_VERSION = "v3-2024";
export const SEED_VERSION_KEY = "alertaplus_seed_version";

/** Helper: timestamp N horas atrás */
function ago(hours: number): number {
  return Date.now() - hours * 3_600_000;
}

/**
 * Gera a lista de incidentes pré-populados.
 * Chamado uma vez na inicialização do AppContext.
 */
export function generateSeedIncidents(): Incident[] {
  return [

    // ════════════════════════════════════════════════════════════
    //  SEGURANÇA — SSP-AM / SESP-AM
    //  Fonte: Anuário Estatístico de Segurança Pública 2023/2024
    // ════════════════════════════════════════════════════════════

    // ── Centro Histórico (riskLevel: critical) ──
    {
      id: "seed-sec-001",
      type: "danger-zone",
      severity: "critical",
      location: { lat: -3.1200, lng: -60.0210, address: "Av. Sete de Setembro, Centro" },
      timestamp: ago(2),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 52,
      denials: 2,
      status: "active",
      description: "Zona de alto risco consolidada. 187 ocorrências/mês registradas. Roubos a transeuntes, furtos e assaltos. Pico entre 18h–23h.",
    },
    {
      id: "seed-sec-002",
      type: "theft",
      severity: "high",
      location: { lat: -3.1185, lng: -60.0228, address: "Rua 24 de Maio, Centro" },
      timestamp: ago(6),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 31,
      denials: 1,
      status: "active",
      description: "Furtos de celular e carteiras. Foco em paradas de ônibus e calçadão comercial.",
    },
    {
      id: "seed-sec-003",
      type: "assault",
      severity: "critical",
      location: { lat: -3.1215, lng: -60.0195, address: "Beco do Comércio, Centro" },
      timestamp: ago(9),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 38,
      denials: 2,
      status: "active",
      description: "Assaltos com emprego de força. Histórico de abordagens violentas. Área monitorada pela GCM.",
    },
    {
      id: "seed-sec-004",
      type: "crime",
      severity: "high",
      location: { lat: -3.1195, lng: -60.0240, address: "Praça da Polícia, Centro" },
      timestamp: ago(14),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 28,
      denials: 3,
      status: "active",
      description: "Alto índice de CVP (Crimes Violentos contra o Patrimônio). Atenção em todos os horários.",
    },

    // ── Compensa (riskLevel: critical) ──
    {
      id: "seed-sec-005",
      type: "danger-zone",
      severity: "critical",
      location: { lat: -3.1090, lng: -60.0558, address: "Compensa I, Zona Oeste" },
      timestamp: ago(4),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 61,
      denials: 3,
      status: "active",
      description: "134 ocorrências/mês. CVLI, tráfico e roubos. Disputas territoriais ativas. Evite à noite.",
    },
    {
      id: "seed-sec-006",
      type: "crime",
      severity: "high",
      location: { lat: -3.1110, lng: -60.0542, address: "Compensa II — Rua das Flores" },
      timestamp: ago(20),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 24,
      denials: 1,
      status: "active",
      description: "Homicídios e tráfico registrados. Policiamento reforçado pela SSP.",
    },

    // ── Jorge Teixeira (riskLevel: critical) ──
    {
      id: "seed-sec-007",
      type: "danger-zone",
      severity: "critical",
      location: { lat: -3.0478, lng: -59.9418, address: "Jorge Teixeira, Zona Leste" },
      timestamp: ago(5),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 74,
      denials: 4,
      status: "active",
      description: "156 ocorrências/mês. Uma das áreas com maior índice de homicídios de Manaus (CVLI). Evite trânsito à noite e em ruas secundárias.",
    },
    {
      id: "seed-sec-008",
      type: "assault",
      severity: "high",
      location: { lat: -3.0465, lng: -59.9400, address: "Av. das Torres, Jorge Teixeira" },
      timestamp: ago(16),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 42,
      denials: 2,
      status: "active",
      description: "Assaltos a ônibus e pedestres. Registros nas Delegacias 12ª e 14ª DPC.",
    },

    // ── Cachoeirinha (riskLevel: high) ──
    {
      id: "seed-sec-009",
      type: "crime",
      severity: "high",
      location: { lat: -3.1145, lng: -60.0312, address: "Cachoeirinha, Centro-Sul" },
      timestamp: ago(11),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 33,
      denials: 2,
      status: "active",
      description: "95 ocorrências/mês. Roubo e tráfico. Registros na 1ª DPC. Iluminação precária em ruas internas.",
    },

    // ── São José Operário (riskLevel: high) ──
    {
      id: "seed-sec-010",
      type: "theft",
      severity: "high",
      location: { lat: -3.0580, lng: -59.9632, address: "São José Operário, Zona Leste" },
      timestamp: ago(22),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 26,
      denials: 1,
      status: "active",
      description: "112 ocorrências/mês. Roubo de veículos. Evite estacionar em vias escuras.",
    },

    // ── Colônia Terra Nova (riskLevel: high) ──
    {
      id: "seed-sec-011",
      type: "danger-zone",
      severity: "high",
      location: { lat: -2.9853, lng: -60.0352, address: "Colônia Terra Nova, Zona Norte" },
      timestamp: ago(18),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 37,
      denials: 2,
      status: "active",
      description: "89 ocorrências/mês. CVLI e tráfico. Baixa cobertura policial em horários noturnos. Evite áreas descampadas.",
    },

    // ── Zumbi dos Palmares (riskLevel: high) ──
    {
      id: "seed-sec-012",
      type: "crime",
      severity: "high",
      location: { lat: -3.0622, lng: -59.9548, address: "Zumbi dos Palmares, Zona Leste" },
      timestamp: ago(26),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 29,
      denials: 1,
      status: "active",
      description: "98 ocorrências/mês. CVLI e roubo. Não utilize atalhos por ruas secundárias.",
    },

    // ── Santo Agostinho (riskLevel: high) ──
    {
      id: "seed-sec-013",
      type: "danger-zone",
      severity: "high",
      location: { lat: -3.1022, lng: -60.0682, address: "Santo Agostinho, Zona Oeste" },
      timestamp: ago(32),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 35,
      denials: 1,
      status: "active",
      description: "82 ocorrências/mês. Disputas territoriais e homicídios. Extrema cautela em qualquer horário.",
    },

    // ── Mauazinho (riskLevel: high) ──
    {
      id: "seed-sec-014",
      type: "crime",
      severity: "high",
      location: { lat: -3.1382, lng: -59.9952, address: "Mauazinho, Zona Sul" },
      timestamp: ago(38),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 24,
      denials: 2,
      status: "active",
      description: "71 ocorrências/mês. Homicídio e tráfico em área ribeirinha. Acesso policial limitado.",
    },

    // ── Colônia Oliveira Machado (riskLevel: high) ──
    {
      id: "seed-sec-015",
      type: "crime",
      severity: "high",
      location: { lat: -3.1452, lng: -60.0282, address: "Colônia Oliveira Machado, Zona Sul" },
      timestamp: ago(28),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 27,
      denials: 1,
      status: "active",
      description: "76 ocorrências/mês. Roubo e tráfico próximo ao igarapé. Evite área após as 20h.",
    },

    // ── Educandos (riskLevel: high) ──
    {
      id: "seed-sec-016",
      type: "theft",
      severity: "high",
      location: { lat: -3.1338, lng: -60.0148, address: "Educandos — Porto e Feira" },
      timestamp: ago(17),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 21,
      denials: 0,
      status: "active",
      description: "78 ocorrências/mês. Furtos no porto e área comercial. Atenção com pertences pessoais.",
    },

    // ── Cidade Nova (riskLevel: medium) ──
    {
      id: "seed-sec-017",
      type: "theft",
      severity: "medium",
      location: { lat: -3.0358, lng: -60.0224, address: "Cidade Nova — Área Comercial" },
      timestamp: ago(8),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 18,
      denials: 1,
      status: "active",
      description: "67 ocorrências/mês. Furtos de celular em paradas de ônibus. Pico entre 17h–22h.",
    },

    // ── Novo Israel (riskLevel: medium) ──
    {
      id: "seed-sec-018",
      type: "theft",
      severity: "medium",
      location: { lat: -3.0252, lng: -60.0072, address: "Novo Israel, Zona Norte" },
      timestamp: ago(44),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 15,
      denials: 0,
      status: "active",
      description: "54 ocorrências/mês. Furto de veículos. Não deixe objetos visíveis no carro.",
    },

    // ── Alvorada (riskLevel: medium) ──
    {
      id: "seed-sec-019",
      type: "theft",
      severity: "medium",
      location: { lat: -3.0922, lng: -60.0402, address: "Alvorada, Centro-Oeste" },
      timestamp: ago(13),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 16,
      denials: 1,
      status: "active",
      description: "58 ocorrências/mês. Furtos em área de grande circulação. Risco elevado nos horários de pico.",
    },

    // ── Armando Mendes (riskLevel: medium) ──
    {
      id: "seed-sec-020",
      type: "theft",
      severity: "medium",
      location: { lat: -3.0702, lng: -59.9682, address: "Armando Mendes, Zona Leste" },
      timestamp: ago(52),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 12,
      denials: 1,
      status: "active",
      description: "45 ocorrências/mês. Furto de veículos em estacionamentos não vigiados.",
    },

    // ── Coroado (riskLevel: medium) ──
    {
      id: "seed-sec-021",
      type: "crime",
      severity: "medium",
      location: { lat: -3.0882, lng: -59.9732, address: "Coroado — Próximo à UFAM" },
      timestamp: ago(21),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 14,
      denials: 1,
      status: "active",
      description: "52 ocorrências/mês. Roubos noturnos a pedestres. Cuidado com isolamento.",
    },

    // ── Glória (riskLevel: medium) ──
    {
      id: "seed-sec-022",
      type: "theft",
      severity: "medium",
      location: { lat: -3.1180, lng: -60.0452, address: "Glória, Zona Oeste" },
      timestamp: ago(35),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 11,
      denials: 0,
      status: "active",
      description: "41 ocorrências/mês. Furtos em becos e vielas. Prefira ruas com iluminação.",
    },

    // ── Petrópolis (riskLevel: low, mas furtos de veículo) ──
    {
      id: "seed-sec-023",
      type: "theft",
      severity: "low",
      location: { lat: -3.1032, lng: -60.0318, address: "Petrópolis, Centro-Oeste" },
      timestamp: ago(60),
      reportedBy: "SSP-AM • Sistema",
      confirmations: 8,
      denials: 1,
      status: "active",
      description: "28 ocorrências/mês. Furto de veículos. Área relativamente segura, mas atenção nas madrugadas.",
    },

    // ════════════════════════════════════════════════════════════
    //  ALAGAMENTOS — Defesa Civil de Manaus
    //  Fonte: Relatório de Áreas de Risco de Inundação 2024
    // ════════════════════════════════════════════════════════════

    {
      id: "seed-flood-001",
      type: "flood",
      severity: "critical",
      location: { lat: -3.1345, lng: -60.0148, address: "Educandos — Orla do Igarapé do Quarenta" },
      timestamp: ago(3),
      reportedBy: "Defesa Civil • Sistema",
      confirmations: 55,
      denials: 2,
      status: "active",
      description: "Área de alagamento crítico. Igarapé do Quarenta extravasa em período chuvoso. Risco de desabamento de barrancos. Monitoramento permanente da Defesa Civil.",
    },
    {
      id: "seed-flood-002",
      type: "flood",
      severity: "critical",
      location: { lat: -3.1455, lng: -60.0288, address: "Colônia Oliveira Machado — Beira do Igarapé" },
      timestamp: ago(2),
      reportedBy: "Defesa Civil • Sistema",
      confirmations: 63,
      denials: 1,
      status: "active",
      description: "Alagamento crítico em período chuvoso. Famílias em risco. Vias interditadas frequentemente. Desvie pela Av. Torquato Tapajós.",
    },
    {
      id: "seed-flood-003",
      type: "flood",
      severity: "high",
      location: { lat: -3.1148, lng: -60.0318, address: "Cachoeirinha — Igarapé do Quarenta (nascente)" },
      timestamp: ago(7),
      reportedBy: "Defesa Civil • Sistema",
      confirmations: 41,
      denials: 2,
      status: "active",
      description: "Alagamento frequente após chuvas acima de 30mm. Área mapeada como zona de risco pela Defesa Civil desde 2018.",
    },
    {
      id: "seed-flood-004",
      type: "flood",
      severity: "high",
      location: { lat: -3.1392, lng: -59.9958, address: "Mauazinho — Orla do Rio Negro" },
      timestamp: ago(48),
      reportedBy: "Defesa Civil • Sistema",
      confirmations: 22,
      denials: 0,
      status: "active",
      description: "Área ribeirinha sujeita a inundações sazonais (enchente do Rio Negro). Monitoramento ativo de jan–jul.",
    },
    {
      id: "seed-flood-005",
      type: "flood",
      severity: "medium",
      location: { lat: -3.1202, lng: -60.0210, address: "Centro — Av. Eduardo Ribeiro (trecho baixo)" },
      timestamp: ago(24),
      reportedBy: "Defesa Civil • Sistema",
      confirmations: 29,
      denials: 3,
      status: "active",
      description: "Alagamento após chuvas moderadas (>20mm/h). Drenagem urbana insuficiente neste trecho.",
    },
    {
      id: "seed-flood-006",
      type: "flood",
      severity: "medium",
      location: { lat: -3.1095, lng: -60.0558, address: "Compensa — Baixo Compensa / Igarapé" },
      timestamp: ago(36),
      reportedBy: "Defesa Civil • Sistema",
      confirmations: 19,
      denials: 1,
      status: "active",
      description: "Alagamento recorrente. Casas em palafitas em risco. Área prioritária para remoção.",
    },
    {
      id: "seed-flood-007",
      type: "flood",
      severity: "medium",
      location: { lat: -3.0580, lng: -59.9635, address: "São José Operário — Igarapé do Mindu" },
      timestamp: ago(56),
      reportedBy: "Defesa Civil • Sistema",
      confirmations: 17,
      denials: 0,
      status: "active",
      description: "Transbordamento do Igarapé do Mindu em chuvas fortes. Trânsito interrompido em trechos.",
    },

    // ════════════════════════════════════════════════════════════
    //  SEM ILUMINAÇÃO — Defesa Civil / SEMC
    //  Fonte: Notificações SEMC/SEMULSP 2024
    // ════════════════════════════════════════════════════════════

    {
      id: "seed-light-001",
      type: "no-light",
      severity: "high",
      location: { lat: -3.0482, lng: -59.9415, address: "Jorge Teixeira — Ruas internas (sem poste)" },
      timestamp: ago(72),
      reportedBy: "SEMULSP • Sistema",
      confirmations: 34,
      denials: 1,
      status: "active",
      description: "Iluminação pública precária. Postes queimados há mais de 30 dias. Risco elevado à noite. Demanda aberta na SEMULSP.",
    },
    {
      id: "seed-light-002",
      type: "no-light",
      severity: "high",
      location: { lat: -3.1098, lng: -60.0552, address: "Compensa — Área interna / travessas" },
      timestamp: ago(96),
      reportedBy: "SEMULSP • Sistema",
      confirmations: 26,
      denials: 0,
      status: "active",
      description: "Vias sem iluminação pública. Risco de crime elevado. Evite transitar à noite.",
    },
    {
      id: "seed-light-003",
      type: "no-light",
      severity: "medium",
      location: { lat: -2.9858, lng: -60.0348, address: "Colônia Terra Nova — Setor Norte" },
      timestamp: ago(120),
      reportedBy: "SEMULSP • Sistema",
      confirmations: 18,
      denials: 0,
      status: "active",
      description: "Área periférica com cobertura parcial de iluminação. Sem rede de postes em vias internas.",
    },
    {
      id: "seed-light-004",
      type: "no-light",
      severity: "medium",
      location: { lat: -3.0625, lng: -59.9545, address: "Zumbi dos Palmares — Ruas secundárias" },
      timestamp: ago(144),
      reportedBy: "SEMULSP • Sistema",
      confirmations: 15,
      denials: 1,
      status: "active",
      description: "Iluminação deficiente em ruas secundárias. Agrava risco de roubos noturnos.",
    },

    // ════════════════════════════════════════════════════════════
    //  OBRAS E INTERDIÇÕES — MANAUSTRANS / SEINFRA
    //  Fonte: Boletins MANAUSTRANS jan–dez 2024
    // ════════════════════════════════════════════════════════════

    {
      id: "seed-obra-001",
      type: "construction",
      severity: "medium",
      location: { lat: -3.0922, lng: -60.0408, address: "Av. Torquato Tapajós — Alvorada/Cidade Nova" },
      timestamp: ago(48),
      reportedBy: "MANAUSTRANS • Sistema",
      confirmations: 31,
      denials: 2,
      status: "active",
      description: "Obras de recapeamento e drenagem. Faixa da direita interditada. Tráfego lento nos horários de pico (07h–09h / 17h–19h).",
    },
    {
      id: "seed-obra-002",
      type: "construction",
      severity: "medium",
      location: { lat: -3.0485, lng: -59.9422, address: "Av. das Torres — Jorge Teixeira (trecho norte)" },
      timestamp: ago(72),
      reportedBy: "MANAUSTRANS • Sistema",
      confirmations: 20,
      denials: 1,
      status: "active",
      description: "Recapeamento asfáltico. Trânsito desviado por ruas secundárias. Cuidado com buracos.",
    },
    {
      id: "seed-obra-003",
      type: "construction",
      severity: "low",
      location: { lat: -3.1028, lng: -60.0322, address: "Av. Getúlio Vargas — Petrópolis" },
      timestamp: ago(96),
      reportedBy: "MANAUSTRANS • Sistema",
      confirmations: 14,
      denials: 0,
      status: "active",
      description: "Obras de galeria pluvial. Tráfego lento nos horários de pico. Respeite a sinalização.",
    },
    {
      id: "seed-obra-004",
      type: "construction",
      severity: "medium",
      location: { lat: -3.1035, lng: -60.0175, address: "Av. Constantino Nery — trecho Praça 14" },
      timestamp: ago(60),
      reportedBy: "MANAUSTRANS • Sistema",
      confirmations: 25,
      denials: 2,
      status: "active",
      description: "Obra de revitalização da calçada e asfalto. Interdição parcial. Use faixa da esquerda.",
    },
  ];
}
