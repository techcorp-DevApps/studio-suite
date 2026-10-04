# Design authority matrix

## Traceable implementation map

| Concern | Authority | Implementation | Decision |
| --- | --- | --- | --- |
| Primitive and semantic colour | `packages/tokens/src/tokens.ts` | generated `@is/tokens/dist/css/index.css` | Shared tokens are authoritative; generated CSS is never hand-edited. |
| Public composition | reference JSX and bundled HTML | `web/src/pages/Landing.jsx` | Preserve editorial rhythm; omit unsupported statistics, prices, awards and endorsements. |
| Controls | shared semantic CSS variables | `.button`, inputs and shadcn variables | Semantic roles, 3px focus, 48px targets and shared disabled treatment. |
| Theme | token `data-theme` contract | `ThemeProvider`, plus shadcn adapter | Functional screens default to light. No unrestricted toggle. |
| Copy | repository policy bundle | public copy and `backend/policy.py` | Requests remain tentative until backend state is `confirmed`; no appearance-change language. |

## Reconciled conflicts and open visual decisions

- **Gold:** references alternate between champagne `#c9a96e` and brass `#a8884f`. Semantic roles retain both. Gold is not small body text; hover text uses navy and is contrast-tested.
- **Hero type:** references conflict between Cinzel and serif. Cinzel remains display; Cormorant Garamond is limited to italic emphasis pending owner review.
- **Corners:** prototypes mix square controls and shadcn's 8px default. Public controls remain square to preserve the established layout; a global redesign is not implied.
- **Gradient, shadow and filters:** variants disagree. This phase uses semantic gold without a text gradient and a restrained shadow without image filters.
- **`.orchestrator`:** no runtime or token mapping exists. It is recorded as unresolved rather than invented.
- **Testimonials and journal:** no approved content was found. Journal is omitted and testimonials use an explicit unpublished state.

## Accessibility evidence

`packages/tokens/scripts/test-tokens.mjs` checks generated CSS parity and 4.5:1 pairs for normal light/dark body text and gold control hover text. Components supply visible focus, labelled inputs, landmarks, reduced-motion behavior and responsive layouts. This is targeted evidence, not an accessibility certification.
