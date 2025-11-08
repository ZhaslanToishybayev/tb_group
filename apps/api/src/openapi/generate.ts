import { writeFileSync } from 'node:fs';
import path from 'node:path';

import openApiDocument from './document';

const target = path.resolve(process.cwd(), 'openapi.generated.json');
writeFileSync(target, JSON.stringify(openApiDocument, null, 2));
console.info(`OpenAPI document written to ${target}`);
