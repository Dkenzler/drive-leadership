import { cp, rm, mkdir } from 'node:fs/promises';
await rm('public', { recursive: true, force: true });
await cp('src', 'public', { recursive: true });
await mkdir('public/vendor', { recursive: true });
await cp('node_modules/marked/lib/marked.umd.js', 'public/vendor/marked.js');
await cp('node_modules/dompurify/dist/purify.min.js', 'public/vendor/purify.js');
console.log('Built public/ with the complete free skill library.');
