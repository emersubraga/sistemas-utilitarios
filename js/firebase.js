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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
let currentUser = null;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
  } else {
    location.href = "login.html";
  }
});

// Escapa texto vindo do banco antes de colocá-lo em innerHTML.
function esc(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

window.criarOrdem = function () {
  const numero = document.getElementById('numero').value.trim();
  const fornecedor = document.getElementById('fornecedor').value.trim();
  const secretaria = document.getElementById('secretaria').value.trim();
  if (!currentUser) return alert("Aguarde a verificação do login e tente novamente.");
  if (!numero || !fornecedor || !secretaria) return alert("Preencha todos os campos.");

  const novaOrdem = {
    numero,
    fornecedor,
    secretaria,
    status: "aguardando",
    criadoPor: currentUser.email,
    ultimaAcao: `Criado por: ${currentUser.email}`
  };

  db.ref('ordens').push(novaOrdem);
  limparCampos();
}

function limparCampos() {
  document.getElementById('numero').value = '';
  document.getElementById('fornecedor').value = '';
  document.getElementById('secretaria').value = '';
}

function renderOrdem(id, ordem) {
  const coluna = document.getElementById(ordem.status);
  if (!coluna) return; // status desconhecido: ignora em vez de quebrar a lista

  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;
  card.dataset.id = id;
  card.ondragstart = drag;

  card.innerHTML = `
    <button class="remove-btn" title="Remover ordem" onclick="removerOrdem('${id}')">×</button>

    <span class="card-numero">#${esc(ordem.numero)}</span>
    <p class="card-desc">${esc(ordem.fornecedor)}</p>

    <div class="card-meta">
      <div class="meta-row">
        <b>Secretaria</b>
        <span class="tag-sec">${esc(ordem.secretaria)}</span>
      </div>
    </div>

    <div class="card-date">${esc(ordem.ultimaAcao || '')}</div>
  `;

  coluna.appendChild(card);
}

function drag(ev) {
  ev.dataTransfer.setData("id", ev.target.dataset.id);
}

window.drop = function (ev) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("id");
  const novoStatus = ev.target.closest('.column').id;
  if (!currentUser) return;

  db.ref('ordens/' + id).once('value').then(snapshot => {
    const ordem = snapshot.val();
    if (ordem && ordem.status !== novoStatus) {
      db.ref('ordens/' + id).update({
        status: novoStatus,
        ultimaAcao: `Movido por: ${currentUser.email}`
      });
    }
  });
}

window.allowDrop = function (ev) {
  ev.preventDefault();
}

window.removerOrdem = function (id) {
  if (!currentUser) return alert("Aguarde a verificação do login e tente novamente.");
  if (confirm("Deseja remover esta ordem?")) {
    db.ref('ordens/' + id).update({
      ultimaAcao: `Removido por: ${currentUser.email}`
    }).then(() => {
      setTimeout(() => db.ref('ordens/' + id).remove(), 300);
    });
  }
}

function limparColunas() {
  ['aguardando', 'empenhada', 'enviada'].forEach(id => {
    const coluna = document.getElementById(id);
    coluna.innerHTML = `<h3>${coluna.querySelector("h3").innerText}</h3>`;
  });
}

db.ref('ordens').on('value', snapshot => {
  limparColunas();

  const ordens = [];
  snapshot.forEach(child => {
    ordens.push({ id: child.key, ...child.val() });
  });

  // Ordena numericamente
  ordens.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

  ordens.forEach(ordem => {
    renderOrdem(ordem.id, ordem);
  });
});
