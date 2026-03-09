import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Truck, Store, CreditCard, CheckCircle2, Upload, ChevronRight, ChevronLeft, Package } from 'lucide-react';
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
      timestamp: new Date().toLocaleString(),
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.shippingMethod === 'pickup' 
        ? (customer.pickupDay === 'Saturday' ? "Pickup Bình Thạnh" : "Pickup Q2") 
        : customer.address,
      shippingMethod: customer.shippingMethod,
      pickupDay: customer.pickupDay,
      shippingFee: shippingFee,
      cart: cart.map(item => {
        const p = PRODUCTS.find(prod => prod.id === item.productId);
        return { name: p?.name, quantity: item.quantity, price: p?.price };
      }),
      total: total,
      billImage: billPreview
    };

    try {
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUXh2p590fMsI-GZV7EVI5dBWMmR1fJJg2122aGw1U62cfMrv0R4i_1QfvEC_pBdH_1w/exec';
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsSuccess(true);
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (IS_CLOSED) {
    return (
      <div className="min-h-screen bg-[#2e4171] flex items-center justify-center p-4 font-sans text-center">
        <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full space-y-6">
          <img src="/logo-muop.png" className="w-20 h-20 mx-auto rounded-full shadow-md" alt="Logo" />
          <h2 className="text-2xl font-black text-[#2e4171]">Cảm ơn bồ đã ghé!</h2>
          <p className="text-slate-600">Mướp đã nhận đủ đơn đợt này rồi. Hẹn bồ tuần sau nhé! ✨</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#2e4171] flex items-center justify-center p-4 font-sans text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#2e4171]">Mướp đã nhận đơn!</h1>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-[#2e4171] text-white rounded-xl font-bold">Quay lại trang chủ</button>
        </motion.div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#f8faff] font-sans flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center text-center w-full max-w-xl">
          <div className="w-36 h-36 bg-[#fffaee] rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
            <img src="/logo-muop.png" className="w-32 h-32 rounded-full object-cover" alt="Logo" />
          </div>
          <h1 className="text-xl font-black text-[#2e4171] mb-4">Cảm ơn bạn đã ghé thăm Mướp Bakery</h1>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-8">
            Bánh của Mướp được làm thủ công, được nướng mới mỗi tuần <br className="hidden sm:block" />
            để đảm bảo luôn có sẵn bánh tươi để phục vụ khách hàng.
          </p>
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-xl text-left border border-[#dce4ff]">
            <h2 className="font-bold text-[#2e4171] text-lg flex items-center gap-2 mb-6">
              <span className="w-1.5 h-6 bg-[#2e4171] rounded-full"></span> Lịch nhận đơn & giao bánh
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#f0f4ff] flex items-center justify-center mt-0.5 text-[#2e4171] text-xs font-bold">1</div>
                <p className="text-slate-600"><strong>Chốt order:</strong> Thứ 4 hàng tuần</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#f0f4ff] flex items-center justify-center mt-0.5 text-[#2e4171] text-xs font-bold">2</div>
                <p className="text-slate-600"><strong>Giao bánh:</strong> Thứ 7 & Chủ Nhật hàng tuần</p>
              </div>
            </div>
            <button onClick={() => setShowIntro(false)} className="w-full bg-[#2e4171] text-white py-4 rounded-2xl font-bold shadow-lg transition-transform active:scale-95">
              Bắt đầu đặt bánh →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] font-sans pb-24">
      <header className="bg-white border-b border-[#2e4171]/10 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-muop.png" className="w-10 h-10 rounded-full border-2 border-[#2e4171]/20" alt="Logo" />
            <h1 className="text-xl font-bold text-[#2e4171]">Mướp Bakery</h1>
          </div>
          <div className="bg-[#2e4171] text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
            <ShoppingCart className="w-4 h-4" /> {cart.reduce((sum, item) => sum + item.quantity, 0)} món
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= i ? 'bg-[#2e4171] text-white' : 'bg-white text-slate-300 border border-slate-200'}`}>{i}</div>
              {i < 3 && <div className={`w-12 h-0.5 ${step > i ? 'bg-[#2e4171]' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center gap-2 text-[#2e4171] font-bold text-lg"><Package /> Chọn bánh bồ thích</div>
              <div className="grid gap-4">
                {PRODUCTS.map(product => {
                  const item = cart.find(c => c.productId === product.id);
                  return (
                    <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{product.name}</h3>
                        <p className="text-[#2e4171] font-bold">{product.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-3 bg-[#f8faff] p-1.5 rounded-xl border border-[#2e4171]/10">
                        <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 rounded-lg bg-white shadow-sm">-</button>
                        <span className="w-6 text-center font-black text-[#2e4171]">{item?.quantity || 0}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 rounded-lg bg-[#2e4171] text-white shadow-sm">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {cart.length > 0 && (
                <button onClick={() => setStep(2)} className="w-full py-4 bg-[#2e4171] text-white rounded-xl font-bold shadow-lg">Tiếp tục đặt hàng</button>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-2 text-[#2e4171] font-bold text-lg"><Truck /> Thông tin nhận hàng</div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setCustomer({...customer, shippingMethod: 'pickup'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 ${customer.shippingMethod === 'pickup' ? 'border-[#2e4171] bg-[#2e4171]/5' : 'bg-white border-slate-100'}`}><Store /> Pick up</button>
                <button onClick={() => setCustomer({...customer, shippingMethod: 'delivery'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 ${customer.shippingMethod === 'delivery' ? 'border-[#2e4171] bg-[#2e4171]/5' : 'bg-white border-slate-100'}`}><Truck /> Giao hàng</button>
              </div>
              <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <input placeholder="Họ và tên" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#2e4171]" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                <input placeholder="Số điện thoại" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#2e4171]" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                {customer.shippingMethod === 'delivery' ? (
                   <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#2e4171]" value={customer.zone} onChange={e => setCustomer({...customer, zone: e.target.value})}>
                     {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                   </select>
                ) : (
                  <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#2e4171]" value={customer.pickupDay} onChange={e => setCustomer({...customer, pickupDay: e.target.value as any})}>
                    <option value="Saturday">Thứ 7 (Bình Thạnh)</option>
                    <option value="Sunday">Chủ nhật (Quận 2)</option>
                  </select>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white border rounded-xl font-bold">Quay lại</button>
                <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-[#2e4171] text-white rounded-xl font-bold">Thanh toán</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-2 text-[#2e4171] font-bold text-lg"><CreditCard /> Thanh toán chuyển khoản</div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-center">
                <p className="text-sm text-slate-500">Chuyển chính xác số tiền:</p>
                <p className="text-3xl font-black text-[#2e4171]">{total.toLocaleString()}đ</p>
                <div className="bg-[#f8faff] p-4 rounded-2xl border-2 border-dashed border-[#2e4171]/20">
                  <p className="font-bold text-[#2e4171] uppercase">{BANK_INFO.bankName}</p>
                  <p className="text-xl font-mono tracking-wider">{BANK_INFO.accountNumber}</p>
                  <p className="text-xs text-slate-500">{BANK_INFO.accountName}</p>
                </div>
                <div className="border-2 border-[#2e4171]/10 rounded-2xl p-4 inline-block">
                  <img src={`${BANK_INFO.qrPlaceholder}${total}`} alt="QR" className="w-48 h-48" />
                </div>
                <div className="space-y-4 pt-4">
                  <p className="text-sm font-bold text-slate-700">Tải ảnh bill lên đây bồ nhé:</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#2e4171]/20 rounded-2xl cursor-pointer hover:bg-[#2e4171]/5 transition-colors">
                    {billPreview ? <img src={billPreview} className="h-full object-contain p-2" /> : <div className="flex flex-col items-center"><Upload className="text-[#2e4171]" /> <span className="text-xs text-slate-400 mt-2">Bấm để chọn ảnh</span></div>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={isSubmitting || !billImage} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${isSubmitting || !billImage ? 'bg-slate-300' : 'bg-[#2e4171]'}`}>
                {isSubmitting ? 'Đang gửi đơn...' : 'Xác nhận đã chuyển khoản'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
