// =====================================================
// app.js — Lógica principal do Dashboard Logístico
// AMT01: Visualização de Dados
// =====================================================

// ── Estado global ──────────────────────────────────────────────────────────────
let dadosFiltrados = [...DADOS];
let sortCol = "ordem_prioridade";
let sortDir = "asc";

// Cores por prioridade
const COR_PRIORIDADE = {
  "Crítico":    { bg: "#FDECEA", text: "#A93226", barra: "#C0392B" },
  "Alto":       { bg: "#FEF5E7", text: "#935116", barra: "#E67E22" },
  "Médio":      { bg: "#FEFDE7", text: "#7D6608", barra: "#D4AC0D" },
  "Baixo":      { bg: "#EBF5FB", text: "#1A5276", barra: "#2E86C1" },
  "Sem Atraso": { bg: "#EAFAF1", text: "#1D8348", barra: "#27AE60" },
};

// ── Inicialização ──────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  popularFiltros();
  aplicarFiltros();
  configurarEventos();
});

// ── Filtros ────────────────────────────────────────────────────────────────────
function popularFiltros() {
  const regioes = [...new Set(DADOS.map(d => d.regiao))].sort();
  const transportadoras = [...new Set(DADOS.map(d => d.transportadora))].sort();

  const selRegiao = document.getElementById("filtro-regiao");
  const selTransp = document.getElementById("filtro-transportadora");

  regioes.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r; opt.textContent = r;
    selRegiao.appendChild(opt);
  });

  transportadoras.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t; opt.textContent = t;
    selTransp.appendChild(opt);
  });
}

function aplicarFiltros() {
  const regiao = document.getElementById("filtro-regiao").value;
  const transp = document.getElementById("filtro-transportadora").value;
  const status = document.getElementById("filtro-status").value;
  const prioridade = document.getElementById("filtro-prioridade").value;

  dadosFiltrados = DADOS.filter(d => {
    if (regiao && d.regiao !== regiao) return false;
    if (transp && d.transportadora !== transp) return false;
    if (status && d.status_entrega !== status) return false;
    if (prioridade && d.prioridade !== prioridade) return false;
    return true;
  });

  renderTudo();
}

function configurarEventos() {
  ["filtro-regiao", "filtro-transportadora", "filtro-status", "filtro-prioridade"]
    .forEach(id => document.getElementById(id).addEventListener("change", aplicarFiltros));

  document.getElementById("btn-reset").addEventListener("click", () => {
    ["filtro-regiao", "filtro-transportadora", "filtro-status", "filtro-prioridade"]
      .forEach(id => { document.getElementById(id).value = ""; });
    aplicarFiltros();
  });

  document.getElementById("btn-export").addEventListener("click", exportarCSV);

  // Ordenação de colunas
  document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortCol = col;
        sortDir = "asc";
      }
      document.querySelectorAll("th.sortable").forEach(h => h.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(sortDir === "asc" ? "sort-asc" : "sort-desc");
      renderTabela();
    });
  });
}

// ── Render principal ───────────────────────────────────────────────────────────
function renderTudo() {
  renderKPIs();
  renderGraficoTransportadoras();
  renderGraficoRegioes();
  renderDonut();
  renderGraficoPrioridades();
  renderTabela();
}

// ── KPIs ───────────────────────────────────────────────────────────────────────
function renderKPIs() {
  const total = dadosFiltrados.length;
  const atrasadas = dadosFiltrados.filter(d => d.status_entrega === "Atrasado").length;
  const pct = total > 0 ? Math.round((atrasadas / total) * 100) : 0;
  const somaAtraso = dadosFiltrados.reduce((s, d) => s + d.dias_atraso, 0);
  const media = total > 0 ? (somaAtraso / total).toFixed(1) : "0.0";
  const maxAtraso = dadosFiltrados.length > 0 ? Math.max(...dadosFiltrados.map(d => d.dias_atraso)) : 0;

  animarValor("kpi-total", total);
  animarValor("kpi-atrasadas", atrasadas);
  document.getElementById("kpi-pct").textContent = pct + "%";
  document.getElementById("kpi-media").textContent = media;
  document.getElementById("kpi-max").textContent = maxAtraso;
}

