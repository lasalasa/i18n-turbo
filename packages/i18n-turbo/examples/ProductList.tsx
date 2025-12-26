import React from 'react';
const products = ["Laptop", "Phone", "Tablet"];
export function ProductList() {
  return <ul>
      {products.map(product => <li key={product}>{product}</li>)}
    </ul>;
}