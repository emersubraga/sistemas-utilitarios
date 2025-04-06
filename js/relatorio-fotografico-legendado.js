// Função para adicionar novos campos de imagem e legenda dinamicamente
function adicionarImagem() {
    const container = document.getElementById('imagens-container');

    const group = document.createElement('div');
    group.className = 'input-row';

    const inputImagem = document.createElement('input');
    inputImagem.type = 'file';
    inputImagem.name = 'imagem[]';
    inputImagem.accept = 'image/png, image/jpeg';
    inputImagem.required = true;

    const textareaLegenda = document.createElement('textarea');
    textareaLegenda.name = 'legenda[]';
    textareaLegenda.rows = 1;
    textareaLegenda.placeholder = 'Digite a legenda da imagem...';
    textareaLegenda.required = true;

    group.appendChild(inputImagem);
    group.appendChild(textareaLegenda);

    container.appendChild(group);
}

document.getElementById("form").addEventListener("submit", function(event) {
    event.preventDefault();

    const empresa = document.getElementById("empresa").value;
    const ordem = document.getElementById("ordem").value;
    const nota = document.getElementById("nota").value;
    const data = document.getElementById("data").value;
    const modelo = document.getElementById("modelo").value;

    const inputsImagem = document.querySelectorAll('input[name="imagem[]"]');
    const textareasLegenda = document.querySelectorAll('textarea[name="legenda[]"]');

    const imagens = Array.from(inputsImagem).map(input => input.files[0]);
    const legendas = Array.from(textareasLegenda).map(textarea => textarea.value);

    gerarPaginaHTML(empresa, ordem, nota, data, modelo, imagens, legendas);
});

function gerarPaginaHTML(empresa, ordem, nota, data, modelo, imagens, legendas) {
    let conteudoHTML = `
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .center {
                    text-align: center;
                    font-weight: bold;
                }
                .spaced {
                    margin-top: 0px;
                }
                header{
                    margin-bottom: 5px;
                    border-bottom: 2px solid #000000;
                }
                header img{
                     margin-bottom: 10px;
                }
                header p {
                    margin-top: -5px;
                    margin-bottom: 5px;
                }

                main p {
                    margin-top: 5px;
                    margin-bottom: 5px;
                }
                .image-container { 
                    display: flex;
                    flex-wrap: wrap; 
                    justify-content: center;
                    gap: 10px; 
                }
                .image-container img {
                    max-width: 100%;
                    height: auto;
                    max-height: 400px; 
                }
                .page-break {
                    page-break-before: always;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
           <header class="center">
                <img src="img/brasão.png" width="50" height="50">
                <p class="center" style="font-family: Arial Narrow; font-size: 17px;">ESTADO DO RIO GRANDE DO NORTE</p>
                <p class="center" style="font-family: Arial Narrow; font-size: 17px;">PREFEITURA MUNICIPAL DE CARAÚBAS</p>
    `;

    if (modelo === "administracao") {
        conteudoHTML += `
            <p class="center" style="font-family: Arial Narrow; font-size: 17px;">CNPJ Nº 08.349.102/0001-29</p>
            <p class="center" style="font-family: Arial Narrow; font-size: 20px;">SECRETARIA MUNICIPAL DE ADMINISTRAÇÃO</p>
        `;
    } else if (modelo === "saude") {
        conteudoHTML += `
            <p class="center" style="font-family: Arial Narrow; font-size: 17px;">CNPJ Nº 11.388.450/0001-10</p>
            <p class="center" style="font-family: Arial Narrow; font-size: 20px;">SECRETARIA MUNICIPAL DE SAÚDE</p>
        `;
    } else if (modelo === "assistencia") {
        conteudoHTML += `
            <p class="center" style="font-family: Arial Narrow; font-size: 17px;">CNPJ Nº 14.856.151/0001-50</p>
            <p class="center" style="font-family: Arial Narrow; font-size: 20px;">SECRETARIA MUNICIPAL DO TRABALHO E ASSISTÊNCIA SOCIAL</p>
        `;
    } else if (modelo === "cultura") {
        conteudoHTML += `
            <p class="center" style="font-family: Arial Narrow; font-size: 17px;">CNPJ Nº 08.349.102/0001-29</p>
            <p class="center" style="font-family: Arial Narrow; font-size: 20px;">SECRETARIA MUNICIPAL DE CULTURA E TURISMO</p>
        `;
    } else if (modelo === "educacao") {
        conteudoHTML += `
            <p class="center" style="font-family: Arial Narrow; font-size: 17px;">CNPJ Nº 30.872.960/0001-02</p>
            <p class="center" style="font-family: Arial Narrow; font-size: 20px;">SECRETARIA MUNICIPAL DO DESENVOLVIMENTO DA EDUCAÇÃO E DO DESPORTO</p>
        `;
    } else if (modelo === "governo") {
        conteudoHTML += `
            <p class="center" style="font-family: Arial Narrow; font-size: 17px;">CNPJ Nº 08.349.102/0001-29</p>
            <p class="center" style="font-family: Arial Narrow; font-size: 20px;">SECRETARIA MUNICIPAL DE GOVERNO</p>
        `;
    } else if (modelo === "infraestrutura") {
        conteudoHTML += `
            <p class="center" style="font-family: Arial Narrow; font-size: 17px;">CNPJ Nº 08.349.102/0001-29</p>
            <p class="center" style="font-family: Arial Narrow; font-size: 20px;">SECRETARIA MUNICIPAL DE INFRAESTRUTURA E SERVIÇOS PÚBLICOS</p>
        `;
    } else if (modelo === "campo") {
        conteudoHTML += `
            <p class="center" style="font-family: Arial Narrow; font-size: 17px;">CNPJ Nº 08.349.102/0001-29</p>
            <p class="center" style="font-family: Arial Narrow; font-size: 20px;">SECRETARIA MUNICIPAL DE POLÍTICAS DO CAMPO E MEIO AMBIENTE</p>
        `;
    }

    conteudoHTML += `
        </header>
            <main>
            <p class="center" style="font-size: 20px;">COMPROVAÇÃO DE DESPESA</p>
            <p><strong>Nome do fornecedor:</strong> ${empresa}</p>
            <p><strong>Nº da ordem de compra/serviço:</strong> ${ordem} &emsp; <strong>Nº da NFS-e:</strong> ${nota}</p>
            <p><strong>Fatura mês/ano:</strong> ${data}</p>
        </main>
    `;

    if (imagens.length > 0) {
        conteudoHTML += `<div class="image-container">`;
        imagens.forEach((img, index) => {
            if (!img) return; // ignora se vazio
            const imageUrl = URL.createObjectURL(img);
            conteudoHTML += `
                <div style="text-align:center; margin-top:20px;">
                    <img src="${imageUrl}" alt="Imagem" style="max-width:90%; max-height:400px;"><br>
                    <p><em>${legendas[index]}</em></p>
                </div>
            `;
        });
        conteudoHTML += `</div>`;
    }

    conteudoHTML += `</body></html>`;

    const novaJanela = window.open();
    novaJanela.document.write(conteudoHTML);
    novaJanela.document.close();
}

