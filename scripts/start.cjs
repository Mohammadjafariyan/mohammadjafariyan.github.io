// Webpack 4 needs the legacy OpenSSL provider on modern Node.js.
process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--openssl-legacy-provider'].filter(Boolean).join(' ');
const { spawn } = require('child_process');
const child = spawn(process.execPath, [require.resolve('react-scripts/bin/react-scripts'), 'start'], {
  stdio: 'inherit',
  env: process.env,
});
child.on('error', error => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', code => { process.exitCode = code === null ? 1 : code; });
