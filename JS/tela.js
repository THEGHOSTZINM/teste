const STATUS = ['Concluído', 'Jogando', 'Quero Jogar'];

// Funções Gerais

// pega um elemento do HTML pelo ID

function pegar(id) {
    return document.getElementById(id);
}

// Cria um elemento HTML com classe e texto
function criar(tag, classe, texto) {
    let elemento = document.createElement(tag);

    elemento.className = classe;
    elemento.textContent = texto;

    return elemento;
}

// verifica o status de um jogo na biblioteca do usuário

function statusDoJogo(jogo, biblioteca) {
    let registro = biblioteca.find(function(item) {
        return item.id_jogo === jogo.id;
    });

    if (registro) {
        return registro.status;
    } else {
        return '';
    }
}


// Capa e Informações do Jogo

// cria a capa com uma cor, sigla e gênero

function criarCapa(jogo) {
    let capa = criar('div', 'capa', '');

    capa.style.setProperty('--cor', String((jogo.id * 57) % 360));

    capa.appendChild(criar('span', 'sigla', jogo.nome.substring(0, 2).toUpperCase()));
    capa.appendChild(criar('span', 'tag', jogo.genero));

    return capa;
}

// cria a parte com nome, desenvolvedora e descrição

function criarInformacoes(jogo) {
    let conteudo = criar('div', 'conteudo-cartao', '');

    conteudo.appendChild(criar('h3', '', jogo.nome));

    conteudo.appendChild(criar('p', 'meta', jogo.desenvolvedora + ' · ' + jogo.ano));

    conteudo.appendChild(criar('p', 'descricao', jogo.descricao));

    conteudo.appendChild(criar('p', 'plataformas', 'Plataformas: ' + jogo.plataformas.join(', ')));

    return conteudo;
}

// Botões dos Jogos

// Cria o seletor para alterar o status de um jogo

function criarSeletor(jogo, biblioteca, alterarStatus) {
    let seletor = document.createElement('select');

    seletor.setAttribute('aria-label', 'Status do jogo ' + jogo.nome);

    let opcaoInicial = criar('option', '', 'Não está na biblioteca');
    opcaoInicial.value = '';

    seletor.appendChild(opcaoInicial);

    STATUS.forEach(function(status) {
        let opcao = criar('option', '', status);

        opcao.value = status;
        seletor.appendChild(opcao);
    });

    seletor.value = statusDoJogo(jogo, biblioteca);

    seletor.addEventListener('change', function() {
        alterarStatus(jogo.id, seletor.value);
    });

    return seletor;
}

// cria os botões para alterar, remover ou editar o jogo

function criarBotoes(jogo, biblioteca, pessoal, alterarStatus, editarJogo, authId) {
    let rodape = criar('div', 'rodape-cartao', '');

    let texto = pessoal ? 'Alterar status:' : 'Adicionar à minha biblioteca:';
    rodape.appendChild(criar('label', '', texto));

    let linha = criar('div', 'linha-botoes', '');

    let seletor = criarSeletor(jogo, biblioteca, alterarStatus);
    linha.appendChild(seletor);

    // botão para remover um jogo da biblioteca
    
    if (pessoal) {
        let remover = criar('button', 'remover', 'Remover');
        remover.type = 'button';

        remover.addEventListener('click', function() {
            alterarStatus(jogo.id, '');
        });

        linha.appendChild(remover);
    }

    rodape.appendChild(linha);

    // botão de edição para quem cadastrou o jogo
    
    if (!pessoal && jogo.criadoPor && jogo.criadoPor === authId) {
        let editar = criar('button', 'editar', 'Editar informações');
        editar.type = 'button';

        editar.addEventListener('click', function() {
            editarJogo(jogo.id);
        });

        rodape.appendChild(editar);
    }

    return rodape;
}

// Criar o Cartão Completo

// junta a capa, as informações e os botões

function criarCard(jogo, biblioteca, pessoal, alterarStatus, editarJogo, authId) {
    let cartao = criar('article', 'cartao', '');

    let capa = criarCapa(jogo);
    let conteudo = criarInformacoes(jogo);
    let rodape = criarBotoes(jogo, biblioteca, pessoal, alterarStatus, editarJogo, authId);

    cartao.appendChild(capa);
    cartao.appendChild(conteudo);
    cartao.appendChild(rodape);

    return cartao;
}


// Filtros dos Jogos

// filtra os jogos por nome, desenvolvedora, gênero e plataforma

function jogosFiltrados(jogos) {
    let busca = pegar('campo-busca').value.toLowerCase().trim();
    let genero = pegar('filtro-genero').value;
    let plataforma = pegar('filtro-plataforma').value;

    return jogos.filter(function(jogo) {
        let texto = (jogo.nome + ' ' + jogo.desenvolvedora).toLowerCase();

        let correspondeBusca = texto.includes(busca);
        let correspondeGenero = genero === '' || jogo.genero === genero;
        let correspondePlataforma = plataforma === '' || jogo.plataformas.includes(plataforma);

        return correspondeBusca && correspondeGenero && correspondePlataforma;
    });
}

// Mostra o Catálogo

// mostra todos os jogos que passaram pelos filtros

function mostrarCatalogo(jogos, biblioteca, alterarStatus, editarJogo, authId) {
    let area = pegar('catalogo');
    area.replaceChildren();

    jogos.forEach(function(jogo) {
        let cartao = criarCard(jogo, biblioteca, false, alterarStatus, editarJogo, authId);
        area.appendChild(cartao);
    });

    if (jogos.length === 0) {
        area.appendChild(criar('p', 'vazio', 'Nenhum jogo encontrado.'));
    }

    pegar('resultado-filtro').textContent = jogos.length + ' jogo(s) encontrado(s) no catálogo.';
}

