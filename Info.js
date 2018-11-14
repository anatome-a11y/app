import React, { Component } from 'react';

import { View, Text, StyleSheet, Image } from 'react-native';
import Container from './Container';

import List from 'antd-mobile-rn/lib/list';
import Card from 'antd-mobile-rn/lib/card';
const ListItem = List.Item;

const Sig = ({value}) => (
    <Text style={styles.listItem}>{value}</Text>
)

const Name = ({children}) => (
    <Text style={styles.listItemTitle}>{children}</Text>
)

class Info extends Component {
    render() {
        const { navigation, screenProps } = this.props;
        const {anatomp} = screenProps;

        const dados = anatomp ? [
            {label: 'Nome', value: anatomp.roteiro.nome},
            {label: 'Curso', value: anatomp.roteiro.curso},
            {label: 'Disciplina', value: anatomp.roteiro.disciplina},
            {label: 'Intituição', value: anatomp.instituicao},
            {label: 'Propósito', value: anatomp.roteiro.proposito ? anatomp.roteiro.proposito : 'Não informado'},
        ] : []

        const generalidades = anatomp ? [
            ...anatomp.generalidades,
            ...anatomp.roteiro.generalidades
        ] : []

        return (
            <Container navigation={navigation}>
                    <List style={{marginBottom: 10}} renderHeader={() => 'Peças físicas do roteiro'}>
                        {anatomp ? anatomp.pecasFisicas.map(p => (
                            <ListItem wrap multipleLine key={p._id}><Name>{p.nome}</Name><Sig value={p.descricao ? p.descricao : 'Nenhuma descrição'} /></ListItem>
                        )) : <ListItem wrap multipleLine><Text>Selecione um roteiro para visualizar as informações das peças físicas</Text></ListItem>}
                    </List>                
                    <List style={{marginBottom: 10}} renderHeader={() => 'Informações sobre o roteiro'}>
                            {anatomp ? dados.map(d => <ListItem key={d.label} wrap multipleLine><Name>{d.label}</Name><Sig value={d.value} /></ListItem>) : <ListItem wrap multipleLine><Text>Selecione um roteiro para visualizar suas informações</Text></ListItem>}
                    </List> 
                    <List style={{marginBottom: 10}} renderHeader={() => 'Generalidades'}>
                            {generalidades.length > 0 ? generalidades.map(g => <ListItem key={g._id} wrap multipleLine>
                            <Text style={styles.listItem}>{g.texto}</Text>
                            <Image
                                resizeMode="stretch"
                                source={{uri: 'http://imgs.steps.dragoart.com/how-to-draw-a-pony-step-7_1_000000053055_5.jpg'}}
                                style={styles.canvas} />                            
                            </ListItem>) : <ListItem wrap multipleLine><Text>Selecione um roteiro para visualizar suas generalidades</Text></ListItem>}
                    </List>                                
                <List style={{marginBottom: 10}} renderHeader={() => 'Lista de siglas da Anatomia'}>
                    <ListItem><Name>A.  <Sig value="Artéria" /></Name></ListItem>
                    <ListItem><Name>Aa.  <Sig value="Artérias" /></Name></ListItem>
                    <ListItem><Name>Art.  <Sig value="Articulação" /></Name></ListItem>
                    <ListItem><Name>Artt.  <Sig value="Articulações" /></Name></ListItem>
                    <ListItem><Name>B.  <Sig value="Bolsa" /></Name></ListItem>
                    <ListItem><Name>Bb.  <Sig value="Bolsas" /></Name></ListItem>
                    <ListItem><Name>For.  <Sig value="Forame" /></Name></ListItem>
                    <ListItem><Name>Forr.  <Sig value="Forames" /></Name></ListItem>
                    <ListItem><Name>Ggl.  <Sig value="Gânglio" /></Name></ListItem>
                    <ListItem><Name>Ggll.  <Sig value="Gânglios" /></Name></ListItem>
                    <ListItem><Name>Gl.  <Sig value="Glândula" /></Name></ListItem>
                    <ListItem><Name>Gll.  <Sig value="Glândulas" /></Name></ListItem>
                    <ListItem><Name>N.  <Sig value="Nervo" /></Name></ListItem>
                    <ListItem><Name>Nn.  <Sig value="Nervos" /></Name></ListItem>
                    <ListItem><Name>Sut.  <Sig value="Sutura" /></Name></ListItem>
                    <ListItem><Name>Sutt.  <Sig value="Suturas" /></Name></ListItem>
                    <ListItem><Name>Lig.  <Sig value="Ligamento" /></Name></ListItem>
                    <ListItem><Name>Ligg.  <Sig value="Ligamentos" /></Name></ListItem>
                    <ListItem><Name>Ln.  <Sig value="Linfonodo" /></Name></ListItem>
                    <ListItem><Name>Lnn.  <Sig value="Linfonodos" /></Name></ListItem>
                    <ListItem><Name>M.  <Sig value="Músculo" /></Name></ListItem>
                    <ListItem><Name>Mm.  <Sig value="Músculos" /></Name></ListItem>
                    <ListItem><Name>V.  <Sig value="Veia" /></Name></ListItem>
                    <ListItem><Name>Vv.  <Sig value="Veias" /></Name></ListItem>
                    <ListItem><Name>R.  <Sig value="Ramo" /></Name></ListItem>
                    <ListItem><Name>Rr.  <Sig value="Ramos" /></Name></ListItem>
                    <ListItem><Name>Rec.  <Sig value="Recesso" /></Name></ListItem>
                    <ListItem><Name>Recc.  <Sig value="Recessos" /></Name></ListItem>
                    <ListItem><Name>Reg.  <Sig value="Região" /></Name></ListItem>
                    <ListItem><Name>Regg.  <Sig value="Regiões" /></Name></ListItem>
                    <ListItem><Name>Tuberc.  <Sig value="Tubérculo" /></Name></ListItem>
                    <ListItem><Name>Tubercc.  <Sig value="Tubérculos" /></Name></ListItem>
                    <ListItem><Name>Tuberos.  <Sig value="Tuberosidade(s)" /></Name></ListItem>
                    <ListItem><Name>Proc.  <Sig value="Processo" /></Name></ListItem>
                    <ListItem><Name>Procc.  <Sig value="Processos" /></Name></ListItem>
                    <ListItem><Name>Vag.  <Sig value="Vagina (“bainha”)" /></Name></ListItem>
                    <ListItem><Name>Vagg.  <Sig value="Vaginas (“bainhas”)" /></Name></ListItem>
                </List>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    listItemTitle: {
      fontWeight: 'bold',
      fontSize: 15,
    },
    listItem: {
        fontWeight: "200",
    },
    canvas: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      },        
  });

export default Info;


