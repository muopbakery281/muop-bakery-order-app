import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Truck, Store, CreditCard, CheckCircle2, Upload, ChevronRight, ChevronLeft, Package, Truck } from 'lucide-react';
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
  { id: 'brownie-almond', name: 'Brownie Hạnh nhân', price: 80000, description: 'Hộp 150g'},
  { id: 'brownie-cinnamon', name: 'Brownie Quế giòn', price: 80000, description: 'Hộp 150g' },
  { id: 'brownie-cheese-dip', name: 'Brownie Chấm kem phô mai', price: 85000, description: 'Hộp 150g' },
  { id: 'extra-cheese', name: 'Thêm sốt kem phô mai', price: 15000, description: 'Hũ 30g' },
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
  qrPlaceholder: "https://i.postimg.cc/ZKvNCc7K/qr.png"
};

const SOCIAL_LINKS = {
  facebook: "https://facebook.com/muop.bakery", // Thay link thiệt của bồ vô đây
  instagram: "https://instagram.com/muop.bakery",
};

const PriceSummaryBox = ({ subtotal, shippingFee, total, onNext, nextLabel, showShipping = false, disabled = false }: any) => (
  <div className="bg-[#f0f4ff] p-5 rounded-[24px] border border-[#dce4ff] space-y-3 mt-6">
    <div className="space-y-2">
      <div className="flex justify-between text-[15px] font-medium text-slate-600">
        <span>Tạm tính:</span>
        <span className="text-[#3b82f6] font-bold">{subtotal.toLocaleString()}đ</span>
      </div>
      
      {/* Chỉ hiện phí ship khi ở Step 2 */}
      {showShipping && shippingFee > 0 && ( // Chỉ hiện khi có phí ship > 0
        <div className="flex justify-between text-[15px] font-medium text-slate-600">
          <span>Phí giao hàng:</span>
          <span>{shippingFee.toLocaleString()}đ</span>
        </div>
      )}

      {/* Dòng Tổng cộng cuối cùng ở Step 2 */}
      {showShipping && (
        <div className="flex justify-between items-center pt-2 border-t border-blue-200">
          <span className="font-bold text-slate-800">Tổng cộng:</span>
          <span className="text-xl font-black text-[#3b82f6]">{total.toLocaleString()}đ</span>
        </div>
      )}
    </div>

    <button 
      onClick={onNext} 
      disabled={disabled}
      className="w-full py-4 bg-[#3b82f6] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#2563eb] transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
    >
      {nextLabel} <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);

