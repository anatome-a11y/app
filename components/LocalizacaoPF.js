import React, { Component } from 'react';

import { View, Text } from 'react-native';

const LocalizacaoPF = ({ parte, pecasFisicas }) => {
    if (parte == undefined) {
        return null;
    } else {
        return Object.keys(pecasFisicas).map(key => {
            const pf = pecasFisicas[key];
            const localizacao = pf.locFlat.find(m => m.parte._id == parte._id && m.referenciaRelativa.referencia == null);
            if (localizacao != undefined) {
                return (
                    <Text key={localizacao._id} style={{ marginBottom: 8 }}>
                        <Text style={{ fontWeight: 'bold' }}>{localizacao.parte.nome}: </Text>
                        <Text>Parte {localizacao.numero} na peça</Text>
                        <Text style={{ fontWeight: 'bold' }}> {pf.nome}</Text>
                    </Text>
                )                
            } else {
                return null;
            }
        })
    }
}

export default LocalizacaoPF