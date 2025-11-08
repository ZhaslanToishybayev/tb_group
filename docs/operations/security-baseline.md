# Security Baseline – October 16, 2025

- `taskmaster/`: `npm audit --omit dev` → 0 vulnerabilities  
  JSON output stored in `docs/operations/taskmaster-audit.json`.
- `status-service/`: `npm audit --omit dev` → 0 vulnerabilities  
  JSON output stored in `docs/operations/status-service-audit.json`.

Both reports use the same command line:

```bash
npm audit --omit dev --json
```

Regenerate these files whenever dependencies change and keep the results under version control so future runs can diff against the known-good baseline.
