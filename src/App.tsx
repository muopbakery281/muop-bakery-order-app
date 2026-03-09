import React, { useState, useMemo } from 'react';
import { ShoppingCart, Truck, Store, CreditCard, CheckCircle2, Upload, ChevronRight, ChevronLeft, Package, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  const handleBack = () => {
    if (step === 1) setShowIntro(true);
    else setStep(step - 1);
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
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUXh2p590fMsI-GZV7EVI5dBWMmR1fJJg2122aGw1U62cfMrv0R4i_1QfvEC_pBdH_1w/exec';
    
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
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsSuccess(true);
    } catch (error) {
      alert('Lỗi gửi đơn, bồ thử lại giúp Mướp nha!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-4 text-[#2e4171]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-[40px] shadow-xl max-w-md w-full text-center space-y-6">
          <CheckCircle2 className="w-20 h-20 text-[#2e4171] mx-auto" />
          <h1 className="text-2xl font-bold">Mướp đã nhận đơn!</h1>
          <p className="opacity-70">Cảm ơn bồ nhiều nha. Đợi Mướp liên hệ xác nhận sớm nhất nhé! ✨</p>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#2e4171] text-white rounded-2xl font-bold transition-all">Quay lại trang chủ</button>
        </motion.div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[48px] shadow-2xl max-w-md w-full p-10 text-center space-y-8">
          <img src="/logo-muop.png" alt="Mướp Bakery" className="w-28 h-28 mx-auto rounded-full shadow-md" />
          <div className="space-y-4">
            <h1 className="text-[#2e4171] text-3xl font-black">Mướp Bakery</h1>
            <p className="text-slate-500 italic">Bánh thủ công, nướng mới theo đơn Thứ 7 & CN hàng tuần.</p>
          </div>
          <button onClick={() => setShowIntro(false)} className="w-full bg-[#2e4171] text-white py-5 rounded-[24px] font-bold text-lg shadow-lg">Bắt đầu đặt đơn thôi →</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2ff] font-sans pb-32 text-[#2e4171]">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#eef2ff]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 hover:bg-[#eef2ff] rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black">Mướp Bakery</h1>
          </div>
          <div className="bg-[#2e4171] text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
            <ShoppingCart className="w-3.5 h-3.5" />
            {cart.reduce((sum, item) => sum + item.quantity, 0)} món
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all ${step === i ? 'w-12 bg-[#2e4171]' : 'w-4 bg-white shadow-inner'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <h2 className="text-sm font-bold opacity-40 uppercase tracking-widest text-center mb-4">1. Chọn bánh bồ thích</h2>
              <div className="grid gap-4">
                {PRODUCTS.map(product => {
                  const item = cart.find(c => c.productId === product.id);
                  return (
                    <div key={product.id} className="bg-white p-6 rounded-[32px] shadow-sm flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-slate-400 text-xs">{product.description || 'Vị ngon khó cưỡng'}</p>
                        <p className="font-black mt-2">{product.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-4 bg-[#f8fafc] p-2 rounded-2xl shadow-inner">
                        <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 rounded-xl bg-white shadow hover:text-red-500 font-bold">-</button>
                        <span className="font-bold w-4 text-center">{item?.quantity || 0}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 rounded-xl bg-[#2e4171] text-white shadow font-bold">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {cart.length > 0 && (
                <button onClick={() => setStep(2)} className="w-full py-5 bg-[#2e4171] text-white rounded-[24px] font-bold shadow-lg mt-8 flex items-center justify-center gap-2">
                  Tiếp tục nhập địa chỉ <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <h2 className="text-sm font-bold opacity-40 uppercase tracking-widest text-center">2. Thông tin giao hàng</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'pickup' }))} className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${customer.shippingMethod === 'pickup' ? 'border-[#2e4171] bg-[#2e4171] text-white' : 'border-white bg-white text-slate-400 shadow-sm'}`}>
                  <Store className="w-5 h-5" />
                  <span className="font-bold text-sm">Pick up tại tiệm</span>
                </button>
                <button onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'delivery' }))} className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${customer.shippingMethod === 'delivery' ? 'border-[#2e4171] bg-[#2e4171] text-white' : 'border-white bg-white text-slate-400 shadow-sm'}`}>
                  <Truck className="w-5 h-5" />
                  <span className="font-bold text-sm">Giao tận nơi</span>
                </button>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-5">
                <input type="text" placeholder="Tên của bồ*" className="w-full p-4 bg-[#f8fafc] rounded-2xl outline-none" value={customer.name} onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="tel" placeholder="SĐT*" className="w-full p-4 bg-[#f8fafc] rounded-2xl outline-none" value={customer.phone} onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))} />
                  <input type="email" placeholder="Email*" className="w-full p-4 bg-[#f8fafc] rounded-2xl outline-none" value={customer.email} onChange={e => setCustomer(prev => ({ ...prev, email: e.target.value }))} />
                </div>

                {customer.shippingMethod === 'pickup' ? (
                  <div className="space-y-4 pt-4 border-t border-[#eef2ff]">
                    <p className="text-xs font-bold opacity-40 uppercase">Chọn ngày Pick up (13:00 - 17:00)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setCustomer(prev => ({ ...prev, pickupDay: 'Saturday' }))} className={`p-3 rounded-2xl font-bold text-xs border-2 ${customer.pickupDay === 'Saturday' ? 'border-[#2e4171] bg-[#2e4171] text-white' : 'border-[#f8fafc] bg-[#f8fafc] text-slate-400'}`}>Thứ 7 (Bình Thạnh)</button>
                      <button onClick={() => setCustomer(prev => ({ ...prev, pickupDay: 'Sunday' }))} className={`p-3 rounded-2xl font-bold text-xs border-2 ${customer.pickupDay === 'Sunday' ? 'border-[#2e4171] bg-[#2e4171] text-white' : 'border-[#f8fafc] bg-[#f8fafc] text-slate-400'}`}>Chủ nhật (Quận 2)</button>
                    </div>
                    <div className="p-4 bg-[#f8fafc] rounded-2xl text-[13px] italic opacity-70">
                      📍 {customer.pickupDay === 'Saturday' ? "179 Chu Văn An, P.26, Q.Bình Thạnh" : "205 Đường số 5, KĐT Lakeview City, P. An Phú, Q2"}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-[#eef2ff]">
                    <select className="w-full p-4 bg-[#f8fafc] rounded-2xl outline-none" value={customer.zone} onChange={e => setCustomer(prev => ({ ...prev, zone: e.target.value }))}>
                      {ZONES.map(z => <option key={z.id} value={z.id}>{z.name} (+{z.fee.toLocaleString()}đ)</option>)}
                    </select>
                    <textarea placeholder="Địa chỉ chi tiết số nhà, tên đường...*" className="w-full p-4 bg-[#f8fafc] rounded-2xl outline-none min-h-[100px]" value={customer.address} onChange={e => setCustomer(prev => ({ ...prev, address: e.target.value }))} />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white rounded-[24px] font-bold text-slate-400 shadow-sm">Quay lại</button>
                <button onClick={() => setStep(3)} disabled={!customer.name || !customer.phone || !customer.email || (customer.shippingMethod === 'delivery' && !customer.address)} className="flex-[2] py-5 bg-[#2e4171] text-white rounded-[24px] font-bold disabled:opacity-30 shadow-lg">Thanh toán ngay</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <h2 className="text-sm font-bold opacity-40 uppercase tracking-widest text-center">3. Thanh toán Chuyển khoản</h2>
              
              <div className="bg-white p-8 rounded-[48px] shadow-sm text-center space-y-6">
                <div>
                  <p className="text-xs font-bold opacity-30 uppercase mb-1">Tổng thanh toán</p>
                  <p className="text-4xl font-black">{total.toLocaleString()}đ</p>
                </div>
                
                <div className="p-4 bg-white rounded-[32px] border border-[#eef2ff] inline-block shadow-xl shadow-blue-900/5">
                  <img src={`${BANK_INFO.qrPlaceholder}${total}`} alt="QR" className="w-56 h-56 mx-auto" />
                </div>

                <div className="text-sm space-y-2 pt-4 border-t border-[#eef2ff]">
                  <div className="flex justify-between"><span>Ngân hàng:</span><span className="font-bold">{BANK_INFO.bankName}</span></div>
                  <div className="flex justify-between"><span>Số tài khoản:</span><span className="font-bold">{BANK_INFO.accountNumber}</span></div>
                  <div className="flex justify-between"><span>Chủ TK:</span><span className="font-bold">{BANK_INFO.accountName}</span></div>
                  <div className="flex justify-between text-[#2e4171]"><span>Nội dung:</span><span className="font-bold">{customer.name} - {customer.phone}</span></div>
                </div>

                <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-[#eef2ff] rounded-[32px] bg-[#f8fafc] cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {billPreview ? <img src={billPreview} className="max-h-48 rounded-2xl" /> : (
                    <div className="flex flex-col items-center opacity-40">
                      <Upload className="mb-2 w-8 h-8" />
                      <span className="text-xs font-bold uppercase">Tải ảnh bill tại đây</span>
                    </div>
                  )}
                </label>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-5 bg-white rounded-[24px] font-bold text-slate-400 shadow-sm">Quay lại</button>
                  <button onClick={handleSubmit} disabled={!billImage || isSubmitting} className="flex-[2] py-5 bg-[#2e4171] text-white rounded-[24px] font-bold shadow-xl flex items-center justify-center gap-2">
                    {isSubmitting ? "Đang gửi đơn..." : <>Gửi đơn ngay <CheckCircle2 className="w-5 h-5" /></>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bar */}
      {step < 3 && cart.length > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
          <div className="max-w-2xl mx-auto bg-[#2e4171] p-6 shadow-2xl rounded-[32px] flex justify-between items-center text-white pointer-events-auto">
            <div>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">Tổng đơn hàng</p>
              <p className="text-xl font-black">{total.toLocaleString()}đ</p>
            </div>
            <div className="bg-white/10 px-5 py-2.5 rounded-2xl text-sm font-bold border border-white/10">
              {cart.reduce((s, i) => s + i.quantity, 0)} món
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
