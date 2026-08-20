import React from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import {
  findClientBySlug,
  getClientAddress,
  getClientName,
  getClientSlug,
} from '../home/map/dummyClients';
import { formatPrice, getRoasterProducts } from './roasterCatalog';
import './RoasterShop.css';

const RoasterShop: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { addItem, itemCount, quantityFor } = useCart();
  const roaster = findClientBySlug(slug);

  if (!roaster) {
    return <Navigate to="/search" replace />;
  }

  const name = getClientName(roaster);
  const address = getClientAddress(roaster);
  const products = getRoasterProducts(roaster);
  const fromSearch = (location.state as { fromSearch?: string } | null)?.fromSearch;
  const searchPath = fromSearch ? `/search${fromSearch}` : '/search';

  return (
    <div className="roaster-shop">
      <div className="roaster-shop-shell">
        <header className="roaster-shop-header">
          <Link to="/" className="roaster-shop-brand">
            <img src="/img/BeanBaseLogo.jpg" alt="BeanBase logo" className="roaster-shop-logo" />
            <span className="roaster-shop-brand-copy">
              <strong>BeanBase</strong>
              <span>Coffee roaster shop</span>
            </span>
          </Link>
          <p className="roaster-shop-cart" aria-live="polite">
            Cart · {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </header>

        <Link to={searchPath} className="roaster-shop-back">
          Return to search
        </Link>

        <section className="roaster-shop-hero">
          <h1>{name}</h1>
          <p className="roaster-shop-address">{address}</p>
          <div className="roaster-shop-tags">
            {roaster.organic && <span className="roaster-tag is-organic">Organic</span>}
            {roaster.origins.map(origin => (
              <span key={origin} className="roaster-tag">
                {origin}
              </span>
            ))}
            {roaster.processingTypes.map(process => (
              <span key={process} className="roaster-tag">
                {process}
              </span>
            ))}
          </div>
        </section>

        <section className="roaster-shop-products" aria-labelledby="roaster-products-heading">
          <div className="roaster-shop-products-header">
            <h2 id="roaster-products-heading">Available products</h2>
            <p>Roasts based on this shop’s origins, processing, and organic offering.</p>
          </div>

          <ul className="roaster-product-list">
            {products.map(product => {
              const quantity = quantityFor(product.id);
              return (
                <li key={product.id} className="roaster-product">
                  <div className="roaster-product-copy">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="roaster-shop-tags">
                      {product.organic && <span className="roaster-tag is-organic">Organic</span>}
                      <span className="roaster-tag">{product.origin}</span>
                      <span className="roaster-tag">{product.processingType}</span>
                      <span className="roaster-tag">{product.weightGrams === 1000 ? '1kg' : '250g'}</span>
                    </div>
                  </div>
                  <div className="roaster-product-actions">
                    <p className="roaster-product-price">{formatPrice(product.price)}</p>
                    <button
                      type="button"
                      className="roaster-add-to-cart"
                      onClick={() =>
                        addItem({
                          id: product.id,
                          roasterSlug: getClientSlug(roaster),
                          roasterName: name,
                          productName: product.name,
                          price: product.price,
                        })
                      }
                    >
                      {quantity > 0 ? `Add another · ${quantity} in cart` : 'Add to cart'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default RoasterShop;
