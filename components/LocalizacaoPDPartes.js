import Badge from 'antd-mobile-rn/lib/badge';
import React from 'react';
import { Dimensions, Image, Text, View } from 'react-native';

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
                <View accessible={true}>
                    <Image
                        style={{
                            width: windowWidth - 30,
                            height: windowWidth - 30,
                            resizeMode: 'stretch',
                            position: 'relative',
                        }}
                        source={{ uri: image.url }}
                    />
                    {image.pontos.map((point, idxPonto) =>
                        <Badge
                            onStartShouldSetResponder={onClickParte(point.label)} text={exibirLabel ? point.label : "  "}
                            style={{ top: point.y + "%", left: point.x + "%", position: 'absolute' }}>
                        </Badge>
                    )}
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