
import React, { Component, Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';


const Breadcrumbs = ({ head, body = [] }) => (
    <Text style={{ padding: 10, textAlign: 'justify', lineHeight: 25 }}>
        <Text style={{ fontWeight: 'bold'}}>Você está em: </Text>
        <Text>{body.reduce((acc, item) => (acc + item + ' / '), '')}</Text>
        <Text style={{ color: '#108ee9' }}>{head}</Text>
    </Text>
)

export default Breadcrumbs;