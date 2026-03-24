# Contributing to Deevo Cortex

Thank you for your interest in contributing. This document outlines the process for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment (see README.md)
4. Create a feature branch from `main`

## Development Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest -v  # Verify tests pass

# Frontend
cd frontend
npm install
npm run dev  # Verify dev server starts
```

## Branch Naming

Use descriptive branch names following this convention:

- `feat/short-description` — New features
- `fix/short-description` — Bug fixes
- `docs/short-description` — Documentation updates
- `refactor/short-description` — Code refactoring
- `test/short-description` — Test additions or fixes

## Making Changes

1. Keep changes focused — one feature or fix per pull request
2. Follow existing code style and patterns
3. Add or update tests for any new functionality
4. Ensure all existing tests pass before submitting
5. Update documentation if your change affects the public API or user-facing behavior

## Code Expectations

**Backend (Python):**
- Follow PEP 8
- Use type hints for function signatures
- Use Pydantic models for data contracts
- Write pytest tests for new services and endpoints

**Frontend (TypeScript/React):**
- Use TypeScript strict mode
- Follow existing component patterns
- Keep components focused and composable
- Use Tailwind utility classes for styling

## Running Tests

```bash
cd backend
pytest -v                           # All tests
pytest tests/test_e2e_pipeline.py   # E2E tests
pytest tests/test_services.py       # Unit tests
```

## Pull Request Process

1. Update the CHANGELOG.md with a note about your change
2. Ensure your branch is up to date with `main`
3. Open a pull request with a clear title and description
4. Fill out the pull request template
5. Wait for review

## Reporting Issues

Use GitHub Issues with the provided templates for bug reports and feature requests. Include as much detail as possible to help reproduce and understand the issue.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.
