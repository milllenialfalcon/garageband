# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Use GitHub's private vulnerability reporting: open the **Security** tab of this repository and choose **Report a vulnerability**. Include what you found, the file or gate involved, and steps to reproduce. Remove any real secrets from the report.

## What is in scope

- The guard hook (`hooks/guard.sh`) and the pre-push guard, if a destructive command or a push to `main` gets through.
- The installers (`install.sh`, the plugin manifest) if they fetch or run code other than what this repository publishes.
- Skills or scripts that would cause a project to leak secrets or skip its security gates.

## Supported versions

Only the latest release on `main` receives fixes. The current release is 0.1.0.
