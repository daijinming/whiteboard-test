var path = require('path');

var config = {
    context: __dirname,
    entry: {
        main: './main'
    },
    output: {
        path: path.join(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'main.bundle.js'
    },
    //配置
    resolve: {
        alias: {
            node_modules: __dirname + '/node_modules',
        }
    }
}
module.exports = config;