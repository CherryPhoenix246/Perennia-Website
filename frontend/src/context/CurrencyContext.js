import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Load from localStorage or default to BBD
    const saved = localStorage.getItem('perennia_currency');
    return saved || 'BBD';
  });

  useEffect(() => {
    localStorage.setItem('perennia_currency', currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'BBD' ? 'USD' : 'BBD');
  };

  const formatPrice = (priceBBD, priceUSD) => {
    if (currency === 'USD') {
      return `$${priceUSD.toFixed(2)} USD`;
    }
    return `$${priceBBD.toFixed(2)} BBD`;
  };

  const getPrice = (priceBBD, priceUSD) => {
    return currency === 'USD' ? priceUSD : priceBBD;
  };

  const getSymbol = () => currency === 'USD' ? 'USD' : 'BBD';

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      toggleCurrency,
      formatPrice,
      getPrice,
      getSymbol
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
