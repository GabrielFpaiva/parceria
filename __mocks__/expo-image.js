// Existe por um gap do jest-expo@57.0.3: o mock nativo de ExpoObserve não implementa
// getIntegrations(), que o expo-image@57.0.2 chama no import (src/observe.ts:159).
// Sem isso, toda suíte que importa expo-image quebra ao carregar.
// REMOVER quando o jest-expo corrigir o mock — e conferir se o Avatar ainda passa.
const React = require('react');
const { Image: RNImage } = require('react-native');

function Image(props) {
  return React.createElement(RNImage, props);
}

module.exports = { Image, ImageBackground: Image };
