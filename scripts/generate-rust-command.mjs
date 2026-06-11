import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const name = process.argv[2];

if (!name) {
  console.error('Usage: node scripts/generate-rust-command.mjs <command-name>');
  console.error('  Creates a new Rust Tauri command with service, error type, and module wiring.');
  process.exit(1);
}

const pascalName = toPascalCase(name);
const snakeName = toSnakeCase(name);
const srcTauriDir = resolve('src-tauri', 'src');
const commandsDir = resolve(srcTauriDir, 'commands');
const servicesDir = resolve(srcTauriDir, 'services');

if (!existsSync(srcTauriDir)) {
  console.error(`Error: ${srcTauriDir} does not exist. Run this script from the project root.`);
  process.exit(1);
}

const commandFile = resolve(commandsDir, `${snakeName}.rs`);
if (existsSync(commandFile)) {
  console.error(`Error: Command file already exists at ${commandFile}`);
  process.exit(1);
}

const commandContent = `use crate::error::AppError;
use crate::response::ApiResponse;
use tracing::{info, instrument};

#[tauri::command]
#[instrument]
pub fn ${snakeName}(name: &str) -> Result<ApiResponse<String>, AppError> {
    info!(name = %name, "${snakeName} called");
    let result = format!("Hello from {}! This is the ${snakeName} command.", name);
    Ok(ApiResponse::success(result))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_${snakeName}() {
        let response = ${snakeName}("test").expect("command should succeed");
        assert!(response.data.as_deref().unwrap_or("").contains("${pascalName}"));
    }
}
`;

const serviceFile = resolve(servicesDir, `${snakeName}_service.rs`);
if (!existsSync(serviceFile)) {
  const serviceContent = `use crate::error::AppError;

pub fn execute_${snakeName}(input: &str) -> Result<String, AppError> {
    Ok(format!("Hello from {}! This is the ${pascalName} service.", input))
}
`;
  writeFileSync(serviceFile, serviceContent);
  console.log(`  Created service: ${serviceFile}`);
}

writeFileSync(commandFile, commandContent);
console.log(`  Created command: ${commandFile}`);

function updateModuleFile(filePath, moduleName) {
  if (!existsSync(filePath)) {
    console.error(`  Warning: ${filePath} not found, skipping module registration.`);
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newDecl = `pub mod ${moduleName};`;

  for (const line of lines) {
    if (line.trim() === newDecl) {
      console.log(`  Already registered in ${filePath}`);
      return;
    }
  }

  const insertIdx = lines.findIndex(l => l.trim().startsWith('#[cfg'));
  const idx = insertIdx >= 0 ? insertIdx : lines.length;

  if (idx > 0 && lines[idx - 1].trim() !== '') {
    lines.splice(idx, 0, '', newDecl);
  } else {
    lines.splice(idx, 0, newDecl);
  }

  writeFileSync(filePath, lines.join('\n'));
  console.log(`  Registered in ${filePath}`);
}

updateModuleFile(resolve(commandsDir, '..', 'commands.rs'), snakeName);
updateModuleFile(resolve(servicesDir, '..', 'services.rs'), `${snakeName}_service`);

const bootstrapPath = resolve(srcTauriDir, 'app', 'bootstrap.rs');
if (existsSync(bootstrapPath)) {
  const bootstrapContent = readFileSync(bootstrapPath, 'utf8');
  const handlerEntry = `crate::commands::${snakeName}::${snakeName},`;

  if (bootstrapContent.includes(handlerEntry)) {
    console.log('  Command already registered in bootstrap.rs');
  } else {
    const updated = bootstrapContent.replace(
      /(tauri::generate_handler!\[)/,
      `$1\n        ${handlerEntry}`,
    );
    writeFileSync(bootstrapPath, updated);
    console.log('  Registered command handler in bootstrap.rs');
  }
}

console.log(`\n✓ Generated Rust command "${name}"`);
console.log('  Next steps:');
console.log(`  1. Review src-tauri/src/commands/${snakeName}.rs`);
console.log(`  2. Implement business logic in src-tauri/src/services/${snakeName}_service.rs`);
console.log('  3. Add a typed frontend wrapper in src/api/');
console.log('  4. Run cargo build to verify');

function toPascalCase(value) {
  return value
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function toSnakeCase(value) {
  return value
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/[-_\s]+/g, '_');
}
