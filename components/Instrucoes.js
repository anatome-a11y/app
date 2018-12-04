
import React, { Component } from 'react';

import {  Text } from 'react-native';
import Card from 'antd-mobile-rn/lib/card';

const style = { paddingLeft: 15, paddingRight: 15, paddingTop: 5, paddingBottom: 5, fontSize: 15 };

const Instrucoes = ({ info, voz }) => (
    <Card accessible={true} style={{ marginBottom: 10 }}>
        <Card.Header title='Instruções' />
        <Card.Body>
            {info.map((i, idx) => (
                <Text accessible accessibilityLabel={`Item ${idx+1}. ${i}`} key={idx} style={style}>
                    {i}
                </Text>
            ))}
            {voz && <Text style={style} accessible={true} accessibilityLabel={`Item ${info.length+1}. Fale: Comando limpar para limpar o texto detectado`}>Caso necessário, fale <Text style={{fontWeight: 'bold'}}>comando limpar</Text> para limpar o texto detectado.</Text>}
        </Card.Body>
    </Card>
)

export default Instrucoes