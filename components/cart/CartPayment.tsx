"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  ChevronLeft,
  CheckCircle,
  Lock,
  Shield,
  DollarSign,
  Truck,
} from "lucide-react";
import OrderPreview from "./OrderPreview";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

interface CartPaymentProps {
  user: any;
  selectedAddress: any;
  onBack: () => void;
  onComplete: () => void;
}

// Payment methods 
const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Pay with Visa, Mastercard, RuPay",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    icon: DollarSign,
    description: "Pay when you receive your order",
  },
];

export default function CartPayment({ user, selectedAddress, onBack, onComplete }: CartPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [showPreview, setShowPreview] = useState(false);
  const [codConfirmed, setCodConfirmed] = useState(false);
  const {
    items: cartItems,
    selectedItems,
    subtotal,
    deliveryCharge,
    total,
  } = useAppSelector((state) => state.cart);

  const handleProceedToPreview = () => {
    if (selectedMethod === "cod" && !codConfirmed) return;
    setShowPreview(true);
  };

  if (showPreview) {
    return (
      <OrderPreview
        user={user}
        selectedAddress={selectedAddress}
        paymentMethod={selectedMethod}
        onBack={() => setShowPreview(false)}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-semibold text-[#1B2559]">Select Payment Method</h3>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;

            return (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#5D5FEF] shadow-lg shadow-indigo-100"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-[#5D5FEF] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1B2559] text-sm">{method.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle size={16} className="text-[#5D5FEF] flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Payment Info  */}
        <div className="bg-white rounded-xl p-5">
          {selectedMethod === "card" && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <CreditCard size={20} className="text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-800 text-sm">Credit/Debit Card</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      You will be redirected to our secure payment gateway to complete your payment.
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                      We accept Visa, Mastercard, RuPay, and American Express.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === "cod" && (
            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Truck size={20} className="text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-yellow-800 text-sm">Cash on Delivery</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      Pay at the time of delivery. Our delivery partner will collect the payment.
                    </p>
                    <div className="mt-3 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={codConfirmed}
                          onChange={(e) => setCodConfirmed(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#5D5FEF] focus:ring-[#5D5FEF]"
                        />
                        <span className="text-xs text-gray-600">
                          I understand that I need to pay at delivery
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secure Payment Badge */}
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
          <Lock size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Secure Payment</p>
            <p className="text-xs text-green-600">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>

        {/* COD Info */}
        {selectedMethod === "cod" && (
          <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
            <Truck size={20} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">COD Information</p>
              <p className="text-xs text-blue-600">
                No extra charges for Cash on Delivery. Pay only the order amount.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl p-5 sticky top-24">
          <h3 className="font-bold text-[#1B2559] text-lg mb-4">Payment Summary</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Total</span>
              <span className="font-medium text-[#1B2559]">₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium text-green-600">₹{deliveryCharge.toLocaleString()}</span>
            </div>
            {selectedMethod === "cod" && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-[#1B2559]">Cash on Delivery</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#1B2559]">Total to Pay</span>
                <span className="text-xl font-bold text-[#5D5FEF]">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={handleProceedToPreview}
            disabled={selectedMethod === "cod" && !codConfirmed}
            className="w-full bg-[#5D5FEF] text-white py-3 rounded-xl font-semibold hover:bg-[#4B4DC9] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            Review Order
          </button>
          
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95"
          >
            <ChevronLeft size={16} />
            Back to Address
          </button>

          {/* Security Badges */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Shield size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">PCI DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}