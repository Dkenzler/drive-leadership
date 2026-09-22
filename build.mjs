import { cp, rm } from 'node:fs/promises';
await rm('public', { recursive: true, force: true });
await cp('src', 'public', { recursive: true });
console.log('Built public/');
