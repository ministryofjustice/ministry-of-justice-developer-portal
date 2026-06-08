export function parseSimpleYaml(text) {
  const result = {};
  let currentKey = null;

  for (const line of text.split('\n')) {
    if (line.trim().startsWith('#') || line.trim() === '') continue;

    const nestedMatch = line.match(/^  (\w+):\s*(.*)$/);
    if (nestedMatch && currentKey) {
      if (typeof result[currentKey] !== 'object' || result[currentKey] === null) {
        result[currentKey] = {};
      }
      result[currentKey][nestedMatch[1]] = cleanYamlValue(nestedMatch[2]);
      continue;
    }

    const listMatch = line.match(/^  - (.+)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(cleanYamlValue(listMatch[1]));
      continue;
    }

    const kvMatch = line.match(/^(\w[\w_-]*):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val === '' || val === '~' || val === 'null') {
        result[currentKey] = null;
      } else {
        result[currentKey] = cleanYamlValue(val);
      }
    }
  }

  return result;
}

function cleanYamlValue(val) {
  if (!val || val === '~' || val === 'null') return null;
  if (val === 'true') return true;
  if (val === 'false') return false;
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  if (/^\d+$/.test(val)) return parseInt(val, 10);
  if (/^\d+\.\d+$/.test(val)) return parseFloat(val);
  return val;
}

export function buildFrontmatter(obj) {
  let result = '';
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      if (value.includes(':') || value.includes('#') || value.includes('"') || value.includes('\\')) {
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        result += `${key}: "${escaped}"\n`;
      } else {
        result += `${key}: ${value}\n`;
      }
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      result += `${key}: ${value}\n`;
    }
  }
  return result;
}