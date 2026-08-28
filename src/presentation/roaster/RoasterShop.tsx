import React from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { useCart } from '../cart/CartContext';
import {
  findClientBySlug,
  getClientAddress,
  getClientName,
  getClientSlug,
} from '../home/map/dummyClients';
import {
  formatPrice,
  getRoasterProducts,
  getTranslatedProductDescription,
  getTranslatedProductName,
} from './roasterCatalog';
import './RoasterShop.css';

const RoasterShop: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { t, intlLocale } = useI18n();
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
            <img src="/img/BeanBaseLogo.jpg" alt={t('common.logoAlt')} className="roaster-shop-logo" />
            <span className="roaster-shop-brand-copy">
              <strong>{t('common.brand')}</strong>
              <span>{t('shop.brandTagline')}</span>
            </span>
          </Link>
          <p className="roaster-shop-cart" aria-live="polite">
            {t(itemCount === 1 ? 'shop.cartOne' : 'shop.cartOther', { count: itemCount })}
          </p>
        </header>

        <Link to={searchPath} className="roaster-shop-back">
          {t('shop.returnToSearch')}
        </Link>

        <section className="roaster-shop-hero">
          <h1>{name}</h1>
          <p className="roaster-shop-address">{address}</p>
          <div className="roaster-shop-tags">
            {roaster.organic && <span className="roaster-tag is-organic">{t('common.organic')}</span>}
            {roaster.origins.map(origin => (
              <span key={origin} className="roaster-tag">
                {t(`origin.${origin}`)}
              </span>
            ))}
            {roaster.processingTypes.map(process => (
              <span key={process} className="roaster-tag">
                {t(`processing.${process}`)}
              </span>
            ))}
          </div>
        </section>

        <section className="roaster-shop-products" aria-labelledby="roaster-products-heading">
          <div className="roaster-shop-products-header">
            <h2 id="roaster-products-heading">{t('shop.availableProducts')}</h2>
            <p>{t('shop.productsIntro')}</p>
          </div>

          <ul className="roaster-product-list">
            {products.map(product => {
              const quantity = quantityFor(product.id);
              const productName = getTranslatedProductName(product, t);
              return (
                <li key={product.id} className="roaster-product">
                  <div className="roaster-product-copy">
                    <h3>{productName}</h3>
                    <p>{getTranslatedProductDescription(product, t)}</p>
                    <div className="roaster-shop-tags">
                      {product.organic && <span className="roaster-tag is-organic">{t('common.organic')}</span>}
                      <span className="roaster-tag">{t(`origin.${product.origin}`)}</span>
                      <span className="roaster-tag">{t(`processing.${product.processingType}`)}</span>
                      <span className="roaster-tag">{t(product.weightGrams === 1000 ? 'product.size1000' : 'product.size250')}</span>
                    </div>
                  </div>
                  <div className="roaster-product-actions">
                    <p className="roaster-product-price">{formatPrice(product.price, intlLocale)}</p>
                    <button
                      type="button"
                      className="roaster-add-to-cart"
                      onClick={() =>
                        addItem({
                          id: product.id,
                          roasterSlug: getClientSlug(roaster),
                          roasterName: name,
                          productName,
                          price: product.price,
                        })
                      }
                    >
                      {quantity > 0
                        ? t('shop.addAnother', { count: quantity })
                        : t('shop.addToCart')}
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
