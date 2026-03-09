import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Truck, Store, CheckCircle2, Upload, ChevronRight, Package, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  shippingMethod: 'pickup' | 'delivery';
  zone: string;
  pickupDay?: 'Saturday' | 'Sunday';
}

// --- Constants ---
const PRODUCTS: Product[] = [
  { id: 'brownie-classic', name: 'Brownie Truyền thống', price: 75000, description: 'Hộp 150g' },
  { id: 'brownie-almond', name: 'Brownie Hạnh nhân', price: 80000 },
  { id: 'brownie-cinnamon', name: 'Brownie Quế giòn', price: 80000 },
  { id: 'brownie-cheese-dip', name: 'Brownie Chấm kem phô mai', price: 85000 },
  { id: 'extra-cheese', name: 'Thêm sốt kem phô mai', price: 15000 },
];

const ZONES = [
  { id: 'zone1', name: 'Zone 1 (Q1, 2, 3, Bình Thạnh)', fee: 25000 },
  { id: 'zone2', name: 'Zone 2 (Q4, 5, 7, 10, Gò Vấp, Phú Nhuận)', fee: 35000 },
  { id: 'zone3', name: 'Zone 3 (Các quận còn lại)', fee: 45000 },
];

const BANK_INFO = {
  accountName: "NGUYEN THI NGOC HA",
  accountNumber: "333280188",
  bankName: "ACB",
  qrPlaceholder: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STK:333280188|BANK:ACB|AMOUNT:"
};

const IS_CLOSED = false;

