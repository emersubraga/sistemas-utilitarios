document.getElementById("form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const empresa = document.getElementById("empresa").value;
    const cnpj = document.getElementById("cnpj").value;
    const logradouro = document.getElementById("logradouro").value;
    const bairro = document.getElementById("bairro").value;
    const numero = document.getElementById("numero").value;
    const cidade = document.getElementById("cidade").value;
    const titulo = document.getElementById("titulo").value;
    const assinaturaNome = document.getElementById("assinaturaNome").value;
    const assinaturaFuncao = document.getElementById("assinaturaFuncao").value;
    const assinaturaCodigo = document.getElementById("assinaturaCodigo").value;
    const data = document.getElementById("data").value;
    const texto = document.getElementById("texto").value;

    const dataInput = new Date(data);
    const dataFormatada = dataInput.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    gerarPaginaHTML(empresa, cnpj, logradouro, bairro, numero, cidade, titulo, assinaturaNome, assinaturaFuncao, assinaturaCodigo, dataFormatada, texto);
});

function gerarPaginaHTML(empresa, cnpj, logradouro, bairro, numero, cidade, titulo, assinaturaNome, assinaturaFuncao, assinaturaCodigo, dataFormatada, texto) {
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
                .centralizado {
                    text-align: center;
                }
                .right {
                    text-align: right;
                }
                .spaced {
                    margin-top: 0px;
                }
                header{
                    margin-bottom: 5px;
                    border-bottom: 2px solid #000000;
                }
                header img{
                    margin-top: -10px;
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
                <p class="center" style="font-family: Arial Narrow; font-size: 17px;">${empresa}</p>
                <p class="center" style="font-family: Arial Narrow; font-size: 17px;">${cnpj}</p>
                <p class="center" style="font-family: Arial Narrow; font-size: 17px;">${logradouro}, ${numero}, ${bairro}</p>
                <p class="center" style="font-family: Arial Narrow; font-size: 17px;">${cidade}</p>
        </header>
            <main>
                <br><br><p class="center" style="font-size: 20px;">${titulo}</p><br>
            </main>
    `;

    // Transforma texto em parágrafos justificados com recuo
    const paragrafos = texto
        .split('\n')
        .filter(linha => linha.trim() !== '')
        .map(linha => `<p style="text-indent: 30px; text-align: justify;">${linha}</p>`)
        .join('');

    conteudoHTML += `
        <div class="centralizado">
            ${paragrafos}
        </div><br><br>
        <p class="right">${dataFormatada}</p><br>
        <div class="center" style="margin-top:40px;">
            <p>___________________________________________</p>
            <p><strong>${assinaturaNome}</strong><br>
            ${assinaturaFuncao}<br>${assinaturaCodigo}</p>
        </div>
    `;

    conteudoHTML += `
        </body>
        </html>
    `;

    const novaJanela = window.open();
    novaJanela.document.write(conteudoHTML);
    novaJanela.document.close();
}
