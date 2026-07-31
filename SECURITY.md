# Security Policy

Compounded is a family math app for kids. Its core promise is that all
child data is **private by construction**: profiles live only in the
browser's IndexedDB on the family's own devices, with no accounts, no
analytics, and no third-party network calls. Anything that could break
that promise is a security issue we want to hear about.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Instead, use GitHub's private reporting: **Security tab → Report a
vulnerability**. That opens a private advisory thread that only you and
the maintainer can see.

This is a family-run project, not a company. You'll get an
acknowledgment within about a week, and a fix as fast as one parent's
evenings allow. There is no bug bounty — just sincere thanks and credit
in the changelog if you'd like it.

## Scope

Threat model note: the optional family backup is protected by a family
key checked on every request. On plain-http LAN addresses the key
travels unencrypted (observable by devices on the same network) — the
app requires an explicit grown-up acknowledgement there and prefers the
HTTPS hostname. The backup server must never be exposed to the
internet.

In scope:

- The PWA itself (everything under `src/`), especially anything that
  could expose or corrupt a child's locally stored progress.
- The published self-hosting configuration in `deploy/` (nginx, the
  optional same-origin WebDAV `/sync/` backup endpoint).
- The service worker / update pipeline.

Out of scope:

- Misconfiguration of a family's own self-hosted server or LAN.
- The in-app currency (Paw Bucks are fictitious and carry no real-world
  value by design).

## Supported versions

Only the latest release on `main` is supported. The app self-updates
via its service worker, so families are expected to be on (or near) the
newest version.
