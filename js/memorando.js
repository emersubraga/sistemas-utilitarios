document.getElementById("form").addEventListener("submit", function(event) {
    event.preventDefault();

    const modelo = document.getElementById("modelo").value;
    const numero = document.getElementById("numero").value;
    const data = document.getElementById("data").value;
    const remetente = document.getElementById("remetente").value;
    const destinatario = document.getElementById("destinatario").value;
    const assunto = document.getElementById("assunto").value;
    const anexo = document.getElementById("anexo").value;
    const objeto = document.getElementById("objeto").value;
    const motivacao = document.getElementById("motivacao").value;
    const dotacao = document.getElementById("dotacao").value;
    const assinaturaNome = document.getElementById("assinaturaNome").value;
    const assinaturaFuncao = document.getElementById("assinaturaFuncao").value;
    const assinaturaCodigo = document.getElementById("assinaturaCodigo").value;

    const dataInput = new Date(data);
    const dataFormatada = dataInput.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    });

    function formatarParagrafos(texto, prefixo) {
        const linhas = texto.split('\n').filter(linha => linha.trim() !== '');
        return linhas.map((linha, index) => `<p><strong>${prefixo}.${index + 1}</strong> ${linha.trim()}</p>`).join('');
    }
    

    gerarPaginaHTML({
        modelo, numero, dataFormatada, remetente, destinatario,
        assunto, anexo, objeto, motivacao, dotacao, assinaturaNome, assinaturaFuncao, assinaturaCodigo,
        formatarParagrafos
    });
});

