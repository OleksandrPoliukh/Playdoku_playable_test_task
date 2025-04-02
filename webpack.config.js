import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import HtmlInlineScriptPlugin from "html-inline-script-webpack-plugin";

export default (env, argv) => {
    const isProduction = argv.mode === "production";

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    let plugins = [];

    const createHtmlPlugins = (versions) => {
        return versions.map((version) => {
            let inlineAssets = true;

            return new HtmlWebpackPlugin({
                template: "./index.html",
                filename: `${version}.html`,
                inject: "body",
                title: version,
                templateParameters: {
                    version: version,
                },
            });
        });
    };

    const versions = ["Applovin", "UnityAds", "Mintegral", "Google", "Moloco"];

    if (isProduction) {
        plugins.push(
            new CleanWebpackPlugin(),
            ...createHtmlPlugins(versions),
            new HtmlInlineScriptPlugin({})
        );
    } else {
        plugins.push(
            new HtmlWebpackPlugin({
                template: "./index.html",
                inject: "body",
            })
        );
    }

    return {
        mode: isProduction ? "production" : "development",
        entry: "./src/main.ts",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "bundle.js",
            publicPath: "/",
            assetModuleFilename: "assets/[name][ext]",
        },
        resolve: {
            extensions: [".ts", ".js"],
        },

        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(js|ts)$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset/inline",
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: "asset/inline",
                },
                {
                    test: /\.(mp3|wav|ogg)$/i,
                    type: "asset/inline",
                },
                {
                    test: /\.json$/,
                    type: "asset/inline",
                },
            ],
        },
        plugins: plugins,
        optimization: isProduction
            ? {
                  minimize: true,
                  minimizer: [
                      new TerserPlugin({
                          terserOptions: {
                              format: {
                                  comments: false,
                              },
                          },
                          extractComments: false,
                      }),
                  ],
              }
            : {},
        devServer: {
            client: {
                overlay: false,
            },
            hot: !isProduction,
        },
    };
};
