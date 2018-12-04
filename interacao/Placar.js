import React, { Component } from 'react';

import { View, Text } from 'react-native';

import Flex from 'antd-mobile-rn/lib/flex';
import Tag from 'antd-mobile-rn/lib/tag';


const Placar = ({ count, total, tentativas, _maxTentativa, timer }) => (
    <View accessible={true}>
        <Flex>
            <View accessibilityLabel={`Etapa ${count + 1} de ${total}.`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Etapa</Text>
                <Tag><Text>{`${count + 1}/${total}`}</Text></Tag>
            </View>
            <View accessibilityLabel={`Tentativa ${tentativas + 1} de ${_maxTentativa}.`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Tentativas</Text>
                <Tag><Text>{tentativas}/{_maxTentativa}</Text></Tag>
            </View>
            <View accessibilityLabel={`Tempo restante ${timer} segundos`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Tempo</Text>
                <Tag><Text>{timer}</Text></Tag>
            </View>
        </Flex>
    </View>
)

export default Placar;