import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { IconCart, IconServer } from '../lib/icons.jsx';
import QRISModal from './QRISModal.jsx';
import { SkeletonGrid, EmptyState } from './Skeleton.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

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
    <main className="max-w-6xl mx-auto px-6 py-16 min-h-screen">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold text-zinc-50">Marketplace</h1>
        <p className="text-zinc-400 mt-2">Pterodactyl panel servers, provisioned instantly after payment.</p>
      </div>

      {isLoading ? (
        <SkeletonGrid count={3} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Belum ada paket hosting tersedia"
          description="Cek lagi nanti, panel baru akan segera hadir."
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {products.map((product) => (
            <motion.div key={product._id} variants={itemVariants} whileHover={{ y: -6 }} className="card-surface p-6 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light mb-4">
                <IconServer className="w-5 h-5" />
              </div>
              <h3 className="font-display text-zinc-50 font-semibold mb-2">{product.name}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed flex-1">{product.description}</p>

              <div className="grid grid-cols-3 gap-2 my-5 text-xs text-zinc-400">
                <div className="border border-zinc-800 rounded-lg py-2 text-center">{product.cpuLimit}% CPU</div>
                <div className="border border-zinc-800 rounded-lg py-2 text-center">{product.ramLimit} MB RAM</div>
                <div className="border border-zinc-800 rounded-lg py-2 text-center">{product.diskLimit} MB Disk</div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-brand-light font-semibold">Rp {product.price.toLocaleString('id-ID')}</span>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <IconCart className="w-4 h-4" /> Buy now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {selectedProduct && (
        <QRISModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </main>
  );
}
