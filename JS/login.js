
import { banco } from './supabase.js';

// cadastra um novo usuário

export async function criarUsuario(nome) {
    nome = nome.trim();

    if (!nome) throw new Error('Digite seu nome.');

    let consulta = await banco.from('usuarios')
        .select('id_usuario').eq('nome', nome);

    if (consulta.error) throw consulta.error;

    if (consulta.data.length > 0) {
        throw new Error('Esse nome já está cadastrado.');
    }

    let resposta = await banco.from('usuarios')
        .insert({ nome: nome })
        .select('id_usuario, nome')
        .single();

    if (resposta.error) throw resposta.error;

    return resposta.data;
}

// faz login com um usuário já cadastrado

export async function entrarUsuario(nome) {
    if (!nome.trim()) {
        throw new Error('Digite seu nome.');
    }

    let resposta = await banco.from('usuarios')
        .select('id_usuario, nome')
        .eq('nome', nome)
        .limit(1)
        .maybeSingle();

    if (resposta.error) throw resposta.error;

    if (!resposta.data) {
        throw new Error('Nome não encontrado. Verifique como escreveu seu nome.');
    }

    return resposta.data;
}