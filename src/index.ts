import fs from 'fs';
import os from 'os';
import path from 'path';
import process from 'process';
import { DgFile, DgProjectRestoreFrameworks } from './types';

if (process.argv.length < 4) {
    console.log('Missing arguments');
    process.exit(1);
}

const DG_FILE = process.argv[2]!;
const DOT_FILE = process.argv[3]!;
const DOT_VERSION = process.argv[4]!;
const FILTER = process.argv.length > 5 ? process.argv[5] : undefined;

function shorten(path: string) {
    const result = extractFilename(path)
        .replace('.csproj', '')
        .replace(/\./g, '_');

    return result;
}

function extractFilename(file: string): string {
    return path.parse(file).base;
}

function generate(dgFile: string, dotFile: string, dotVersion: string, blacklist?: string) {

    if (!fs.existsSync(dgFile)) {
        console.log(`${dgFile} does not exist`);
        process.exit(1);
    }

    let output = '';
    function writeln(s: string) {
        output += `${s}${os.EOL}`
    }

    const json: DgFile = JSON.parse(fs.readFileSync(dgFile, 'utf8'));
    const projects = Object.keys(json.projects)
        .filter(x => {
            if (blacklist == null) return true;
            return new RegExp(blacklist).test(x) === false;
        })

    const dotVer = dotVersion as keyof DgProjectRestoreFrameworks;

    writeln('digraph dependencies {');

    projects.forEach(projectPath => {
        const project = json.projects[projectPath]!;
        const framework = project.restore.frameworks[dotVer];

        if (framework == null) {
            console.log(`Invalid dotnet framework version: "${dotVersion}"`);
            process.exit(1);
        }

        Object.keys(framework.projectReferences)
            .forEach(referencePath => {
                writeln(`  ${shorten(projectPath)} -> ${shorten(referencePath)}`);
            })
    });

    writeln('}');

    fs.writeFileSync(dotFile, output, 'utf8');
    console.log(`${dotFile} written`);
}

generate(DG_FILE, DOT_FILE, DOT_VERSION, FILTER);
