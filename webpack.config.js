// webpack.config.js 
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { DefinePlugin } = require('webpack');

const PATH_INIT = path.join(__dirname, './src');
const PATH_DIST = path.join(__dirname, './dist');

var config = {
	entry: [
		path.join(PATH_INIT, './index.js')
	],
	output: {
		path: PATH_DIST,
		filename: 'bundle.js'
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin()
	],

}

module.exports = (env, argv) => {

	config.module = {
		rules: [
			{ test: /\.(png|jpe?g|gif)$/i, loader: 'file-loader' },
			{
				test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
				loader: 'file-loader',
				options: {
					//outputPath: 'fonts',
					publicPath: `dist`,
					// name(file){
					// 	if(argv.mode === 'development'){
					// 		return '[path].[name].[ext]';
					// 	}
					// 	return '[contenthash].[ext]'
					// }
				},
			},
			{ test: /\.css$/, use: ['style-loader', 'css-loader'] },
			{ test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] },
			{ test: /\.js$/, exclude: "/node_modules/", use: [{ loader: 'babel-loader' }] },
		]
	};

	if (argv.mode === 'development') {
		config.devtool = 'source-map';
		config.mode = 'development';
		config.devServer = {
			publicPath: '/dist/',
		}
		config.plugins = [
			new DefinePlugin({
				'process.env': {
					'NODE_ENV': JSON.stringify('development'),
				}
			}),
		]
	}

	if (argv.mode === 'production') {
		//...
		config.plugins = [
			new DefinePlugin({
				'process.env': {
					'NODE_ENV': JSON.stringify('production'),
				}
			}),
		]
	}

	return config;
}