function animarValor(id, valor) {
  const el = document.getElementById(id);
  const inicio = parseInt(el.textContent) || 0;
  const duracao = 400;
  const inicio_ts = performance.now();
  function step(ts) {
    const p = Math.min((ts - inicio_ts) / duracao, 1);
    el.textContent = Math.round(inicio + (valor - inicio) * p);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Gráfico de barras horizontal genérico ──────────────────────────────────────
function renderBarChart(containerId, dados, labelKey, valorKey, maxValor) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (dados.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhum dado para exibir</p>';
    return;
  }

  dados.forEach((item, i) => {
    const pct = maxValor > 0 ? (item[valorKey] / maxValor) * 100 : 0;
    const cor = item.cor || "#4A90D9";
    const delay = i * 60;

    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span class="bar-label" title="${item[labelKey]}">${item[labelKey]}</span>
      <div class="bar-track" role="progressbar" aria-valuenow="${item[valorKey]}" aria-valuemax="${maxValor}" aria-label="${item[labelKey]}: ${item[valorKey]}">
        <div class="bar-fill" style="width:0%; background:${cor}; transition-delay:${delay}ms">
          ${item[valorKey] > 0 ? item[valorKey] : ""}
        </div>
      </div>
      <span class="bar-num">${item[valorKey]}</span>
    `;
    container.appendChild(row);

    // Anima após inserir
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        row.querySelector(".bar-fill").style.width = pct + "%";
      });
    });
  });
}

// ── Gráfico transportadoras ────────────────────────────────────────────────────
function renderGraficoTransportadoras() {
  const contagem = {};
  dadosFiltrados.filter(d => d.status_entrega === "Atrasado").forEach(d => {
    contagem[d.transportadora] = (contagem[d.transportadora] || 0) + 1;
  });

  const cores = { "FlashLog": "#C0392B", "ViaCargo": "#E67E22", "RotaMax": "#2E86C1" };
  const dados = Object.entries(contagem)
    .map(([k, v]) => ({ transportadora: k, atrasos: v, cor: cores[k] || "#888" }))
    .sort((a, b) => b.atrasos - a.atrasos);

  const max = dados.length > 0 ? Math.max(...dados.map(d => d.atrasos)) : 1;
  renderBarChart("chart-transportadoras", dados, "transportadora", "atrasos", max);
}

// ── Gráfico regiões ────────────────────────────────────────────────────────────
function renderGraficoRegioes() {
  const contagem = {};
  dadosFiltrados.filter(d => d.status_entrega === "Atrasado").forEach(d => {
    contagem[d.regiao] = (contagem[d.regiao] || 0) + 1;
  });

  // Regiões sem atraso também aparecem com 0
  dadosFiltrados.forEach(d => {
    if (!(d.regiao in contagem)) contagem[d.regiao] = 0;
  });

  const escala = ["#C0392B", "#E67E22", "#D4AC0D", "#2E86C1", "#27AE60"];
  const dados = Object.entries(contagem)
    .map(([k, v]) => ({ regiao: k, atrasos: v }))
    .sort((a, b) => b.atrasos - a.atrasos)
    .map((d, i) => ({ ...d, cor: escala[Math.min(i, escala.length - 1)] }));

  const max = dados.length > 0 ? Math.max(...dados.map(d => d.atrasos), 1) : 1;
  renderBarChart("chart-regioes", dados, "regiao", "atrasos", max);
}

// ── Donut chart (SVG puro) ─────────────────────────────────────────────────────
function renderDonut() {
  const atrasadas = dadosFiltrados.filter(d => d.status_entrega === "Atrasado").length;
  const noPrazo = dadosFiltrados.filter(d => d.status_entrega === "No Prazo").length;
  const total = dadosFiltrados.length;

  const svg = document.getElementById("donut-chart");
  const legend = document.getElementById("donut-legend");
  svg.innerHTML = "";
  legend.innerHTML = "";

  if (total === 0) {
    svg.innerHTML = '<text x="80" y="85" text-anchor="middle" fill="#888" font-size="12">Sem dados</text>';
    return;
  }

  const cx = 80, cy = 80, r = 55, ri = 36;
  const segmentos = [
    { label: "Atrasadas", valor: atrasadas, cor: "#C0392B" },
    { label: "No Prazo",  valor: noPrazo,   cor: "#27AE60" },
  ];

  let anguloAtual = -Math.PI / 2;

  segmentos.forEach(seg => {
    if (seg.valor === 0) return;
    const angulo = (seg.valor / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(anguloAtual);
    const y1 = cy + r * Math.sin(anguloAtual);
    const x2 = cx + r * Math.cos(anguloAtual + angulo);
    const y2 = cy + r * Math.sin(anguloAtual + angulo);
    const xi1 = cx + ri * Math.cos(anguloAtual);
    const yi1 = cy + ri * Math.sin(anguloAtual);
    const xi2 = cx + ri * Math.cos(anguloAtual + angulo);
    const yi2 = cy + ri * Math.sin(anguloAtual + angulo);
    const large = angulo > Math.PI ? 1 : 0;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${large} 0 ${xi1} ${yi1} Z`);
    path.setAttribute("fill", seg.cor);
    path.setAttribute("stroke", "#fff");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
    anguloAtual += angulo;
  });

  // Texto central
  const pct = Math.round((atrasadas / total) * 100);
  const tPct = document.createElementNS("http://www.w3.org/2000/svg", "text");
  tPct.setAttribute("x", cx); tPct.setAttribute("y", cy - 4);
  tPct.setAttribute("text-anchor", "middle");
  tPct.setAttribute("font-size", "18");
  tPct.setAttribute("font-weight", "600");
  tPct.setAttribute("fill", "#C0392B");
  tPct.textContent = pct + "%";
  svg.appendChild(tPct);

  const tLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  tLabel.setAttribute("x", cx); tLabel.setAttribute("y", cx + 14);
  tLabel.setAttribute("text-anchor", "middle");
  tLabel.setAttribute("font-size", "10");
  tLabel.setAttribute("fill", "#666");
  tLabel.textContent = "de atraso";
  svg.appendChild(tLabel);

  // Legenda
  segmentos.forEach(seg => {
    const item = document.createElement("div");
    item.className = "donut-legend-item";
    item.innerHTML = `<span class="donut-dot" style="background:${seg.cor}"></span><span>${seg.label}: <strong>${seg.valor}</strong></span>`;
    legend.appendChild(item);
  });
}

