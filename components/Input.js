
import React, { Component } from 'react';
import withAppContext from './AppContextHOC'

import { View, Text, Keyboard } from 'react-native';
import List from 'antd-mobile-rn/lib/list';
import Icon from 'antd-mobile-rn/lib/icon';
import Button from 'antd-mobile-rn/lib/button';
import InputItem from 'antd-mobile-rn/lib/input-item';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
const ListItem = List.Item

class Input extends React.Component {

    state = {
        voiceWords: []
    }

    render() {
        const { config, onReadNFC, onStopNFC, onStartListen, onStopListen, ...specificProps } = this.props;
        const { _ref, value, onChange, InputProps, name, isTag, onDone } = specificProps;

        return (isTag && config.indexOf('nfc') != -1) ? (
            <View style={{ marginBottom: 10 }}>
                <Button
                    ref={_ref}
                    accessibilityLabel={`${name}. Botão. Toque duas vezes, Mantenha pressionado e aproxime de uma etiqueta de RF aidí`}
                    style={{ flex: 1, margin: 5, display: 'flex', alignItems: 'center' }}
                    onPressIn={onReadNFC(onChange)}
                    onPressOut={() => { onStopNFC(); onDone() }}
                >
                    <Icon type={'\ue6d2'} style={{ color: '#fff' }} /> {name}
                </Button>
                <Text style={{ flex: 1, margin: 5, fontSize: 15 }} >Valor Lido: <Text style={{ color: '#108ee9' }}>{value ? value : 'Nenhum'}</Text></Text>
            </View>
        ) : (
                (config.indexOf('voz') != -1 || config.indexOf('talkback') != -1) ? (
                    <View style={{ marginBottom: 10 }}>
                        <Button
                            ref={_ref}
                            accessibilityLabel={`${name}. Botão. Toque duas vezes, Mantenha pressionado e fale após o sinal`}
                            style={{ flex: 1, margin: 5 }}
                            onPressIn={onStartListen(this.onChange, isTag)}
                            onPressOut={onStopListen}>
                            <Icon type={'\ue677'} style={{ color: '#fff' }} />{name}
                        </Button>
                        {/* <Button type='ghost' style={{ flex: 1, margin: 5 }} onPressOut={() => onChange('')}>Limpar detecção</Button> */}
                        <Text style={{ fontSize: 15, margin: 5, flex: 1 }} >Texto detectado: <Text style={{ color: '#108ee9' }}>{value ? value : 'Nenhum'}</Text></Text>
                        {this.state.voiceWords.length > 0 && value ? <View style={{ flex: 1, margin: 5, flexWrap: 'wrap', alignItems: 'flex-start', flexDirection: 'row' }}>
                            {config.indexOf('talkback') == -1 ? <Text>Alternativas: </Text> : <Button accessibilityLabel={`Detecções alternativas. Botão. Toque duas vezes para pular ou prossiga para ouvi-las.`} onPressOut={this.props.onSkipAlternatives} size='small' type='primary' style={{ marginRight: 3 }}>Alternativas</Button>}                            
                            {this.state.voiceWords.map(v => <Button accessibilityLabel={`Texto alternativo. ${v}. Botão. Toque duas vezes para substituir o texto detectado`} onPressOut={() => {this.props.onChange(v); announceForAccessibility(`Novo texto detectado: ${v}`)}} key={v} size='small' type='ghost' style={{ marginRight: 3 }}>{v}</Button>)}
                        </View> : null}
                    </View>
                ) : (
                        <InputItem
                            ref={_ref}
                            value={value}
                            onChange={onChange}
                            placeholder={name}
                            clear={config.indexOf('talkback') ==  -1}
                            onSubmitEditing={onDone}
                            {...InputProps}
                        />
                    )
            )
    }

    onChange = val => {
        if (Array.isArray(val)) {
            this.props.onChange(val[0])
            this.setState({ voiceWords: val })
        } else {
            this.setState({ voiceWords: [] })
            this.props.onChange(val)
        }
    }
}

Input.defaultProps = {
    onDone: () => { }
}


export default withAppContext(Input)