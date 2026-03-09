import React, { useState, useMemo } from 'react';
import { ShoppingCart, Truck, Store, CreditCard, CheckCircle2, Upload, ChevronRight, ChevronLeft, Package, ArrowLeft } from 'lucide-react';
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
  qrPlaceholder: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=STK:333280188|BANK:ACB|AMOUNT:"
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '', phone: '', email: '', address: '',
    shippingMethod: 'pickup', zone: 'zone1', pickupDay: 'Saturday', 
  });
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, item) => {
    const p = PRODUCTS.find(prod => prod.id === item.productId);
    return sum + (p?.price || 0) * item.quantity;
  }, 0), [cart]);

  const shippingFee = useMemo(() => (customer.shippingMethod === 'pickup' ? 0 : (ZONES.find(z => z.id === customer.zone)?.fee || 0)), [customer]);
  const total = subtotal + shippingFee;

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta);
        return newQty === 0 ? prev.filter(i => i.productId !== productId) : prev.map(i => i.productId === productId ? { ...i, quantity: newQty } : i);
      }
      return delta > 0 ? [...prev, { productId, quantity: 1 }] : prev;
    });
  };

  const handleBack = () => step === 1 ? setShowIntro(true) : setStep(step - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUXh2p590fMsI-GZV7EVI5dBWMmR1fJJg2122aGw1U62cfMrv0R4i_1QfvEC_pBdH_1w/exec';
    try {
      await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ ...customer, total, cart, billPreview }) });
      setIsSuccess(true);
    } catch (e) { alert('Lỗi gửi đơn rồi bồ ơi!'); } finally { setIsSubmitting(false); }
  };

  if (isSuccess) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#eef2ff]">
      <div className="bg-white p-10 rounded-[40px] shadow-xl max-w-md w-full text-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-[#2e4171] mx-auto" />
        <h1 className="text-2xl font-bold text-[#2e4171]">Mướp đã nhận đơn!</h1>
        <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#2e4171] text-white rounded-2xl font-bold">Quay lại</button>
      </div>
    </div>
  );

  if (showIntro) return (
    <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[40px] shadow-xl max-w-md w-full p-10 text-center">
        <img src="/logo-muop.png" className="w-24 h-24 mx-auto rounded-full mb-6 shadow-sm" alt="Logo" />
        <h1 className="text-[#2e4171] text-3xl font-black mb-2">Mướp Bakery</h1>
        <p className="text-slate-400 mb-8 italic">Bánh mới mỗi cuối tuần ✨</p>
        <button onClick={() => setShowIntro(false)} className="w-full bg-[#2e4171] text-white py-4 rounded-2xl font-bold">Bắt đầu đặt đơn →</button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef2ff] pb-32">
      <header className="bg-white sticky top-0 z-10 border-b border-[#dce4ff]">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={handleBack} className="p-2 hover:bg-[#f0f4ff] rounded-full text-[#2e4171]"><ArrowLeft size={20}/></button>
          <span className="font-black text-[#2e4171]">Mướp Bakery</span>
          <div className="bg-[#2e4171] text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
             <ShoppingCart size={14}/> {cart.reduce((s, i) => s + i.quantity, 0)}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-4">
              <h2 className="text-xs font-bold text-[#2e4171] opacity-50 uppercase text-center">1. Chọn bánh bồ thích</h2>
              {PRODUCTS.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-[24px] shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#2e4171]">{p.name}</h3>
                    <p className="text-xs text-slate-400">{p.description || 'Nướng mới trong ngày'}</p>
                    <p className="font-black text-[#2e4171] mt-1">{p.price.toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center gap-3 bg-[#f8fafc] p-2 rounded-xl">
                    <button onClick={() => updateQuantity(p.id, -1)} className="w-8 h-8 rounded-lg bg-white shadow text-[#2e4171] font-bold">-</button>
                    <span className="font-bold text-[#2e4171]">{cart.find(c => c.productId === p.id)?.quantity || 0}</span>
                    <button onClick={() => updateQuantity(p.id, 1)} className="w-8 h-8 rounded-lg bg-[#2e4171] text-white shadow font-bold">+</button>
                  </div>
                </div>
              ))}
              {cart.length > 0 && <button onClick={() => setStep(2)} className="w-full py-4 bg-[#2e4171] text-white rounded-2xl font-bold shadow-lg">Tiếp theo →</button>}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <h2 className="text-xs font-bold text-[#2e4171] opacity-50 uppercase text-center">2. Thông tin nhận hàng</h2>
              <div className="flex gap-3">
                <button onClick={() => setCustomer({...customer, shippingMethod: 'pickup'})} className={`flex-1 p-4 rounded-2xl border-2 font-bold text-sm ${customer.shippingMethod === 'pickup' ? 'border-[#2e4171] bg-[#2e4171] text-white' : 'border-white bg-white text-slate-400'}`}>Tới lấy bánh</button>
                <button onClick={() => setCustomer({...customer, shippingMethod: 'delivery'})} className={`flex-1 p-4 rounded-2xl border-2 font-bold text-sm ${customer.shippingMethod === 'delivery' ? 'border-[#2e4171] bg-[#2e4171] text-white' : 'border-white bg-white text-slate-400'}`}>Ship tận nơi</button>
              </div>
              <div className="bg-white p-6 rounded-[32px] space-y-4 shadow-sm">
                <input placeholder="Tên bồ*" className="w-full p-4 bg-[#f8fafc] rounded-xl outline-none text-sm" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                <input placeholder="Số điện thoại*" className="w-full p-4 bg-[#f8fafc] rounded-xl outline-none text-sm" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                <input placeholder="Email*" className="w-full p-4 bg-[#f8fafc] rounded-xl outline-none text-sm" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})}/>
                {customer.shippingMethod === 'pickup' ? (
                  <div className="pt-4 border-t space-y-3">
                    <p className="text-[10px] font-bold opacity-40 uppercase">Chọn ngày (13h-17h)</p>
                    <div className="flex gap-2">
                      <button onClick={() => setCustomer({...customer, pickupDay: 'Saturday'})} className={`flex-1 py-3 rounded-xl text-xs font-bold ${customer.pickupDay === 'Saturday' ? 'bg-[#2e4171] text-white' : 'bg-[#f8fafc] text-slate-400'}`}>Thứ 7 (Bình Thạnh)</button>
                      <button onClick={() => setCustomer({...customer, pickupDay: 'Sunday'})} className={`flex-1 py-3 rounded-xl text-xs font-bold ${customer.pickupDay === 'Sunday' ? 'bg-[#2e4171] text-white' : 'bg-[#f8fafc] text-slate-400'}`}>Chủ Nhật (Q2)</button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t space-y-4">
                    <select className="w-full p-4 bg-[#f8fafc] rounded-xl text-sm" value={customer.zone} onChange={e => setCustomer({...customer, zone: e.target.value})}>
                      {ZONES.map(z => <option key={z.id} value={z.id}>{z.name} (+{z.fee.toLocaleString()}đ)</option>)}
                    </select>
                    <textarea placeholder="Địa chỉ chi tiết*" className="w-full p-4 bg-[#f8fafc] rounded-xl text-sm min-h-[80px]" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                  </div>
                )}
              </div>
              <button onClick={() => setStep(3)} disabled={!customer.name || !customer.phone} className="w-full py-4 bg-[#2e4171] text-white rounded-2xl font-bold disabled:opacity-30 shadow-lg">Tới bước Thanh toán</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6 text-center">
              <h2 className="text-xs font-bold text-[#2e4171] opacity-50 uppercase">3. Thanh toán</h2>
              <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-6">
                <p className="text-3xl font-black text-[#2e4171]">{total.toLocaleString()}đ</p>
                <img src={`${BANK_INFO.qrPlaceholder}${total}`} className="w-48 h-48 mx-auto border-4 border-[#f0f4ff] rounded-2xl" alt="QR"/>
                <div className="text-xs space-y-1 opacity-70">
                  <p>STK: <b>{BANK_INFO.accountNumber}</b> - {BANK_INFO.bankName}</p>
                  <p>Tên: {BANK_INFO.accountName}</p>
                </div>
                <label className="block p-6 border-2 border-dashed border-[#eef2ff] rounded-2xl bg-[#f8fafc] cursor-pointer">
                  <input type="file" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setBillImage(f); const r = new FileReader(); r.onload = () => setBillPreview(r.result as string); r.readAsDataURL(f); }
                  }}/>
                  {billPreview ? <img src={billPreview} className="max-h-32 mx-auto rounded-lg"/> : <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Tải ảnh bill tại đây</span>}
                </label>
                <button onClick={handleSubmit} disabled={!billImage || isSubmitting} className="w-full py-4 bg-[#2e4171] text-white rounded-2xl font-bold shadow-lg">Gửi đơn hàng</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {step < 3 && cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 max-w-xl mx-auto z-20">
          <div className="bg-[#2e4171] p-5 rounded-[24px] shadow-2xl flex justify-between items-center text-white">
            <div><p className="text-[10px] opacity-50 uppercase font-bold">Tổng đơn</p><p className="text-lg font-black">{total.toLocaleString()}đ</p></div>
            <div className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold border border-white/5">{cart.reduce((s,i) => s+i.quantity, 0)} món</div>
          </div>
        </div>
      )}
    </div>
  );
}