function gerarPaginaHTML({
    modelo, numero, dataFormatada, remetente, destinatario,
    assunto, anexo, objeto, motivacao, dotacao, assinaturaNome, assinaturaFuncao, assinaturaCodigo,
    formatarParagrafos
}) {
    let conteudoHTML = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memorando</title>
        <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

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

        header {
            margin-bottom: 5px;
            border-bottom: 2px solid #000000;
        }

        header img {
            margin-top: 0px;
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

        .container {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            flex-direction: column;
            width: 100%;
            max-width: 800px; /* controla a largura da "folha" */
            margin: 0 auto;   /* centraliza horizontalmente */
            padding: 20px;    /* adiciona espaço interno */
        }

        .titulo-data {
            margin-top: 10px;
            display: flex;
            justify-content: center;
            gap: 155px; /* Define o espaço entre os títulos */
        }

        .titulo-data h4 {
            margin: 0;
        }

        .remetente-destinatario {
            display: flex;
            flex-direction: column;
            margin-right: 300px;
            gap: 0;
        }

        .assunto {
            display: flex;
            text-align: justify;
            gap: 200px;
        }

        .anexo {
            display: flex;
            margin-right: 400px;
        }

        .saudacao p.recuo-duplo {
            text-indent: 7em;
        }

        .resolucao{
            display: flex;
            text-align: justify;
        }
        .resolucao p.recuo-duplo {
            text-indent: 7em;
        }

        .artigo-recuado {
            margin-left: 16em;   /* Recuo à esquerda (opcional) */
            text-align: justify;
            font-style: italic; /* Opcional: deixa com aparência de citação */
            font-size: 13px;
        }

        .clausulas {
            display: flex;
            flex-direction: column;
            text-align: justify;
        }
        
        .area-dotacao{
            display: flex;
            flex-direction: column;
            text-align: justify;
        }

        .assinatura {
            text-align: center;
            margin: 50px auto 0 auto; /* margem superior opcional pra afastar do conteúdo anterior */
            width: fit-content; /* mantém só o tamanho necessário */
        }

        .tabela {
            text-align: center;
            font-family: Arial, sans-serif;
            margin: 50px auto 0 auto; /* margem superior opcional pra afastar do conteúdo anterior */
            width: auto; /* mantém só o tamanho necessário */
        }

        .tabela h5 {
            margin: 5px 0;
            font-size: 16px;
            font-weight: bold;
        }

        .tabela table {
            width: 650px;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 14px;
        }

        .tabela th, .tabela td {
            border: 1px solid #ccc;
            padding: 8px 10px;
            text-align: center;
        }

        .tabela thead {
            background-color: #f0f0f0;
        }

        .tabela tbody tr:nth-child(even) {
            background-color: #fafafa;
        }

    </style>
</head>
<body>
    <header class="center">
        <img src="img/brasão.png" width="50" height="50">
        <p class="center" style="font-family: Arial Narrow; font-size: 17px;">ESTADO DO RIO GRANDE DO NORTE</p>
        <p class="center" style="font-family: Arial Narrow; font-size: 17px;">PREFEITURA MUNICIPAL DE CARAÚBAS</p>`;

    // Bloco condicional para escolher a secretaria
    const secretarias = {
        administracao: ["SECRETARIA MUNICIPAL DE ADMINISTRAÇÃO", "08.349.102/0001-29"],
        saude: ["SECRETARIA MUNICIPAL DE SAÚDE", "11.388.450/0001-10"],
        assistencia: ["SECRETARIA MUNICIPAL DO TRABALHO E ASSISTÊNCIA SOCIAL", "14.856.151/0001-50"],
        cultura: ["SECRETARIA MUNICIPAL DE CULTURA E TURISMO", "08.349.102/0001-29"],
        educacao: ["SECRETARIA MUNICIPAL DO DESENVOLVIMENTO DA EDUCAÇÃO E DO DESPORTO", "30.872.960/0001-02"],
        governo: ["SECRETARIA MUNICIPAL DE GOVERNO", "08.349.102/0001-29"],
        infraestrutura: ["SECRETARIA MUNICIPAL DE INFRAESTRUTURA E SERVIÇOS PÚBLICOS", "08.349.102/0001-29"],
        campo: ["SECRETARIA MUNICIPAL DE POLÍTICAS DO CAMPO E MEIO AMBIENTE", "08.349.102/0001-29"]
    };

    if (secretarias[modelo]) {
        const [nomeSecretaria, cnpj] = secretarias[modelo];
        conteudoHTML += `
        <p class="center" style="font-family: Arial Narrow; font-size: 20px;">${nomeSecretaria}</p>
        <p class="center" style="font-family: Arial Narrow; font-size: 17px;">CNPJ Nº ${cnpj}</p>`;
    }

    conteudoHTML += `</header>
    <main>
        <div class="container">
            <div class="titulo-data">
                <h4>Memorando nº ${numero}</h4>
                <h4>Caraúbas/RN, ${dataFormatada}.</h4>
            </div><br><br>
            <div class="remetente-destinatario">
                <p><strong>Da:</strong> ${remetente}</p>
                <p><strong>Ao:</strong> ${destinatario}</p>
            </div><br><br>
            <div class="assunto">
                <p><strong>Assunto:</strong> ${assunto}</p>
            </div><br>
            <div class="anexos">
                <p><strong>Anexo:</strong> ${anexo}</p>
            </div><br>
            <div class="saudacao">
                <p class="recuo-duplo">Excelentíssimo Senhor Prefeito,</p>
            </div>
            <div class="resolucao">
                <p class="recuo-duplo">Com previsão legal no inciso I do art. 
                    10 da Resolução nº 28 de 15 de dezembro
                    de 2020 do Tribunal de Contas do Estado 
                    do Rio Grande do Norte, vem essa Unidade 
                    Administrativa requisitar a abertura de 
                    processo de despesa pública considerando a necessidade de desenvolver o atendimento do que consta especificado no Anexo I da presente solicitação, no afã de satisfazer a contento, conforme as seguintes disposições, <strong>in verbis:</strong></p>
            </div>
            <div class="artigo">
                <p class="artigo-recuado">Art. 10. Os processos de comprovação da despesa pública orçamentária realizada pelo regime ordinário ou comum, afora outros documentos previstos em legislação específica, serão compostos, obrigatoriamente, das seguintes peças:<br>
                    I – solicitação para a realização da despesa, à qual deverá ser juntada:<br>
                    a) as justificativas da real necessidade da contratação;<br>
                    b) a definição precisa, suficiente e clara do objeto da contratação, podendo tomar a forma de:<br>
                    1. “projeto básico”, devidamente acompanhado do ato de sua aprovação pela autoridade competente, nos casos de contratação para a execução de obras e para a prestação de serviços;<br> 
                    2. “termo de referência”, na forma e nos casos em que a legislação o exigir; ou<br>
                    3. “especificações técnicas do objeto da contratação”, contendo as definições acerca da especificação, da unidade e da quantidade relativamente a cada bem a ser adquirido, no caso de compras.</p>
            </div><br>
            <div class="clausulas">
                <p><strong>1. DO OBJETO</strong><br>
                    ${formatarParagrafos(objeto, 1)}</p>
            </div>
            <div class="clausulas">
                <p><strong>2. DA MOTIVAÇÃO PARA SOLICITAÇÃO:</strong><br>
                    ${formatarParagrafos(motivacao, 2)}</p>
            </div>
            <div class="area-dotacao">
                <p><strong>3. DA DOTAÇÃO ORÇAMENTÁRIA:</strong><br>
                <strong>3.1.</strong> As despesas decorrentes da aquisição do objeto
                desta solicitação correrão à conta de recursos específicos consignados
                no Orçamento Geral do município, conforme abaixo discriminado:<br>
                    ${dotacao}</p>
            </div><br>
            <div class="clausulas">
                <p><strong>4. DO PEDIDO:</strong><br>
                    <strong>4.1.</strong> Diante o exposto, a fim de propiciar uma
                    melhor qualidade dos serviços públicos prestados à população
                    caraubense, solicito despacho do Excelentíssimo Senhor Prefeito
                    autorizando a consecução do pretenso processo administrativo,
                    dentro das premissas da legalidade, impessoalidade, publicidade,
                    eficiência, transparência, economicidade e celeridade e melhor
                    efetividade no trato da coisa pública, primando pela ampliação
                    das atividades do Poder Executivo no desempenho de suas atribuições
                    institucionais junto à população caraubense.<br><br><br>
                    Respeitosamente, 
                </p>
            </div>
            <div class="assinatura">
                <p><strong>${assinaturaNome}</strong></p>
                <p>${assinaturaFuncao}</p>
                <p>${assinaturaCodigo}</p>
            </div>
        </div>
    </main>
</body>
</html>`;

    const novaJanela = window.open("", "_blank");
    if (novaJanela) {
        novaJanela.document.write(conteudoHTML);
        novaJanela.document.close();
    } else {
        alert("Por favor, permita pop-ups para este site.");
    }
}

