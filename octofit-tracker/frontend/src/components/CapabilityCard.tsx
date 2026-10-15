import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<Item> = {
  title: string;
  description: string;
  load: () => Promise<Record<string, Item[]>>;
  responseKey: string;
  emptyText: string;
  renderItem: (item: Item) => ReactNode;
};

type ResourceState<Item> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; items: Item[] };

export function CapabilityCard<Item>({ title, description, load, responseKey, emptyText, renderItem }: Props<Item>) {
  const [state, setState] = useState<ResourceState<Item>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    load()
      .then((data) => {
        if (!Array.isArray(data[responseKey])) throw new Error('Invalid API response');
        if (active) setState({ status: 'success', items: data[responseKey] });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, [load, responseKey]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
    {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}. Please try again later.</p>}
    {state.status === 'success' && (state.items.length === 0
      ? <p role="status">{emptyText}</p>
      : <ul className="list-group list-group-flush">{state.items.map((item, index) => <li className="list-group-item" key={index}>{renderItem(item)}</li>)}</ul>)}
  </div></section>;
}
