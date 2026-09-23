# Finish Taktik v3 and add English/Arabic

## Scope
- Repair the unfinished clock settings markup so the app builds again.
- Complete the Carbon & Signal redesign across sign-in, library, book details, upload dialog, and PDF reader.
- Add a global English/Arabic language switch on the main screens.
- Translate navigation, actions, forms, filters, empty states, clock statuses/settings, shortcuts, history, and reader controls.
- Persist the chosen language on the device and apply correct right-to-left layout and Arabic-friendly typography.
- Preserve all existing clock timing, uploads, authentication, search, filtering, and PDF reading behavior.

## Implementation
- Add a lightweight locale provider and centralized translation dictionaries with English as the default.
- Mount the provider at the app root and keep the document `lang` and `dir` synchronized.
- Add a reusable compact language control, then integrate translated copy into public, clock, authentication, and protected library views.
- Finish the remaining visual restyling using the existing Carbon & Signal design tokens and tactile controls.
- Validate the key pages at phone and desktop widths in both language directions, then resolve any build or layout issues.
