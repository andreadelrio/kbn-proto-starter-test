// Claude Code hook: after Claude edits a file in src/, lint that file with the EUI rules
// (eslint.config.js). If something breaks them, the messages go back to Claude to fix right away.
// Other agents get the same rules through `npm run check`, the editor and the dev server overlay.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

let filePath;
try {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  filePath = input.tool_input?.file_path ?? input.tool_response?.filePath;
} catch {
  process.exit(0);
}
if (!filePath) process.exit(0);

const relative = path.relative(projectDir, path.resolve(projectDir, filePath));
if (!/^src\/.*\.tsx?$/.test(relative.split(path.sep).join('/'))) process.exit(0);

const eslint = path.join(projectDir, 'node_modules', '.bin', 'eslint');
if (!existsSync(eslint) || !existsSync(path.join(projectDir, relative))) process.exit(0);

const result = spawnSync(eslint, ['--max-warnings=0', relative], { cwd: projectDir, encoding: 'utf8' });
if (result.status === 0) process.exit(0);

process.stderr.write(
  `${relative} breaks the prototype's EUI rules. Fix these before moving on:\n` +
    `${result.stdout}${result.stderr}`,
);
process.exit(2);
