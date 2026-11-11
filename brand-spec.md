# Örnek redesign

Mode: visual overhaul; preserve all application contracts.
Audience: Kazakhstan students preparing for ҰБТ, on phones and desktops.
Visual language: dark educational workspace, luminous violet accents, restrained glass surfaces.
Design dials: variance 6, motion 3, density 6, asset dependence 6, brand fidelity 8.

## Identity and assets
- Existing Örnek wordmark: site/assets/ornek-wordmark.svg; light-on-dark adaptation: site/assets/ornek-wordmark-dark.svg.
- Existing custom subject artwork: subject-art.webp, history-art.webp, profile-math-art.webp, physics-art.webp.
- Fonts: existing local Onest (headings), Golos (body); Kazakh characters remain covered by the original font assets.
- Canvas #0c0b12; surfaces #15131f and #1c192a; text #f4f1fc; secondary #b0a8c5; violet #a58aff; mint feedback #70d9b0.
- Spacing: 4px base, 8/12/16/24/32/48/64 rhythm.
- Radius: controls 10–12px, panels 20px, hero 24px.
- Borders: white at 8%, selected violet at 45%; shadows are restrained, glow only on primary focus.
- Motion: 160–240ms ease-out state feedback; reduced-motion respected. No continuous movement in exercises.

## Protected contracts
All question/data files, exercise engines, answers, scoring, timers, storage keys, auth, forms, consent, locale and navigation actions remain unchanged. Existing document IDs and handler names are retained. New rail controls invoke existing actions. Informational sections retain the latest source version; the retired countdown is not restored.

## Validation
Compare all protected files to the source baseline, run existing bank integrity checks, verify assets and JavaScript syntax, then inspect the deployed interface and primary flows.