// ── Gráfico de prioridades ─────────────────────────────────────────────────────
function renderGraficoPrioridades() {
  const container = document.getElementById("chart-prioridades");
  container.innerHTML = "";

  const ordem = ["Crítico", "Alto", "Médio", "Baixo", "Sem Atraso"];
  const contagem = {};
  dadosFiltrados.forEach(d => {
    contagem[d.prioridade] = (contagem[d.prioridade] || 0) + 1;
  });

  const total = dadosFiltrados.length || 1;

  ordem.forEach((p, i) => {
    const qtd = contagem[p] || 0;
    const pct = Math.round((qtd / total) * 100);
    const c = COR_PRIORIDADE[p];
    const delay = i * 70;

    const item = document.createElement("div");
    item.className = "priority-item";
    item.innerHTML = `
      <div class="priority-row">
        <span class="badge" style="background:${c.bg};color:${c.text};min-width:80px;text-align:center">${p}</span>
        <div class="priority-track">
          <div class="priority-bar" style="width:0%;background:${c.barra};transition-delay:${delay}ms" data-w="${pct}"></div>
        </div>
        <span class="priority-num">${qtd}</span>
      </div>
    `;
    container.appendChild(item);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        item.querySelector(".priority-bar").style.width = pct + "%";
      });
    });
  });
}

// ── Tabela ─────────────────────────────────────────────────────────────────────
function renderTabela() {
  const tbody = document.getElementById("tbody-entregas");
  const count = document.getElementById("table-count");
  tbody.innerHTML = "";

  // Ordenação
  const sorted = [...dadosFiltrados].sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  count.textContent = `Exibindo ${sorted.length} de ${DADOS.length} registros`;

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-msg">Nenhum registro encontrado com os filtros aplicados.</td></tr>';
    return;
  }

  sorted.forEach(d => {
    const c = COR_PRIORIDADE[d.prioridade];
    const tr = document.createElement("tr");
    tr.className = d.status_entrega === "Atrasado" ? "row-atrasado" : "";

    tr.innerHTML = `
      <td class="td-id"><strong>#${d.id_entrega}</strong></td>
      <td>${d.transportadora}</td>
      <td>${d.regiao}</td>
      <td class="td-center">${d.prazo_dias}</td>
      <td class="td-center">${d.dias_reais}</td>
      <td class="td-center ${d.dias_atraso > 0 ? "td-atraso" : "td-ok"}">
        ${d.dias_atraso > 0 ? "+" + d.dias_atraso : "—"}
      </td>
      <td>
        <span class="status-pill ${d.status_entrega === 'Atrasado' ? 'status-atrasado' : 'status-ok'}">
          ${d.status_entrega}
        </span>
      </td>
      <td>
        <span class="badge" style="background:${c.bg};color:${c.text}">
          ${d.prioridade}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Exportar CSV ───────────────────────────────────────────────────────────────
function exportarCSV() {
  const cabecalho = ["id_entrega", "transportadora", "regiao", "prazo_dias", "dias_reais", "dias_atraso", "status_entrega", "prioridade"];
  const linhas = dadosFiltrados.map(d =>
    cabecalho.map(col => `"${d[col]}"`).join(",")
  );
  const csv = [cabecalho.join(","), ...linhas].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dashboard-logistico.csv";
  a.click();
  URL.revokeObjectURL(url);
}
