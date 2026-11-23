import { criarUsuario, entrarUsuario } from './login.js';
import { buscarCatalogo, salvarJogoBanco } from './jogos.js';
import { buscarBiblioteca, salvarStatus } from './biblioteca.js';
import { mostrarTela, preencherOpcoes } from './tela.js';

// variáveis principais

let usuario = null;
let jogos = [];
let biblioteca = [];
let generos = [];
let plataformas = [];
let aba = 'catalogo';
let criandoConta = false;
let editando = null;

// pega um elemento do HTML pelo ID

function pegar(id) {
    return document.getElementById(id);
}

// mostra as informações na tela

function mostrar() {
    mostrarTela(
        usuario,
        jogos,
        biblioteca,
        aba,
        mudarStatus,
        abrirEdicao,
        usuario ? usuario.id_usuario : null
    );
}

// busca os dados atualizados no Supabase

async function atualizar() {
    let catalogo = await buscarCatalogo();

    jogos = catalogo.jogos;
    generos = catalogo.generos;
    plataformas = catalogo.plataformas;

    if (usuario) {
        biblioteca = await buscarBiblioteca(usuario.id_usuario);
    } else {
        biblioteca = [];
    }

    preencherOpcoes(generos, plataformas);
    mostrar();
}

// mostra uma mensagem para o usuário

function aviso(texto) {
    pegar('aviso').textContent = texto;
    pegar('aviso').hidden = false;
}

// Login e Usuários

// alterna entre entrar e criar conta

function trocarModo() {
    criandoConta = !criandoConta;

    pegar('titulo-login').textContent = criandoConta ? 'Criar conta' : 'Entrar';
    pegar('btn-entrar').textContent = criandoConta ? 'Criar conta' : 'Entrar';
    pegar('texto-troca').textContent = criandoConta ? 'Já possui uma conta?' : 'Não tem conta?';
    pegar('btn-trocar').textContent = criandoConta ? 'Entrar' : 'Criar uma conta';

    pegar('mensagem-login').textContent = '';
}

// faz login ou cadastra um usuário

async function entrar(evento) {
    evento.preventDefault();

    let nome = pegar('nome-usuario').value;
    pegar('mensagem-login').textContent = '';

    try {
        if (criandoConta) {
            usuario = await criarUsuario(nome);
        } else {
            usuario = await entrarUsuario(nome);
        }

        aba = 'catalogo';
        pegar('nome-usuario').value = '';

        await atualizar();

    } catch (erro) {
        usuario = null;
        pegar('mensagem-login').textContent = 'Erro: ' + erro.message;
        mostrar();
    }
}

// sai da conta e volta para o login

function sair() {
    usuario = null;
    pegar('aviso').hidden = true;
    mostrar();
}


// Biblioteca do usuário

// adiciona, altera ou remove um jogo da biblioteca

async function mudarStatus(idJogo, status) {
    try {
        await salvarStatus(usuario.id_usuario, idJogo, status);

        biblioteca = await buscarBiblioteca(usuario.id_usuario);
        mostrar();

        if (status) {
            aviso('Status atualizado: ' + status);
        } else {
            aviso('Jogo removido da biblioteca.');
        }

    } catch (erro) {
        aviso('Erro: ' + erro.message);
    }
}


// Cadastro de jogos

// abre a janela para cadastrar um novo jogo

function abrirCadastro() {
    editando = null;

    pegar('form-jogo').reset();
    pegar('titulo-modal').textContent = 'Cadastrar jogo';
    pegar('btn-salvar-jogo').textContent = 'Cadastrar jogo';
    pegar('campo-status-inicial').hidden = false;
    pegar('mensagem-jogo').textContent = '';

    pegar('modal-jogo').showModal();
}


// Edição de jogos

// preenche os campos com os dados do jogo escolhido

function preencherDadosJogo(jogo) {
    let campos = pegar('form-jogo').elements;

    campos.nome.value = jogo.nome;
    campos.descricao.value = jogo.descricao;
    campos.desenvolvedora.value = jogo.desenvolvedora;
    campos.ano.value = jogo.ano;

    let genero = generos.find(function(item) {
        return item.nome === jogo.genero;
    });

    if (genero) {
        campos.genero.value = genero.id_genero;
    }
}

// marca as plataformas que pertencem ao jogo

function preencherPlataformas(jogo) {
    document.querySelectorAll('input[name="plataforma"]').forEach(function(caixa) {

        let plataforma = plataformas.find(function(item) {
            return String(item.id_plataforma) === caixa.value;
        });

        if (plataforma) {
            caixa.checked = jogo.plataformas.includes(plataforma.nome);
        } else {
            caixa.checked = false;
        }
    });
}

