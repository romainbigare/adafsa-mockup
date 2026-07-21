# CLAUDE.md

Guidance for Claude Code when working in this repo.

## Architecture & code quality

- Always think carefully about the architecture and separation of concerns before making changes: which module/component owns what, where the hard/tricky bits of the code live, what to be aware of, and what could go wrong. Don't just patch the nearest file.

## Product philosophy

- Every feature must be implemented in the most intuitive, user-friendly way possible: minimize inputs, minimize clicks, bury complexity in the code rather than exposing it in the UI.
- Design for "friendly first, works out of the box" — then funnel expert users toward deeper/more advanced inputs further into the app, not up front.

## Agents

- Never spawn Claude Opus or Claude Fable agents for discovery, tracking, or web-search tasks. Use Sonnet only for these.

## Testing

- Keep manual UI testing to a minimum — the user handles that themselves.
- Always add tests in the code for new features/changes to guard against regressions, especially before or after large changes.

## Backward compatibility

- Never implement backward compatibility unless explicitly requested. Break things if it makes the code simpler or the design cleaner.
