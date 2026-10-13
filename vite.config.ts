import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
function repositoryName(): string {
  const repository = process.env.GITHUB_REPOSITORY;
  if (repository) return repository.split('/').at(-1)!;
  const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  const name = remote.replace(/\.git$/, '').split(/[/:]/).at(-1);
  if (!name) throw new Error('Cannot determine repository name from origin');
  return name;
}
const name = repositoryName();
export default defineConfig({ plugins: [react(), tailwindcss()], base: name.endsWith('.github.io') ? '/' : `/${name}/` });
