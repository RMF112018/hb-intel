# 04A — Personalized Welcome Header Contract and Behavior Matrix

## Purpose

Lock Prompt-04 welcome-header implementation behavior so Prompt-05+ can consume a stable top-band signature greeting contract.

## Contract Surface

- Webpart module: `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/`
- Manifest baseline: `PersonalizedWelcomeHeaderWebPart.manifest.json`
- Config contract: `PersonalizedWelcomeHeaderConfig`
- Helper seams used: `resolveWelcomeMessage`, `resolveFirstName`, `resolveGreetingAt`, `normalizeWelcomeHeaderConfig`

## Behavior Matrix

| Scenario                         | Expected behavior                                                    |
| -------------------------------- | -------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| Preferred/profile name available | Headline format is `Good morning                                     | afternoon                    | evening, {First Name}.`                                            |
| Preferred name missing           | Fallback uses display name then email local-part token, then `there` |
| Support/context lines provided   | Rendered below hero-signature heading with preserved hierarchy       |
| Alert severity is `none`         | No alert section rendered                                            |
| Alert severity is `info          | warning                                                              | critical` with message/title | Alert status section renders without displacing greeting hierarchy |

## Ownership and Maintenance

- Shared greeting/identity helper contracts are maintained by `hb-webparts` app maintainers.
- Site owners maintain authored support/context/alert content via property pane configuration.
- Greeting format and fallback order are locked for Prompt-04 and should not be changed by feature prompts without an explicit decision record.
