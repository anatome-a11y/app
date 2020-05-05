import React, { Component } from 'react';

import { View, Text } from 'react-native';

import Flex from 'antd-mobile-rn/lib/flex';
import Tag from 'antd-mobile-rn/lib/tag';
import { withI18n } from '../messages/withI18n';


const Placar = ({ count, total, tentativas, _maxTentativa, timer, i18n }) => (
    <View accessible={true}>
        <Flex>
            <View accessibilityLabel={`Etapa ${count + 1} de ${total}.`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>{i18n('common.step')}</Text>
                <Tag><Text>{`${count + 1}/${total}`}</Text></Tag>
            </View>
            <View accessibilityLabel={`Tentativa ${tentativas + 1} de ${_maxTentativa}.`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>{i18n('common.attempts')}</Text>
                <Tag><Text>{tentativas}/{_maxTentativa}</Text></Tag>
            </View>
            <View accessibilityLabel={`Tempo restante ${timer} segundos`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>{i18n('common.time')}</Text>
                <Tag><Text>{timer}</Text></Tag>
            </View>
        </Flex>
    </View>
)

export default withI18n(Placar);