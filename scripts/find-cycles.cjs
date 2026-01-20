#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'src');
const exts = ['.ts', '.tsx', '.js', '.jsx'];

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full, files);
    } else if (exts.includes(path.extname(e.name))) {
      files.push(full);
    }
  }
  return files;
}

function resolveImport(fromFile, importPath) {
  if (importPath.startsWith('@/')) {
    const rel = importPath.replace(/^@\//, '');
    const candidate = path.join(root, 'src', rel);
    const resolved = tryExtensions(candidate);
    return resolved;
  }
  if (importPath.startsWith('.')) {
    const candidate = path.resolve(path.dirname(fromFile), importPath);
    const resolved = tryExtensions(candidate);
    return resolved;
  }
  return null;
}

function tryExtensions(base) {
  for (const ext of exts) {
    const f = base + ext;
    if (fs.existsSync(f)) return path.normalize(f);
  }
  for (const ext of exts) {
    const f = path.join(base, 'index' + ext);
    if (fs.existsSync(f)) return path.normalize(f);
  }
  return null;
}

function parseImports(file) {
  const text = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+(?:[^'"\n]+)\s+from\s+['"]([^'"\n]+)['"]/g;
  const results = [];
  let m;
  while ((m = importRegex.exec(text)) !== null) {
    results.push(m[1]);
  }
  const dynRegex = /import\(['"]([^'"\n]+)['"]\)/g;
  while ((m = dynRegex.exec(text)) !== null) {
    results.push(m[1]);
  }
  return results;
}

function buildGraph(files) {
  const graph = new Map();
  for (const f of files) {
    graph.set(f, new Set());
  }
  for (const f of files) {
    try {
      const imps = parseImports(f);
      for (const imp of imps) {
        const resolved = resolveImport(f, imp);
        if (resolved && graph.has(resolved)) {
          graph.get(f).add(resolved);
        }
      }
    } catch (e) {
    }
  }
  return graph;
}

function findCycles(graph) {
  const white = new Set(graph.keys());
  const gray = new Set();
  const black = new Set();
  const cycles = [];

  function dfs(node, stack) {
    white.delete(node);
    gray.add(node);
    stack.push(node);
    for (const neigh of graph.get(node)) {
      if (black.has(neigh)) continue;
      if (gray.has(neigh)) {
        const idx = stack.indexOf(neigh);
        const cycle = stack.slice(idx).concat([neigh]);
        cycles.push(cycle);
      } else if (white.has(neigh)) {
        dfs(neigh, stack);
      }
    }
    stack.pop();
    gray.delete(node);
    black.add(node);
  }

  for (const node of Array.from(graph.keys())) {
    if (white.has(node)) dfs(node, []);
  }
  return cycles;
}

function main() {
  if (!fs.existsSync(srcRoot)) {
    console.error('Source root not found:', srcRoot);
    process.exit(1);
  }
  console.log('Scanning files under', srcRoot);
  const files = walk(srcRoot);
  console.log('Files found:', files.length);
  const graph = buildGraph(files);
  console.log('Graph built with nodes:', graph.size);
  const cycles = findCycles(graph);
  if (cycles.length === 0) {
    console.log('No cycles found.');
  } else {
    console.log(`Found ${cycles.length} cycle(s):`);
    cycles.forEach((c, i) => {
      console.log(`\nCycle ${i + 1}:`);
      c.forEach(p => console.log('  ' + path.relative(root, p)));
    });
  }
}

main();
