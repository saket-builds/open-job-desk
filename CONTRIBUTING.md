# Contributing

Thanks for helping improve Job Desk.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Checks before a PR

```bash
npm run test:discovery
npm run test:fill
npm run build
```

## Guidelines

- Do not commit real candidate PII, resumes, `.env*`, or `job-desk-state.json`
- Keep the fill helper from clicking Submit
- Prefer small, focused PRs with a clear “why”
- If you add a portal board, verify the public ATS slug still works

## License

By contributing, you agree your contributions are licensed under the MIT License.
