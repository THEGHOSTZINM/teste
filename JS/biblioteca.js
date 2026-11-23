import { banco } from './supabase.js';

export async function buscarBiblioteca(idUsuario) {
    let resultado = await banco.from('biblioteca')
        .select('id_jogo, status').eq('id_usuario', idUsuario);
    if (resultado.error) throw resultado.error;
    return resultado.data;
}

export async function salvarStatus(idUsuario, idJogo, status) {
    if (status === '') {
        let resultado = await banco.from('biblioteca').delete()
            .eq('id_usuario', idUsuario).eq('id_jogo', idJogo);
        if (resultado.error) throw resultado.error;
    } else {
        let resultado = await banco.from('biblioteca').upsert({
            id_usuario: idUsuario,
            id_jogo: idJogo,
            status: status
        }, { onConflict: 'id_usuario,id_jogo' });
        if (resultado.error) throw resultado.error;
    }
}