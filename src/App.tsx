import React, { useState, useMemo } from 'react';
import { ShoppingCart, Truck, Store, CheckCircle2, Upload, ChevronRight, Package, ArrowLeft, Plus, Minus } from 'lucide-react';
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
  address: string;
  shippingMethod: 'pickup' | 'delivery';
}

// --- Constants ---
const PRODUCTS: Product[] = [
  { id: 'brownie-classic', name: 'Brownie Truyền thống', price: 75000, description: 'Hộp 150g' },
  { id: 'brownie-almond', name: 'Brownie Hạnh nhân', price: 80000 },
  { id: 'brownie-cinnamon', name: 'Brownie Quế giòn', price: 80000 },
  { id: 'brownie-cheese-dip', name: 'Brownie Chấm kem phô mai', price: 85000 },
  { id: 'extra-cheese', name: 'Thêm sốt kem phô mai', price: 15000 },
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
    name: '',
    phone: '',
    address: '',
    shippingMethod: 'pickup',
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

  const total = subtotal; // Tạm thời chưa tính phí ship chi tiết ở đây

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
    // Logic gửi dữ liệu lên Google Sheets của bồ giữ nguyên ở đây
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  // --- RENDERING ---

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-4 font-sans text-[#2e4171]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-[40px] shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-[#2e4171]" />
          </div>
          <h1 className="text-2xl font-bold">Mướp đã nhận đơn!</h1>
          <p className="opacity-70 text-sm">Cảm ơn bồ đã ủng hộ Mướp. Đợi Mướp liên hệ xác nhận sớm nhất nha! ✨</p>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#2e4171] text-white rounded-2xl font-bold hover:opacity-90 transition-all">Quay lại trang chủ</button>
        </motion.div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[48px] shadow-2xl max-w-md w-full p-10 text-center space-y-8 border border-white"
        >
          <div className="flex justify-center">
            <div className="w-28 h-28 bg-[#f8fafc] rounded-full flex items-center justify-center shadow-inner">
               <img src="/logo-muop.png" alt="Mướp Bakery" className="w-20 h-20 object-contain" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-[#2e4171] text-2xl font-black leading-tight">Mướp Bakery chào bồ!</h1>
            <p className="text-slate-500 text-sm leading-relaxed px-4">
              Bánh nhà Mướp được làm <strong>thủ công hoàn toàn</strong>, nướng mới mỗi tuần để đảm bảo hương vị nguyên bản nhất.
            </p>
          </div>

          <div className="bg-[#eef2ff] rounded-3xl p-5 text-[#2e4171] text-xs space-y-2">
            <p className="font-bold uppercase tracking-wider opacity-60">Lịch nhận đơn & giao bánh</p>
            <p>Chốt đơn: <span className="font-bold">Thứ 4 hàng tuần</span></p>
            <p>Giao bánh: <span className="font-bold">Thứ 7 & Chủ Nhật</span></p>
          </div>

          <button 
            onClick={() => setShowIntro(false)}
            className="w-full bg-[#2e4171] text-white py-5 rounded-[24px] font-bold shadow-lg active:scale-95 transition-all text-lg"
          >
            Bắt đầu đặt hàng →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2ff] font-sans pb-32 text-[#2e4171]">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#eef2ff]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowIntro(true)} className="p-2 hover:bg-[#eef2ff] rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black tracking-tight">Mướp Bakery</h1>
          </div>
          <div className="bg-[#2e4171] text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
            <ShoppingCart className="w-3.5 h-3.5" />
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Step Progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${step === i ? 'w-10 bg-[#2e4171]' : 'w-4 bg-white'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-sm font-bold opacity-40 uppercase tracking-widest mb-6 text-center">Danh mục bánh hôm nay</h2>
              <div className="grid gap-4">
                {PRODUCTS.map(product => {
                  const item = cart.find(c => c.productId === product.id);
                  return (
                    <div key={product.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-transparent hover:border-[#2e4171]/10 transition-all flex items-center justify-between group">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{product.description || 'Vị ngon khó cưỡng'}</p>
                        <p className="text-[#2e4171] font-black mt-2">{product.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-4 bg-[#f8fafc] p-2 rounded-2xl">
                        <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm hover:text-red-500"><Minus className="w-4 h-4" /></button>
                        <span className="font-bold w-4 text-center">{item?.quantity || 0}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#2e4171] text-white shadow-md"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {cart.length > 0 && (
                <button onClick={() => setStep(2)} className="w-full py-5 bg-[#2e4171] text-white rounded-[24px] font-bold shadow-xl shadow-blue-900/10 mt-8 flex items-center justify-center gap-2">
                  Tiếp tục nhập thông tin <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          )}

          {step === 2 && (
             <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-5">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase opacity-30 ml-2">Tên của bồ</label>
                     <input type="text" placeholder="Hà Ngọc..." className="w-full p-4 bg-[#f8fafc] rounded-2xl outline-none focus:ring-2 ring-[#2e4171]/10 border-transparent" value={customer.name} onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase opacity-30 ml-2">Số điện thoại</label>
                     <input type="tel" placeholder="090..." className="w-full p-4 bg-[#f8fafc] rounded-2xl outline-none focus:ring-2 ring-[#2e4171]/10 border-transparent" value={customer.phone} onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase opacity-30 ml-2">Phương thức nhận bánh</label>
                     <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'pickup' }))} className={`p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all ${customer.shippingMethod === 'pickup' ? 'border-[#2e4171] bg-[#2e4171] text-white' : 'border-[#f8fafc] bg-[#f8fafc] text-slate-400'}`}>
                          <Store className="w-4 h-4" /> Pick up
                        </button>
                        <button onClick={() => setCustomer(prev => ({ ...prev, shippingMethod: 'delivery' }))} className={`p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all ${customer.shippingMethod === 'delivery' ? 'border-[#2e4171] bg-[#2e4171] text-white' : 'border-[#f8fafc] bg-[#f8fafc] text-slate-400'}`}>
                          <Truck className="w-4 h-4" /> Ship tận tay
                        </button>
                     </div>
                   </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white rounded-[24px] font-bold text-slate-400 shadow-sm">Quay lại</button>
                  <button onClick={() => setStep(3)} disabled={!customer.name || !customer.phone} className="flex-[2] py-5 bg-[#2e4171] text-white rounded-[24px] font-bold disabled:opacity-30 shadow-lg">Đến phần Thanh toán</button>
                </div>
             </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-[48px] shadow-sm text-center space-y-8">
                <div>
                  <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Tổng cộng cần thanh toán</p>
                  <p className="text-4xl font-black">{total.toLocaleString()}đ</p>
                </div>
                
                <div className="p-4 bg-white rounded-[32px] border border-[#eef2ff] inline-block shadow-xl shadow-blue-900/5">
                  <img src={`${BANK_INFO.qrPlaceholder}${total}`} alt="QR" className="w-56 h-56 mx-auto" />
                </div>

                <div className="space-y-4">
                    <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-[#eef2ff] rounded-[32px] bg-[#f8fafc] cursor-pointer hover:bg-[#eef2ff] transition-colors">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      {billPreview ? (
                        <img src={billPreview} className="max-h-48 rounded-2xl shadow-md" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="mb-3 opacity-20 w-10 h-10" />
                          <span className="text-sm font-bold opacity-40">Tải ảnh giao dịch thành công</span>
                        </div>
                      )}
                    </label>
                </div>

                <button onClick={handleSubmit} disabled={!billImage || isSubmitting} className="w-full py-5 bg-[#2e4171] text-white rounded-[24px] font-bold shadow-xl flex items-center justify-center gap-3">
                  {isSubmitting ? "Mướp đang kiểm tra..." : "Xác nhận gửi đơn ngay"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Price Bar */}
      {step < 3 && cart.length > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 p-6 z-20">
          <div className="max-w-2xl mx-auto bg-[#2e4171] p-6 shadow-2xl rounded-[32px] flex justify-between items-center text-white">
            <div>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">Tạm tính</p>
              <p className="text-xl font-black">{total.toLocaleString()}đ</p>
            </div>
            <div className="bg-white/10 px-5 py-2.5 rounded-2xl text-sm font-bold backdrop-blur-sm border border-white/10">
              {cart.reduce((s, i) => s + i.quantity, 0)} món
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
