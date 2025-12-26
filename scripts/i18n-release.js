const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const PACKAGE_PATH = path.join(__dirname, '../packages/i18n-turbo');

function run(command) {
    console.log(`> ${command}`);
    execSync(command, { stdio: 'inherit' });
}

console.log('🚀 Starting Release Process for i18n-turbo...');

rl.question('Select version bump type (patch/minor/major) [patch]: ', (answer) => {
    const type = answer.trim() || 'patch';

    if (!['patch', 'minor', 'major'].includes(type)) {
        console.error('Invalid version type. Use patch, minor, or major.');
        process.exit(1);
    }

    try {
        // 1. Bump version in package.json (skip git tag for now to commit all together)
        console.log(`\n📦 Bumping ${type} version...`);
        run(`npm version ${type} -w packages/i18n-turbo --no-git-tag-version`);

        // 2. Read new version
        const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_PATH, 'package.json'), 'utf8'));
        const newVersion = pkg.version;
        console.log(`\n✨ New version: ${newVersion}`);

        // 3. Stage changes
        run('git add .');

        // 4. Commit
        console.log('\n💾 Committing changes...');
        run(`git commit -m "chore: bump version to ${newVersion}"`);

        // 5. Create Tag
        console.log(`\n🏷️  Creating tag v${newVersion}...`);
        run(`git tag v${newVersion}`);

        // 6. Push
        console.log('\n⬆️  Pushing to remote...');
        run('git push origin main --tags');

        console.log('\n✅ Release complete!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Release failed:', error.message);
        process.exit(1);
    }
});
