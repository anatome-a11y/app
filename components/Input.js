
import React, { Component } from 'react';
import withAppContext from './AppContextHOC'

import { View, Text} from 'react-native';
import List from 'antd-mobile-rn/lib/list';
import Icon from 'antd-mobile-rn/lib/icon';
import Button from 'antd-mobile-rn/lib/button';
import InputItem from 'antd-mobile-rn/lib/input-item';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
const ListItem = List.Item

class Input extends React.Component {

    render() {
        const { config, onReadNFC, onStopNFC, onStartListen, onStopListen, ...specificProps } = this.props;
        const { _ref, value, onChange, InputProps, name, isTag, onDone } = specificProps;

        return (isTag && config.indexOf('nfc') != -1) ? (
                <View style={{ marginBottom: 10 }}>
                    <Button
                        ref={_ref}
                        accessibilityLabel={`${name}. Botão. Mantenha pressionado e aproxime de uma etiqueta de RF aidí`}
                        style={{ flex: 1, margin: 5, display: 'flex', alignItems: 'center' }}
                        onPressIn={onReadNFC(onChange)}
                        onPressOut={() => {onStopNFC(); onDone()}}
                        >
                        <Icon type={'\ue6d2'} style={{color: '#fff'}} /> {name}
                    </Button>
                    <Text style={{ flex: 1, margin: 5 }} >Valor Lido: {value ? value : 'Nenhum'}</Text>
                </View>
        ) : (
                (config.indexOf('voz') != -1) ? (
                        <View style={{ marginBottom: 10 }}>
                            <Button
                                ref={_ref}
                                accessibilityLabel={'Filtrar. Botão. Mantenha pressionado e fale após o sinal '}
                                style={{ flex: 1, margin: 5 }}
                                onPressIn={onStartListen(onChange, isTag)}
                                onPressOut={onStopListen}>
                                <Icon type={'\ue677'} style={{color: '#fff'}} />{name}
                            </Button>
                            {/* <Button type='ghost' style={{ flex: 1, margin: 5 }} onPressOut={() => onChange('')}>Limpar detecção</Button> */}
                            <Text style={{ flex: 1, margin: 5 }} >Texto detectado: {value ? value : 'Nenhum'}</Text>
                        </View>
                ) : (
                        <InputItem
                            ref={_ref}
                            value={value}
                            onChange={onChange}
                            placeholder={name}
                            onSubmitEditing={onDone}
                            {...InputProps}
                        />
                    )
            )
    }
}

Input.defaultProps = {
    onDone: () => {}
}


export default withAppContext(Input)