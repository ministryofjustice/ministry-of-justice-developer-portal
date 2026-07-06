#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

function requireEnv(name) {
  const value = process.env[name];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function readProducts(productsPath) {
  return JSON.parse(fs.readFileSync(productsPath, 'utf8'));
}

function writeProducts(productsPath, products) {
  fs.writeFileSync(productsPath, `${JSON.stringify(products, null, 2)}\n`);
}

function upsertProduct(products, product) {
  const existingIndex = products.findIndex((entry) => entry.slug === product.slug);
  const existingEntry = existingIndex >= 0 ? products[existingIndex] : null;

  const nextEntry = {
    ...(existingEntry || {}),
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    owner: product.owner,
    catalogInsightsEnabled: true,
    teamName: product.teamName,
    teamOrg: product.teamOrg,
    catalogDeploymentEnvironment: product.catalogDeploymentEnvironment,
    catalogShowVulnerabilities: product.catalogShowVulnerabilities,
    catalogShowCodeScanning: product.catalogShowCodeScanning,
    status: existingEntry?.status || 'live',
    tags: Array.isArray(existingEntry?.tags) ? existingEntry.tags : [],
  };

  if (existingIndex >= 0) {
    products[existingIndex] = nextEntry;
    return { products, action: 'Updated existing product entry' };
  }

  products.push(nextEntry);
  return { products, action: 'Added new product entry' };
}

async function main() {
  const rootDir = process.cwd();
  const productsPath = path.join(rootDir, 'content', 'products', 'products.json');

  const product = {
    slug: requireEnv('PRODUCT_SLUG'),
    name: requireEnv('PRODUCT_NAME'),
    category: requireEnv('PRODUCT_CATEGORY'),
    description: requireEnv('PRODUCT_DESCRIPTION'),
    owner: requireEnv('PRODUCT_OWNER'),
    teamName: requireEnv('GH_TEAM'),
    teamOrg: process.env.GH_TEAM_ORG?.trim() || 'ministryofjustice',
    catalogDeploymentEnvironment: requireEnv('CATALOG_DEPLOYMENT_ENVIRONMENT'),
    catalogShowVulnerabilities: process.env.INCLUDE_VULNERABILITIES === 'yes',
    catalogShowCodeScanning: process.env.INCLUDE_CODE_SCANNING === 'yes',
  };

  const products = readProducts(productsPath);
  const { products: updatedProducts, action } = upsertProduct(products, product);
  writeProducts(productsPath, updatedProducts);
  console.log(`${action}: ${product.slug}`);
}

const isDirectExecution =
  Boolean(process.argv[1]) && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
  main().catch((error) => {
    console.error('Failed to onboard catalog product:', error);
    process.exit(1);
  });
}