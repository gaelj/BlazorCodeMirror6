import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/index.ts',
  output: {
    dir: '../wwwroot',
    format: "esm",
  },
  plugins: [nodeResolve(), typescript()]
};