// Mostra a Biblioteca

// cria uma seção para cada status da biblioteca

function criarSecao(status, jogos, biblioteca, alterarStatus, editarJogo, authId) {
    let secao = criar('section', 'secao', '');
    let cabecalho = criar('div', 'titulo-secao', '');
    let grade = criar('div', 'grade', '');

    let titulo;

    if (status === 'Concluído') {
        titulo = '✓ Concluídos';
    } else if (status === 'Jogando') {
        titulo = '▶ Jogando';
    } else {
        titulo = '☆ Quero Jogar';
    }

    cabecalho.appendChild(criar('h3', '', titulo));

    let quantidade = 0;

    // procura os jogos que pertencem ao status escolhido
    
    jogos.forEach(function(jogo) {
        if (statusDoJogo(jogo, biblioteca) === status) {
            let cartao = criarCard(jogo, biblioteca, true, alterarStatus, editarJogo, authId);

            grade.appendChild(cartao);
            quantidade++;
        }
    });

    cabecalho.appendChild(criar('span', 'quantidade', String(quantidade)));
    secao.appendChild(cabecalho);

    if (quantidade === 0) {
        secao.appendChild(criar('p', 'vazio', 'Nenhum jogo nesta seção.'));
    } else {
        secao.appendChild(grade);
    }

    return { secao: secao, quantidade: quantidade };
}

// organiza os jogos nas três seções da biblioteca

function mostrarBiblioteca(jogos, biblioteca, alterarStatus, editarJogo, authId) {
    let area = pegar('biblioteca');
    area.replaceChildren();

    let total = 0;

    STATUS.forEach(function(status) {
        let resultado = criarSecao(status, jogos, biblioteca, alterarStatus, editarJogo, authId);

        area.appendChild(resultado.secao);
        total += resultado.quantidade;
    });

    pegar('resultado-filtro').textContent = total + ' jogo(s) encontrado(s) na sua biblioteca.';
}

// Mostra a Tela Principal

// controla a tela de login e a tela do aplicativo

export function mostrarTela(usuario, jogos, biblioteca, aba, alterarStatus, editarJogo, authId) {
    pegar('tela-login').hidden = Boolean(usuario);
    pegar('aplicativo').hidden = !usuario;
    pegar('btn-sair').hidden = !usuario;

    // se não houver usuário, mostra somente o login
    
    if (!usuario) {
        pegar('boas-vindas').textContent = '';
        return;
    }

    // mostra o nome do usuário e as quantidades
    
    pegar('boas-vindas').textContent = 'Olá, ' + usuario.nome;
    pegar('total-catalogo').textContent = jogos.length;
    pegar('total-biblioteca').textContent = biblioteca.length;

    let noCatalogo = aba === 'catalogo';

    // alterna entre as abas
    
    pegar('aba-catalogo').classList.toggle('ativa', noCatalogo);
    pegar('aba-biblioteca').classList.toggle('ativa', !noCatalogo);

    pegar('catalogo').hidden = !noCatalogo;
    pegar('biblioteca').hidden = noCatalogo;

    if (noCatalogo) {
        pegar('titulo-pagina').textContent = 'Catálogo de jogos';
        pegar('descricao-pagina').textContent = 'Descubra jogos e adicione à sua biblioteca.';
    } else {
        pegar('titulo-pagina').textContent = 'Minha biblioteca';
        pegar('descricao-pagina').textContent = 'Seus jogos organizados por Concluídos, Jogando e Quero Jogar.';
    }

    let filtrados = jogosFiltrados(jogos);

    // decide qual parte do site será mostrada
    
    if (noCatalogo) {
        mostrarCatalogo(filtrados, biblioteca, alterarStatus, editarJogo, authId);
    } else {
        mostrarBiblioteca(filtrados, biblioteca, alterarStatus, editarJogo, authId);
    }
}

// Preenche Gêneros e Plataformas

// coloca os gêneros nos filtros e no formulário de cadastro

function preencherGeneros(generos) {
    generos.forEach(function(genero) {
        let filtro = criar('option', '', genero.nome);
        filtro.value = genero.nome;

        pegar('filtro-genero').appendChild(filtro);

        let cadastro = criar('option', '', genero.nome);
        cadastro.value = genero.id_genero;

        pegar('form-jogo').elements.genero.appendChild(cadastro);
    });
}

// coloca as plataformas nos filtros e no formulário

function preencherPlataformas(plataformas) {
    plataformas.forEach(function(plataforma) {
        let filtro = criar('option', '', plataforma.nome);
        filtro.value = plataforma.nome;

        pegar('filtro-plataforma').appendChild(filtro);

        let rotulo = criar('label', '', plataforma.nome);

        let caixa = document.createElement('input');
        caixa.type = 'checkbox';
        caixa.name = 'plataforma';
        caixa.value = plataforma.id_plataforma;

        rotulo.prepend(caixa);
        pegar('opcoes-plataformas').appendChild(rotulo);
    });
}

// atualiza todas as opções de gênero e plataforma

export function preencherOpcoes(generos, plataformas) {
    pegar('filtro-genero').innerHTML = '<option value="">Todos os gêneros</option>';
    pegar('filtro-plataforma').innerHTML = '<option value="">Todas as plataformas</option>';

    pegar('form-jogo').elements.genero.replaceChildren();
    pegar('opcoes-plataformas').replaceChildren();

    preencherGeneros(generos);
    preencherPlataformas(plataformas);
}
