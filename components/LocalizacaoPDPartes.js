import Badge from 'antd-mobile-rn/lib/badge';
import React from 'react';
import { Image, View } from 'react-native';


const LocalizacaoPDPartes = ({ parte, pecasFisicas = [], exibirLabel = true, onClickParte }) => {

    let pecasFisicasFiltradas = [];
    Object.keys(pecasFisicas).map(key => {

        let peca = JSON.parse(JSON.stringify(pecasFisicas[key]));

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

    });

    pecasFisicasFiltradas = pecasFisicasFiltradas.filter(p => p.midias.length > 0);

    return pecasFisicasFiltradas.map(peca => peca.midias.map((image, idx) =>
        <View accessible={true}>
            <Image
                style={{
                    width: 400,
                    height: 400,
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
        </View>
    ))
}

export default LocalizacaoPDPartes