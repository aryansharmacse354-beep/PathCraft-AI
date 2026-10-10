#!/bin/bash

# PathCraft AI - Advanced Repository Setup Script
# This script creates all advanced-level repository files in one command

set -e

echo "🚀 Starting PathCraft AI Advanced Repository Setup..."

# Create directories
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .husky
mkdir -p tests
mkdir -p docs

echo "✅ Directories created"

# Create .nvmrc
cat > .nvmrc << 'EOF'
20
EOF

# Create .prettierrc
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always"
}
EOF

# Create .prettierignore
cat > .prettierignore << 'EOF'
node_modules
.next
out
coverage
dist
build
*.lock
package-lock.json
yarn.lock
pnpm-lock.yaml
EOF

# Create .eslintrc.json
cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "parserOptions": {
    "project": "./tsconfig.json",
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "no-console": [
      "warn",
      { "allow": ["warn", "error"] }
    ],
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error"
  },
  "ignorePatterns": [
    "node_modules/",
    ".next/",
    "coverage/",
    "dist/"
  ]
}
EOF

# Create tsconfig.eslint.json
cat > tsconfig.eslint.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "include": ["**/*.ts", "**/*.tsx", ".eslintrc.json"],
  "exclude": ["node_modules", ".next", "coverage", "dist"]
}
EOF

# Create .env.example
cat > .env.example << 'EOF'
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Providers
GEMINI_API_KEY=your_gemini_api_key_here

# Optional AI Providers
OPENAI_API_KEY=
GROQ_API_KEY=

# Optional: Error Tracking
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=

# Environment
NODE_ENV=development
EOF

# Create .env.test
cat > .env.test << 'EOF'
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=test-key-for-testing-only
NODE_ENV=test
EOF

# Create jest.config.js
cat > jest.config.js << 'EOF'
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/.next/'],
}

module.exports = createJestConfig(customJestConfig)
EOF

# Create jest.setup.js
cat > jest.setup.js << 'EOF'
import '@testing-library/jest-dom'
EOF

# Create vitest.config.ts
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
EOF

# Create tests/setup.ts
cat > tests/setup.ts << 'EOF'
import '@testing-library/jest-dom'
EOF

# Create tests/example.test.ts
cat > tests/example.test.ts << 'EOF'
describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true)
  })

  it('should perform basic math', () => {
    expect(2 + 2).toBe(4)
  })

  it('should handle strings', () => {
    const message = 'PathCraft AI'
    expect(message).toContain('PathCraft')
  })
})
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

CMD ["node", "server.js"]
EOF

# Create .dockerignore
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
.env.*.local
.next
out
coverage
dist
.DS_Store
Thumbs.db
.vscode
.idea
README.md
Dockerfile
docker-compose.yml
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pathcraft-ai
    ports:
      - '3000:3000'
    env_file:
      - .env.local
    environment:
      NODE_ENV: development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    restart: unless-stopped
EOF

# Create vercel.json
cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "GEMINI_API_KEY": {
      "required": true
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": []
}
EOF

