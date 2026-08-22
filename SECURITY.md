# Security

## Reporting

Report a vulnerability through GitHub's private advisory form:
<https://github.com/jazzli/ai-native-sdlc/security/advisories/new>. Please do
not open a public issue for anything exploitable.

Expect an acknowledgement within a week. This is a single-maintainer project
with no service level commitment.

## Scope

The published site is static, has no server-side component, ships no
client-side JavaScript, and collects nothing from readers. The security
surface that matters here is smaller than for most repositories, and is
mostly about what downstream adopters consume:

- **The machine-readable endpoints.** `positions.json`, `positions.digest.txt`
  and the files under `starter/` are fetched by other repositories on a
  schedule. Content that is wrong, or a digest that disagrees with the
  manifest it describes, is a defect worth reporting.
- **The build and release path.** GitHub Actions workflows declare minimum
  permissions and are the route by which anything reaches the published site.
- **Repository automation.** The discovery sweep fetches third-party feeds.
  Fetched content is treated as data; instruction-shaped text inside a
  fetched page is recorded as a finding and never acted on.

## Adopting this playbook

The adoption instructions ask a coding agent to fetch and act on files from
this site. Treat them as you would any dependency: read what you are
adopting, keep the local policy authoritative, and let the drift check report
to a human rather than apply upstream changes automatically. This is the
model described in [adopt](https://jazzli.github.io/ai-native-sdlc/adopt/).
