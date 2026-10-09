import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import MidiaPeca from './pecaDigital/MidiaPeca';

const windowWidth = Dimensions.get('window').width;


const LocalizacaoPDPartes = ({ parte, pecaFisica, pecasFisicas = [], exibirLabel = true, onClickParte }) => {

    let pecasFisicasFiltradas = [];
    Object.keys(pecasFisicas).map(key => {

        let peca = JSON.parse(JSON.stringify(pecasFisicas[key]));
        if (peca._id == pecaFisica._id) {
            pecasFisicasFiltradas.push(peca);
        }
        /*
        let pecaFiltrada = JSON.parse(JSON.stringify(pecasFisicas[key]));
        pecaFiltrada.midias = [];
        pecaFiltrada.localizacao = [];
 
        let pontos = [];
        for (let image of peca.midias) {
            let imageFiltrada = JSON.parse(JSON.stringify(image));
            pontos = image.pontos.filter(ponto => ponto.parte._id == parte._id);
            if (pontos && pontos.length > 0) {
                pecaFiltrada.midias.push(imageFiltrada);
            }
            pontos = [];
        }
        if (pecaFiltrada.midias && pecaFiltrada.midias.length > 0) {
            pecasFisicasFiltradas.push(pecaFiltrada);
        }
        */

    });

    //  pecasFisicasFiltradas = pecasFisicasFiltradas.filter(p => p.midias.length > 0);

    return (
        <View>
            {pecasFisicasFiltradas.map(peca => peca.midias.map((image, idx) =>
                <View accessible={true} key={(image._id || peca._id) + '-' + idx}>
                    <MidiaPeca
                        midia={image}
                        exibirLabel={exibirLabel}
                        largura={windowWidth - 30}
                        onSelect={onClickParte ? (label) => onClickParte(label)() : undefined}
                    />
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
            ))}
        </View>)
}

export default LocalizacaoPDPartes