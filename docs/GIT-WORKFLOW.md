# Git Workflow

## Branches

- `main`: stable trainer-ready releases only
- `develop`: integration branch
- `feature/*`: isolated feature work
- `fix/*`: integration and regression fixes

## Daily workflow

```bash
git fetch origin
git switch your-feature-branch
git merge origin/develop
git status
```

Commit one logical change at a time, push the feature branch, and open a pull request into `develop`. Require review and passing CI. Never force-push shared branches and never commit `.env`, database credentials, JWT secrets, uploads, `node_modules`, coverage, or build output.

When the complete application passes the Postman collection, automated tests, frontend build, and clean-install README check, merge `develop` into `main` through a final release pull request.