// abre a janela para editar um jogo existente

function abrirEdicao(idJogo) {
    let jogo = jogos.find(function(item) {
        return item.id === Number(idJogo);
    });

    if (!jogo) return;

    editando = Number(idJogo);

    pegar('form-jogo').reset();

    preencherDadosJogo(jogo);
    preencherPlataformas(jogo);

    pegar('titulo-modal').textContent = 'Editar jogo';
    pegar('btn-salvar-jogo').textContent = 'Salvar alterações';
    pegar('campo-status-inicial').hidden = true;
    pegar('mensagem-jogo').textContent = '';

    pegar('modal-jogo').showModal();
}


// Salvar jogos

// pega as plataformas marcadas no formulário

function pegarPlataformasEscolhidas() {
    let escolhidas = [];

    document.querySelectorAll('input[name="plataforma"]').forEach(function(caixa) {
        if (caixa.checked) {
            escolhidas.push(Number(caixa.value));
        }
    });

    return escolhidas;
}

// salva um novo jogo ou as alterações de um jogo já existente

async function salvarJogo(evento) {
    evento.preventDefault();

    let form = pegar('form-jogo');
    let campos = form.elements;

    let nome = campos.nome.value.trim();
    let plataformasEscolhidas = pegarPlataformasEscolhidas();

    // verifica se pelo menos uma plataforma foi escolhida
    
    if (plataformasEscolhidas.length === 0) {
        pegar('mensagem-jogo').textContent = 'Escolha pelo menos uma plataforma.';
        return;
    }

    // organiza os dados que serão enviados ao banco
    
    let novoJogo = {
        nome: nome,
        descricao: campos.descricao.value.trim(),
        desenvolvedora: campos.desenvolvedora.value.trim(),
        ano: Number(campos.ano.value),
        idGenero: Number(campos.genero.value)
    };

    try {

        // cadastra ou atualiza o jogo no Supabase
        
        let id = await salvarJogoBanco(
            novoJogo,
            plataformasEscolhidas,
            editando,
            usuario.id_usuario
        );

        // se for um jogo novo, salva o status inicial na biblioteca
        
        if (editando === null && campos.status.value !== '') {
            await salvarStatus(usuario.id_usuario, id, campos.status.value);
        }

        let eraEdicao = editando !== null;

        form.reset();
        pegar('modal-jogo').close();

        // atualiza o catálogo depois de salvar
        
        await atualizar();

        aba = 'catalogo';
        mostrar();

        if (eraEdicao) {
            aviso('Jogo atualizado!');
        } else {
            aviso('Jogo cadastrado!');
        }

    } catch (erro) {
        pegar('mensagem-jogo').textContent = 'Erro: ' + erro.message;
    }
}

// Filtros do catálogo

// limpa os filtros de pesquisa, gênero e plataforma

function limparFiltros() {
    pegar('campo-busca').value = '';
    pegar('filtro-genero').value = '';
    pegar('filtro-plataforma').value = '';

    mostrar();
}

// Botões

// define o que acontece ao clicar nos botões do site

function configurarBotoes() {

    // login

    pegar('form-login').addEventListener('submit', entrar);
    pegar('btn-trocar').addEventListener('click', trocarModo);
    pegar('btn-sair').addEventListener('click', sair);

    // abas do catálogo e da biblioteca
    
    pegar('aba-catalogo').addEventListener('click', function() {
        aba = 'catalogo';
        mostrar();
    });

    pegar('aba-biblioteca').addEventListener('click', function() {
        aba = 'biblioteca';
        mostrar();
    });

    // filtros
    
    pegar('campo-busca').addEventListener('input', mostrar);
    pegar('filtro-genero').addEventListener('change', mostrar);
    pegar('filtro-plataforma').addEventListener('change', mostrar);
    pegar('btn-limpar').addEventListener('click', limparFiltros);

    // cadastro e edição
    
    pegar('btn-cadastrar').addEventListener('click', abrirCadastro);

    pegar('btn-cancelar').addEventListener('click', function() {
        pegar('modal-jogo').close();
    });

    pegar('form-jogo').addEventListener('submit', salvarJogo);

    // atualiza o catálogo com os dados do Supabase
    
    pegar('btn-reiniciar').addEventListener('click', async function() {
        try {
            await atualizar();
            aviso('Jogos atualizados.');

        } catch (erro) {
            aviso('Erro: ' + erro.message);
        }
    });
}

// Inicialização do site

// configura os botões e mostra a tela inicial

function iniciar() {
    configurarBotoes();
    mostrar();
}

iniciar();