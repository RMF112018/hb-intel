/**
 * My Work home surface scaffold.
 *
 * B03-04 mounts a structural marker so the router and shell tests can
 * verify which surface rendered. The visible cards (Work Summary,
 * Adobe Sign Action Queue, Source Readiness) land in B03-05.
 */
export function MyWorkHomeSurface() {
  return (
    <div
      data-my-work-surface="my-work-home"
      data-my-work-surface-role="home"
      data-my-work-surface-scaffold="b03-04"
      aria-hidden="true"
    />
  );
}

export default MyWorkHomeSurface;
