
import React, { Component } from 'react';

import {  Text } from 'react-native';
import Card from 'antd-mobile-rn/lib/card';


const Instrucoes = ({ info }) => (
    <Card accessible={true} style={{ marginBottom: 10 }}>
        <Card.Header title='Instruções' />
        <Card.Body>
            {info.map((i, idx) => (
                <Text accessible accessibilityLabel={`Item ${idx+1}. ${i}`} key={idx} style={{ paddingLeft: 15, paddingRight: 15, paddingTop: 5, paddingBottom: 5, fontSize: 15 }}>
                    {i}
                </Text>
            ))}
        </Card.Body>
    </Card>
)

export default Instrucoes