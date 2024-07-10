
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
import requireTransform from 'vite-plugin-require-transform';
import mkcert from "vite-plugin-mkcert";
import legacyPlugin from '@vitejs/plugin-legacy';
import esbuild from 'rollup-plugin-esbuild';

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
const outputDir = `dist/${year}-${month}-${day}/webAppTemplate`;
import path from 'path'
const https = false;

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: "./",  
    assetsPublicPath :'./',
    build: {
      outDir: outputDir,
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, `index.html`)
        },
        output: {
          sourcemap: false,
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames({name}) {
            if (/\.(jpg|png|jpeg|gif|svg)$/.test(name)) { // 匹配资源文件后缀
              return `img/[name]-[hash].[ext]`;  // 创建media文件夹存放匹配的资源文件,name为该文件的原名，hash为哈希值，ext为文件后缀名，以[name].[hash][ext]命名规则
            } else if (/\.(css|less|sass|scss)$/.test(name)) {
              return `css/[name]-[hash].[ext]`;
            }
            return 'assets/[name]-[hash].[ext]';
          }
        }
      } 
    },
    plugins: [
      vue(),
      Components({
        resolvers: [VantResolver()],
      }),
      requireTransform({}),
      mkcert(),
      {
        ...esbuild({
            target: 'chrome70',
            include: /\.vue|.ts|.js$/,
            loaders: {
                '.vue': 'js'
            }
        }),
        enforce: 'post'
      },
      legacyPlugin({
        modernPolyfills: true,
        targets: ['ie >= 11', 'chrome <= 80'], // 需要兼容的目标列表，可以设置多个
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // 面向IE11时需要此插件
        renderLegacyChunks: true,
        polyfills: [
          'es.symbol',
          'es.array.filter',
          'es.promise',
          'es.promise.finally',
          'es/map',
          'es/set',
          'es.array.for-each',
          'es.object.define-properties',
          'es.object.define-property',
          'es.object.get-own-property-descriptor',
          'es.object.get-own-property-descriptors',
          'es.object.keys',
          'es.object.to-string',
          'web.dom-collections.for-each',
          'esnext.global-this',
          'esnext.string.match-all'
        ]
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "pages": path.resolve(__dirname, "src/pages"),
        "components": path.resolve(__dirname, "src/common/components"),
        "assets": path.resolve(__dirname, "src/assets"),
        "stores": path.resolve(__dirname, "src/stores"),
        "router": path.resolve(__dirname, "src/router"),
        "common": path.resolve(__dirname, "src/common"),
        "apis": path.resolve(__dirname, "src/apis"),
        "directives": path.resolve(__dirname, "src/directives"),
        "mixins": path.resolve(__dirname, "src/mixins"),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "@/common/styles/public.less";`
        },
      },
    },
    server: {
      host: "0.0.0.0",
      https,
      port: https ? 443 : 80,//设置服务启动端口号，是一个可选项，不要设置为本机的端口号，可能会发生冲突
      // open:true,//是否自动打开浏览器，可选项
      cors: true,//允许跨域。
      // 设置代理
      proxy: {
        // 将请求代理到另一个服务器
        [env.VITE_APP_API_BASE_URL]: {
          target: env.VITE_APP_API_BASE_URL,//这是你要跨域请求的地址前缀
          changeOrigin: true,//开启跨域
          pathRewrite: {
            [env.VITE_APP_API_BASE_URL]: ''
          }
        },
        [env.VITE_APP_API_BASE_URL]: {
          target: env.VITE_APP_API_BASE_URL,
          changeOrigin: true,
          pathRewrite: {
            [env.VITE_APP_API_BASE_URL]: ''
          }
        },
        [env.VITE_API_FILE_URL]: {
          target: env.VITE_API_FILE_URL,
          changeOrigin: true,
          pathRewrite: {
            [env.VITE_API_FILE_URL]: ''
          }
        }
      }
    }
  }
});