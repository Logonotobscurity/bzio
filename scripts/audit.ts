
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// Files to exclude from the audit
const excludedFiles = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.next',
  'coverage',
  // Add other files or directories to exclude if needed
];

// Function to find all TypeScript files in a directory
function findTSFiles(dir: string): string[] {
  let files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!excludedFiles.includes(item)) {
        files = files.concat(findTSFiles(fullPath));
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to analyze the imports in a TypeScript file
function analyzeFile(filePath: string, program: ts.Program) {
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) {
    console.error(`Could not get source file for ${filePath}`);
    return;
  }

  const checker = program.getTypeChecker();

  ts.forEachChild(sourceFile, node => {
    if (ts.isImportDeclaration(node)) {
      const importClause = node.importClause;
      if (importClause && importClause.name) {
        // This is a default import
        const moduleSpecifier = node.moduleSpecifier.getText(sourceFile).slice(1, -1);
        const resolvedModule = ts.resolveModuleName(
          moduleSpecifier,
          sourceFile.fileName,
          program.getCompilerOptions(),
          ts.sys
        ).resolvedModule;

        if (resolvedModule) {
          const moduleSourceFile = program.getSourceFile(resolvedModule.resolvedFileName);
          if (moduleSourceFile) {
            const moduleSymbol = checker.getSymbolAtLocation(moduleSourceFile);
            if (moduleSymbol) {
              const exports = checker.getExportsOfModule(moduleSymbol);
              const defaultExport = exports.find(e => e.escapedName === 'default');
              if (!defaultExport) {
                console.log(`[File]: ${filePath}`);
                console.log(`  [Default Import Issue]`);
                console.log(`  Import: import ${importClause.name.text} from '${moduleSpecifier}';`);
                console.log(`  Resolved Module: ${resolvedModule.resolvedFileName}`);
                console.log(`  Diagnosis: The module does not have a default export.`);
                console.log(`  Remediation: Change to a named import, e.g., import { ${importClause.name.text} } from '${moduleSpecifier}';`);
                console.log('---');
              }
            }
          }
        }
      }
    }
  });
}

// Main function to run the audit
function audit() {
  const projectDir = process.cwd();
  const tsFiles = findTSFiles(projectDir);

  const program = ts.createProgram(tsFiles, {
    // Add any necessary compiler options here
    // You might want to read these from your tsconfig.json
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.ReactJSX,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    baseUrl: '.',
    paths: {
      "@/*": ["src/*"]
    }
  });

  console.log('Starting TypeScript import audit...');
  for (const file of tsFiles) {
    analyzeFile(file, program);
  }
  console.log('Audit complete.');
}

audit();

