import { banco } from './supabase.js';

function verificar(resultado) {
    if (resultado.error) throw resultado.error;
    return resultado.data;
}

// busca os dados do banco

export async function buscarCatalogo() {
    let jogos = verificar(await banco.from('jogos').select('*').order('nome'));
    let generos = verificar(await banco.from('generos').select('*').order('nome'));
    let plataformas = verificar(await banco.from('plataformas').select('*').order('nome'));
    let jogosGeneros = verificar(await banco.from('jogos_generos').select('*'));
    let jogosPlataformas = verificar(await banco.from('jogos_plataformas').select('*'));

    let lista = [];

    jogos.forEach(function(jogo) {
        let nomeGenero = buscarGenero(jogo.id_jogo, generos, jogosGeneros);
        let plataformasJogo = buscarPlataformas(jogo.id_jogo, plataformas, jogosPlataformas);

        lista.push({
            id: jogo.id_jogo,
            nome: jogo.nome,
            descricao: jogo.descricao || '',
            desenvolvedora: jogo.desenvolvedora,
            ano: jogo.ano_lancamento,
            genero: nomeGenero,
            plataformas: plataformasJogo,
            criadoPor: jogo.id_usuario_criador || null
        });
    });

    return { jogos: lista, generos: generos, plataformas: plataformas };
}

// busca o gênero de um jogo

function buscarGenero(idJogo, generos, jogosGeneros) {
    let idGenero = null;
    let nomeGenero = 'Sem gênero';

    jogosGeneros.forEach(function(relacao) {
        if (relacao.id_jogo === idJogo && idGenero === null) {
            idGenero = relacao.id_genero;
        }
    });

    generos.forEach(function(genero) {
        if (genero.id_genero === idGenero) {
            nomeGenero = genero.nome;
        }
    });

    return nomeGenero;
}

// busca as plataformas de um jogo

function buscarPlataformas(idJogo, plataformas, jogosPlataformas) {
    let plataformasJogo = [];

    jogosPlataformas.forEach(function(relacao) {
        if (relacao.id_jogo === idJogo) {
            plataformas.forEach(function(plataforma) {
                if (plataforma.id_plataforma === relacao.id_plataforma) {
                    plataformasJogo.push(plataforma.nome);
                }
            });
        }
    });

    return plataformasJogo;
}

// verifica se um jogo já existe no catálogo

async function verificarRepetido(nome, editando) {
    let resultado = await banco.from('jogos').select('id_jogo, nome');

    if (resultado.error) throw resultado.error;

    let nomeNormalizado = nome.trim().toLowerCase().replace(/\s+/g, ' ');

    let mesmoNome = resultado.data.find(function(item) {
        let nomeExistente = item.nome.trim().toLowerCase().replace(/\s+/g, ' ');

        let nomesIguais = nomeExistente === nomeNormalizado;
        let outroJogo = item.id_jogo !== editando;

        return nomesIguais && outroJogo;
    });

    if (mesmoNome) {
        throw new Error('Já existe um jogo com esse nome no catálogo.');
    }
}

// cadastra ou edita um jogo do catálogo

export async function salvarJogoBanco(jogo, plataformasEscolhidas, editando, idUsuario) {
    await verificarRepetido(jogo.nome, editando);

    let dadosJogo = {
        nome: jogo.nome,
        descricao: jogo.descricao,
        desenvolvedora: jogo.desenvolvedora,
        ano_lancamento: jogo.ano
    };

    let idJogo;

    if (editando === null) {
        dadosJogo.id_usuario_criador = idUsuario;

        let resposta = await banco.from('jogos')
            .insert(dadosJogo)
            .select('id_jogo')
            .single();

        if (resposta.error) throw resposta.error;

        idJogo = resposta.data.id_jogo;
    } else {
        let resposta = await banco.from('jogos')
            .update(dadosJogo)
            .eq('id_jogo', editando)
            .eq('id_usuario_criador', idUsuario)
            .select('id_jogo')
            .single();

        if (resposta.error) throw resposta.error;
        if (!resposta.data) throw new Error('Você não pode editar este jogo.');

        idJogo = resposta.data.id_jogo;

        let apagarGenero = await banco.from('jogos_generos')
            .delete()
            .eq('id_jogo', idJogo);

        if (apagarGenero.error) throw apagarGenero.error;

        let apagarPlataformas = await banco.from('jogos_plataformas')
            .delete()
            .eq('id_jogo', idJogo);

        if (apagarPlataformas.error) throw apagarPlataformas.error;
    }

    await salvarRelacoes(idJogo, jogo.idGenero, plataformasEscolhidas);

    return idJogo;
}

// salva o gênero e as plataformas do jogo cadastrado/editado

async function salvarRelacoes(idJogo, idGenero, plataformasEscolhidas) {
    let respostaGenero = await banco.from('jogos_generos')
        .insert({
            id_jogo: idJogo,
            id_genero: idGenero
        });

    if (respostaGenero.error) throw respostaGenero.error;

    let relacoes = [];

    plataformasEscolhidas.forEach(function(idPlataforma) {
        relacoes.push({
            id_jogo: idJogo,
            id_plataforma: idPlataforma
        });
    });

    let respostaPlataformas = await banco.from('jogos_plataformas')
        .insert(relacoes);

    if (respostaPlataformas.error) throw respostaPlataformas.error;
}