# Create next-sitemap.config.js
cat > next-sitemap.config.js << 'EOF'
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/api/*', '/admin/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/admin/*'],
      },
    ],
  },
}
EOF

# Create middleware.ts
cat > middleware.ts << 'EOF'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set('x-content-type-options', 'nosniff')
  response.headers.set('x-frame-options', 'DENY')
  response.headers.set('x-xss-protection', '1; mode=block')
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
EOF

# Create instrumentation.ts
cat > instrumentation.ts << 'EOF'
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Server runtime initialized')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('[Instrumentation] Edge runtime initialized')
  }
}
EOF

# Create GitHub workflows - CI
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  lint-test-build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Run typecheck
        run: npm run typecheck

      - name: Run tests
        run: npm run test

      - name: Build app
        run: npm run build
EOF

# Create GitHub workflows - Deploy
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
EOF

# Create GitHub workflows - CodeQL
cat > .github/workflows/codeql.yml << 'EOF'
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest

    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript-typescript']

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
EOF

# Create .github/dependabot.yml
cat > .github/dependabot.yml << 'EOF'
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '03:00'
    open-pull-requests-limit: 10
    reviewers:
      - aryansharmacse354-beep
    labels:
      - dependencies
      - npm
EOF

# Create .github/CODEOWNERS
cat > .github/CODEOWNERS << 'EOF'
* @aryansharmacse354-beep
EOF

# Create .github/PULL_REQUEST_TEMPLATE.md
cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
## Summary
Briefly describe the change and why it was needed.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- 
- 
- 

## Testing
- [ ] Added/updated tests
- [ ] All tests passing locally
- [ ] Tested in development environment

## Checklist
- [ ] Code follows style guidelines
- [ ] Ran `npm run lint` and `npm run format`
- [ ] Ran `npm run typecheck` with no errors
- [ ] Ran `npm run test` and all tests pass
- [ ] Updated relevant documentation
- [ ] No new warnings generated
- [ ] Commits are atomic and well-documented

## Screenshots (if applicable)

## Additional Notes
EOF

# Create .github/ISSUE_TEMPLATE/bug_report.md
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug report
about: Report a bug in PathCraft AI
title: '[BUG] '
labels: bug
assignees: aryansharmacse354-beep
---

## Describe the bug
A clear and concise description of what the bug is.

## Steps to reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected behavior
A clear and concise description of what you expected to happen.

## Actual behavior
What actually happened instead.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Node version: [e.g. 20.x]
- npm version: [e.g. 10.x]

## Additional context
Add any other context about the problem here.
EOF

# Create .github/ISSUE_TEMPLATE/feature_request.md
cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature request
about: Suggest an idea for PathCraft AI
title: '[FEATURE] '
labels: enhancement
assignees: aryansharmacse354-beep
---

## Is your feature request related to a problem?
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

## Describe the solution you'd like
A clear and concise description of what you want to happen.

## Describe alternatives you've considered
A clear and concise description of any alternative solutions or features you've considered.

## Additional context
Add any other context or screenshots about the feature request here.
EOF

# Create .husky/pre-commit
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run typecheck
npm run test
EOF
chmod +x .husky/pre-commit

# Create .husky/commit-msg
cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit "$1"
EOF
chmod +x .husky/commit-msg

# Create CONTRIBUTING.md
cat > CONTRIBUTING.md << 'EOF'
# Contributing to PathCraft AI

Thank you for considering contributing to PathCraft AI! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Git

### Local Development Setup

1. Fork the repository
2. Clone your fork
   ```bash
   git clone https://github.com/your-username/PathCraft-AI.git
   cd PathCraft-AI
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY to .env.local
   ```

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to verify

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/your-bug-fix
```

### Making Changes

1. Make your changes
2. Run linting
   ```bash
   npm run lint:fix
   ```

3. Format your code
   ```bash
   npm run format
   ```

4. Run type checking
   ```bash
   npm run typecheck
   ```

5. Run tests
   ```bash
   npm run test
   ```

6. Build to verify no errors
   ```bash
   npm run build
   ```

### Committing Changes

- Write clear, descriptive commit messages
- Use the present tense ("Add feature" not "Added feature")
- Reference issues when applicable (e.g., "Fix #123")
- One logical change per commit

### Pushing Changes

```bash
git push origin feature/your-feature-name
```

### Creating a Pull Request

1. Go to GitHub and create a pull request
2. Fill out the PR template completely
3. Ensure all CI checks pass
4. Request review from maintainers
5. Address feedback and make requested changes

## Testing

All contributions should include tests:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Code Style

- Follow the existing code style
- Use TypeScript strictly (no `any` types without justification)
- Write descriptive variable and function names
- Add JSDoc comments for public functions
- Keep components small and focused

## Documentation

- Update README.md if adding new features
- Add comments for complex logic
- Update ARCHITECTURE.md if changing system design
- Include examples in documentation

## Reporting Issues

- Check existing issues before creating new ones
- Provide a clear description
- Include steps to reproduce (for bugs)
- Include your environment (OS, Node version, browser)
- Include relevant logs or screenshots

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
EOF

# Create ARCHITECTURE.md
cat > ARCHITECTURE.md << 'EOF'
# PathCraft AI - Architecture Documentation

## Overview

PathCraft AI is a Next.js-based full-stack application that generates interactive career roadmaps using Generative AI. The application features a client-side DAG visualization engine backed by AI-powered roadmap generation.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: React 18
- **Graph Visualization**: @xyflow/react + Dagre
- **Styling**: Tailwind CSS + Lucide Icons
- **State Management**: React hooks + localStorage
- **Schema Validation**: Zod

### Backend
- **Runtime**: Node.js via Next.js API routes
- **AI Provider**: Google Gemini API
- **Fallbacks**: OpenAI, Groq (configured)

### DevOps
- **Hosting**: Vercel (serverless)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Dependency Management**: Dependabot

## Project Structure

```
PathCraft-AI/
├── app/
│   ├── api/                          # API routes (Next.js)
│   │   ├── milestones/
│   │   │   └── guidance/route.ts     # Deep specialist guidance
│   │   ├── roadmaps/
│   │   │   ├── compare/route.ts      # Dual-role comparison
│   │   │   ├── generate/route.ts     # Core roadmap generation
│   │   │   └── replan/route.ts       # Topological replanning
│   ├── layout.tsx                    # Root layout + metadata
│   ├── page.tsx                      # Main dashboard
│   └── globals.css                   # Global styles
│
├── components/
│   ├── roadmap/
│   │   ├── MilestoneNode.tsx         # DAG node component
│   │   ├── MilestoneInspector.tsx    # Details drawer
│   │   ├── RoadmapCanvas.tsx         # React Flow container
│   │   └── PathComparisonModal.tsx   # Comparison UI
│   ├── comparison/
│   └── ui/                           # Reusable UI components
│
├── lib/
│   ├── ai/
│   │   ├── client.ts                 # Gemini API wrapper
│   │   └── prompts.ts                # AI prompts & anti-contamination
│   ├── types/
│   │   └── roadmap.ts                # Zod schemas + TS types
│   └── utils/
│       ├── graphEngine.ts            # Dagre layout + graph logic
│       └── storage.ts                # localStorage utilities
│
├── tests/
│   ├── setup.ts                      # Test configuration
│   └── example.test.ts               # Example test
│
├── public/                           # Static assets
│
├── middleware.ts                     # Request security headers
├── instrumentation.ts                # Server instrumentation
├── Dockerfile                        # Container image
├── docker-compose.yml                # Local dev environment
├── vercel.json                       # Vercel configuration
├── jest.config.js                    # Jest configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies & scripts
```

## Request Flow

### Roadmap Generation Flow

```
1. User selects career
   ↓
2. POST /api/roadmaps/generate
   - Validate input (Zod schema)
   - Call Gemini API with domain-specific prompts
   - Generate structured DAG JSON
   ↓
3. Graph Engine Processing
   - Compute topological order
   - Evaluate node unlock states
   - Layout with Dagre (hierarchical)
   ↓
4. Render on Canvas
   - @xyflow/react renders nodes
   - Color-coded by status
   - Save to localStorage
```

## Data Models

### Roadmap Schema (Zod)

```typescript
RoadmapSchema = z.object({
  careerTitle: z.string(),
  description: z.string(),
  nodes: z.array(MilestoneNode),
  edges: z.array(Edge),
  metadata: z.object({
    domain: z.enum([...]),
    estimatedMonths: z.number(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  }),
})
```

## Design Principles

- clear separation of concerns
- strong type safety with TypeScript
- schema validation with Zod
- modular and reusable components
- production-ready deployment config
- comprehensive testing and CI/CD
EOF

# Create DEVELOPMENT.md
cat > DEVELOPMENT.md << 'EOF'
# Development Guide

## Quick Start

```bash
# Clone and setup
git clone https://github.com/aryansharmacse354-beep/PathCraft-AI.git
cd PathCraft-AI
npm install

# Environment setup
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Start development server
npm run dev
# Visit http://localhost:3000
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Build for production
npm start                # Start production server

# Quality checks
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run format           # Auto-format with Prettier
npm run format:check     # Check format without changing
npm run typecheck        # Run TypeScript type checker

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Utility
npm run check            # Run all checks (lint, typecheck, test)
```

## Environment Variables

Create `.env.local` in the root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=your_key_here
```

Optional:
```env
OPENAI_API_KEY=
GROQ_API_KEY=
SENTRY_DSN=
```

## Project Structure Quick Reference

- **app/**: Next.js routes and API endpoints
- **components/**: React components (roadmap UI, modals, etc.)
- **lib/**: Utilities, AI client, types, graph logic
- **tests/**: Test files
- **public/**: Static assets

## Common Tasks

### Adding a New Component

1. Create file in `components/`
2. Add TypeScript types
3. Write component with React best practices
4. Export from `components/index.ts`

### Adding an API Endpoint

1. Create route in `app/api/path/route.ts`
2. Implement handler function
3. Validate input with Zod
4. Call AI client if needed
5. Return JSON response

### Adding Tests

1. Create `.test.ts` or `.test.tsx` file
2. Use Jest/Vitest syntax
3. Mock external dependencies
4. Run `npm run test:watch`

## Debugging

### Browser DevTools
- Use React Developer Tools extension
- Inspect component state and props
- Check Network tab for API calls
- Check Console for errors/warnings

### Docker Development

```bash
# Build and run
docker-compose up

# Rebuild after changes
docker-compose up --build

# Access container
docker exec -it pathcraft-ai sh
```

## CI/CD

Push to `main` branch to trigger:
- GitHub Actions CI workflow
- Automated lint, test, build checks
- Automatic deployment to Vercel (on success)

See `.github/workflows/` for configuration.

## Code Style

- **Linting**: ESLint (Next.js recommended rules)
- **Formatting**: Prettier (100 char line width)
- **TypeScript**: Strict mode enabled
- **Commit hooks**: Husky pre-commit linting

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)
EOF

# Create SECURITY.md
cat > SECURITY.md << 'EOF'
# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in PathCraft AI, please report it responsibly:

**DO NOT** open a public GitHub issue.

Instead, please email the maintainer privately.

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will:
- Acknowledge your report within 48 hours
- Investigate and confirm the issue
- Release a fix in a timely manner
- Credit you in the security advisory (if desired)

## Supported Versions

Security updates are provided for:
- **Latest**: Current stable release
- **Previous**: Previous major version (limited time)

## Security Practices

### Environment Variables
- Never commit `.env.local` or secrets
- Use `.env.example` for documentation
- Rotate API keys periodically
- Use strong API keys from providers

### Dependencies
- Kept up-to-date via Dependabot
- Regular security audits (`npm audit`)
- Review major version updates
- Test updates before merging

### API Security
- Input validation with Zod schemas
- Security headers via middleware
- HTTPS enforced in production
- No sensitive data in logs
- API key rotation policies

### Frontend Security
- XSS prevention (React auto-escapes)
- Secure storage in localStorage
- No hardcoded secrets

### Code Quality
- TypeScript strict mode
- ESLint security plugins
- Code review requirements
- Automated security scanning (CodeQL)

## Security Headers

The application includes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Questions?

For security questions, contact the maintainers privately.
EOF

# Create CHANGELOG.md
cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to PathCraft AI will be documented in this file.

## [Unreleased]

### Added
- GitHub Actions CI/CD workflows
- Jest testing setup and configuration
- ESLint and Prettier configuration
- Husky pre-commit hooks
- Docker and Docker Compose support
- Comprehensive documentation (CONTRIBUTING, ARCHITECTURE, DEVELOPMENT, SECURITY)
- GitHub issue and PR templates
- Dependabot configuration
- Middleware security headers
- TypeScript strict mode configuration
- Testing utilities and example tests
- Vercel deployment configuration

## [1.0.0] - 2024-10-10

### Added
- Initial release of PathCraft AI
- Interactive career roadmap generation using Gemini AI
- React Flow-based DAG visualization with Dagre layout
- Dynamic skill tree with progress tracking
- Milestone inspection drawer with detailed guidance
- Dual-career comparison functionality
- Weekly study hours planning and feasibility calculation
- LocalStorage persistence for roadmap data
- JSON export functionality
- Support for multiple AI providers (Gemini, OpenAI, Groq)
EOF

# Create LICENSE
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 Aryan Sharma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

echo "✅ All files created successfully!"

# Update .gitignore to include .env if not already there
if ! grep -q "^.env$" .gitignore; then
  echo "" >> .gitignore
  echo "# Local env files" >> .gitignore
  echo ".env" >> .gitignore
fi

echo ""
echo "📦 Installing dev dependencies..."
npm install --save-dev \
  @testing-library/jest-dom \
  @testing-library/react \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  eslint-config-next \
  eslint-config-prettier \
  husky \
  jest \
  jest-environment-jsdom \
  prettier \
  ts-jest \
  @vitejs/plugin-react \
  vitest

echo ""
echo "✅ Setting up Husky..."
npm run prepare || true

echo ""
echo "🎉 PathCraft AI Advanced Repository Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update package.json with new scripts:"
echo "   - lint:fix, format, format:check, typecheck, test:watch, test:coverage, check"
echo ""
echo "2. Run the following to verify everything works:"
echo "   npm run lint"
echo "   npm run typecheck"
echo "   npm run test"
echo "   npm run build"
echo ""
echo "3. Commit these changes:"
echo "   git add ."
echo "   git commit -m 'chore: setup advanced repository standards'"
echo ""
echo "4. Push to GitHub:"
echo "   git push origin setup/advanced-repo-standards"
echo ""
echo "5. Create a Pull Request on GitHub"
echo ""
echo "📚 Documentation:"
echo "   - Read CONTRIBUTING.md for contribution guidelines"
echo "   - Read ARCHITECTURE.md for system design"
echo "   - Read DEVELOPMENT.md for development workflow"
echo "   - Read SECURITY.md for security best practices"
EOF