// --- Main Component ---
export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    shippingMethod: 'pickup',
    zone: 'zone1',
    pickupDay: 'Saturday', 
  });
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  const shippingFee = useMemo(() => {
    if (customer.shippingMethod === 'pickup') return 0;
    const zone = ZONES.find(z => z.id === customer.zone);
    return zone?.fee || 0;
  }, [customer.shippingMethod, customer.zone]);

  const total = subtotal + shippingFee;

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta);
        if (newQty === 0) return prev.filter(item => item.productId !== productId);
        return prev.map(item => item.productId === productId ? { ...item, quantity: newQty } : item);
      }
      if (delta > 0) return [...prev, { productId, quantity: 1 }];
      return prev;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setBillPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      customerName: customer.name,
      phone: customer.phone,
      total: total,
      billImage: billPreview
    };

    try {
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUXh2p590fMsI-GZV7EVI5dBWMmR1fJJg2122aGw1U62cfMrv0R4i_1QfvEC_pBdH_1w/exec';
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });
      setIsSuccess(true);
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERING ---

  if (IS_CLOSED) {
    return (
      <div className="min-h-screen bg-[#a3bfd8] flex items-center justify-center p-4 font-sans text-[#2e4171]">
        <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center space-y-6">
          <img src="/logo-muop.png" className="w-20 h-20 mx-auto rounded-full object-cover" alt="Logo" />
          <h2 className="text-2xl font-black">Cảm ơn bồ đã ghé!</h2>
          <p className="opacity-70">Mướp đã nhận đủ đơn đợt này rồi. Hẹn bồ tuần sau nhé! ✨</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#a3bfd8] flex items-center justify-center p-4 font-sans text-[#2e4171]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Mướp đã nhận đơn!</h1>
          <p className="opacity-70">Mướp sẽ liên hệ xác nhận sớm nhất nha. Chúc bồ một ngày ngọt ngào! ✨</p>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#2e4171] text-white rounded-2xl font-bold">Quay lại trang chủ</button>
        </motion.div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#a3bfd8] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-[#fffaee] rounded-full flex items-center justify-center border border-[#a3bfd8]/30">
               <img src="/logo-muop.png" alt="Mướp Bakery" className="w-16 h-16 object-contain" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-[#2e4171] text-2xl font-bold">Cảm ơn bạn đã ghé thăm<br/>Mướp Bakery.</h1>
            <p className="text-[#794d3a] text-sm leading-relaxed">
              Vì bánh của Mướp được làm <strong>hoàn toàn thủ công</strong>, nướng mới mỗi tuần để đảm bảo chất lượng tốt nhất.
            </p>
          </div>

          <div className="bg-[#a3bfd8]/10 rounded-2xl p-4 text-[#2e4171] text-xs border border-[#a3bfd8]/20">
            Mướp sẽ chốt order vào <span className="font-bold">Thứ 4</span> hàng tuần...
          </div>

          <button 
            onClick={() => setShowIntro(false)}
            className="w-full bg-[#2e4171] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Bắt đầu đặt hàng →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#a3bfd8] font-sans pb-24 text-[#2e4171]">
      <header className="bg-white border-b border-[#a3bfd8]/30 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowIntro(true)} className="p-2 hover:bg-[#fffaee] rounded-full">
                <ArrowLeft className="w-5 h-5 text-[#2e4171]" />
            </button>
            <h1 className="text-lg font-bold">Mướp Bakery</h1>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold bg-[#fffaee] border border-[#a3bfd8]/50 px-3 py-1.5 rounded-full text-[#2e4171]">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} món</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= i ? 'bg-[#2e4171] text-white' : 'bg-white text-[#a3bfd8] border border-[#a3bfd8]'}`}>{i}</div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid gap-4">
                {PRODUCTS.map(product => {
                  const item = cart.find(c => c.productId === product.id);
                  return (
                    <div key={product.id} className="bg-white p-5 rounded-3xl shadow-sm border border-[#a3bfd8]/20 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#2e4171]">{product.name}</h3>
                        <p className="text-[#dbac75] font-bold mt-1">{product.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-3 bg-[#fffaee] p-1.5 rounded-2xl border border-[#a3bfd8]/20">
                        <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm">-</button>
                        <span className="font-bold">{item?.quantity || 0}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#2e4171] text-white">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {cart.length > 0 && (
                <button onClick={() => setStep(2)} className="w-full py-4 bg-[#2e4171] text-white rounded-2xl font-bold shadow-xl">Tiếp tục đặt hàng</button>
              )}
            </motion.div>
          )}

          {step === 2 && (
             <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white p-6 rounded-[32px] border border-[#a3bfd8]/20 space-y-4">
                   <input type="text" placeholder="Tên của bồ" className="w-full p-4 bg-[#fffaee] border border-[#a3bfd8]/20 rounded-2xl outline-none" value={customer.name} onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))} />
                   <input type="tel" placeholder="Số điện thoại" className="w-full p-4 bg-[#fffaee] border border-[#a3bfd8]/20 rounded-2xl outline-none" value={customer.phone} onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white border border-[#a3bfd8] rounded-2xl font-bold">Quay lại</button>
                  <button onClick={() => setStep(3)} disabled={!customer.name || !customer.phone} className="flex-[2] py-4 bg-[#2e4171] text-white rounded-2xl font-bold disabled:opacity-50">Thanh toán</button>
                </div>
             </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] border border-[#a3bfd8]/20 text-center space-y-6">
                <p className="text-3xl font-black">{total.toLocaleString()}đ</p>
                <div className="p-4 bg-white rounded-3xl border-2 border-[#fffaee] inline-block shadow-inner">
                  <img src={`${BANK_INFO.qrPlaceholder}${total}`} alt="QR" className="w-48 h-48 mx-auto" />
                </div>
                <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-[#a3bfd8] rounded-3xl bg-[#fffaee] cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      {billPreview ? <img src={billPreview} className="max-h-40 rounded-lg" /> : <><Upload className="mb-2" /><span className="text-sm font-bold opacity-60">Tải ảnh bill tại đây</span></>}
                    </label>
                </div>
                <button onClick={handleSubmit} disabled={!billImage || isSubmitting} className="w-full py-4 bg-[#2e4171] text-white rounded-2xl font-bold shadow-xl">
                  {isSubmitting ? "Đang gửi..." : "Xác nhận gửi đơn"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {step < 3 && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#2e4171] p-5 shadow-2xl z-20 rounded-t-[32px]">
          <div className="max-w-2xl mx-auto flex justify-between items-center text-white">
            <div>
              <p className="text-[10px] font-bold opacity-60 uppercase">Tổng cộng</p>
              <p className="text-xl font-black">{total.toLocaleString()}đ</p>
            </div>
            <div className="bg-[#dbac75] px-4 py-2 rounded-xl text-xs font-bold">{cart.reduce((s, i) => s + i.quantity, 0)} món</div>
          </div>
        </div>
      )}
    </div>
  );
}
