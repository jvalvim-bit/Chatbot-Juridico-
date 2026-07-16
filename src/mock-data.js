export const dashboardFixture = Object.freeze({
  generatedAt: "2026-07-16T12:00:00.000Z",
  notice: "Ambiente demonstrativo — todos os dados desta tela são fictícios.",
  metrics: [
    { label: "Atendimentos hoje", value: 18, trend: "+12%", tone: "gold" },
    { label: "Em triagem", value: 6, trend: "3 prioritários", tone: "blue" },
    { label: "Agendamentos", value: 4, trend: "próximas 24h", tone: "green" },
    { label: "Tempo médio", value: "1m 42s", trend: "-18s", tone: "purple" },
  ],
  queue: [
    {
      id: "ATD-DEMO-001",
      client: "Cliente Exemplo A",
      subject: "Direito previdenciário",
      stage: "Triagem concluída",
      updated: "há 2 min",
      priority: "alta",
    },
    {
      id: "ATD-DEMO-002",
      client: "Cliente Exemplo B",
      subject: "Direito do consumidor",
      stage: "Aguardando relato",
      updated: "há 7 min",
      priority: "normal",
    },
    {
      id: "ATD-DEMO-003",
      client: "Cliente Exemplo C",
      subject: "Agendamento",
      stage: "Horário sugerido",
      updated: "há 11 min",
      priority: "normal",
    },
  ],
  activity: [
    { time: "14:32", text: "Triagem encaminhada para revisão humana." },
    { time: "14:18", text: "Novo horário fictício sugerido pelo fluxo." },
    {
      time: "13:54",
      text: "Documento apenas mencionado; upload não iniciado.",
    },
  ],
});
