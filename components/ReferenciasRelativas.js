import React, { Component } from 'react';

import { View, Text } from 'react-native';



const ReferenciasRelativas = ({parte, pecasFisicas, attrName = 'locFlat', title = null}) => {
    let minQtdRef = 0

    const Itens = Object.keys(pecasFisicas).map(key => {
        const pf = pecasFisicas[key];

        //Verifica se a parte buscada tem etiqueta nesta peça física
        const locParte = pf[attrName].find(l => l.parte._id == parte._id);

        //Se a parte existe nesta peça física
        if(locParte){
            //Verifica se alguma tem etiqueta propria
            const temEtiqueta = pf[attrName].find(l => l.parte._id == parte._id && l.referenciaRelativa.referencia == null)

            //Se tem etiqueta, retorna a localização dos que ele referencia
            if(temEtiqueta){
                const referenciados = pf[attrName].filter(l => l.referenciaRelativa.referencia != null && l.referenciaRelativa.referencia._id  == parte._id);
                
                if(referenciados.length > minQtdRef){
                    minQtdRef = referenciados.length;
                }

                return referenciados.map(l => (
                    <Text key={l.parte._id} style={{marginBottom: 5, textAlign: 'justify'}}>
                        <Text style={{fontWeight: 'bold', color: '#108ee9'}}>Peça {pf.nome}: </Text>
                        <Text style={{fontWeight: 'bold'}}> {parte.nome} </Text>
                        referencia a parte
                        <Text style={{fontWeight: 'bold'}}> {l.parte.nome} </Text>
                        que está localizada {l.referenciaRelativa.referenciaParaReferenciado}
                    </Text>
                ))
            }else{
                const referencias = pf[attrName].filter(l => l.parte._id == parte._id);
                
                if(referencias.length > minQtdRef){
                    minQtdRef = referencias.length;
                }                
                
                return referencias.map(l => (
                    <Text key={l.parte._id} style={{marginBottom: 5, textAlign: 'justify'}}>
                        <Text style={{fontWeight: 'bold', color: '#108ee9'}}>Peça {pf.nome}: </Text>
                        <Text style={{fontWeight: 'bold'}}> {parte.nome} </Text>
                        é referenciada pela parte
                        <Text style={{fontWeight: 'bold'}}> {l.referenciaRelativa.referencia.nome} </Text>
                        que está localizada {l.referenciaRelativa.referenciadoParaReferencia}
                    </Text>
                ))
            }
        }else{
            return null
        }
    })

    if(title){
        if(minQtdRef > 0){
            return [title, ...Itens]
        }else{
            return null;
        }
    }else{
        return Itens;
    }    
}

export default ReferenciasRelativas