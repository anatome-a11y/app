export const pecaNoIndice = (pecasFisicas, loc) => {
    const peca = loc && loc.pecaFisica;
    if (!peca) return null;
    const id = typeof peca === 'object' ? peca._id : peca;
    return (id && pecasFisicas[id]) || null;
};

const idDe = valor => (valor && typeof valor === 'object' ? valor._id : valor) || '';

const labelNaPeca = (peca, parteId) => {
    const midias = (peca && peca.midias) || [];
    const alvo = String(idDe(parteId) || '');
    for (let i = 0; i < midias.length; i++) {
        const pontos = midias[i].pontos || [];
        for (let j = 0; j < pontos.length; j++) {
            const ponto = pontos[j];
            if (!ponto || ponto.label == null || String(ponto.label) === '') {
                continue;
            }
            if (String(idDe(ponto.parte)) === alvo) {
                return String(ponto.label);
            }
        }
    }
    return '';
};

export const numeroDaLocalizacao = (loc, peca, mapa) => {
    if (loc && loc.numero != null && String(loc.numero) !== '') {
        return String(loc.numero);
    }
    const pontos = mapa && mapa.pontos;
    if (Array.isArray(pontos) && pontos.length) {
        const primeiro = pontos[0];
        if (primeiro && typeof primeiro === 'object' && primeiro.label != null && String(primeiro.label) !== '') {
            return String(primeiro.label);
        }
        if (primeiro != null && typeof primeiro !== 'object' && String(primeiro) !== '') {
            return String(primeiro);
        }
    }
    return labelNaPeca(peca, mapa && mapa.parte);
};

export const textoRespostaParte = item => {
    const partes = (item && item.partes) || [];
    const numeros = [];
    const nomes = [];
    partes.forEach(parte => {
        if (!parte) return;
        if (parte.numero != null && String(parte.numero) !== '') {
            numeros.push(String(parte.numero));
        }
        if (parte.parte && parte.parte.nome) {
            nomes.push(parte.parte.nome);
        }
    });
    const numero = numeros.join(', ');
    const nome = nomes.join(', ');
    if (numero && nome) return numero + ' (' + nome + ')';
    return numero || nome || '';
};

export const norm = s => {
    return s.toLowerCase()
    .replace(new RegExp("\\s", 'g'),"")
    .replace(new RegExp("[àáâãäå]", 'g'),"a")
    .replace(new RegExp("æ", 'g'),"ae")
    .replace(new RegExp("ç", 'g'),"c")
    .replace(new RegExp("[èéêë]", 'g'),"e")
    .replace(new RegExp("[ìíîï]", 'g'),"i")
    .replace(new RegExp("ñ", 'g'),"n")                            
    .replace(new RegExp("[òóôõö]", 'g'),"o")
    .replace(new RegExp("œ", 'g'),"oe")
    .replace(new RegExp("[ùúûü]", 'g'),"u")
    .replace(new RegExp("[ýÿ]", 'g'),"y")
    .replace(new RegExp("\\W", 'g'),"");
};