//const autoprefixer = require('autoprefixer');

const imageToJavaScript = {
  test: /\.(jpe?g|gif|png|svg)$/i,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: false
      }
    }
  ]
};


module.exports = imageToJavaScript;
