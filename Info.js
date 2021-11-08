import React, { Component } from 'react';

import { View, Text, StyleSheet, Image } from 'react-native';
import Container from './Container';

import Videos from './components/Videos'
import Imagens from './components/Imagens'
import BC from './components/Breadcrumbs'

import List from 'antd-mobile-rn/lib/list';
import { announceForAccessibility, focusOnView } from 'react-native-accessibility';


const ListItem = List.Item;

const siglas = [
    ['a.', 'A', 'Artéria'],
    ['aa.', 'AA', 'Artérias'],
    ['art.', 'ART', 'Articulação'],
    ['artt.', 'ARTT', 'Articulações'],
    ['B.', 'B', 'Bolsa'],
    ['Bb.', 'BB', 'Bolsas'],
    ['For.', 'FOR', 'Forame'],
    ['Forr.', 'FORR', 'Forames'],
    ['Ggl.', 'GGL', 'Gânglio'],
    ['Ggll.', 'GGLL', 'Gânglios'],
    ['Gl.', 'GL', 'Glândula'],
    ['Gll.', 'GLL', 'Glândulas'],
    ['N.', 'N', 'Nervo'],
    ['Nn.', 'NN', 'Nervos'],
    ['Sut.', 'SUT', 'Sutura'],
    ['Sutt.', 'SUTT', 'Suturas'],
    ['Lig.', 'LIG', 'Ligamento'],
    ['Ligg.', 'LIGG', 'Ligamentos'],
    ['Ln.', 'LN', 'Linfonodo'],
    ['Lnn.', 'LNN', 'Linfonodos'],
    ['M.', 'M', 'Músculo'],
    ['Mm.', 'MM', 'Músculos'],
    ['V.', 'V', 'Veia'],
    ['Vv.', 'VV', 'Veias'],
    ['R.', 'R', 'Ramo'],
    ['Rr.', 'RR', 'Ramos'],
    ['Rec.', 'REC', 'Recesso'],
    ['Recc.', 'RECC', 'Recessos'],
    ['Reg.', 'REG', 'Região'],
    ['Regg.', 'REGG', 'Regiões'],
    ['Tuberc.', 'TUBERC', 'Tubérculo'],
    ['Tubercc.', 'TUBERCC', 'Tubérculos'],
    ['Tuberos.', 'TUBEROS', 'Tuberosidade(s)'],
    ['Proc.', 'PROC', 'Processo'],
    ['Procc.', 'PROCC', 'Processos'],
    ['Vag.', 'VAG', 'Vagina (“bainha”)'],
    ['Vagg.', 'VAGG', 'Vaginas (“bainhas”)'],
]

const Sig = ({ value, acc = 'Descrição:' }) => (
    <Text accessibilityLabel={`${acc} ${value}`} style={styles.listItem}>{value}</Text>
)

const Name = ({ children }) => (
    <Text style={styles.listItemTitle}>{children}</Text>
)

class Info extends Component {

    initialFocus = null;

    componentDidMount() {
        setTimeout(() => {
            focusOnView(this.initialFocus)
        }, 500)
    }


