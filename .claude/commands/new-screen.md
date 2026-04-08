Create a new screen for MaosFalam following these steps:

1. Check @docs/screens.md for the screen spec, all states, and edge cases
2. Create the page in /src/app/ following Next.js App Router conventions
3. Create component files in /src/components/ (reading/, camera/, landing/, or ui/)
4. Import mock data from /src/mocks/ using the useMock() hook
5. Apply brand voice rules from @.claude/skills/brand/SKILL.md to ALL user-facing text
6. Use Tailwind + CSS variables from the design system (colors: black #08050E, deep #110C1A, gold #C9A24A, rose #C4647A, violet #7B6BA5, bone #E8DFD0)
7. Implement ALL states listed in screens.md for this screen (loading, error, empty, success, etc.)
8. Mobile-first: design for 375px width, scale up
9. Add TypeScript types in /src/types/
10. Write a basic Vitest test for the component

Fonts: Cinzel Decorative (logo ONLY), Cormorant Garamond (cigana voice, intros, taglines), Cinzel (headings), Raleway (body, UI, buttons), JetBrains Mono (technical data, badges, metadata).

Corner ornaments (not border-radius) are the visual signature of branded components.
Parchment (#1C1710) background is EXCLUSIVE to reading result cards and share cards.
