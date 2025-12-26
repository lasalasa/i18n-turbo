import fs from 'fs';
import path from 'path';
import { extractStringsFromDirectory } from '../src/extractor';

const TEST_DIR = path.join(__dirname, 'benchmark_files');
const OUTPUT_FILE = path.join(__dirname, 'benchmark_output.json');
const FILE_COUNT = 200; // Adjust based on machine speed

function setup() {
    if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
    fs.mkdirSync(TEST_DIR, { recursive: true });

    console.log(`Generating ${FILE_COUNT} files...`);
    for (let i = 0; i < FILE_COUNT; i++) {
        const content = `
import React from 'react';
export const Component${i} = () => {
    return (
        <div>
            <h1>Header ${i}</h1>
            <p>This is paragraph ${i} which should be extracted.</p>
            <button title="Button ${i}">Click me ${i}</button>
        </div>
    );
};
`;
        fs.writeFileSync(path.join(TEST_DIR, `Comp${i}.tsx`), content);
    }
}

async function run() {
    setup();

    console.log('Starting extraction...');
    const start = performance.now();

    await extractStringsFromDirectory(TEST_DIR, OUTPUT_FILE, {
        fnName: 't',
        dryRun: false,
        merge: false,
        config: {
            minStringLength: 2
        }
    });

    const end = performance.now();
    console.log(`Processed ${FILE_COUNT} files in ${(end - start).toFixed(2)}ms`);

    // Cleanup
    if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
    if (fs.existsSync(OUTPUT_FILE)) fs.rmSync(OUTPUT_FILE);
}

run().catch(console.error);