    render() {
        const { navigation, screenProps } = this.props;
        const { anatomp, config } = screenProps;

        const dados = anatomp ? [
            { label: 'Nome', value: anatomp.roteiro.nome },
            { label: 'Curso', value: anatomp.roteiro.curso },
            { label: 'Disciplina', value: anatomp.roteiro.disciplina },
            { label: 'Intituição', value: anatomp.instituicao },
        ] : []


        const sizePF = anatomp ? anatomp.pecasFisicas.length : 1;

        return (
            <Container navigation={navigation}>
                <BC _ref={r => this.initialFocus = r} body={[]} head={'Informações'} acc='Prossiga para ouvir as informações do roteiro' />
                {anatomp && <List style={{ marginBottom: 10 }} renderHeader={() => 'Peças físicas do roteiro'} accessibilityLabel={`Peças físicas do roteiro. Lista com ${sizePF} itens. Prossiga para ouvir`}>
                    {anatomp ? anatomp.pecasFisicas.map(p => (
                        <ListItem wrap multipleLine key={p._id}><Name>{p.nome}</Name><Sig value={p.descricao ? p.descricao : 'Nenhuma descrição'} /></ListItem>
                    )) : <ListItem wrap multipleLine><Text>Este roteiro não possui peça física</Text></ListItem>}
                </List>}
                {anatomp && <List style={{ marginBottom: 10 }} renderHeader={() => 'Orientações de estudo'} accessibilityLabel={`Orientações de estudo. Lista com ${anatomp.generalidades.length} itens. Prossiga para ouvir`}>
                    {anatomp.generalidades.length > 0 ? anatomp.generalidades.map(g => <ListItem key={g._id} wrap multipleLine>
                        <Text style={styles.listItem}>{g.texto}</Text>
                        <Imagens config={config} midias={g.midias} />
                        <Videos config={config} midias={g.midias} />
                    </ListItem>) : <ListItem wrap multipleLine><Text>Este roteiro não possui orientações de estudo</Text></ListItem>}
                </List>}
                {anatomp && anatomp.roteiro.pecasGenericas.map(pecaGenerica => {
                    return (
                        <List key={pecaGenerica._id} style={{ marginBottom: 10 }} renderHeader={() => `Generalidades da peça ${pecaGenerica.nome}`} accessibilityLabel={`Generalidades da peça ${pecaGenerica.nome}. Lista com ${pecaGenerica.generalidades.length} itens. Prossiga para ouvir`}>
                            {pecaGenerica.generalidades.length > 0 ? pecaGenerica.generalidades.map(g => <ListItem key={g._id} wrap multipleLine>
                                <Text style={styles.listItem}>{g.texto}</Text>
                                <Imagens config={config} midias={g.midias} />
                                <Videos config={config} midias={g.midias} />
                            </ListItem>) : <ListItem wrap multipleLine><Text>Este roteiro não possui orientações de estudo</Text></ListItem>}
                        </List>
                    )
                })}
                {anatomp && <List style={{ marginBottom: 10 }} renderHeader={() => 'Generalidades do roteiro'} accessibilityLabel={`Orientações de estudo. Lista com ${anatomp.roteiro.generalidades.length} itens. Prossiga para ouvir`}>
                    {anatomp.roteiro.generalidades.length > 0 ? anatomp.roteiro.generalidades.map(g => <ListItem key={g._id} wrap multipleLine>
                        <Text style={styles.listItem}>{g.texto}</Text>
                        <Imagens config={config} midias={g.midias} />
                        <Videos config={config} midias={g.midias} />
                    </ListItem>) : <ListItem wrap multipleLine><Text>Este roteiro não possui generalidades</Text></ListItem>}
                </List>}
                {anatomp && <List style={{ marginBottom: 10 }} renderHeader={() => 'Informações sobre o roteiro'} accessibilityLabel={`Informações sobre o roteiro. Lista com ${dados.length} itens. Prossiga para ouvir`}>
                    {anatomp ? dados.map(d => <ListItem key={d.label} wrap multipleLine><Name>{d.label}</Name><Sig acc={''} value={d.value} /></ListItem>) : <ListItem wrap multipleLine><Text>Selecione um roteiro para obter suas informações</Text></ListItem>}
                </List>}
                <List style={{ marginBottom: 10 }} renderHeader={() => 'Siglas da Anatomia'} accessibilityLabel={`Siglas da Anatomia. Lista com 33 itens. Prossiga para ouvir`}>
                    {siglas.map(([a, b, c]) => <ListItem key={a} accessibilityLabel={`${b} ${c}`} accessible><Name>{a}  <Sig value={c} /></Name></ListItem>)}
                </List>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    listItemTitle: {
        fontWeight: 'bold',
        fontSize: 15,
        textAlign: 'justify'
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