const IS_CLOSED = false; //False = Mở form | True = Đóng form

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
      if (SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Có lỗi xảy ra khi gửi đơn hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

if (IS_CLOSED) {
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-4 font-sans text-center">
        {/* Khung trắng chính - Bo góc 32px và đổ bóng */}
        <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full space-y-6">
          
          {/* Logo nằm trong vòng tròn màu be y hệt Intro */}
          <div className="w-28 h-28 bg-[#fffaee] rounded-full flex items-center justify-center mb-6 
            mx-auto 
    
            /* HIỆU ỨNG MỚI: Đổ bóng kép để tạo độ nổi */
            shadow-lg shadow-blue-100/50
            
            /* HIỆU ỨNG MỚI: Viền trắng dày và rõ ràng */
            border-4 border-white
          ">
            <img 
              src="/logo-muop.png" 
              className="w-24 h-24 rounded-full object-cover" 
              alt="Mướp Bakery Logo" 
            />
          </div>
          

          <h2 className="text-2xl font-black text-[#3b82f6]">Cảm ơn bạn đã ghé Mướp Bakery!</h2>
          <p className="text-slate-600 italic text-[15px]">
           Tiếc là Mướp đã nhận đủ đơn bánh cho đợt này rồi. <br className="hidden sm:block" /> Hẹn bồ tuần sau nhé! ✨
          </p>
          
          {/* Phần kết nối Social */}
          <div className="pt-4 border-t border-slate-50">
            <p className="text-sm text-slate-400 mb-4">Theo dõi Mướp để không bỏ lỡ đợt đặt bánh tới nha:</p>
            <div className="flex justify-center gap-4">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#eef2ff] text-[#3b82f6] rounded-xl font-bold text-sm">Facebook</a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#fef2f2] text-[#ec4899] rounded-xl font-bold text-sm">Instagram</a>
            </div>
          </div>
        </div> 
      </div> 
    );
  }
  
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-4 font-sans text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#3b82f6]">Cảm ơn bạn đã đặt hàng!</h1>
          <p className="text-slate-600">Mướp sẽ kiểm tra đơn hàng và gửi thông tin xác nhận qua email trong vòng 24 giờ✨ </p>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] transition-colors">
            Quay lại trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#eef2ff] font-sans pb-10 flex flex-col items-center justify-center">
         <div className="flex flex-col items-center pt-10 pb-6 text-center px-4 w-full max-w-xl">
            <div className="w-36 h-36 bg-[#fffaee] rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
              <img src="/logo-muop.png" className="w-32 h-32 rounded-full object-cover" alt="Mướp Bakery Logo" />
            </div>
            <h1 className="text-[20px] font-black text-[#3b82f6] mb-4 w-full">Cảm ơn bạn đã ghé thăm Mướp Bakery</h1>
            <p className="text-slate-600 text-[15px] leading-relaxed mb-8 px-4 max-w-[1100px] mx-auto">
              Bánh của Mướp được làm thủ công, được nướng mới mỗi tuần <br className="hidden sm:block" /> để đảm bảo luôn có sẵn bánh tươi để phục vụ khách hàng.
            </p>
            <div className="w-full bg-white rounded-[32px] p-8 shadow-xl text-left space-y-5 border border-[#dce4ff]">
               <h2 className="font-bold text-[#3b82f6] text-lg flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-[#3b82f6] rounded-full"></span> Lịch nhận đơn & giao bánh
               </h2>
               <div className="space-y-4">
                 <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-[#eef2ff] flex items-center justify-center mt-0.5">
                     <span className="text-[#3b82f6] text-[10px] font-bold">1</span>
                   </div>
                   <p className="text-slate-600 text-[15px]"><span className="font-bold text-slate-800">Chốt order:</span> Thứ 4 hàng tuần</p>
                 </div>
                 <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-[#eef2ff] flex items-center justify-center mt-0.5">
                     <span className="text-[#3b82f6] text-[10px] font-bold">2</span>
                   </div>
                   <p className="text-slate-600 text-[15px]"><span className="font-bold text-slate-800">Giao bánh:</span> Thứ 7 & Chủ Nhật hàng tuần</p>
                 </div>
               </div>
               <button onClick={() => setShowIntro(false)} className="w-full bg-[#3b82f6] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#3b82f6]/20 hover:bg-[#2563eb] transition-all text-lg mt-4">
                 Bắt đầu đặt bánh →
               </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <header className="bg-white border-b border-[#eef2ff] sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#eef2ff]">
              <img src="/logo-muop.png" alt="Mướp Bakery Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold text-[#3b82f6] tracking-tight">Mướp Bakery</h1>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-white bg-[#3b82f6] px-3 py-1.5 rounded-full">
            <ShoppingCart className="w-4 h-4" />
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} món</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= i ? 'bg-[#3b82f6] text-white' : 'bg-white text-slate-300 border border-slate-200'
              }`}>
                {i}
              </div>
              {i < 3 && <div className={`w-12 h-0.5 ${step > i ? 'bg-[#3b82f6]' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="text-[#3b82f6]" />
                <h2 className="text-lg font-bold text-slate-800">Chọn bánh bồ thích</h2>
              </div>
              <div className="grid gap-4">
                {PRODUCTS.map(product => {
                  const item = cart.find(c => c.productId === product.id);
                  return (
                    <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-[#3b82f6] transition-colors">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-slate-800">{product.name}</h3>
                        <p className="text-sm text-slate-500">{product.description || 'Hộp 150gr'}</p>
                        <p className="text-[#3b82f6] font-bold mt-1">{product.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <button type="button" onClick={(e) => { e.preventDefault(); updateQuantity(product.id, -1); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-600 hover:text-[#3b82f6] active:scale-90 transition-transform">-</button>
                        <span className="w-6 text-center font-black text-[#3b82f6]">{item?.quantity || 0}</span>
                        <button type="button" onClick={(e) => { e.preventDefault(); updateQuantity(product.id, 1); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-sm hover:bg-[#2563eb] active:scale-90 transition-transform">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
          {cart.length > 0 && (
                      <PriceSummaryBox 
                        subtotal={subtotal} 
                        onNext={() => setStep(2)} 
                        nextLabel="Tiếp tục đặt hàng" 
                      />
                    )}
                  </motion.div> 
                )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Truck className="text-[#3b82f6]" />
                  <h2 className="text-lg font-bold text-slate-800">Thông tin nhận hàng</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'pickup' }))} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${customer.shippingMethod === 'pickup' ? 'border-[#3b82f6] bg-[#eef2ff]' : 'border-slate-100 bg-white'}`}>
                    <Store className={customer.shippingMethod === 'pickup' ? 'text-[#3b82f6]' : 'text-slate-400'} />
                    <span className="font-bold text-[#3b82f6]">Lấy đơn tại tiệm</span>
                  </button>
                  <button onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'delivery' }))} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${customer.shippingMethod === 'delivery' ? 'border-[#3b82f6] bg-[#eef2ff]' : 'border-slate-100 bg-white'}`}>
                    <Truck className={customer.shippingMethod === 'delivery' ? 'text-[#3b82f6]' : 'text-slate-400'} />
                    <span className="font-bold text-[#3b82f6]">Giao hàng</span>
                  </button>
                </div>

                <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Tên của bạn<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input type="text" placeholder="Nhập tên bạn..." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all text-black font-medium" value={customer.name} onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider text-black">
                        Số điện thoại*
                      </label>
                      <input 
                        type="tel" 
                        placeholder="09xx..." 
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all text-black font-medium" 
                        value={customer.phone} 
                        onChange={e => {
                          // CHẶN TẠI ĐÂY: Chỉ giữ lại các chữ số (0-9)
                          const value = e.target.value.replace(/\D/g, '');
                          setCustomer(prev => ({ ...prev, phone: value }));
                        }} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Email<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="email" placeholder="muop@bakery.com" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all text-black font-medium" value={customer.email} onChange={e => setCustomer(prev => ({ ...prev, email: e.target.value }))} />
                    </div>
                  </div>

                  {customer.shippingMethod === 'pickup' && (
                    <div className="space-y-4 pt-4 border-t border-slate-50 animate-fade-in-up">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#3b82f6]">
                        Chọn ngày lấy đơn tại tiệm <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        <button type="button" onClick={() => setCustomer(prev => ({ ...prev, pickupDay: 'Saturday' }))} className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-start gap-1 ${customer.pickupDay === 'Saturday' ? 'border-[#3b82f6] bg-[#eef2ff] text-[#3b82f6]' : 'border-slate-100 bg-white text-slate-400'}`}>
                          <div className="flex justify-between w-full">
                            <span>Thứ 7 (13:00 - 17:00)</span>
                            {customer.pickupDay === 'Saturday' && <CheckCircle2 className="w-4 h-4 text-[#3b82f6]" />}
                          </div>
                          <span className="text-[11px] font-medium opacity-80 text-slate-500 text-left">📍 Địa chỉ: 179 Chu Văn An, Phường 26, Quận Bình Thạnh, TP.HCM</span>
                        </button>
                        
                        <button type="button" onClick={() => setCustomer(prev => ({ ...prev, pickupDay: 'Sunday' }))} className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-start gap-1 ${customer.pickupDay === 'Sunday' ? 'border-[#3b82f6] bg-[#eef2ff] text-[#3b82f6]' : 'border-slate-100 bg-white text-slate-400'}`}>
                          <div className="flex justify-between w-full">
                            <span>Chủ nhật (16:00 - 20:00)</span>
                            {customer.pickupDay === 'Sunday' && <CheckCircle2 className="w-4 h-4 text-[#3b82f6]" />}
                          </div>
                          <span className="text-[11px] font-medium opacity-80 text-slate-500 text-left">📍 Địa chỉ: 205 Đường số 5, KĐT Lakeview City, Phường An Phú, Quận 2, TP.HCM</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {customer.shippingMethod === 'delivery' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 pt-4 border-t border-slate-50">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Khu vực giao hàng<span className="text-red-500 ml-1">*</span>
                        </label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all text-black font-medium" value={customer.zone} onChange={e => setCustomer(prev => ({ ...prev, zone: e.target.value }))}>
                          {ZONES.map(z => (<option key={z.id} value={z.id} className="text-black">{z.name} - {z.fee.toLocaleString()}đ</option>))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Địa chỉ chi tiết<span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea placeholder="Số nhà, tên đường, phường..." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none min-h-[80px] focus:ring-2 focus:ring-[#3b82f6] transition-all text-black font-medium" value={customer.address} onChange={e => setCustomer(prev => ({ ...prev, address: e.target.value }))} />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

<PriceSummaryBox 
      subtotal={subtotal} 
      shippingFee={shippingFee} 
      total={total} 
      showShipping={true} 
      onNext={() => setStep(3)} 
      nextLabel="Thanh toán ngay"
      disabled={!customer.name || !customer.phone || (customer.shippingMethod === 'delivery' && !customer.address)}
    />

    {/* Nút quay lại để dạng text đơn giản bên dưới box xanh cho đẹp */}
    <button 
      onClick={() => setStep(1)} 
      className="w-full text-slate-400 font-bold text-sm mt-4 hover:text-[#3b82f6] transition-colors"
    >
      ← Quay lại
    </button>
  </motion.div>
)}
        
{step === 3 && (
  <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
    <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-[#3b82f6]" />
                  <h2 className="text-lg font-bold text-slate-800">Thanh toán chuyển khoản</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white rounded-2xl border-2 border-[#eef2ff] shadow-inner">
                      <img src={`${BANK_INFO.qrPlaceholder}${total}`} alt="Mã QR" className="w-56 h-56 object-contain" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-slate-500">Quét mã để thanh toán nhanh</p>
                      <p className="font-bold text-[#3b82f6] text-xl">{total.toLocaleString()}đ</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-50 pt-6 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Tên tài khoản:</span><span className="font-bold text-slate-700">{BANK_INFO.accountName}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Số tài khoản:</span><span className="font-bold text-slate-700">{BANK_INFO.accountNumber}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Ngân hàng:</span><span className="font-bold text-slate-700">{BANK_INFO.bankName}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Nội dung:</span><span className="font-bold text-[#3b82f6]">{customer.name} - {customer.phone}</span></div>
                  </div>
                </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="text-[#3b82f6] w-5 h-5" />
          <h3 className="font-bold text-slate-800">Xác nhận chuyển khoản</h3>
        </div>
        
        <div className="relative">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="bill-upload" />
          <label 
            htmlFor="bill-upload" 
            className="flex flex-col items-center justify-center w-full p-10 border-2 border-dashed border-slate-200 rounded-[32px] bg-white hover:border-[#3b82f6] transition-all cursor-pointer group"
          >
            {billPreview ? (
              <img src={billPreview} alt="Bill preview" className="w-full max-h-64 object-contain rounded-xl" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-[#eef2ff] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <div className="text-center">
                  <p className="text-slate-800 font-bold text-lg">Tải ảnh bill tại đây</p>
                  <p className="text-slate-400 text-sm mt-1">Chụp màn hình chuyển khoản thành công</p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>

    {/* PHẦN NÚT BẤM MỚI THEO MẪU */}
    <div className="flex gap-4 mt-10">
      <button 
        onClick={() => setStep(2)} 
        className="flex-1 py-5 bg-white text-slate-600 border border-slate-200 rounded-[24px] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" /> Quay lại
      </button>
      <button 
        onClick={handleSubmit} 
        disabled={!billImage || isSubmitting} 
        className="flex-[2.5] py-5 bg-[#3b82f6] text-white rounded-[24px] font-bold flex items-center justify-center gap-2 hover:bg-[#2563eb] transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:bg-blue-300"
      >
        {isSubmitting ? 'Đang ghi nhận đơn hàng...' : 'Đặt hàng'} 
        {!isSubmitting && <CheckCircle2 className="w-6 h-6 opacity-80" />}
      </button>
    </div>
  </motion.div>
)}

        </AnimatePresence>
      </main>
    </div>
  );
}
