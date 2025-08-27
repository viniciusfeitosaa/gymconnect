module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Desabilitar regras que podem causar problemas em produção
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    // Permitir warnings sem falhar o build
    'react/no-unescaped-entities': 'warn',
    'react/display-name': 'warn'
  },
  // Configurações para ambiente de produção
  env: {
    production: true,
    browser: true,
    es6: true
  }
};
