import ptBR from './pt_br'
import en from './en'

export function flattenMessages(nestedMessages, prefix = '') {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    let value = nestedMessages[key]
    let prefixedKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      messages[prefixedKey] = value
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey))
    }
    return messages
  }, {})
}

export const messages =  {
    'pt-BR': ptBR,
    'en': en
  }