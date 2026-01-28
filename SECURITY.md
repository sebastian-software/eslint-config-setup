# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.0.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email [s.werner@sebastian-software.de](mailto:s.werner@sebastian-software.de)
3. Include a description of the vulnerability and steps to reproduce

We will acknowledge receipt within 48 hours and provide a timeline for a fix.

## Scope

This package generates ESLint configurations. Security concerns are primarily:

- Malicious rule configurations that could execute arbitrary code
- Supply chain issues with bundled plugin dependencies
- Information leakage through generated configs
