import React, { useState, useEffect, useMemo } from 'react';
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

  // --- Calculations ---
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

  // --- Handlers ---
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
      console.error('Error submitting order:', error);
      alert('Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERING ---

  if (IS_CLOSED) {
    return (
      <div className="min-h-screen bg-muop-blue flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center space-y-6">
          <img src="/logo-muop.png" className="w-20 h-20 mx-auto rounded-full shadow-md object-cover" alt="Logo" />
          <h2 className="text-2xl font-black text-muop-dark">Cảm ơn bồ đã ghé!</h2>
          <p className="text-slate-600">Mướp đã nhận đủ đơn đợt này rồi. Hẹn bồ tuần sau nhé! ✨</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-muop-blue flex items-center justify-center p-4 font-sans">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-muop-dark">Mướp đã nhận đơn!</h1>
          <p className="text-slate-600">Mướp sẽ liên hệ xác nhận sớm nhất nha. Chúc bồ một ngày ngọt ngào! ✨</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-muop-primary text-white rounded-xl font-semibold hover:bg-muop-dark transition-colors">Quay lại trang chủ</button>
        </motion.div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
  
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 text-center space-y-8 border border-slate-100"
        >
          {/* Logo với nền #fffaee */}
         <div className="flex justify-center">
          <div className="w-24 h-24 bg-[#fffaee] rounded-full flex items-center justify-center">
             <img src="/logo-muop.png" alt="Mướp Bakery" className="w-16 h-16 object-contain" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-[#2e4171] text-xl font-bold">
            Cảm ơn bạn đã ghé thăm<br/>Mướp Bakery.
          </h1>
          <p className="text-[#794d3a] text-sm leading-relaxed">
            Vì bánh của Mướp được làm <strong>hoàn toàn thủ công</strong>, nướng mới mỗi tuần để đảm bảo chất lượng tốt nhất.
          </p>
        </div>

        {/* Khung thông tin lịch chốt đơn - Dùng màu xanh nhạt nhẹ cho nội dung */}
        <div className="bg-[#a3bfd8]/20 rounded-2xl p-4 text-[#2e4171] text-xs">
          Mướp sẽ chốt order vào <span className="font-bold">Thứ 4</span> hàng tuần...
        </div>

        {/* Nút bấm chính - Dùng màu xanh đậm chuẩn của bồ */}
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

          <button 
            onClick={() => setShowIntro(false)}
            className="w-full bg-muop-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-muop-primary/30 hover:bg-muop-dark transition-all transform active:scale-95 text-lg"
          >
            Bắt đầu đặt đơn thôi →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header với nút Back về Intro */}
      <header className="bg-white border-b border-muop-blue sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowIntro(true)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Quay lại trang thông tin"
            >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-muop-blue/50">
              <img src="/logo-muop.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-lg font-bold text-muop-dark">Mướp Bakery</h1>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-muop-primary bg-muop-blue/30 px-3 py-1.5 rounded-full">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} món</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= i ? 'bg-muop-primary text-white' : 'bg-white text-slate-300 border border-slate-200'}`}>{i}</div>
              {i < 3 && <div className={`w-12 h-0.5 ${step > i ? 'bg-muop-primary' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="text-muop-primary" />
                <h2 className="text-lg font-bold text-slate-800">Chọn bánh bồ thích</h2>
              </div>
              <div className="grid gap-4">
                {PRODUCTS.map(product => {
                  const item = cart.find(c => c.productId === product.id);
                  return (
                    <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-slate-800">{product.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{product.description}</p>
                        <p className="text-muop-primary font-bold mt-1">{product.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl">
                        <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm">-</button>
                        <span className="w-4 text-center font-bold text-muop-dark">{item?.quantity || 0}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-muop-primary text-white shadow-sm">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {cart.length > 0 && (
                <button onClick={() => setStep(2)} className="w-full py-4 bg-muop-primary text-white rounded-xl font-bold mt-6 shadow-lg shadow-muop-primary/20">Tiếp tục đặt hàng <ChevronRight className="inline w-5 h-5 ml-1" /></button>
              )}
            </motion.div>
          )}

          {step === 2 && (
             <motion.div key="s2" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                 {/* ... Giữ nguyên phần Form thông tin khách hàng từ code cũ của bồ ... */}
                 <div className="flex items-center gap-2">
                    <Truck className="text-muop-primary" />
                    <h2 className="text-lg font-bold text-slate-800">Thông tin nhận hàng</h2>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'pickup' }))} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${customer.shippingMethod === 'pickup' ? 'border-muop-primary bg-muop-blue/20' : 'border-slate-100 bg-white'}`}>
                        <Store className={customer.shippingMethod === 'pickup' ? 'text-muop-primary' : 'text-slate-400'} />
                        <span className="font-bold text-sm">Pick up</span>
                    </button>
                    <button onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'delivery' }))} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${customer.shippingMethod === 'delivery' ? 'border-muop-primary bg-muop-blue/20' : 'border-slate-100 bg-white'}`}>
                        <Truck className={customer.shippingMethod === 'delivery' ? 'text-muop-primary' : 'text-slate-400'} />
                        <span className="font-bold text-sm">Giao hàng</span>
                    </button>
                 </div>

                 <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100">
                    <input type="text" placeholder="Tên của bồ" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={customer.name} onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))} />
                    <input type="tel" placeholder="Số điện thoại" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={customer.phone} onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))} />
                    <input type="email" placeholder="Email" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={customer.email} onChange={e => setCustomer(prev => ({ ...prev, email: e.target.value }))} />
                    
                    {customer.shippingMethod === 'delivery' && (
                        <textarea placeholder="Địa chỉ chi tiết" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none h-20" value={customer.address} onChange={e => setCustomer(prev => ({ ...prev, address: e.target.value }))} />
                    )}
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white text-slate-400 border border-slate-200 rounded-xl font-bold">Quay lại</button>
                    <button onClick={() => setStep(3)} disabled={!customer.name || !customer.phone} className="flex-[2] py-4 bg-muop-primary text-white rounded-xl font-bold disabled:opacity-50">Thanh toán</button>
                 </div>
             </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center space-y-4">
                <p className="text-sm text-slate-500 uppercase font-bold">Tổng thanh toán</p>
                <p className="text-3xl font-black text-muop-dark">{total.toLocaleString()}đ</p>
                
                <div className="p-4 bg-white rounded-2xl border-2 border-muop-blue/50 inline-block">
                  <img src={`${BANK_INFO.qrPlaceholder}${total}`} alt="QR" className="w-48 h-48 mx-auto" />
                </div>

                <div className="text-left text-sm space-y-2 pt-4 border-t border-slate-50">
                  <div className="flex justify-between"><span className="text-slate-400">STK:</span><span className="font-bold">{BANK_INFO.accountNumber}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Ngân hàng:</span><span className="font-bold">{BANK_INFO.bankName}</span></div>
                  <div className="flex justify-between text-muop-primary"><span className="font-bold">Nội dung:</span><span className="font-bold">{customer.name} - {customer.phone}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-white cursor-pointer hover:bg-muop-blue/5">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {billPreview ? <img src={billPreview} className="max-h-40 rounded-lg" /> : <><Upload className="text-muop-primary mb-2" /><span className="text-sm font-bold text-slate-500">Tải ảnh bill tại đây</span></>}
                </label>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white text-slate-400 border border-slate-200 rounded-xl font-bold">Quay lại</button>
                <button onClick={handleSubmit} disabled={!billImage || isSubmitting} className="flex-[2] py-4 bg-muop-primary text-white rounded-xl font-bold shadow-lg shadow-muop-primary/20">
                  {isSubmitting ? "Đang gửi..." : "Xác nhận gửi đơn"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Summary */}
      {step < 3 && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-lg z-20">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Tổng cộng</p><p className="text-lg font-black text-muop-dark">{total.toLocaleString()}đ</p></div>
            <div className="text-sm font-bold text-muop-primary bg-muop-blue/20 px-4 py-2 rounded-xl">{cart.reduce((s, i) => s + i.quantity, 0)} món</div>
          </div>
        </div>
      )}
    </div>
  );
}
