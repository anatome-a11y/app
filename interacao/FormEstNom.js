import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TextInput } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Input from '../components/Input'
import Option from '../components/Option'


const ListItem = List.Item;


class FormEstNom extends Component {
    timer = null;
    fieldRef = []

    state = {
        pecasFisicas: {},
        pecaFisica: '',
        loading: true,
        parte: undefined,
        value: '',
        conteudos: []
    }

    componentDidMount() {
        const { anatomp } = this.props.screenProps;

        Toast.loading('Aguarde...', 0)
        announceForAccessibility('Aguarde...')

        //Objeto de indexação
        let pecasFisicas = {};
        anatomp.pecasFisicas.forEach(pf => {
            pecasFisicas[pf._id] = { ...pf, partesNumeradas: [] };
        })

        //Seta as partes e seus numeros para cada peça física
        anatomp.mapa.forEach(mapa => {
            mapa.localizacao.map(loc => pecasFisicas[loc.pecaFisica._id].partesNumeradas.push({ parte: mapa.parte, numero: loc.numero }));
        })

        this.setState({ loading: false, pecasFisicas, pecaFisica: Object.keys(pecasFisicas)[0] }, () => {
            Toast.hide();
        })

    }

    render() {
        const { navigation, screenProps, isTeoria } = this.props;
        const { value, pecasFisicas, pecaFisica, parte, conteudos } = this.state;

        return (
            <Container navigation={navigation}>
                <List renderHeader={() => 'Peças físicas'}>
                    {
                        Object.keys(pecasFisicas).map(key => {
                            const pf = pecasFisicas[key];
                            return (
                                <ListItem key={pf._id}>
                                    <Option
                                        checked={pecaFisica == pf._id}
                                        onChange={this.onSelectPF(pf._id)}
                                    >
                                        {pf.nome}
                                    </Option>
                                </ListItem>
                            )
                        })
                    }
                </List>
                <List renderHeader={() => 'Parte anatômica'}>
                    <ListItem>
                        <Input
                            isTag
                            _ref={this.onGetRef}
                            value={value}
                            onChange={this.onChange}
                            name='Parte'
                            onDone={this.onSubmit}
                            InputProps={{
                                type: 'number',
                                error: parte == undefined && value != '',
                                onErrorClick: this.onErrorClick,
                            }}
                        />
                    </ListItem>
                    {parte != undefined && (
                        <ListItem>
                            <Text>Nome: {parte.parte.nome}</Text>
                        </ListItem>
                    )}
                </List>

                {isTeoria && <List renderHeader={() => 'Informações da parte'}>
                    {
                        conteudos.length == 0 ? (
                            <ListItem key='emptyList'>
                                <Text>Nenhum conteúdo foi encontrado</Text>
                            </ListItem>
                        ) : (conteudos.map(c => (
                            <ListItem key={c}>
                                <Text>{c}</Text>
                            </ListItem>                            
                        )))
                    }
                </List>}
            </Container>
        )
    }


    onErrorClick = () => { Toast.info('Parte não registrada'); announceForAccessibility('Parte não registrada') }



    onChange = value => {
        const { pecasFisicas, pecaFisica } = this.state;
        const parte = pecasFisicas[pecaFisica].partesNumeradas.find(p => p.numero == value);
        const conteudos = (parte == undefined || !this.props.isTeoria) ? [] : this.props.screenProps.anatomp.roteiro.conteudos.filter(c => c.partes.find(p => p._id == parte.parte._id)).map(c => c.singular)
        this.setState({ value, parte, conteudos })
    }

    onSelectPF = pecaFisica => e => this.setState({ pecaFisica })

    onGetRef = r => { this.fieldRef = r }
}

export default FormEstNom;