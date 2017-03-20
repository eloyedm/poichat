var path = __dirname;

module.exports = {
    entry: {
    	main: "./main.js",
    },
    resolve: {
        alias: {
            'jquery': __dirname + '/node_modules/jquery/dist/jquery.js',
            'underscore': __dirname + '/node_modules/underscore/underscore.js',
            'Backbone': __dirname + '/node_modules/backbone/backbone.js',
            'socket': __dirname + '/node_modules/socket.io-client/dist/socket.io.js'
        }
    },
    output: {
        path: __dirname+"/bundles/",
        filename: "[name].bundle.js"
    }
};
