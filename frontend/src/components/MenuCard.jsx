export default function MenuCard({ item, onAdd }) {
  return (
    <article className="menu-card">
      <div className="menu-card__art" aria-hidden="true">
        <span>{item.emoji}</span>
      </div>
      <div className="menu-card__body">
        <h3>{item.name}</h3>
        <p className="menu-card__desc">{item.description}</p>
        <div className="menu-card__footer">
          <span className="menu-card__price">${Number(item.price).toFixed(2)}</span>
          <button className="btn btn--small" onClick={() => onAdd(item)}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
