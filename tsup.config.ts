import {readFileSync, writeFileSync} from 'fs';
import {defineConfig} from 'tsup';

function replaceStringInFile(
  filePath: string,
  searchString: string,
  replaceString: string,
): () => Promise<void> {
  return async () => {
    try {
      const updatedContent = readFileSync(filePath, 'utf-8').replace(
        new RegExp(searchString, 'g'),
        replaceString,
      );
      writeFileSync(filePath, updatedContent, 'utf-8');
    } catch (error) {
      console.error(`An error occurred while processing ${filePath}: `, error);
    }
  };
}

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    onSuccess: replaceStringInFile('dist/index.js', 'import', 'require'),
  },
  {
    clean: true,
    dts: true,
    entry: ['src/vite/index.ts', 'src/vite/placeholder.ts'],
    format: 'cjs',
    outDir: 'vite',
  },
]);
