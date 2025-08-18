const firebaseConfig = {
  apiKey: "AIzaSyA7CMtNAmd4AJiCyho5O0JZSSNFhP1iM_U",
  authDomain: "controle-ordens-e461e.firebaseapp.com",
  databaseURL: "https://controle-ordens-e461e-default-rtdb.firebaseio.com",
  projectId: "controle-ordens-e461e",
  storageBucket: "controle-ordens-e461e.firebasestorage.app",
  messagingSenderId: "843214621145",
  appId: "1:843214621145:web:4d0f5748172b7ba242f1c8",
  measurementId: "G-S88RXTLRRL"
};

const secretariasFixas = [
  "Administração", "Educação", "Saúde", "Assistência Social", "Governo",
  "Controladoria", "Procuradoria", "Transportes", "Infraestrutura",
  "Políticas do Campo", "Receita", "Finanças", "Planejamento", "Cultura"
];
let processoDFDAtual = null;

// 🔹 Inicializa Firebase (compat)
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
let usuarioLogado = false;

auth.onAuthStateChanged(user => {
  usuarioLogado = !!user;
});

const db = firebase.database();

let processosCache = [];
let processoSelecionado = null;

const etapasPorTipoEStatus = {
  Pregão: {
    compra: [
      'Recebimento de DFDs',
      'Cadastro de Solicitações de Despesas (TopDown)',
      'Pesquisa de Preços (Consolidação)',
      'Elaboração do ETP',
      'Pesquisa de Preços – ETP',
      'Elaboração do TR',
      'Realização de Pesquisa Mercadológica (Banco de Preços)',
      'Realização de Pesquisa Mercadológica (Sites de Amplo Domínio)',
      'Realização de Pesquisa Mercadológica (Sites Especializados)',
      'Realização de Pesquisa Mercadológica (Fornecedores)',
      'Cadastro de Pesquisas Mercadológicas (TopDown)',
      'Emissão de Certidão de Realização de Pesquisas de Preços',
      'Elaboração de Relatório Geral de Cotação'
    ],
    licitacao: [
      'Conferência de Documentação', 'Despachos - Edital', 'Cadastramento no Compras.gov',
      'Envio ao jurídico', 'Elaboração do Edital', 'Acolhimento de Pareceres',
      'Cadastramento no TopDown', 'Sessão Marcada/Publicação do Edital', 'Publicaçaõ do Aviso',
      'Aguardando sessão...', 'Disputa', 'Negociação', 'Solicitação de Proposta', 'Habilitação',
      'Envio ao jurídico', 'Homologação', 'Contratos'
    ]
  },
  Concorrência: {
    compra: [
      'Recebimento de DFDs',
      'Cadastro de Solicitações de Despesas (TopDown)'
    ],
    licitacao: [
      'Conferência de Documentação', 'Despachos - Edital', 'Cadastramento no Compras.gov',
      'Envio ao jurídico', 'Elaboração do Edital', 'Acolhimento de Pareceres',
      'Cadastramento no TopDown', 'Sessão Marcada/Publicação do Edital', 'Publicaçaõ do Aviso',
      'Aguardando sessão...', 'Disputa', 'Negociação', 'Solicitação de Proposta', 'Habilitação',
      'Envio ao jurídico', 'Homologação', 'Contratos'
    ]
  },
  Dispensa: {
    compra: [
      'Recebimento de DFDs', 'Cadastro de Solicitações de Despesas (TopDown)',
      'Pesquisa de Preços (Consolidação)', 'Elaboração do ETP', 'Pesquisa de Preços – ETP',
      'Elaboração do TR', 'Realização de Pesquisa Mercadológica (Fornecedores)',
      'Solicitação de Documentação', 'Envio do TR para publicação do Aviso de Contratação Direta',
      'Publicação do Aviso de Contratação Direta (prazo de 03 dias úteis a contar do dia posterior a publicação)',
      'Emissão de Certidão de Realização de Pesquisas de Preços', 'Elaboração de Relatório Geral de Cotação'
    ],
    licitacao: [
      'Publicado Aviso de Contratação Direta', 'Enviado ao Setor de Compras para aguardar recebimento de propostas',
      'Despacho AD/TR', 'Despacho de solicitação Orçamentária', 'Despacho de informações Orçamentária',
      'Declaração de adequação Orçamentária', 'Despacho de Autorização', 'Termo de Atuação',
      'Minutas', 'Envio do jurídico', 'Acolhimento de Pareceres', 'Termo de Autorizativo',
      'Termo de Contrato', 'Publicação'
    ]
  },
  Inexigibilidade: {
    compra: [
      'Recebimento de DFD', 'Cadastro de Solicitação de Despesas (TopDown)',
      'Conferência de Documentações (Apresentações Artísticas)', 'Solicitação de Documentos (Apresentações Artísticas)',
      'Solicitação de Proposta de Preços', 'Emissão de Certidão de Realização de Pesquisas de Preços'
    ],
    licitacao: [
      'Despacho AD/TR', 'Despacho de solicitação Orçamentária', 'Despacho de informações Orçamentária',
      'Declaração de adequação Orçamentária', 'Despacho de Autorização', 'Termo de Atuação',
      'Minutas', 'Envio do jurídico', 'Acolhimento de Pareceres', 'Termo de Autorizativo',
      'Termo de Contrato', 'Publicação'
    ]
  },
  Adesão: {
    compra: [
      'Recebimento de DFDs', 'Cadastro de Solicitações de Despesas (TopDown)',
      'Pesquisa de Preços (Consolidação)', 'Elaboração do ETP', 'Pesquisa de Preços – ETP',
      'Elaboração do TR', 'Realização de Pesquisa Mercadológica (Banco de Preços)',
      'Realização de Pesquisa Mercadológica (Sites de Amplo Domínio)',
      'Realização de Pesquisa Mercadológica (Sites Especializados)',
      'Realização de Pesquisa Mercadológica (Fornecedores)',
      'Cadastro de Pesquisas Mercadológicas (TopDown)',
      'Emissão de Certidão de Realização de Pesquisas de Preços',
      'Elaboração de Relatório Geral de Cotação'
    ],
    licitacao: [
      'Despacho AD/TR', 'Despacho de solicitação Orçamentária', 'Despacho de informações Orçamentária',
      'Declaração de adequação Orçamentária', 'Envio de Memorandos de orientação para as Secretarias',
      'Termo de Vantajosidade', 'Despacho de Autorização', 'Termo de Atuação', 'Minutas',
      'Envio do jurídico', 'Acolhimento de Pareceres', 'Termo de Autorizativo', 'Termo de Contrato', 'Publicação'
    ]
  }
};

function getEtapasPorTipo(tipo, status) {
  const tipoKey = tipo?.trim()?.toLowerCase();
  for (const chave in etapasPorTipoEStatus) {
    if (chave.toLowerCase() === tipoKey) {
      return etapasPorTipoEStatus[chave][status] || [];
    }
  }
  return [];
}

function getCardColor(status) {
  switch (status) {
    case 'compra': return '#8d8d8dff';
    case 'licitacao': return '#ebe97bff';
    case 'finalizado': return '#7feb7bff';
    default: return '#ccc';
  }
}

// 🔹 ... (todo o resto do seu código permanece igual)

window.salvarEtapa = salvarEtapa;
window.abrirModalEtapa = abrirModalEtapa;
window.adicionarProcesso = adicionarProcesso;
window.filtrarProcessos = filtrarProcessos;
window.drop = drop;
window.allowDrop = allowDrop;
window.abrirModalDFD = abrirModalDFD;
window.salvarDFDs = salvarDFDs;
window.verLog = verLog;
window.removerProcesso = removerProcesso;
window.abrirModalEdicao = abrirModalEdicao;
window.salvarEdicao = salvarEdicao;