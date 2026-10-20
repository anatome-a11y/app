export const extensao = nome => {
    if (!nome) {
        return '';
    }
    const limpo = String(nome).split('?')[0].split('#')[0];
    const partes = limpo.split('.');
    return partes.length > 1 ? partes[partes.length - 1].toLowerCase() : '';
};

export const ehModelo3d = nome => {
    const ext = extensao(nome);
    return ext === 'glb' || ext === 'gltf' || ext === 'obj';
};

export const pontos3d = pontos => {
    if (!pontos) {
        return [];
    }
    return pontos.map(ponto => {
        if (!ponto || ponto.z == null || ponto.z === '') {
            return null;
        }
        const parte = ponto.parte;
        const parteId = parte && parte._id ? String(parte._id) : (typeof parte === 'string' ? parte : '');
        const x = Number(ponto.x);
        const y = Number(ponto.y);
        const z = Number(ponto.z);
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            return null;
        }
        const faces = Array.isArray(ponto.faces)
            ? ponto.faces.map(Number).filter(face => !isNaN(face))
            : [];
        const traco = Array.isArray(ponto.traco)
            ? ponto.traco.map(item => ({
                x: Number(item && item.x),
                y: Number(item && item.y),
                z: Number(item && item.z),
            })).filter(item => !isNaN(item.x) && !isNaN(item.y) && !isNaN(item.z))
            : [];
        return {
            x: x,
            y: y,
            z: z,
            label: ponto.label == null ? '' : String(ponto.label),
            parteId: parteId,
            parteNome: parte && parte.nome ? String(parte.nome) : '',
            malha: ponto.malha ? String(ponto.malha) : '',
            faces: faces,
            traco: traco,
        };
    }).filter(ponto => ponto);
};

export const urlSegura = url => (
    typeof url === 'string'
        ? url.replace(/^http:\/\/(anatome-api\.onrender\.com)/i, 'https://$1')
        : url
);

export const origemDaUrl = url => {
    const match = String(urlSegura(url) || '').match(/^(https?:\/\/[^/]+)/i);
    return match ? match[1] + '/' : 'https://localhost/';
};
