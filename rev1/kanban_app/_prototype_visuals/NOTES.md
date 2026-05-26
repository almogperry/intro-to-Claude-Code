# Prototype — visual variants

**PROTOTYPE. Throwaway. Delete after answer captured below.**

## Question

Do the user-reversed visual choices in [project-description.md §7](../../.claude/docs/project-description.md) actually feel right when compared side-by-side with conservative alternatives?

Specifically:
- Inverted priority colours (green = High, red = Low) vs traffic-light
- Large ✓ overlay vs strikethrough on completed cards
- Inline-grow expanded card with blurred backdrop vs side drawer or centred modal

## How to view

Open [index.html](index.html) directly in a browser. No server needed.

URLs:
- `index.html?variant=A` — as-specified
- `index.html?variant=B` — conservative defaults
- `index.html?variant=C` — hybrid

Or use the floating bottom bar / `←` `→` keys to flip between variants.

## Variants

| | Colour scale | Completed | Expanded card |
|---|---|---|---|
| **A** as-spec | green=High → red=Low | large ✓ overlay, 75% opacity | inline-grow from card position + blurred backdrop |
| **B** conservative | red=High → green=Low | strikethrough title+meta, 55% opacity | right-side drawer (420px) |
| **C** hybrid | green=High → red=Low | small ✓ corner badge, 75% opacity | centred modal, no blur |

Same 9 sample tasks across all variants. Includes overdue cards, upcoming cards (with bold frame), completed cards in the terminal column, and tasks with subtasks.

## Answer

_Pending user verdict. Fill in once variant chosen._

- Winning variant:
- Bits to steal from other variants:
- Confirmed reversals to keep:
- Reversals to undo:

## Cleanup

Once verdict captured, delete this directory and fold the winning choices into the real components when building [card.js](../static/js/components/card.js) and [card_expanded.js](../static/js/components/card_expanded.js).

Rev01