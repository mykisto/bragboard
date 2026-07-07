interface Props {
  onStart: () => void;
}

export function EmptyState({ onStart }: Props) {
  return (
    <div className="empty-state">
      <h1 className="empty-state__headline">Start your record.</h1>
      <p className="empty-state__line">
        The days you doubt yourself are the days this board is for. Put the first thing
        you're quietly proud of where you can see it.
      </p>
      <button type="button" className="empty-state__cta" onClick={onStart}>
        Add the first one
      </button>
    </div>
  );
}
