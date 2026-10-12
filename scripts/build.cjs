process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--openssl-legacy-provider'].filter(Boolean).join(' ');
const { spawnSync } = require('child_process');
const result = spawnSync(process.execPath, [require.resolve('react-scripts/bin/react-scripts'), 'build'], { stdio: 'inherit', env: process.env });
process.exit(result.status === null ? 1 : result.status);
