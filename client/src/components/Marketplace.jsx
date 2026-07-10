import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { IconCart, IconServer } from '../lib/icons.jsx';
import QRISModal from './QRISModal.jsx';

export default function Marketplace() {
 const [products, setProducts] = useState([]);
 const [selectedProduct, setSelectedProduct] = useState(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 api
 .listProducts()
 .then(setProducts)
 .finally(() => setIsLoading(false));
 }, []);

 return (
 <main className="max-w-6xl mx-auto px-6 py-16">
 <div className="mb-10">
 <h1 className="text-3xl font-semibold text-zinc-50">Marketplace</h1>
 <p className="text-zinc-400 mt-2">Pterodactyl panel servers, provisioned instantly after payment.</p>
 </div>

 {isLoading ? (
 <p className="text-zinc-400">Loading products.</p>
 ) : products.length === 0 ? (
 <p className="text-zinc-400">No products are currently available.</p>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {products.map((product) => (
 <div key={product._id} className="card-surface p-6 flex flex-col">
 <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
 <IconServer className="w-5 h-5" />
 </div>
 <h3 className="text-zinc-50 font-semibold mb-2">{product.name}</h3>
 <p className="text-zinc-400 text-sm leading-relaxed flex-1">{product.description}</p>
 <div className="grid grid-cols-3 gap-2 my-5 text-xs text-zinc-400">
 <div className="border border-zinc-800 rounded-lg py-2 text-center">
 {product.cpuLimit}% CPU
 </div>
 <div className="border border-zinc-800 rounded-lg py-2 text-center">
 {product.ramLimit} MB RAM
 </div>
 <div className="border border-zinc-800 rounded-lg py-2 text-center">
 {product.diskLimit} MB Disk
 </div>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-cyan-400 font-semibold">
 Rp {product.price.toLocaleString('id-ID')}
 </span>
 <button
 onClick={() => setSelectedProduct(product)}
 className="btn-primary flex items-center gap-2 text-sm"
 >
 <IconCart className="w-4 h-4" /> Buy now
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 {selectedProduct && (
 <QRISModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
 )}
 </main>
 );
}
