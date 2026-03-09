import React, { useState, useMemo } from 'react';
import { ShoppingCart, Truck, Store, CreditCard, CheckCircle2, Upload, ChevronRight, ChevronLeft, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Constants ---
interface Product { id: string; name: string; price: number; description?: string; }
interface OrderItem { productId: string; quantity: number; }
interface CustomerInfo { name: string; phone: string; email: string; address: string; shippingMethod: 'pickup' | 'delivery'; zone: string; pickupDay?: 'Saturday' | 'Sunday'; }

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

// --- Sub-Components ---

// Component khung tổng tiền dùng cho Step 1 & 2
const PriceSummaryBox = ({ subtotal, shippingFee, total, onNext, nextLabel, showShipping = false, disabled = false }: any) => (
  <div className="bg-[#f0f4ff] p-5 rounded-[24px] border border-[#dce4ff] space-y-3 mt-6">
    <div className="space-y-2">
      <div className="flex justify-between text-[15px] font-medium text-slate-600">
        <span>Tạm tính:</span>
        <span className="text-[#3b82f6]">{subtotal.toLocaleString()}đ</span>
      </div>
      {showShipping && (
        <div className="flex justify-between text-[15px] font-medium text-slate-600">
          <span>Phí giao hàng:</span>
          <span>{shippingFee === 0 ? "0đ" : `${shippingFee.toLocaleString()}đ`}</span>
        </div>
      )}
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
      className="w-full py-4 bg-[#3b82f6] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#2563eb] transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:grayscale"
    >
      {nextLabel} <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '', phone: '', email: '', address: '', shippingMethod: 'pickup', zone: 'zone1', pickupDay: 'Saturday', 
  });
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, item) => {
    const p = PRODUCTS.find(p => p.id === item.productId);
    return sum + (p?.price || 0) * item.quantity;
  }, 0), [cart]);

  const shippingFee = useMemo(() => customer.shippingMethod === 'pickup' ? 0 : (ZONES.find(z => z.id === customer.zone)?.fee || 0), [customer.shippingMethod, customer.zone]);
  const total = subtotal + shippingFee;

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const ex = prev.find(i => i.productId === productId);
      if (ex) {
        const nq = Math.max(0, ex.quantity + delta);
        return nq === 0 ? prev.filter(i => i.productId !== productId) : prev.map(i => i.productId === productId ? { ...i, quantity: nq } : i);
      }
      return delta > 0 ? [...prev, { productId, quantity: 1 }] : prev;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Logic gửi dữ liệu giữ nguyên như cũ...
    setTimeout(() => { setIsSuccess(true); setIsSubmitting(false); }, 1500);
  };

  if (isSuccess) return (
    <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold text-[#3b82f6]">Mướp đã nhận đơn!</h1>
        <button onClick={() => window.location.reload()} className="w-full py-3 bg-[#3b82f6] text-white rounded-xl font-bold">Quay lại</button>
      </div>
    </div>
  );

  if (showIntro) return (
    <div className="min-h-screen bg-[#eef2ff] flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full space-y-6">
        <img src="/logo-muop.png" className="w-24 h-24 mx-auto rounded-full" alt="Logo" />
        <h1 className="text-xl font-black text-[#3b82f6]">Chào mừng bồ tới Mướp Bakery</h1>
        <button onClick={() => setShowIntro(false)} className="w-full bg-[#3b82f6] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200">Bắt đầu đặt đơn thôi →</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="bg-white border-b sticky top-0 z-20 p-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
             <img src="/logo-muop.png" className="w-8 h-8 rounded-full" alt="Logo" />
             <span className="font-bold text-[#3b82f6]">Mướp Bakery</span>
          </div>
          <div className="bg-[#eef2ff] text-[#3b82f6] px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" /> {cart.reduce((s, i) => s + i.quantity, 0)} món
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pt-8 space-y-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= i ? 'bg-[#3b82f6] text-white' : 'bg-white text-slate-300 border'}`}>{i}</div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Package className="text-[#3b82f6]" /> Chọn bánh bồ thích</h2>
              {PRODUCTS.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm">
                  <div className="flex-1">
                    <h3 className="font-bold">{p.name}</h3>
                    <p className="text-xs text-slate-400">{p.description}</p>
                    <p className="text-[#3b82f6] font-bold">{p.price.toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl">
                    <button onClick={() => updateQuantity(p.id, -1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold">-</button>
                    <span className="w-4 text-center font-black">{cart.find(i => i.productId === p.id)?.quantity || 0}</span>
                    <button onClick={() => updateQuantity(p.id, 1)} className="w-8 h-8 bg-[#3b82f6] text-white rounded-lg shadow-sm font-bold">+</button>
                  </div>
                </div>
              ))}
              {cart.length > 0 && (
                <PriceSummaryBox subtotal={subtotal} total={subtotal} onNext={() => setStep(2)} nextLabel="Tiếp tục đặt hàng" />
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Truck className="text-[#3b82f6]" /> Thông tin nhận hàng</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setCustomer({...customer, shippingMethod: 'pickup'})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${customer.shippingMethod === 'pickup' ? 'border-[#3b82f6] bg-[#eef2ff]' : 'bg-white'}`}>
                  <Store className={customer.shippingMethod === 'pickup' ? 'text-[#3b82f6]' : 'text-slate-300'} />
                  <span className="font-bold text-sm">Pick up tại tiệm</span>
                </button>
                <button onClick={() => setCustomer({...customer, shippingMethod: 'delivery'})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${customer.shippingMethod === 'delivery' ? 'border-[#3b82f6] bg-[#eef2ff]' : 'bg-white'}`}>
                  <Truck className={customer.shippingMethod === 'delivery' ? 'text-[#3b82f6]' : 'text-slate-300'} />
                  <span className="font-bold text-sm">Giao hàng tận nơi</span>
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border space-y-4">
                <input placeholder="Tên của bạn*" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3b82f6]" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="SĐT*" className="p-3 bg-slate-50 rounded-xl outline-none" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                  <input placeholder="Email*" className="p-3 bg-slate-50 rounded-xl outline-none" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
                </div>
                {customer.shippingMethod === 'delivery' && (
                  <>
                    <select className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={customer.zone} onChange={e => setCustomer({...customer, zone: e.target.value})}>
                      {ZONES.map(z => <option key={z.id} value={z.id}>{z.name} - {z.fee.toLocaleString()}đ</option>)}
                    </select>
                    <textarea placeholder="Địa chỉ chi tiết*" className="w-full p-3 bg-slate-50 rounded-xl outline-none min-h-[80px]" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                  </>
                )}
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
              <button onClick={() => setStep(1)} className="w-full text-slate-400 font-bold text-sm">← Quay lại chọn thêm bánh</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><CreditCard className="text-[#3b82f6]" /> Thanh toán</h2>
              <div className="bg-white p-6 rounded-3xl border text-center space-y-4">
                <div className="bg-[#f8faff] p-4 inline-block rounded-2xl border-2 border-[#eef2ff]">
                  <img src={`${BANK_INFO.qrPlaceholder}${total}`} className="w-48 h-48 mx-auto" alt="QR" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm italic">Quét mã để chuyển khoản nhanh</p>
                  <p className="text-2xl font-black text-[#3b82f6]">{total.toLocaleString()}đ</p>
                </div>
                <div className="text-left text-sm space-y-2 pt-4 border-t">
                  <div className="flex justify-between"><span className="text-slate-400">STK:</span><b>{BANK_INFO.accountNumber}</b></div>
                  <div className="flex justify-between"><span className="text-slate-400">Ngân hàng:</span><b>{BANK_INFO.bankName}</b></div>
                </div>
              </div>

              {/* Upload Section với "động lực" */}
              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2 text-slate-800"><Upload className="w-4 h-4 text-[#3b82f6]" /> Xác nhận bill</h3>
                <label className={`flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed rounded-3xl cursor-pointer transition-all ${billPreview ? 'bg-white border-[#3b82f6]' : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50 hover:border-[#3b82f6]'}`}>
                  <input type="file" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setBillImage(f); const r = new FileReader(); r.onloadend = () => setBillPreview(r.result as string); r.readAsDataURL(f); }
                  }} />
                  {billPreview ? <img src={billPreview} className="max-h-48 object-contain p-2" alt="Bill" /> : (
                    <div className="text-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-[#3b82f6]"><Upload className="w-5 h-5" /></div>
                      <p className="text-[#3b82f6] font-bold text-sm">Bấm để tải ảnh bill tại đây</p>
                      <p className="text-slate-400 text-[11px]">Mướp cần bill để xác nhận đơn nha</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white border rounded-2xl font-bold flex items-center justify-center gap-1 text-slate-400"><ChevronLeft className="w-4 h-4"/> Quay lại</button>
                <button onClick={handleSubmit} disabled={!billImage || isSubmitting} className="flex-[2] py-4 bg-[#3b82f6] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50">
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đơn hàng'} <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
