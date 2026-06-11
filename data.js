// =====================================================
// data.js — Base de dados e regras de negócio
// AMT01: Dashboard Logístico
// =====================================================

const DADOS_BRUTOS = [
  { id_entrega: 301, transportadora: "RotaMax",  regiao: "Sudeste",      prazo_dias: 3, dias_reais: 7  },
  { id_entrega: 302, transportadora: "ViaCargo", regiao: "Sul",          prazo_dias: 5, dias_reais: 5  },
  { id_entrega: 303, transportadora: "FlashLog", regiao: "Nordeste",     prazo_dias: 4, dias_reais: 9  },
  { id_entrega: 304, transportadora: "RotaMax",  regiao: "Norte",        prazo_dias: 6, dias_reais: 4  },
  { id_entrega: 305, transportadora: "ViaCargo", regiao: "Centro-Oeste", prazo_dias: 2, dias_reais: 6  },
  { id_entrega: 306, transportadora: "FlashLog", regiao: "Sul",          prazo_dias: 5, dias_reais: 12 },
  { id_entrega: 307, transportadora: "RotaMax",  regiao: "Sul",          prazo_dias: 6, dias_reais: 9  },
  { id_entrega: 308, transportadora: "ViaCargo", regiao: "Sudeste",      prazo_dias: 3, dias_reais: 4  },
  { id_entrega: 309, transportadora: "FlashLog", regiao: "Norte",        prazo_dias: 5, dias_reais: 5  },
  { id_entrega: 310, transportadora: "ViaCargo", regiao: "Nordeste",     prazo_dias: 4, dias_reais: 8  },
];

// ── Regra de negócio: calcular colunas derivadas ──────────────────────────────

function calcularPrioridade(diasAtraso) {
  if (diasAtraso >= 7) return "Crítico";
  if (diasAtraso >= 4) return "Alto";
  if (diasAtraso >= 2) return "Médio";
  if (diasAtraso === 1) return "Baixo";
  return "Sem Atraso";
}

function calcularOrdemPrioridade(prioridade) {
  const mapa = { "Crítico": 1, "Alto": 2, "Médio": 3, "Baixo": 4, "Sem Atraso": 5 };
  return mapa[prioridade] ?? 99;
}

// Enriquece cada registro com colunas calculadas
const DADOS = DADOS_BRUTOS.map(row => {
  const atrasado = row.dias_reais > row.prazo_dias;
  const dias_atraso = atrasado ? row.dias_reais - row.prazo_dias : 0;
  const prioridade = calcularPrioridade(dias_atraso);
  return {
    ...row,
    dias_atraso,
    status_entrega: atrasado ? "Atrasado" : "No Prazo",
    prioridade,
    ordem_prioridade: calcularOrdemPrioridade(prioridade),
  };
});

// Exporta para uso global
window.DADOS = DADOS;
