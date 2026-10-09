import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import MidiaPeca from './pecaDigital/MidiaPeca';

const windowWidth = Dimensions.get('window').width;


const LocalizacaoPD = ({ parte, pecasFisicas = [], exibirLabel = true, mapa }) => {

    let pecasFisicasFiltradas = [];

    if (mapa) {
        const mapaParte = mapa.find(m => m.parte._id == parte._id)
        // Caso seja uma parte referenciada
        if (mapaParte && mapaParte.localizacao[0].referenciaRelativa.referencia != null) {
            parte = mapaParte.localizacao[0].referenciaRelativa.referencia;
        }
    }

    Object.keys(pecasFisicas).map(key => {

        let peca = JSON.parse(JSON.stringify(pecasFisicas[key]));

        let pecaFiltrada = JSON.parse(JSON.stringify(pecasFisicas[key]));
        pecaFiltrada.midias = [];
        pecaFiltrada.localizacao = [];

        let pontos = [];
        for (let image of peca.midias) {
            let imageFiltrada = JSON.parse(JSON.stringify(image));
            imageFiltrada.pontos = [];


            imageFiltrada.pontos = image.pontos.filter(ponto => ponto.parte._id == parte._id);
            if (imageFiltrada && imageFiltrada.pontos && imageFiltrada.pontos.length > 0) {
                pontos = pontos.concat(imageFiltrada.pontos);
            }

            imageFiltrada.pontos = pontos;
            if (imageFiltrada && imageFiltrada.pontos && imageFiltrada.pontos.length > 0) {
                pecaFiltrada.midias.push(imageFiltrada);
            }
            pontos = [];
        }
        if (pecaFiltrada.midias && pecaFiltrada.midias.length > 0) {
            pecasFisicasFiltradas.push(pecaFiltrada);
        }

    });

    pecasFisicasFiltradas = pecasFisicasFiltradas.filter(p => p.midias.length > 0);

    return pecasFisicasFiltradas.map(peca => peca.midias.map((image, idx) =>
        <View key={(image._id || peca._id) + '-' + idx}>
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
    ))
}

export default LocalizacaoPD