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
    compra: ['Recebimento de DFDs',
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
    'Elaboração de Relatório Geral de Cotação'],
    
    licitacao: ['Conferência de Documentação', 'Despachos - Edital', 'Cadastramento no Compras.gov', 'Envio ao jurídico', 'Elaboração do Edital', 'Acolhimento de Pareceres', 'Cadastramento no TopDown', 'Sessão Marcada/Publicação do Edital', 'Publicaçaõ do Aviso', 'Aguardando sessão...', 'Disputa', 'Negociação', 'Solicitação de Proposta', 'Habilitação', 'Envio ao jurídico', 'Homologação', 'Contratos']
  },

  Concorrência: {
    compra: ['Recebimento de DFDs',
    'Cadastro de Solicitações de Despesas (TopDown)'],
    
    licitacao: ['Conferência de Documentação', 'Despachos - Edital', 'Cadastramento no Compras.gov', 'Envio ao jurídico', 'Elaboração do Edital', 'Acolhimento de Pareceres', 'Cadastramento no TopDown', 'Sessão Marcada/Publicação do Edital', 'Publicaçaõ do Aviso', 'Aguardando sessão...', 'Disputa', 'Negociação', 'Solicitação de Proposta', 'Habilitação', 'Envio ao jurídico', 'Homologação', 'Contratos']
  },

  Dispensa: {
    compra: ['Recebimento de DFDs',
    'Cadastro de Solicitações de Despesas (TopDown)',
    'Pesquisa de Preços (Consolidação)',
    'Elaboração do ETP',
    'Pesquisa de Preços – ETP',
    'Elaboração do TR',
    'Realização de Pesquisa Mercadológica (Fornecedores)',
    'Solicitação de Documentação',
    'Envio do TR para publicação do Aviso de Contratação Direta',
    'Publicação do Aviso de Contratação Direta (prazo de 03 dias úteis a contar do dia posterior a publicação)',
    'Emissão de Certidão de Realização de Pesquisas de Preços',
    'Elaboração de Relatório Geral de Cotação'],
    
    licitacao: ['Publicado Avido de Contratação Direta', 'Enviado ao Setor de Compras para aguardar recebimento de propostas', 'Despacho AD/TR', 'Despacho de solicitação Orçamentária', 'Despacho de informações Orçamentária', 'Declaração de adequação Orçamentária', 'Despacho de Autorização', 'Termo de Atuação', 'Minutas', 'Envio do jurídico', 'Acolhimento de Pareceres', 'Termo de Autorizativo', 'Termo de Contrato', 'Publicação']
  },
  Inexigibilidade: {
    compra: ['Recebimento de DFD',
    'Cadastro de Solicitação de Despesas (TopDown)',
    'Conferência de Documentações (Apresentações Artísticas)',
    'Solicitação de Documentos (Apresentações Artísticas)',
    'Solicitação de Proposta de Preços',
    'Emissão de Certidão de Realização de Pesquisas de Preços'],

    licitacao: ['Justificativa', 'Ratificação']
  },
  Adesão: {
    compra: ['Recebimento de DFDs',
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
    'Elaboração de Relatório Geral de Cotação'],

    licitacao: ['Despacho AD/TR', 'Despacho de solicitação Orçamentária', 'Despacho de informações Orçamentária', 'Declaração de adequação Orçamentária', 'Envio de Memorandos de orientação para as Secretarias', 'Termo de Vantajosidade', 'Despacho de Autorização', 'Termo de Atuação', 'Minutas', 'Envio do jurídico', 'Acolhimento de Pareceres', 'Termo de Autorizativo', 'Termo de Contrato', 'Publicação']
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

function adicionarProcesso() {
  if (!usuarioLogado) return alert("Você precisa estar logado para adicionar.");

  const numero = document.getElementById('numero').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const tipo = document.getElementById('tipo').value.trim();
  const protocolo = document.getElementById('protocolo').value.trim();
  const secretarias = Array.from(document.querySelectorAll('#formulario input[type=checkbox]:checked'))
  .map(cb => cb.value);

  if (!descricao || !tipo || secretarias.length === 0)
    return alert("Preencha todos os campos e selecione pelo menos uma secretaria.");

  const etapaInicial = getEtapasPorTipo(tipo, 'compra')[0] || 'Início';
  const dfds = {};
  secretarias.forEach(sec => dfds[sec] = false);

  const novo = {
    numero, descricao, tipo, protocolo,
    status: "compra",
    etapa: etapaInicial,
    secretarias,
    dfds,
    log: [`${new Date().toLocaleString()} - ${etapaInicial}`]
  };

  db.ref('processos').push(novo);
  ['numero', 'descricao', 'tipo', 'protocolo'].forEach(id => document.getElementById(id).value = '');
  document.querySelectorAll('#formulario input[type=checkbox]').forEach(cb => cb.checked = false);
}


function renderProcesso(id, proc) {
  const filtro = document.getElementById('filtro').value.toLowerCase();
  const texto = (proc.numero + proc.descricao + proc.tipo).toLowerCase();
  if (filtro && !texto.includes(filtro)) return;

  const card = document.createElement('div');
  card.className = 'card';
  card.style.backgroundColor = getCardColor(proc.status);
  card.setAttribute('draggable', true);
  card.dataset.id = id;
  card.ondragstart = e => e.dataTransfer.setData('id', id);
  const ultimaAcao = proc.log?.slice(-1)[0] || '';

  card.innerHTML = `
    <button class="remove-btn" onclick="removerProcesso('${id}')">×</button>
    <strong>#${proc.numero}</strong><br>
    <em>${proc.tipo}</em><br>
    ${proc.descricao}<br>
    <div><small><b>Protocolo:</b> ${proc.protocolo}</small></div>
    <div><small><b>Etapa:</b> ${proc.etapa || ''}</small></div>
    <div class="log"><small>📅 ${ultimaAcao.split(' - ')[0]}</small></div>
    <button class="btn btn-sm btn-link" onclick="verLog('${id}')">Histórico</button>
    ${proc.status !== 'finalizado' ? `
      <button class="btn btn-sm btn-primary" onclick="abrirModalEtapa('${id}', '${proc.etapa || ''}', '${proc.status}')">Etapa</button>
    ` : ''}
    ${proc.etapa === 'Recebimento de DFDs' ? `
      <button class="btn btn-sm btn-primary mt-1" onclick="abrirModalDFD('${id}')">Receber DFDs</button>
    ` : ''}
    ${proc.etapa === 'Recebimento de DFDs' && proc.dfds ? (() => {
      const total = Object.keys(proc.dfds).length;
      const recebidos = Object.values(proc.dfds).filter(v => v).length;
      const pendentes = Object.entries(proc.dfds)
        .filter(([_, entregue]) => !entregue)
        .map(([sec]) => sec)
        .join(', ');

      return `
        <div><small><b>DFDs:</b> ${recebidos}/${total} recebidos</small></div>
        ${pendentes ? `<div><small><b>Pendentes:</b> ${pendentes}</small></div>` : ''}
      `;
    })() : ''}
    ${usuarioLogado ? `
      <button class="btn btn-sm btn-primary mt-1" onclick="abrirModalEdicao('${id}', '${proc.numero || ''}', '${proc.protocolo || ''}')">Editar Dados</button>
    ` : ''}
  `;
  document.getElementById(proc.status).appendChild(card);
}

function limparColunas() {
  ['compra', 'licitacao', 'finalizado'].forEach(id => {
    const col = document.getElementById(id);
    col.innerHTML = `<h3>${col.querySelector("h3").innerText}</h3>`;
  });
}

function verLog(id) {
  db.ref('processos/' + id).once('value').then(snap => {
    const logs = snap.val().log || [];
    document.getElementById('logConteudo').innerText = logs.join('\n');
    new bootstrap.Modal(document.getElementById('logModal')).show();
  });
}

function removerProcesso(id) {
  if (!usuarioLogado) return alert("Você precisa estar logado para remover.");

  if (confirm("Deseja excluir?")) {
    db.ref('processos/' + id).remove();
  }
}


function drop(ev) {
  if (!usuarioLogado) return;

  ev.preventDefault();
  const id = ev.dataTransfer.getData('id');
  const novoStatus = ev.target.closest('.column').id;

  db.ref('processos/' + id).once('value').then(snapshot => {
    const proc = snapshot.val();
    if (proc.status !== novoStatus) {
      const log = proc.log || [];

      if (novoStatus === 'licitacao') {
        log.push(`${new Date().toLocaleString()} - Enviado para Licitação`);
      } else {
        log.push(`${new Date().toLocaleString()} - Movido para '${novoStatus}'`);
      }

      const update = { status: novoStatus, log };

      if (novoStatus === 'finalizado') {
        update.etapa = 'Finalizado';
        log.push(`${new Date().toLocaleString()} - Etapa alterada para 'Finalizado'`);
      } else if (!getEtapasPorTipo(proc.tipo, novoStatus).includes(proc.etapa)) {
        update.etapa = getEtapasPorTipo(proc.tipo, novoStatus)[0] || '';
        log.push(`${new Date().toLocaleString()} - Etapa reiniciada para '${update.etapa}'`);
      }

      db.ref('processos/' + id).update(update);
    }
  });
}

function allowDrop(ev) {
  ev.preventDefault();
}

function filtrarProcessos() {
  limparColunas();
  processosCache.forEach(p => renderProcesso(p.id, p.data));
}

function abrirModalEtapa(id, etapaAtual, statusAtual) {
  processoSelecionado = id;
  db.ref('processos/' + id).once('value').then(snapshot => {
    const proc = snapshot.val();
    const etapas = getEtapasPorTipo(proc.tipo, statusAtual);
    const select = document.getElementById('etapaSelect');
    select.innerHTML = '';
    etapas.forEach(etapa => {
      const opt = document.createElement('option');
      opt.value = etapa;
      opt.textContent = etapa;
      if (etapa === etapaAtual) opt.selected = true;
      select.appendChild(opt);
    });
    new bootstrap.Modal(document.getElementById('etapaModal')).show();
  });
}

function salvarEtapa() {
  if (!usuarioLogado) return alert("Você precisa estar logado para alterar a etapa.");
  const novaEtapa = document.getElementById('etapaSelect').value;
  if (!processoSelecionado || !novaEtapa) return;

  db.ref('processos/' + processoSelecionado).once('value').then(snap => {
    const proc = snap.val();
    const log = proc.log || [];
    log.push(`${new Date().toLocaleString()} - Etapa alterada para '${novaEtapa}'`);
    db.ref('processos/' + processoSelecionado).update({
      etapa: novaEtapa,
      log
    });
    processoSelecionado = null;
    bootstrap.Modal.getInstance(document.getElementById('etapaModal')).hide();
  });
}

db.ref('processos').on('value', snap => {
  processosCache = [];
  limparColunas();
  snap.forEach(child => {
    processosCache.push({ id: child.key, data: child.val() });
  });
  filtrarProcessos();
});

function abrirModalDFD(id) {
  processoDFDAtual = id;
  const container = document.getElementById('dfdCheckboxes');
  container.innerHTML = '';

  db.ref('processos/' + id).once('value').then(snap => {
    const dados = snap.val();
    const dfds = dados.dfds || {};

    (dados.secretarias || []).forEach(sec => {
      const div = document.createElement('div');
      div.className = 'form-check';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'form-check-input';
      checkbox.id = 'chk_' + sec;
      checkbox.checked = dfds[sec] || false;

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = 'chk_' + sec;
      label.textContent = sec;

      div.appendChild(checkbox);
      div.appendChild(label);
      container.appendChild(div);
    });

    new bootstrap.Modal(document.getElementById('dfdModal')).show();
  });
}

function salvarDFDs() {
  if (!usuarioLogado) return alert("Você precisa estar logado para salvar.");
  if (!processoDFDAtual) return;

  db.ref('processos/' + processoDFDAtual).once('value').then(snap => {
    const dados = snap.val();
    const dfds = {};

    (dados.secretarias || []).forEach(sec => {
      const checked = document.getElementById('chk_' + sec)?.checked;
      dfds[sec] = !!checked;
    });

    db.ref('processos/' + processoDFDAtual + '/dfds').set(dfds).then(() => {
      bootstrap.Modal.getInstance(document.getElementById('dfdModal')).hide();
      processoDFDAtual = null;
    });
  });
}

let processoEdicaoAtual = null;

function abrirModalEdicao(id, numero, protocolo) {
  processoEdicaoAtual = id;
  document.getElementById('editNumero').value = numero || '';
  document.getElementById('editProtocolo').value = protocolo || '';
  new bootstrap.Modal(document.getElementById('modalEdicao')).show();
}

function salvarEdicao() {
  if (!usuarioLogado || !processoEdicaoAtual) return;

  const numero = document.getElementById('editNumero').value.trim();
  const protocolo = document.getElementById('editProtocolo').value.trim();

  db.ref('processos/' + processoEdicaoAtual).update({ numero, protocolo }).then(() => {
    bootstrap.Modal.getInstance(document.getElementById('modalEdicao')).hide();
    processoEdicaoAtual = null;
  });
}


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
