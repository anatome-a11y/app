
import React, { Component, Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { withI18n } from '../messages/withI18n';


const Breadcrumbs = ({ _ref, acc = 'Prossiga para ouvir as instruções.', i18n, head, body = [] }) => {
    const _body = [...body].reverse().join(' dentro de ');
    const path = body.length ? ' dentro de '+ _body + '.' : '.';
    const msgAcc = i18n('common.youAreIn') + head + path + acc;
    return (
        <Text accessible={true} accessibilityLabel={msgAcc} ref={_ref} style={{ padding: 10, textAlign: 'justify', lineHeight: 22 }}>
            <Text style={{ fontWeight: 'bold'}}>{i18n('common.youAreIn')} </Text>
            <Text>{body.reduce((acum, item) => (acum + item + ' / '), '')}</Text>
            <Text style={{ color: '#108ee9' }}>{head}</Text>
        </Text>
    )
}

export default withI18n(Breadcrumbs);