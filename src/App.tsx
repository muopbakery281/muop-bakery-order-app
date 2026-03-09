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

// --- Main Component ---
export default function App() {
  // 1. TẤT CẢ HOOKS PHẢI ĐẶT Ở TRÊN CÙNG
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
        return { 
          name: p?.name, 
          quantity: item.quantity,
          price: p?.price 
        };
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
      } else {
        console.log('Simulating submission to Google Sheets:', payload);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại hoặc liên hệ Mướp qua Facebok hoặc Instagram.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. LOGIC HIỂN THỊ (Sắp xếp theo thứ tự ưu tiên)
  
  // Nếu đóng cửa
  if (IS_CLOSED) {
    return (
      <div className="min-h-screen bg-muop-blue flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center space-y-6">
          <img src="/logo-muop.png" className="w-20 h-20 mx-auto rounded-full shadow-md object-cover" alt="Logo" />
          <h2 className="text-2xl font-black text-muop-dark">Cảm ơn bồ đã ghé!</h2>
          <p className="text-slate-600">Mướp đã nhận đủ đơn đợt này rồi. Hẹn bồ tuần sau nhé! ✨</p>
          <div className="flex flex-col gap-2">
            <a href="https://facebook.com/muop.bakery" className="py-3 bg-[#1877F2] text-white rounded-xl font-bold">Facebook</a>
            <a href="https://instagram.com/muop.bakery" className="py-3 bg-gradient-to-r from-[#833AB4] to-[#FCB045] text-white rounded-xl font-bold">Instagram</a>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đặt hàng thành công
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-muop-blue flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-muop-dark">Cảm ơn bồ, Mướp đã nhận đơn!</h1>
          <p className="text-slate-600">
            Mướp sẽ kiểm tra bill và liên hệ xác nhận với bồ sớm nhất nha. Chúc bồ một ngày ngọt ngào! 🥐✨
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-muop-primary text-white rounded-xl font-semibold hover:bg-muop-dark transition-colors"
          >
            Quay lại trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

// Trang Intro (hiển thị đầu tiên nếu đang mở cửa)
  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#eef2ff] font-sans pb-10 flex flex-col items-center justify-center">
         <div className="flex flex-col items-center pt-10 pb-6 text-center px-4 w-full max-w-xl">
            
            {/* Logo với khung tròn màu be #fffaee */}
            <div className="w-36 h-36 bg-[#fffaee] rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
              <img src="/logo-muop.png" className="w-32 h-32 rounded-full object-cover" alt="Mướp Bakery Logo" />
            </div>
            
            {/* Title trên cùng 1 dòng */}
            <h1 className="text-[20px] font-black text-[#2e4171] mb-4 w-full">
              Cảm ơn bạn đã ghé thăm Mướp Bakery
            </h1>

            {/* Mô tả ngắt làm 2 dòng */}
            <p className="text-slate-600 text-[15px] leading-relaxed mb-8 px-4 max-w-[1100px] mx-auto">
              Bánh của Mướp được làm thủ công, được nướng mới mỗi tuần để <br className="hidden sm:block" /> 
     đảm bảo luôn có sẵn bánh tươi để phục vụ khách hàng.
            </p>

            {/* Khung Lịch trình */}
            <div className="w-full bg-white rounded-[32px] p-8 shadow-xl text-left space-y-5 border border-[#dce4ff]">
               <h2 className="font-bold text-[#2e4171] text-lg flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-[#2e4171] rounded-full"></span>
                 Lịch nhận đơn & giao bánh
               </h2>
               
               <div className="space-y-4">
                 <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-[#eef2ff] flex items-center justify-center mt-0.5">
                     <span className="text-[#2e4171] text-[10px] font-bold">1</span>
                   </div>
                   <p className="text-slate-600 text-[15px]">
                     <span className="font-bold text-slate-800">Chốt order:</span> Thứ 4 hàng tuần
                   </p>
                 </div>
                 
                 <div className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-full bg-[#eef2ff] flex items-center justify-center mt-0.5">
                     <span className="text-[#2e4171] text-[10px] font-bold">2</span>
                   </div>
                   <p className="text-slate-600 text-[15px]">
                     <span className="font-bold text-slate-800">Giao bánh:</span> Thứ 7 & Chủ Nhật hàng tuần
                   </p>
                 </div>
               </div>

               {/* Nút bắt đầu đặt đơn */}
               <button 
                 onClick={() => setShowIntro(false)} 
                 className="w-full bg-[#2e4171] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#2e4171]/20 hover:bg-[#1e2a4a] transition-all text-lg mt-4"
               >
                 Bắt đầu đặt bánh →
               </button>
            </div>
         </div>
      </div>
    );
  }

  // 3. MAIN APP (Sau khi bấm Bắt đầu)
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-muop-blue sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-muop-blue/50">
              <img
                src="/logo-muop.png"
                alt="Mướp Bakery Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-muop-dark tracking-tight">Mướp Bakery</h1>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-muop-primary bg-muop-blue/30 px-3 py-1.5 rounded-full">
            <ShoppingCart className="w-4 h-4" />
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} món</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= i ? 'bg-muop-primary text-white' : 'bg-white text-slate-300 border border-slate-200'
              }`}>
                {i}
              </div>
              {i < 3 && <div className={`w-12 h-0.5 ${step > i ? 'bg-muop-primary' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Package className="text-muop-primary" />
                <h2 className="text-lg font-bold text-slate-800">Chọn bánh bồ thích</h2>
              </div>
              <div className="grid gap-4">
                {PRODUCTS.map(product => {
                  const item = cart.find(c => c.productId === product.id);
                  return (
                    <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-muop-blue transition-colors">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-slate-800">{product.name}</h3>
                        <p className="text-sm text-slate-500">{product.description || `${product.price.toLocaleString()}đ`}</p>
                        <p className="text-muop-primary font-bold mt-1">{product.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(product.id, -1);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-600 hover:text-muop-primary active:scale-90 transition-transform"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-black text-muop-dark">
                          {item?.quantity || 0}
                        </span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(product.id, 1);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-muop-primary text-white shadow-sm hover:bg-muop-dark active:scale-90 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {cart.length > 0 && (
                <div className="bg-muop-blue/20 p-4 rounded-2xl border border-muop-blue/30 space-y-3 mt-6">
                  <div className="flex justify-between text-sm text-slate-600 font-medium">
                    <span>Tạm tính:</span>
                    <span className="text-muop-dark">{subtotal.toLocaleString()}đ</span>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-muop-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-muop-dark transition-all shadow-lg shadow-muop-primary/20"
                  >
                    Tiếp tục đặt hàng <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Truck className="text-muop-primary" />
                  <h2 className="text-lg font-bold text-slate-800">Thông tin nhận hàng</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'pickup' }))}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      customer.shippingMethod === 'pickup' ? 'border-muop-primary bg-muop-blue/20' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <Store className={customer.shippingMethod === 'pickup' ? 'text-muop-primary' : 'text-slate-400'} />
                    <span className="font-bold text-sm">Pick up tại tiệm</span>
                    <span className="text-xs text-slate-500">Miễn phí</span>
                  </button>
                  <button 
                    onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'delivery' }))}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      customer.shippingMethod === 'delivery' ? 'border-muop-primary bg-muop-blue/20' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <Truck className={customer.shippingMethod === 'delivery' ? 'text-muop-primary' : 'text-slate-400'} />
                    <span className="font-bold text-sm">Giao hàng tận nơi</span>
                    <span className="text-xs text-slate-500">Theo khu vực</span>
                  </button>
                </div>

                <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên của bạn<span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Nhập tên bồ nè..."
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-muop-primary outline-none transition-all"
                      value={customer.name}
                      onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại<span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        placeholder="09xx..."
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-muop-primary outline-none transition-all"
                        value={customer.phone}
                        onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email<span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        placeholder="muop@bakery.com"
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-muop-primary outline-none transition-all"
                        value={customer.email}
                        onChange={e => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* 1. Phần hiển thị khi chọn Pickup */}
                  {customer.shippingMethod === 'pickup' && (
                    <div className="space-y-4 pt-4 border-t border-slate-50 animate-fade-in-up">
                      <label className="text-xs font-bold uppercase tracking-wider text-muop-dark">Bồ muốn pick up tại Mướp vào ngày nào?<span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          type="button"
                          onClick={() => setCustomer(prev => ({ ...prev, pickupDay: 'Saturday' }))}
                          className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1 ${
                            customer.pickupDay === 'Saturday' ? 'border-muop-primary bg-muop-blue/20 text-muop-dark' : 'border-slate-100 bg-white text-slate-400'
                          }`}
                        >
                          <span>Thứ 7</span>
                          <span className="text-[10px] font-medium">(13:00 - 17:00)</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setCustomer(prev => ({ ...prev, pickupDay: 'Sunday' }))}
                          className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1 ${
                            customer.pickupDay === 'Sunday' ? 'border-muop-primary bg-muop-blue/20 text-muop-dark' : 'border-slate-100 bg-white text-slate-400'
                          }`}
                        >
                          <span>Chủ nhật</span>
                          <span className="text-[10px] font-medium">(13:00 - 17:00)</span>
                        </button>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[13px] text-slate-600 leading-relaxed">
                        <p className="font-bold text-muop-dark mb-1">📍 Địa chỉ Pick up:</p>
                        {customer.pickupDay === 'Saturday' ? (
                          <p>179 Chu Văn An, P.26, Q.Bình Thạnh</p>
                        ) : (
                          <p>205 Đường số 5, KĐT Lakeview City, P. An Phú, TP. Thủ Đức</p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-2 italic">Nếu bạn muốn pick up ngoài khung giờ này, hãy inbox shop qua FB/IG để hẹn giờ nhé~</p>
                      </div>
                    </div>
                  )}

                  {/* 2. Phần hiển thị khi chọn Delivery */}
                  {customer.shippingMethod === 'delivery' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="space-y-4 pt-4 border-t border-slate-50"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khu vực giao hàng<span className="text-red-500">*</span></label>
                        <select 
                          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-muop-primary transition-all"
                          value={customer.zone}
                          onChange={e => setCustomer(prev => ({ ...prev, zone: e.target.value }))}
                        >
                          {ZONES.map(z => (
                            <option key={z.id} value={z.id}>{z.name} - {z.fee.toLocaleString()}đ</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Địa chỉ chi tiết<span className="text-red-500">*</span></label>
                        <textarea 
                          placeholder="Số nhà, tên đường, phường..."
                          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none min-h-[80px] focus:ring-2 focus:ring-muop-primary transition-all"
                          value={customer.address}
                          onChange={e => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Quay lại
                </button>
                
                <button 
                  onClick={() => setStep(3)}
                  disabled={
                    !customer.name.trim() || 
                    !customer.phone.trim() || 
                    !customer.email.trim() || 
                    (customer.shippingMethod === 'delivery' && !customer.address.trim())
                  }
                  className="flex-[2] py-4 bg-muop-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-muop-dark transition-all shadow-lg shadow-muop-primary/20 disabled:opacity-50 disabled:grayscale disabled:shadow-none"
                >
                  Thanh toán <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-muop-primary" />
                  <h2 className="text-lg font-bold text-slate-800">Thanh toán chuyển khoản</h2>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white rounded-2xl border-2 border-muop-blue/50 shadow-inner">
                      <img 
                        src={`${BANK_INFO.qrPlaceholder}${total}`} 
                        alt="Mã QR Mướp Bakery" 
                        className="w-56 h-56 object-contain"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-slate-500">Quét mã để thanh toán nhanh</p>
                      <p className="font-bold text-muop-dark text-xl">{total.toLocaleString()}đ</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Ngân hàng:</span>
                      <span className="font-bold text-slate-700">{BANK_INFO.bankName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Số tài khoản:</span>
                      <span className="font-bold text-slate-700">{BANK_INFO.accountNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-700">{BANK_INFO.accountName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Nội dung:</span>
                      <span className="font-bold text-muop-primary">{customer.name} - {customer.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="text-muop-primary w-5 h-5" />
                    <h3 className="font-bold text-slate-800">Xác nhận chuyển khoản</h3>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden" 
                      id="bill-upload"
                    />
                    <label 
                      htmlFor="bill-upload"
                      className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-white hover:border-muop-primary hover:bg-muop-blue/10 transition-all cursor-pointer"
                    >
                      {billPreview ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-100">
                          <img src={billPreview} alt="Bill preview" className="w-full h-full object-contain bg-slate-50" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold bg-black/60 px-5 py-2.5 rounded-full shadow-lg">Đổi ảnh khác</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 bg-muop-blue/50 rounded-full flex items-center justify-center mb-3">
                            <Upload className="text-muop-primary w-6 h-6" />
                          </div>
                          <p className="font-bold text-slate-700">Tải ảnh bill tại đây</p>
                          <p className="text-xs text-slate-400 mt-1">Chụp màn hình chuyển khoản thành công nha</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Quay lại
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!billImage || isSubmitting}
                  className="flex-[2] py-4 bg-muop-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-muop-dark transition-all shadow-lg shadow-muop-primary/20 disabled:opacity-50 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi đơn...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Gửi đơn hàng <CheckCircle2 className="w-5 h-5" />
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Summary Bar */}
      {step < 3 && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-20">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tổng cộng</p>
              <p className="text-xl font-bold text-muop-dark">{total.toLocaleString()}đ</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} món 
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
