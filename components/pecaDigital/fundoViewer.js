const FUNDOS = [
    { id: 'white', label: 'Branco', color: '#ffffff' },
    { id: 'gray', label: 'Cinza', color: '#8e8e8e' },
    { id: 'dark', label: 'Escuro', color: '#2c2c2c' },
    { id: 'slate', label: 'Azul-ardósia', color: '#4a6274' },
];

const PADRAO = 'gray';
let atual = PADRAO;
const ouvintes = [];

const porId = id => FUNDOS.filter(item => item.id === id)[0] || FUNDOS.filter(item => item.id === PADRAO)[0];

export const fundosViewer = FUNDOS;

export const fundoViewerAtual = () => porId(atual);

export const definirFundoViewer = id => {
    if (!FUNDOS.some(item => item.id === id) || id === atual) {
        return;
    }
    atual = id;
    const fundo = porId(atual);
    ouvintes.forEach(ouvinte => ouvinte(fundo));
};

export const ouvirFundoViewer = ouvinte => {
    ouvintes.push(ouvinte);
    return () => {
        const indice = ouvintes.indexOf(ouvinte);
        if (indice !== -1) {
            ouvintes.splice(indice, 1);
        }
    };
};
