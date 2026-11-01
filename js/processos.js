
const secretariasFixas = [
  "Administração", "Educação", "Saúde", "Assistência Social", "Governo",
  "Controladoria", "Procuradoria", "Transportes", "Infraestrutura",
  "Políticas do Campo", "Receita", "Finanças", "Planejamento", "Cultura",
  "Secretaria da Mulher", "Fundo de Assistência Social"
];

let processoDFDAtual = null;

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
let usuarioLogado = false;

auth.onAuthStateChanged(user => {
  usuarioLogado = !!user;

  // Redesenha os cards: o botão "Editar" só aparece para quem está logado, e o
  // login pode ser restaurado depois de os dados já terem sido desenhados.
  if (typeof filtrarProcessos === 'function') filtrarProcessos();
});

const db = firebase.database();

let processosCache = [];
let processoSelecionado = null;

const etapasPorTipoEStatus = {
  Pregão: {
    compra: [
      'Recebimento de Solicitações',
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
      'Conferência de Documentação',
      'Despachos - Edital',
      'Cadastramento no Compras.gov',
      'Envio ao jurídico',
      'Elaboração do Edital',
      'Acolhimento de Pareceres',
      'Cadastramento no TopDown',
      'Sessão Marcada/Publicação do Edital',
      'Publicação do Aviso',
      'Aguardando sessão...',
      'Disputa',
      'Negociação',
      'Solicitação de Proposta',
      'Habilitação',
      'Envio ao jurídico',
      'Homologação',
      'Contratos',
      'Em prazo de recursos',
      'Aguardando parecer contábil',
      'Prazo de amostras',
      'Aguardando parecer da Engenharia'
    ]
  },

  Concorrência: {
    compra: [
      'Recebimento de Solicitações',
      'Cadastro de Solicitações de Despesas (TopDown)'
    ],
    licitacao: [
      'Conferência de Documentação',
      'Despachos - Edital',
      'Cadastramento no Compras.gov',
      'Envio ao jurídico',
      'Elaboração do Edital',
      'Acolhimento de Pareceres',
      'Cadastramento no TopDown',
      'Sessão Marcada/Publicação do Edital',
      'Publicaçaõ do Aviso',
      'Aguardando sessão...',
      'Disputa',
      'Negociação',
      'Solicitação de Proposta',
      'Habilitação',
      'Envio ao jurídico',
      'Homologação',
      'Contratos',
      'Em prazo de recursos',
      'Aguardando parecer contábil',
      'Prazo de amostras',
      'Aguardando parecer da Engenharia'
    ]
  },

  Dispensa: {
    compra: [
      'Recebimento de Solicitações',
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
      'Elaboração de Relatório Geral de Cotação'
    ],
    licitacao: [
      'Publicado Aviso de Contratação Direta',
      'Enviado ao Setor de Compras para aguardar recebimento de propostas',
      'Despacho AD/TR',
      'Despacho de solicitação Orçamentária',
      'Despacho de informações Orçamentária',
      'Declaração de adequação Orçamentária',
      'Despacho de Autorização',
      'Termo de Atuação',
      'Minutas',
      'Envio do jurídico',
      'Acolhimento de Pareceres',
      'Termo de Autorizativo',
      'Termo de Contrato',
      'Publicação'
    ]
  },

  Inexigibilidade: {
    compra: [
      'Recebimento de DFD',
      'Cadastro de Solicitação de Despesas (TopDown)',
      'Conferência de Documentações (Apresentações Artísticas)',
      'Solicitação de Documentos (Apresentações Artísticas)',
      'Solicitação de Proposta de Preços',
      'Emissão de Certidão de Realização de Pesquisas de Preços'
    ],
    licitacao: [
      'Despacho AD/TR',
      'Despacho de solicitação Orçamentária',
      'Despacho de informações Orçamentária',
      'Declaração de adequação Orçamentária',
      'Despacho de Autorização',
      'Termo de Atuação',
      'Minutas',
      'Envio do jurídico',
      'Acolhimento de Pareceres',
      'Termo de Autorizativo',
      'Termo de Contrato',
      'Publicação',
      'Em prazo de recursos',
      'Aguardando parecer contábil',
      'Prazo de amostras',
      'Aguardando parecer da Engenharia'
    ]
  },

  Adesão: {
    compra: [
      'Recebimento de Solicitações',
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
      'Despacho AD/TR',
      'Despacho de solicitação Orçamentária',
      'Despacho de informações Orçamentária',
      'Declaração de adequação Orçamentária',
      'Envio de Memorandos de orientação para as Secretarias',
      'Termo de Vantajosidade',
      'Despacho de Autorização',
      'Termo de Atuação',
      'Minutas',
      'Envio do jurídico',
      'Acolhimento de Pareceres',
      'Termo de Autorizativo',
      'Termo de Contrato',
      'Publicação',
      'Em prazo de recursos',
      'Aguardando parecer contábil',
      'Prazo de amostras',
      'Aguardando parecer da Engenharia'
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

// A cor dos cards agora vem do CSS (faixa lateral na cor da coluna).
// Mantida apenas por compatibilidade, caso algum outro script a utilize.
function getCardColor(status) {
  switch (status) {
    case 'compra': return '#f36b2a';
    case 'licitacao': return '#7446e8';
    case 'finalizado': return '#169c50';
    default: return '#ccc';
  }
}

// Escapa texto vindo do banco antes de colocá-lo em innerHTML.
function esc(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function adicionarProcesso() {
  if (!usuarioLogado) {
    return alert("Você precisa estar logado para adicionar.");
  }

  const numero = document.getElementById('numero').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const tipo = document.getElementById('tipo').value.trim();
  const protocolo = document.getElementById('protocolo').value.trim();

  const secretarias = Array.from(
    document.querySelectorAll('#formulario input[type=checkbox]:checked')
  ).map(cb => cb.value);

  if (!descricao || !tipo || secretarias.length === 0) {
    return alert(
      "Preencha todos os campos e selecione pelo menos uma secretaria."
    );
  }

  const etapaInicial = getEtapasPorTipo(tipo, 'compra')[0] || 'Início';
  const dfds = {};

  secretarias.forEach(sec => {
    dfds[sec] = false;
  });

  const novo = {
    numero,
    descricao,
    tipo,
    protocolo,
    status: "compra",
    etapa: etapaInicial,
    secretarias,
    dfds,
    prazoEntrega: "",
    dataSessao: "",
    log: [`${new Date().toLocaleString()} - ${etapaInicial}`]
  };

  db.ref('processos').push(novo);

  ['numero', 'descricao', 'tipo', 'protocolo'].forEach(id => {
    document.getElementById(id).value = '';
  });

  document.querySelectorAll('#formulario input[type=checkbox]').forEach(cb => {
    cb.checked = false;
  });
}

function renderProcesso(id, proc) {
  const filtro = document.getElementById('filtro').value.toLowerCase();
  const texto = (proc.numero + proc.descricao + proc.tipo).toLowerCase();

  if (filtro && !texto.includes(filtro)) return;

  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('draggable', true);
  card.dataset.id = id;
  card.ondragstart = e => e.dataTransfer.setData('id', id);

  const ultimaAcao = proc.log?.slice(-1)[0] || '';

  const qtdComentarios = Object.keys(proc.comentarios || {}).length;

  card.innerHTML = `
    <button class="remove-btn" title="Excluir processo" onclick="removerProcesso('${id}')">×</button>

    <div class="card-top">
      <span class="tipo-badge">${esc(proc.tipo)}</span>
      <span class="card-numero">#${esc(proc.numero)}</span>
    </div>

    <p class="card-desc">${esc(proc.descricao)}</p>

    <div class="card-meta">
      <div class="meta-row"><b>Protocolo</b><span>${esc(proc.protocolo) || '—'}</span></div>
      <div class="etapa-pill">${esc(proc.etapa || 'Sem etapa')}</div>

      ${proc.etapa === "Recebimento de Solicitações" ? `
        <div class="meta-row">
          <b>Prazo de entrega</b>
          <span>${
            proc.prazoEntrega
              ? esc(proc.prazoEntrega.split("-").reverse().join("/"))
              : "Não informado"
          }</span>
        </div>
      ` : ""}

      ${proc.etapa === "Aguardando sessão..." ? `
        <div class="meta-row">
          <b>Data da sessão</b>
          <span>${
            proc.dataSessao
              ? esc(new Date(proc.dataSessao).toLocaleString("pt-BR"))
              : "Não informada"
          }</span>
        </div>
      ` : ""}

      ${proc.etapa === 'Recebimento de Solicitações' && proc.dfds ? (() => {
        const total = Object.keys(proc.dfds).length;
        const recebidos = Object.values(proc.dfds).filter(v => v).length;
        const pendentes = Object.entries(proc.dfds)
          .filter(([_, entregue]) => !entregue)
          .map(([sec]) => esc(sec))
          .join(', ');

        return `
          <div class="meta-row"><b>Solicitações</b><span>${recebidos}/${total} recebidas</span></div>
          ${pendentes ? `<div class="meta-pendentes"><b>Pendentes:</b> ${pendentes}</div>` : ''}
        `;
      })() : ''}
    </div>

    <div class="card-date">📅 ${esc(ultimaAcao.split(' - ')[0])}</div>

    <div class="card-actions">
      ${proc.status !== 'finalizado' ? `
        <button class="btn btn-sm btn-primary"
                onclick="abrirModalEtapa('${id}', '${esc(proc.etapa || '')}', '${proc.status}')">
          Etapa
        </button>
      ` : ''}

      ${proc.etapa === 'Recebimento de Solicitações' ? `
        <button class="btn btn-sm btn-primary" onclick="abrirModalDFD('${id}')">
          Receber Solicitações
        </button>
      ` : ''}

      <button class="btn btn-sm btn-outline-primary" onclick="verLog('${id}')">
        Histórico
      </button>

      ${usuarioLogado ? `
        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEdicao('${id}')">
          Editar
        </button>
      ` : ''}
    </div>

    <button class="btn btn-sm btn-comentarios" onclick="abrirComentarios('${id}')">
      💬 Comentários (${qtdComentarios})
    </button>
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
    const logs = snap.val().log || '';
    document.getElementById('logConteudo').innerText = logs.join('\n');
    new bootstrap.Modal(document.getElementById('logModal')).show();
  });
}

function removerProcesso(id) {
  if (!usuarioLogado) {
    return alert("Você precisa estar logado para remover.");
  }

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
        log.push(
          `${new Date().toLocaleString()} - Etapa alterada para 'Finalizado'`
        );
      } else if (!getEtapasPorTipo(proc.tipo, novoStatus).includes(proc.etapa)) {
        update.etapa = getEtapasPorTipo(proc.tipo, novoStatus)[0] || '';
        log.push(
          `${new Date().toLocaleString()} - Etapa reiniciada para '${update.etapa}'`
        );
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

    select.onchange = atualizarCamposExtras;
    atualizarCamposExtras();

    function atualizarCamposExtras() {
      const etapa = select.value;

      document.getElementById("campoPrazo").style.display =
        etapa === "Recebimento de Solicitações" ? "block" : "none";

      document.getElementById("campoSessao").style.display =
        etapa === "Aguardando sessão..." ? "block" : "none";

      document.getElementById("prazoEntrega").value =
        proc.prazoEntrega || "";

      document.getElementById("dataSessao").value =
        proc.dataSessao || "";
    }
  });
}

function salvarEtapa() {
  if (!usuarioLogado) {
    return alert("Você precisa estar logado para alterar a etapa.");
  }

  const novaEtapa = document.getElementById('etapaSelect').value;

  if (!processoSelecionado || !novaEtapa) return;

  db.ref('processos/' + processoSelecionado).once('value').then(snap => {
    const proc = snap.val();
    const log = proc.log || [];

    log.push(
      `${new Date().toLocaleString()} - Etapa alterada para '${novaEtapa}'`
    );

    const update = {
      etapa: novaEtapa,
      log
    };

    if (novaEtapa === "Recebimento de Solicitações") {
      update.prazoEntrega =
        document.getElementById("prazoEntrega").value;
    }

    if (novaEtapa === "Aguardando sessão...") {
      update.dataSessao = document.getElementById("dataSessao").value;
    } else {
      update.dataSessao = "";
    }

    db.ref('processos/' + processoSelecionado)
      .update(update)
      .then(() => {
        processoSelecionado = null;
        bootstrap.Modal.getInstance(
          document.getElementById('etapaModal')
        ).hide();
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao salvar a etapa.");
      });
  });
}

db.ref('processos').on('value', snap => {
  processosCache = [];
  limparColunas();

  snap.forEach(child => {
    processosCache.push({
      id: child.key,
      data: child.val()
    });
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
  if (!usuarioLogado) {
    return alert("Você precisa estar logado para salvar.");
  }

  if (!processoDFDAtual) return;

  db.ref('processos/' + processoDFDAtual).once('value').then(snap => {
    const dados = snap.val();
    const dfds = {};

    (dados.secretarias || []).forEach(sec => {
      const checked = document.getElementById('chk_' + sec)?.checked;
      dfds[sec] = !!checked;
    });

    db.ref('processos/' + processoDFDAtual + '/dfds').set(dfds).then(() => {
      bootstrap.Modal.getInstance(
        document.getElementById('dfdModal')
      ).hide();

      processoDFDAtual = null;
    });
  });
}

let processoEdicaoAtual = null;

function abrirModalEdicao(id, numero, protocolo) {
  processoEdicaoAtual = id;

  // Se número/protocolo não vierem como argumento, busca no cache.
  if (numero === undefined || protocolo === undefined) {
    const dados = processosCache.find(item => item.id === id)?.data || {};
    numero = dados.numero;
    protocolo = dados.protocolo;
  }

  document.getElementById('editNumero').value = numero || '';
  document.getElementById('editProtocolo').value = protocolo || '';

  new bootstrap.Modal(
    document.getElementById('modalEdicao')
  ).show();
}

function salvarEdicao() {
  if (!usuarioLogado || !processoEdicaoAtual) return;

  const numero = document.getElementById('editNumero').value.trim();
  const protocolo = document.getElementById('editProtocolo').value.trim();

  db.ref('processos/' + processoEdicaoAtual)
    .update({ numero, protocolo })
    .then(() => {
      bootstrap.Modal.getInstance(
        document.getElementById('modalEdicao')
      ).hide();

      processoEdicaoAtual = null;
    });
}



// ==================== Comentários por processo ====================

let processoComentariosAtual = null;
let comentariosListenerRef = null;

function nomeUsuarioAtual(user) {
  if (!user) return 'Usuário não identificado';

  // Prioriza o e-mail do usuário autenticado.
  return user.email || user.displayName || 'Usuário autenticado';
}

function formatarDataComentario(valor) {
  if (!valor) return 'Data não disponível';

  const data = new Date(valor);

  return Number.isNaN(data.getTime())
    ? 'Data não disponível'
    : data.toLocaleString('pt-BR');
}

function abrirComentarios(id) {
  const user = auth.currentUser;

  processoComentariosAtual = id;

  const processo = processosCache.find(
    item => item.id === id
  )?.data;

  const titulo = processo
    ? `Processo #${processo.numero || 'sem número'} — ${processo.descricao || ''}`
    : `Processo ${id}`;

  document.getElementById('comentariosProcessoTitulo').textContent = titulo;
  document.getElementById('novoComentario').value = '';
  document.getElementById('novoComentario').disabled = !user;
  document.getElementById('btnEnviarComentario').disabled = !user;

  if (!user) {
    document.getElementById('listaComentarios').textContent =
      'Faça login para adicionar comentários. Os comentários existentes continuam disponíveis para leitura.';
  }

  // Evita manter um listener aberto para outro processo.
  if (comentariosListenerRef) {
    comentariosListenerRef.off();
    comentariosListenerRef = null;
  }

  comentariosListenerRef = db.ref(
    'processos/' + id + '/comentarios'
  );

  comentariosListenerRef.on('value', snapshot => {
    renderizarComentarios(
      snapshot.val() || {},
      !!auth.currentUser
    );
  }, error => {
    console.error('Erro ao carregar comentários:', error);

    document.getElementById('listaComentarios').textContent =
      'Não foi possível carregar os comentários. Verifique as permissões do Firebase.';
  });

  const modalEl = document.getElementById('comentariosModal');

  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function renderizarComentarios(comentarios, podeAlterar) {
  const container = document.getElementById('listaComentarios');

  container.replaceChildren();

  const itens = Object.entries(comentarios)
    .sort((a, b) => (b[1]?.criadoEm || 0) - (a[1]?.criadoEm || 0));

  if (!itens.length) {
    const vazio = document.createElement('p');

    vazio.className = 'text-muted';
    vazio.textContent = 'Ainda não há comentários neste processo.';

    container.appendChild(vazio);
    return;
  }

  itens.forEach(([comentarioId, comentario]) => {
    const resolvido = comentario.resolvido === true;

    const card = document.createElement('div');
    card.className = 'border rounded p-3 mb-2';
    card.style.backgroundColor = resolvido ? '#f0fff4' : '#fff';

    const topo = document.createElement('div');

    topo.className =
      'd-flex flex-wrap justify-content-between align-items-start gap-2 mb-2';

    const autor = document.createElement('div');

    const nome = document.createElement('strong');
    nome.textContent =
      comentario.autorNome || 'Usuário não identificado';

    const data = document.createElement('div');
    data.className = 'small text-muted';
    data.textContent = formatarDataComentario(comentario.criadoEm);

    autor.append(nome, data);

    const status = document.createElement('span');
    status.className = resolvido
      ? 'badge bg-success'
      : 'badge bg-warning text-dark';

    status.textContent = resolvido ? 'Resolvido' : 'Pendente';

    topo.append(autor, status);

    const texto = document.createElement('p');
    texto.className = 'mb-2';
    texto.style.whiteSpace = 'pre-wrap';
    texto.textContent = comentario.texto || '';

    card.append(topo, texto);

    // Exibe quem resolveu e quando isso aconteceu.
    if (resolvido) {
      const resolucao = document.createElement('div');

      resolucao.className = 'small text-muted mb-2';

      resolucao.textContent =
        `Resolvido por ${comentario.resolvidoPor || 'usuário não identificado'} em ${formatarDataComentario(comentario.resolvidoEm)}`;

      card.appendChild(resolucao);
    }

    // Usuários autenticados podem alterar o status.
    if (podeAlterar) {
      const acoes = document.createElement('div');
      acoes.className = 'text-end';

      const botao = document.createElement('button');
      botao.type = 'button';

      botao.className = resolvido
        ? 'btn btn-sm btn-outline-secondary'
        : 'btn btn-sm btn-success';

      botao.textContent = resolvido
        ? 'Reabrir pendência'
        : 'Marcar como resolvido';

      botao.addEventListener('click', () => {
        alterarStatusComentario(comentarioId, !resolvido);
      });

      acoes.appendChild(botao);
      card.appendChild(acoes);
    }

    container.appendChild(card);
  });
}

function enviarComentario(event) {
  event.preventDefault();

  const user = auth.currentUser;

  if (!user) {
    return alert('Você precisa estar logado para comentar.');
  }

  if (!processoComentariosAtual) return;

  const campo = document.getElementById('novoComentario');
  const texto = campo.value.trim();

  if (!texto) {
    return alert('Digite um comentário antes de enviar.');
  }

  const novoComentario = {
    texto,
    autorUid: user.uid,
    autorNome: nomeUsuarioAtual(user),
    criadoEm: firebase.database.ServerValue.TIMESTAMP,
    resolvido: false,
    resolvidoPor: '',
    resolvidoEm: null
  };

  const botao = document.getElementById('btnEnviarComentario');
  botao.disabled = true;

  db.ref(
    'processos/' + processoComentariosAtual + '/comentarios'
  ).push(novoComentario)
    .then(() => {
      campo.value = '';
    })
    .catch(error => {
      console.error('Erro ao salvar comentário:', error);

      alert(
        'Não foi possível salvar o comentário. Verifique as regras de acesso do Firebase.'
      );
    })
    .finally(() => {
      botao.disabled = !auth.currentUser;
    });
}

function alterarStatusComentario(comentarioId, resolvido) {
  const user = auth.currentUser;

  if (!user || !processoComentariosAtual) {
    return alert(
      'Você precisa estar logado para alterar o status.'
    );
  }

  const dados = {
    resolvido,
    resolvidoPor: resolvido ? nomeUsuarioAtual(user) : '',
    resolvidoPorUid: resolvido ? user.uid : '',
    resolvidoEm: resolvido
      ? firebase.database.ServerValue.TIMESTAMP
      : null
  };

  db.ref(
    `processos/${processoComentariosAtual}/comentarios/${comentarioId}`
  ).update(dados)
    .catch(error => {
      console.error('Erro ao atualizar comentário:', error);

      alert(
        'Não foi possível atualizar o status. Verifique as regras de acesso do Firebase.'
      );
    });
}

// Eventos do formulário e fechamento do modal.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formComentario');

  if (form) {
    form.addEventListener('submit', enviarComentario);
  }

  const modal = document.getElementById('comentariosModal');

  if (modal) {
    modal.addEventListener('hidden.bs.modal', () => {
      if (comentariosListenerRef) {
        comentariosListenerRef.off();
        comentariosListenerRef = null;
      }

      processoComentariosAtual = null;
    });
  }
});

window.abrirComentarios = abrirComentarios;


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

db.ref('processos').once('value').then(snap => {
  console.log("DEBUG - Processos carregados:", snap.val());
});
