# Dashboard Logístico — AMT01
## Visualização de Dados

### Como usar
1. Extraia o conteúdo do arquivo ZIP
2. Abra o arquivo `index.html` diretamente no navegador
3. Não é necessário instalar nada ou ter internet

### Arquivos
- `index.html` — estrutura do dashboard
- `style.css`  — estilos e tema visual
- `data.js`    — base de dados e cálculos (colunas calculadas)
- `app.js`     — lógica dos KPIs, gráficos, tabela e filtros

### Funcionalidades
- 5 KPIs: Total, Atrasadas, % Atraso, Média, Maior Atraso
- Gráfico de barras: atrasos por transportadora
- Gráfico de barras: atrasos por região
- Gráfico de rosca: distribuição no prazo vs atrasado
- Gráfico de prioridades: distribuição por nível
- Tabela completa com ordenação por qualquer coluna
- Formatação condicional por prioridade (Crítico/Alto/Médio/Baixo/Sem Atraso)
- Filtros por Região, Transportadora, Status e Prioridade
- Exportar para CSV

### Regra de negócio
Uma entrega é atrasada quando: dias_reais > prazo_dias

### Critérios de prioridade
| Prioridade | Atraso       | Cor     |
|------------|-------------|---------|
| Crítico    | ≥ 7 dias    | Vermelho|
| Alto       | 4 a 6 dias  | Laranja |
| Médio      | 2 a 3 dias  | Amarelo |
| Baixo      | 1 dia       | Azul    |
| Sem Atraso | 0 dias      | Verde   |
