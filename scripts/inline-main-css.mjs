import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const outputDir = resolve('dist');
const htmlPath = resolve(outputDir, 'index.html');
const html = await readFile(htmlPath, 'utf8');
const stylesheet = /<link rel="stylesheet" crossorigin href="(\/assets\/index-[^"/]+\.css)">/g;
const matches = [...html.matchAll(stylesheet)];

if (matches.length !== 1) {
  throw new Error(`Expected one main stylesheet in index.html, found ${matches.length}`);
}

const [tag, href] = matches[0];
const css = await readFile(resolve(outputDir, href.slice(1)), 'utf8');
if (css.includes('</style')) {
  throw new Error('Main stylesheet contains a closing style tag');
}

await writeFile(htmlPath, html.replace(tag, `<style>${css}</style>`));
console.log(`Inlined ${href} into index.html`);
