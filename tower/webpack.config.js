const path = require('path')

// Vastaa alkuperäistä komentoriviajoa (`webpack --mode production --module-bind js=babel-loader`).
// hashFunction: 'sha256' välttää webpack 4:n oletuksena käyttämän md4:n, jota Node 17+ ei enää
// tarjoa. Webpack 4 käyttää md4:ää myös kovakoodattuna sisäisesti, joten npm-skripti asettaa
// lisäksi NODE_OPTIONS=--openssl-legacy-provider (ERR_OSSL_EVP_UNSUPPORTED).
module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js',
    hashFunction: 'sha256'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
}
