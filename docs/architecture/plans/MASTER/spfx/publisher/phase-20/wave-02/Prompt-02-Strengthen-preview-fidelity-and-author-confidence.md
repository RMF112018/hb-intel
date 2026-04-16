# Prompt-02-Strengthen-preview-fidelity-and-author-confidence

## Objective
Improve the preview surface so it feels even more like a dependable pre-publish proof, not just a good approximation with strong explanatory text.

## Authorities
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- readiness/trust controller seams
- any template composition or page-binding seams that affect what preview can faithfully represent

## Current gap to close
The preview trust bridge is strong, but confidence still depends heavily on explanatory framing. Push the product toward stronger intrinsic confidence where the repo supports it.

## Required implementation outcome
1. Audit preview fidelity against the actual rendered/published structure.
2. Identify where preview can become more intrinsically trustworthy.
3. Improve in-context remediation only where it genuinely helps action.
4. Preserve the saved-draft truth model.

## Proof of closure
- show what fidelity or trust improvements were made
- verify preview still speaks truth about saved vs unsaved state
- keep readiness rail and preview responsibilities coherent

## Constraints
- do not turn preview into a second governance rail
- do not blur the saved-draft truth model
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
