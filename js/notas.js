/* ==========================================================
   Controle de Notas Fiscais — Prefeitura de Caraúbas
   Usa o MESMO projeto Firebase do Controle de Ordens (dashboard).
   Dados gravados no nó "notas" do Realtime Database.
   ========================================================== */

// Cole aqui o MESMO firebaseConfig que você usa em js/firebase.js (Controle de Ordens).
const firebaseConfig = {
  apiKey: "AIzaSyCcPaWVNmwzEHVE-XdsDBJCWHbTmUwwjjs",
  authDomain: "controle-de-ordens-5c752.firebaseapp.com",
  databaseURL: "https://controle-de-ordens-5c752-default-rtdb.firebaseio.com",
  projectId: "controle-de-ordens-5c752",
  storageBucket: "controle-de-ordens-5c752.firebasestorage.app",
  messagingSenderId: "337470475095",
  appId: "1:337470475095:web:e746ae3f73f83b7bdc8c12",
  measurementId: "G-W0VK6EYRY2"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
const auth = firebase.auth();

const SECRETARIAS = [
  "Administração", "Assistência Social", "Controladoria", "Cultura", "Educação",
  "Finanças", "Fundo de Assistência Social", "Governo", "Infraestrutura",
  "Planejamento", "Políticas do Campo", "Procuradoria", "Receita", "Saúde",
  "Secretaria da Mulher", "Transportes"
];

const PAGINA = 50;

let usuario = null;
let registros = [];
let editandoId = null;
let limite = PAGINA;
let leituraIniciada = false;
let erroLeitura = false;
let avisoTimer = null;

const $ = id => document.getElementById(id);

/* ---------- utilitários ---------- */

function esc(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function norm(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtData(iso) {
  if (!iso) return '—';
  const [a, m, d] = String(iso).split('-');
  return a && m && d ? `${d}/${m}/${a}` : iso;
}

function fmtCompetencia(c) {
  if (!c) return '';
  const [a, m] = String(c).split('-');
  return a && m ? `${m}/${a}` : c;
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function fmtValor(v) {
  return typeof v === 'number' ? moeda.format(v) : '—';
}

function fmtTimestamp(ts) {
  return typeof ts === 'number' ? new Date(ts).toLocaleString('pt-BR') : '';
}

function truncar(texto, max) {
  const t = String(texto ?? '');
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

// "1.234,56" -> 1234.56 | vazio -> null | inválido -> NaN
function parseValor(texto) {
  let s = String(texto ?? '').replace(/[R$\s]/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

function avisar(mensagem, tipo) {
  const el = $('aviso');
  el.textContent = mensagem;
  el.className = 'aviso show ' + (tipo || 'ok');
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => { el.className = 'aviso'; }, 4500);
}

function tratarErroEscrita(err) {
  console.error('Erro ao gravar nota:', err);
  if (err && err.code === 'PERMISSION_DENIED') {
    avisar('Sem permissão para gravar. O seu usuário precisa estar na lista de autorizados.', 'erro');
  } else {
    avisar('Não foi possível salvar. Verifique a conexão e tente novamente.', 'erro');
  }
}

/* ---------- login ---------- */

auth.onAuthStateChanged(user => {
  if (!user) {
    location.href = 'login.html';
    return;
  }

  usuario = user;

  if (!editandoId) $('entreguePor').value = user.email || '';

  iniciarLeitura();
});

function iniciarLeitura() {
  if (leituraIniciada) return;
  leituraIniciada = true;

  db.ref('notas').on('value', snap => {
    registros = [];
    snap.forEach(child => {
      registros.push({ id: child.key, ...child.val() });
    });

    registros.sort((a, b) =>
      (b.dataEntrega || '').localeCompare(a.dataEntrega || '') ||
      (b.registradoEm || 0) - (a.registradoEm || 0)
    );

    erroLeitura = false;
    render();
  }, err => {
    console.error('Erro ao carregar notas:', err);
    erroLeitura = true;
    render();
  });
}

/* ---------- formulário ---------- */

function preencherSecretarias() {
  const opcoes = SECRETARIAS.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  $('secretaria').insertAdjacentHTML('beforeend', opcoes);
  $('filtro-secretaria').insertAdjacentHTML('beforeend', opcoes);
}

function lerForm() {
  const v = id => $(id).value.trim();

  return {
    numeroNota: v('numeroNota'),
    fornecedor: v('fornecedor'),
    ordem: v('ordem'),
    protocolo: v('protocolo'),
    secretaria: $('secretaria').value,
    responsavel: v('responsavel'),
    dataEntrega: $('dataEntrega').value,
    dataRecebimento: $('dataRecebimento').value,
    competencia: v('competencia'),
    valor: parseValor($('valor').value),
    observacoes: v('observacoes')
  };
}

function resetForm() {
  $('form-nota').reset();
  editandoId = null;
  $('dataEntrega').value = hojeISO();
  $('entreguePor').value = usuario ? (usuario.email || '') : '';
  $('modo-edicao').hidden = true;
  $('btnCancelar').hidden = true;
  $('btnSalvar').textContent = 'Registrar entrega';
}

function existeDuplicada(d) {
  return registros.some(r =>
    norm(r.numeroNota) === norm(d.numeroNota) &&
    norm(r.fornecedor) === norm(d.fornecedor)
  );
}

function editar(id) {
  const r = registros.find(x => x.id === id);
  if (!r) return;

  editandoId = id;

  $('numeroNota').value = r.numeroNota || '';
  $('fornecedor').value = r.fornecedor || '';
  $('ordem').value = r.ordem || '';
  $('protocolo').value = r.protocolo || '';
  $('secretaria').value = r.secretaria || '';
  $('responsavel').value = r.responsavel || '';
  $('dataEntrega').value = r.dataEntrega || '';
  $('dataRecebimento').value = r.dataRecebimento || '';
  $('competencia').value = r.competencia || '';
  $('valor').value = typeof r.valor === 'number' ? r.valor.toFixed(2).replace('.', ',') : '';
  $('observacoes').value = r.observacoes || '';
  $('entreguePor').value = r.entreguePor || '';

  $('modo-edicao-texto').textContent = `Editando a nota #${r.numeroNota} de ${r.fornecedor}`;
  $('modo-edicao').hidden = false;
  $('btnCancelar').hidden = false;
  $('btnSalvar').textContent = 'Salvar alterações';

  $('form-nota').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('numeroNota').focus({ preventScroll: true });
}

function excluir(id) {
  const r = registros.find(x => x.id === id);
  if (!r) return;

  if (!confirm(`Excluir a nota #${r.numeroNota} de ${r.fornecedor}?\nEsta ação não pode ser desfeita.`)) return;

  db.ref('notas/' + id).remove()
    .then(() => {
      avisar('Registro excluído.', 'ok');
      if (editandoId === id) resetForm();
    })
    .catch(tratarErroEscrita);
}

$('form-nota').addEventListener('submit', ev => {
  ev.preventDefault();

  if (!usuario) {
    return avisar('Aguarde a verificação do login e tente novamente.', 'erro');
  }

  const dados = lerForm();

  if (Number.isNaN(dados.valor)) {
    avisar('Valor inválido. Use o formato 1.234,56.', 'erro');
    $('valor').focus();
    return;
  }

  const edicao = !!editandoId;
  let promessa;

  if (edicao) {
    promessa = db.ref('notas/' + editandoId).update({
      ...dados,
      editadoPor: usuario.email,
      editadoEm: firebase.database.ServerValue.TIMESTAMP
    });
  } else {
    if (existeDuplicada(dados) &&
        !confirm(`Já existe uma nota #${dados.numeroNota} registrada para ${dados.fornecedor}.\nRegistrar mesmo assim?`)) {
      return;
    }

    promessa = db.ref('notas').push({
      ...dados,
      entreguePor: usuario.email,
      entreguePorUid: usuario.uid,
      registradoEm: firebase.database.ServerValue.TIMESTAMP
    });
  }

  const botao = $('btnSalvar');
  botao.disabled = true;

  promessa
    .then(() => {
      avisar(edicao ? 'Alterações salvas.' : 'Entrega registrada.', 'ok');
      resetForm();
    })
    .catch(tratarErroEscrita)
    .finally(() => { botao.disabled = false; });
});

$('btnCancelar').addEventListener('click', resetForm);

/* ---------- lista, filtros e resumo ---------- */

function filtrados() {
  const busca = norm($('filtro-busca').value.trim());
  const sec = $('filtro-secretaria').value;
  const de = $('filtro-de').value;
  const ate = $('filtro-ate').value;

  return registros.filter(r => {
    if (sec && r.secretaria !== sec) return false;
    if (de && (!r.dataEntrega || r.dataEntrega < de)) return false;
    if (ate && (!r.dataEntrega || r.dataEntrega > ate)) return false;

    if (busca) {
      const texto = norm([
        r.numeroNota, r.fornecedor, r.ordem, r.protocolo, r.secretaria,
        r.responsavel, r.observacoes, r.entreguePor
      ].join(' '));
      if (!texto.includes(busca)) return false;
    }

    return true;
  });
}

function linha(r) {
  const recebida = r.dataRecebimento
    ? `<small>Recebida em ${esc(fmtData(r.dataRecebimento))}</small>` : '';
  const comp = r.competencia
    ? `<small>Competência ${esc(fmtCompetencia(r.competencia))}</small>` : '';
  const obs = r.observacoes
    ? `<small class="obs" title="${esc(r.observacoes)}">📝 ${esc(truncar(r.observacoes, 110))}</small>` : '';
  const editado = r.editadoPor
    ? `<small>Editado por ${esc(r.editadoPor)}</small>` : '';

  return `
    <tr>
      <td data-label="Nota"><div class="cell"><strong>#${esc(r.numeroNota)}</strong>${recebida}${comp}</div></td>
      <td data-label="Fornecedor"><div class="cell"><strong>${esc(r.fornecedor)}</strong><small>Ordem: ${esc(r.ordem)}</small>${obs}</div></td>
      <td data-label="Protocolo"><div class="cell">${esc(r.protocolo)}</div></td>
      <td data-label="Secretaria"><div class="cell"><span class="tag-sec">${esc(r.secretaria)}</span></div></td>
      <td data-label="Recebido por"><div class="cell">${esc(r.responsavel)}</div></td>
      <td data-label="Entrega"><div class="cell"><strong>${esc(fmtData(r.dataEntrega))}</strong><small>por ${esc(r.entreguePor || '—')}</small>${editado}</div></td>
      <td data-label="Valor"><div class="cell">${esc(fmtValor(r.valor))}</div></td>
      <td data-label="Ações"><div class="cell row-actions">
        <button type="button" class="icon-btn" data-acao="editar" data-id="${esc(r.id)}">Editar</button>
        <button type="button" class="icon-btn danger" data-acao="excluir" data-id="${esc(r.id)}">Excluir</button>
      </div></td>
    </tr>`;
}

function render() {
  const lista = filtrados();
  const mesAtual = hojeISO().slice(0, 7);
  const soma = lista.reduce((t, r) => t + (typeof r.valor === 'number' ? r.valor : 0), 0);
  const noMes = registros.filter(r => (r.dataEntrega || '').startsWith(mesAtual)).length;

  $('chip-total').textContent = `Registros: ${lista.length}`;
  $('chip-valor').textContent = `Valor: ${moeda.format(soma)}`;
  $('chip-mes').textContent = `Entregas no mês: ${noMes}`;

  const vazio = $('estado-vazio');
  const tabela = $('wrap-tabela');

  if (erroLeitura) {
    vazio.textContent = 'Não foi possível carregar as notas. Verifique a conexão e as permissões do Firebase.';
  } else if (!registros.length) {
    vazio.textContent = 'Nenhuma nota registrada ainda. Use o formulário acima para registrar a primeira entrega.';
  } else if (!lista.length) {
    vazio.textContent = 'Nenhum registro encontrado para os filtros aplicados.';
  } else {
    vazio.textContent = '';
  }

  vazio.hidden = !vazio.textContent;
  tabela.hidden = !lista.length;

  $('corpo').innerHTML = lista.slice(0, limite).map(linha).join('');

  const restantes = lista.length - limite;
  $('btn-mais').hidden = restantes <= 0;
  if (restantes > 0) $('btn-mais').textContent = `Mostrar mais (${restantes} restantes)`;
}

['filtro-busca', 'filtro-secretaria', 'filtro-de', 'filtro-ate'].forEach(id => {
  $(id).addEventListener(id === 'filtro-busca' ? 'input' : 'change', () => {
    limite = PAGINA;
    render();
  });
});

$('btn-limpar').addEventListener('click', () => {
  $('filtro-busca').value = '';
  $('filtro-secretaria').value = '';
  $('filtro-de').value = '';
  $('filtro-ate').value = '';
  limite = PAGINA;
  render();
});

$('btn-mais').addEventListener('click', () => {
  limite += PAGINA;
  render();
});

$('corpo').addEventListener('click', ev => {
  const botao = ev.target.closest('button[data-acao]');
  if (!botao) return;

  if (botao.dataset.acao === 'editar') editar(botao.dataset.id);
  if (botao.dataset.acao === 'excluir') excluir(botao.dataset.id);
});

/* ---------- exportação CSV (abre direto no Excel) ---------- */

function celulaCSV(valor) {
  let s = String(valor ?? '');
  // evita que o Excel interprete o texto como fórmula
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

$('btn-csv').addEventListener('click', () => {
  const lista = filtrados();

  if (!lista.length) {
    return avisar('Não há registros para exportar.', 'erro');
  }

  const cabecalho = [
    'Número da nota', 'Fornecedor', 'Ordem de compra/serviço', 'Protocolo', 'Secretaria',
    'Responsável pelo recebimento', 'Data de entrega', 'Data de recebimento', 'Competência',
    'Valor', 'Entregue por', 'Observações', 'Registrado em'
  ];

  const linhas = lista.map(r => [
    r.numeroNota, r.fornecedor, r.ordem, r.protocolo, r.secretaria,
    r.responsavel, fmtData(r.dataEntrega), r.dataRecebimento ? fmtData(r.dataRecebimento) : '',
    fmtCompetencia(r.competencia),
    typeof r.valor === 'number' ? r.valor.toFixed(2).replace('.', ',') : '',
    r.entreguePor, r.observacoes, fmtTimestamp(r.registradoEm)
  ].map(celulaCSV).join(';'));

  const csv = '﻿' + [cabecalho.map(celulaCSV).join(';'), ...linhas].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  link.href = URL.createObjectURL(blob);
  link.download = `notas-fiscais-${hojeISO()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

/* ---------- início ---------- */

preencherSecretarias();
$('dataEntrega').value = hojeISO();
render();
