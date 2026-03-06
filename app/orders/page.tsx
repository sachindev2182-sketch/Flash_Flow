"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  AlertCircle,
  Eye,
  X,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  ShoppingBag,
  Home,
  Briefcase,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchUserOrders, fetchOrderById, Order } from "@/lib/redux/features/order/orderSlice";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/Footer";

const orderStatusColors = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  processing: "bg-purple-50 text-purple-600 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-600 border-indigo-200",
  delivered: "bg-green-50 text-green-600 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const orderStatusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const orderStatusBackgrounds = {
  pending: "from-amber-50 to-amber-100/50",
  confirmed: "from-blue-50 to-blue-100/50",
  processing: "from-purple-50 to-purple-100/50",
  shipped: "from-indigo-50 to-indigo-100/50",
  delivered: "from-green-50 to-green-100/50",
  cancelled: "from-red-50 to-red-100/50",
};

const trackingSteps = [
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [customUser, setCustomUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { orders, loading, pagination } = useAppSelector((state) => state.order);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
      }

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setCustomUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      }

      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (customUser || firebaseUser) {
      dispatch(fetchUserOrders({ page: 1, limit: 10 }));
    }
  }, [dispatch, customUser, firebaseUser]);

  const user = customUser || firebaseUser;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    
    setCancelling(true);
    try {
      const response = await fetch(`/api/orders/${selectedOrderId}/cancel`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setCancelModal(false);
        setExpandedOrder(null);
        showToast("Order cancelled successfully", "success");
        // Refresh orders list
        dispatch(fetchUserOrders({ page: 1, limit: 10 }));
      } else {
        showToast("Failed to cancel order", "error");
      }
    } catch (error) {
      showToast("Failed to cancel order", "error");
    } finally {
      setCancelling(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home size={14} className="text-blue-500" />;
      case "work":
        return <Briefcase size={14} className="text-purple-500" />;
      default:
        return <MapPin size={14} className="text-gray-500" />;
    }
  };

  const getTrackingStepStatus = (orderStatus: string, stepStatus: string) => {
    const statusOrder = ["confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(orderStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    if (orderStatus === "cancelled") return "cancelled";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={48} className="text-[#5D5FEF] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar user={user} onProfileClick={() => setShowProfile(true)} />

      <main className="flex-grow pt-20 sm:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/home" className="text-gray-600 hover:text-[#5D5FEF] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-900 font-medium bg-gradient-to-r from-[#5D5FEF] to-[#868CFF] bg-clip-text text-transparent">
              My Orders
            </span>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1B2559] mb-2">My Orders</h1>
              <p className="text-gray-500">Track and manage your orders</p>
            </div>
            <div className="hidden sm:block w-24 h-24 bg-gradient-to-br from-[#5D5FEF]/10 to-[#868CFF]/10 rounded-full blur-2xl" />
          </div>

          {loading && orders.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 text-center border border-gray-200 shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-br from-[#5D5FEF]/10 to-[#868CFF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={48} className="text-[#5D5FEF]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1B2559] mb-3">No Orders Yet</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Looks like you haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5D5FEF] to-[#868CFF] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#5D5FEF]/25 transition-all group"
              >
                Start Shopping
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const StatusIcon = orderStatusIcons[order.orderStatus];
                const isExpanded = expandedOrder === order._id;

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 ${
                      isExpanded ? 'ring-2 ring-[#5D5FEF] ring-offset-2' : ''
                    }`}
                  >
                    {/* Order Header - Always Visible */}
                    <div 
                      className={`p-6 cursor-pointer bg-gradient-to-r ${orderStatusBackgrounds[order.orderStatus]}`}
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${orderStatusColors[order.orderStatus].split(' ')[0]}`}>
                            <StatusIcon size={24} className={orderStatusColors[order.orderStatus].split(' ')[1]} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Order #{order.orderId}</p>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${orderStatusColors[order.orderStatus]}`}>
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatShortDate(order.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                            <p className="text-xl font-bold text-[#5D5FEF]">₹{order.totalAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-[#5D5FEF]">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="flex items-center gap-3 mt-4 pl-16">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg px-2 py-1">
                            <div className="w-8 h-8 bg-gray-200 rounded-md overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.title}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <span className="text-xs text-gray-600">x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-medium text-gray-600">
                            +{order.items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100 bg-gray-50/50"
                        >
                          <div className="p-6 space-y-6">
                            {/* Tracking Timeline */}
                            {order.orderStatus !== "cancelled" && (
                              <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h4 className="font-semibold text-[#1B2559] mb-6 flex items-center gap-2">
                                  <Truck size={18} className="text-[#5D5FEF]" />
                                  Order Tracking
                                </h4>
                                <div className="relative">
                                  {/* Progress Bar */}
                                  <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full">
                                    <div
                                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#5D5FEF] to-[#868CFF] rounded-full transition-all duration-500"
                                      style={{
                                        width: `${
                                          trackingSteps.findIndex(s => s.status === order.orderStatus) >= 0
                                            ? (trackingSteps.findIndex(s => s.status === order.orderStatus) + 1) * 25
                                            : 0
                                        }%`,
                                      }}
                                    />
                                  </div>

                                  {/* Steps */}
                                  <div className="flex justify-between relative">
                                    {trackingSteps.map((step, index) => {
                                      const status = getTrackingStepStatus(order.orderStatus, step.status);
                                      const Icon = step.icon;

                                      return (
                                        <div key={step.status} className="flex flex-col items-center text-center z-10">
                                          <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                              status === "completed"
                                                ? "bg-green-500 text-white"
                                                : status === "current"
                                                ? "bg-[#5D5FEF] text-white"
                                                : status === "cancelled"
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 text-gray-400"
                                            }`}
                                          >
                                            <Icon size={18} />
                                          </div>
                                          <p
                                            className={`text-xs font-medium ${
                                              status === "completed" || status === "current"
                                                ? "text-[#1B2559]"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            {step.label}
                                          </p>
                                          {status === "current" && order.orderStatus === step.status && (
                                            <p className="text-[10px] text-[#5D5FEF] mt-1 font-medium">Current</p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Order Items */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <h4 className="font-semibold text-[#1B2559] mb-4 flex items-center gap-2">
                                <ShoppingBag size={18} className="text-[#5D5FEF]" />
                                Items ({order.items.length})
                              </h4>
                              <div className="space-y-4">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                      <Image
                                        src={item.image}
                                        alt={item.title}
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between mb-2">
                                        <h5 className="font-medium text-[#1B2559]">{item.title}</h5>
                                        <span className="font-bold text-[#5D5FEF]">
                                          ₹{item.price * item.quantity}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">{item.description}</p>
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">
                                          ₹{item.price} × {item.quantity}
                                        </span>
                                        {item.size && (
                                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                            Size: {item.size}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <h4 className="font-semibold text-[#1B2559] mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-[#5D5FEF]" />
                                Delivery Address
                              </h4>
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  {getAddressTypeIcon(order.shippingAddress.addressType)}
                                  <span className="text-xs font-medium capitalize text-gray-600">
                                    {order.shippingAddress.addressType}
                                  </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <p className="font-medium text-[#1B2559]">{order.shippingAddress.fullName}</p>
                                  <p className="text-gray-600 flex items-center gap-2">
                                    <Phone size={14} />
                                    {order.shippingAddress.phoneNumber}
                                  </p>
                                  <p className="text-gray-600">
                                    {order.shippingAddress.houseNumber}, {order.shippingAddress.street}
                                  </p>
                                  <p className="text-gray-600">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                                    {order.shippingAddress.pincode}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <h4 className="font-semibold text-[#1B2559] mb-4 flex items-center gap-2">
                                <CreditCard size={18} className="text-[#5D5FEF]" />
                                Payment Summary
                              </h4>
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-[#1B2559]">₹{order.subtotal.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Charge</span>
                                    {order.deliveryCharge === 0 ? (
                                      <span className="font-medium text-green-600">Free</span>
                                    ) : (
                                      <span className="font-medium text-[#1B2559]">₹{order.deliveryCharge}</span>
                                    )}
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Method</span>
                                    <span className="font-medium text-[#1B2559] capitalize">{order.paymentMethod}</span>
                                  </div>
                                  <div className="border-t border-gray-200 pt-3 mt-3">
                                    <div className="flex justify-between">
                                      <span className="font-semibold text-[#1B2559]">Total</span>
                                      <span className="text-xl font-bold text-[#5D5FEF]">
                                        ₹{order.totalAmount.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Cancel Button */}
                            {order.orderStatus !== "cancelled" && 
                             order.orderStatus !== "delivered" && 
                             order.orderStatus !== "shipped" && (
                              <div className="flex justify-end">
                                <button
                                  onClick={() => {
                                    setSelectedOrderId(order._id);
                                    setCancelModal(true);
                                  }}
                                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all active:scale-95 flex items-center gap-2"
                                >
                                  <AlertTriangle size={16} />
                                  Cancel Order
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {cancelModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setCancelModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[#1B2559] mb-2">Cancel Order</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm"
                  >
                    No, Keep It
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Yes, Cancel"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[200]"
          >
            <div
              className={`px-4 py-3 rounded-lg shadow-xl font-medium text-sm flex items-center gap-2 ${
                toast.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}