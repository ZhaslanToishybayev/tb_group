# Secrets & Configuration Policy

## Principles
- Never commit credentials; `.env` contains placeholders only.
- Use environment-specific secret stores (Vault, AWS Secrets Manager, Doppler).
- Spec Kit tracks required secrets in plan.md – keep the list in sync with actual vault entries.

## Recommended Providers
| Environment | Provider | Notes |
|-------------|----------|-------|
| Local dev | `.env.local` + direnv | Keep file out of VCS (`.gitignore`). |
| CI | GitHub Actions secrets | Map to `STATUS_SERVICE_*`, `TASKMASTER_*`. |
| Prod | Cloud secret manager | Provide read-only access to app runtime. |

## Runtime Variables
- `FEATURE_FLAGS` — comma-delimited list toggling experimental flows (read by `src/services/featureFlags.ts`).
- `DISABLE_ANALYTICS` — set to `true` to silence analytics logging in regulated environments.
- `LOG_LEVEL` — adjusts Pino verbosity without redeploy.

## Rotations
- Track rotation cadence in Task Master (`maintenance` tag).
- Automate via GitHub Actions workflow `rotate-secrets.yml` (future).
- Update `docs/integration-overview.md` and `Spec Kit` plan upon rotation.

## Validation
- Add health check endpoint verifying secret presence (without leaking values).
- CI job ensures mandatory env keys exist in `.env.example`.

## Tooling
- Consider adding `sops` + KMS for encrypted config files.
- Use `dotenv-safe` to fail fast when keys are missing at runtime.
