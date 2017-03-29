module.exports = {
    entry: './src/app.js',
    output: {
        path: './bin',
        filename: 'app.bundle.js'
    },
    resolve: {
      alias: {
        //views
        'vw_main': './src/views/vw_main.js',
        //models

        //collections
      }
    }
};
