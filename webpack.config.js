/**
 * Requiring Dependencies
 */
// const path               = require('path');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
const Webpack            = require('webpack');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');


/**
 * Plugins
 */
// const isProd               = process.env.NODE_ENV === 'production ';
// const cleanPlugin          = new CleanWebpackPlugin(['build']);
// const webpackProvidePlugin = new Webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery' });
// const uglifyPlugin         = new Webpack.optimize.UglifyJsPlugin({ /*eslint-disable-line*/compress: { warnings: false } });
// const hotModuleReplacement = new Webpack.HotModuleReplacementPlugin();
// const namedModulesPlugin   = new Webpack.NamedModulesPlugin();
// const cssProd              = extractCss.extract({ fallback: 'style-loader', use: ['css-loader', 'postcss-loader', 'sass-loader'], publicPath: '/build' });
// const cssConfig            = isProd ? cssProd : cssDev;


/**
 * Loaders
 */
// const linterLoader = {
// 	enforce: 'pre',
// 	test: /\.js$/,
// 	exclude: /node_modules/,
// 	loader: 'eslint-loader',
// };
const scriptLoader = {
	test: /\.js$/,
	use: [
		{
			loader: 'babel-loader',
			options: {
				presets: ['es2015']
			}
		}
	]
};
const styleLoader = {
	test: /\.scss$/,
	use: ['style-loader', 'css-loader', 'sass-loader']
};



/**
 * Configuration Webpack
 */
const config = {
	entry: {
		app: './public/scripts/script.js' // this is for where webpack start the journey
	},
	output: {
		filename: './public/build/app.js'
	},
	module: {
		rules: [
			scriptLoader,
			styleLoader
		]
	}, 
	externals: {
		// require("jquery") is external and available
		//  on the global var jQuery
		'jquery': 'jQuery',
		'google': 'google'
	},
	plugins: [
		new ExtractTextPlugin({
			filename: './public/build/style.css'
		})
	]
};


/**
 * Exporting the Configuration object
 */
module.exports = config;