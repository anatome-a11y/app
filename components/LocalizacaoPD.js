import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import MidiaPeca from './pecaDigital/MidiaPeca';

const windowWidth = Dimensions.get('window').width;
const cacheMidias = new WeakMap();

const idDe = valor => (valor && typeof valor === 'object' ? valor._id : valor);

const midiasDaParte = (peca, parteId) => {
    if (!peca || !peca.midias) {
        return [];
    }
    let cache = cacheMidias.get(peca);
    if (!cache) {
        cache = {};
        cacheMidias.set(peca, cache);
    }
    const chave = String(parteId);
    if (cache[chave]) {
        return cache[chave];
    }
    const midias = [];
    peca.midias.forEach(image => {
        const pontos = (image.pontos || []).filter(ponto => String(idDe(ponto && ponto.parte)) === chave);
        if (pontos.length) {
            midias.push(Object.assign({}, image, { pontos: pontos }));
        }
    });
    cache[chave] = midias;
    return midias;
};

const LocalizacaoPD = ({ parte, pecasFisicas = [], exibirLabel = true, mapa }) => {
    let alvo = parte;
    if (mapa && parte) {
        const mapaParte = mapa.find(m => m.parte && m.parte._id == parte._id);
        if (mapaParte && mapaParte.localizacao && mapaParte.localizacao[0]
            && mapaParte.localizacao[0].referenciaRelativa
            && mapaParte.localizacao[0].referenciaRelativa.referencia != null) {
            alvo = mapaParte.localizacao[0].referenciaRelativa.referencia;
        }
    }

    const alvoId = idDe(alvo);
    const lista = Array.isArray(pecasFisicas)
        ? pecasFisicas
        : Object.keys(pecasFisicas).map(key => pecasFisicas[key]);
    const blocos = [];

    lista.forEach(peca => {
        midiasDaParte(peca, alvoId).forEach((image, idx) => {
            blocos.push(
                <View key={(image._id || (peca && peca._id) || 'peca') + '-' + idx}>
                    <MidiaPeca midia={image} exibirLabel={exibirLabel} largura={windowWidth - 30} />
                    {image.vista &&
                        <Text style={{ marginBottom: 8, marginLeft: 8 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Vista: </Text>{"\n"}
                            <Text style={{ fontSize: 10 }}>{image.vista}</Text>
                        </Text>
                    }
                    {image.referencia &&
                        <Text style={{ marginBottom: 8, marginLeft: 8 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Referência: </Text>{"\n"}
                            <Text style={{ fontSize: 10 }}>{image.referencia}</Text>
                        </Text>
                    }
                </View>
            );
        });
    });

    return blocos;
};

export default LocalizacaoPD;
