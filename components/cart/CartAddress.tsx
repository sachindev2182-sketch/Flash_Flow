"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Home,
  Briefcase,
  Plus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  Address,
} from "@/lib/redux/features/address/addressSlice";

interface CartAddressProps {
  user: any;
  onBack: () => void;
  onProceed: (selectedAddress: any) => void;
}

export default function CartAddress({
  user,
  onBack,
  onProceed,
}: CartAddressProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { addresses, loading, operationLoading, error } = useAppSelector(
    (state) => state.address,
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    addressId: string | null;
  }>({
    show: false,
    addressId: null,
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    houseNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
    addressType: "home" as "home" | "work" | "other",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else {
        setSelectedAddressId(addresses[0]._id);
      }
    }
  }, [addresses]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
  }, [error]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home size={16} className="text-blue-500" />;
      case "work":
        return <Briefcase size={16} className="text-purple-500" />;
      default:
        return <MapPin size={16} className="text-gray-500" />;
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case "home":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "work":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const handleEdit = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      houseNumber: address.houseNumber,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
      addressType: address.addressType,
    });
    setShowForm(true);
  };

  const handleDelete = (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ show: true, addressId });
  };

  const confirmDelete = async () => {
    if (deleteModal.addressId) {
      await dispatch(deleteAddress(deleteModal.addressId));
      setDeleteModal({ show: false, addressId: null });
      showToast("Address deleted successfully", "success");
    }
  };

  const handleSetDefault = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dispatch(setDefaultAddress(addressId));
    setSelectedAddressId(addressId);
    showToast("Default address updated", "success");
  };

  const resetForm = () => {
    setFormData({
      fullName: user?.name || user?.displayName || "",
      phoneNumber: "",
      houseNumber: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
      addressType: "home",
    });
    setFormErrors({});
    setTouched({});
    setEditingAddress(null);
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "phoneNumber":
        if (!value) return "Phone number is required";
        if (!/^[0-9]{10}$/.test(value))
          return "Enter a valid 10-digit phone number";
        break;
      case "houseNumber":
        if (!value) return "House/Flat number is required";
        break;
      case "street":
        if (!value) return "Street address is required";
        break;
      case "city":
        if (!value) return "City is required";
        break;
      case "state":
        if (!value) return "State is required";
        break;
      case "pincode":
        if (!value) return "Pincode is required";
        if (!/^[0-9]{6}$/.test(value)) return "Enter a valid 6-digit pincode";
        break;
      case "fullName":
        if (!value) return "Full name is required";
        break;
    }
    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (key !== "isDefault" && key !== "addressType") {
        const error = validateField(
          key,
          formData[key as keyof typeof formData] as string,
        );
        if (error) {
          errors[key] = error;
          isValid = false;
        }
      }
    });

    setFormErrors(errors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
    );
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingAddress) {
      await dispatch(
        updateAddress({
          addressId: editingAddress._id,
          addressData: formData,
        }),
      );
      showToast("Address updated successfully", "success");
    } else {
      await dispatch(addAddress(formData));
      showToast("Address added successfully", "success");
    }

    setShowForm(false);
    resetForm();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[400px]">
  //       <Loader2 size={32} className="text-[#5D5FEF] animate-spin" />
  //     </div>
  //   );
  // }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 flex items-center justify-between">
          <h3 className="font-semibold text-[#1B2559]">
            Select Delivery Address{" "}
            {addresses.length > 0 && `(${addresses.length})`}
          </h3>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#5D5FEF] text-white rounded-lg text-sm font-medium hover:bg-[#4B4DC9] transition-colors"
            >
              <Plus size={14} />
              Add New
            </button>
          )}
        </div>

        {/* Address List */}
        {addresses.length > 0 && !showForm && (
          <AnimatePresence mode="popLayout">
            {addresses.map((address, index) => (
              <motion.div
                key={address._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl p-5 border-2 cursor-pointer transition-all ${
                  selectedAddressId === address._id
                    ? "border-[#5D5FEF] shadow-lg shadow-indigo-100"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                onClick={() => setSelectedAddressId(address._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Address Type and Default Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getAddressTypeColor(
                          address.addressType,
                        )}`}
                      >
                        {getAddressTypeIcon(address.addressType)}
                        {address.addressType.charAt(0).toUpperCase() +
                          address.addressType.slice(1)}
                      </span>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5D5FEF]/10 text-[#5D5FEF] rounded-full text-xs font-medium">
                          <CheckCircle size={12} />
                          Default
                        </span>
                      )}
                      {selectedAddressId === address._id && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                          <CheckCircle size={12} />
                          Selected
                        </span>
                      )}
                    </div>

                    {/* Address Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="font-medium text-[#1B2559]">
                          {address.fullName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {address.phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 mt-1" />
                        <span className="text-sm text-gray-600">
                          {address.houseNumber}, {address.street},{" "}
                          {address.city}, {address.state} - {address.pincode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-start gap-1 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={(e) => handleSetDefault(address._id, e)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-[#5D5FEF]"
                        title="Set as default"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleEdit(address, e)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-[#5D5FEF]"
                      title="Edit address"
                    >
                      <Edit size={14} />
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={(e) => handleDelete(address._id, e)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                        title="Delete address"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* No Addresses State */}
        {addresses.length === 0 && !showForm && (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#1B2559] mb-2">
              No Addresses Found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              You haven't added any delivery addresses yet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5D5FEF] text-white rounded-lg font-medium hover:bg-[#4B4DC9] transition-all"
            >
              <Plus size={16} />
              Add New Address
            </button>
          </div>
        )}

        {/* Address Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl p-5 border border-gray-200 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-[#1B2559]">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h4>
                <button
                  onClick={handleCloseForm}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all ${
                      formErrors.fullName && touched.fullName
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20"
                    }`}
                    placeholder="Your full name"
                  />
                  {formErrors.fullName && touched.fullName && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={10}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all ${
                      formErrors.phoneNumber && touched.phoneNumber
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20"
                    }`}
                    placeholder="10-digit mobile number"
                  />
                  {formErrors.phoneNumber && touched.phoneNumber && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* House/Flat Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    House/Flat Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all ${
                      formErrors.houseNumber && touched.houseNumber
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20"
                    }`}
                    placeholder="e.g., Flat 101, Building A"
                  />
                  {formErrors.houseNumber && touched.houseNumber && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.houseNumber}
                    </p>
                  )}
                </div>

                {/* Street */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all ${
                      formErrors.street && touched.street
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20"
                    }`}
                    placeholder="Street name, area, landmark"
                  />
                  {formErrors.street && touched.street && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.street}
                    </p>
                  )}
                </div>

                {/* City and State Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all ${
                        formErrors.city && touched.city
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20"
                      }`}
                      placeholder="City"
                    />
                    {formErrors.city && touched.city && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all ${
                        formErrors.state && touched.state
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20"
                      }`}
                      placeholder="State"
                    />
                    {formErrors.state && touched.state && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={6}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all ${
                      formErrors.pincode && touched.pincode
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20"
                    }`}
                    placeholder="6-digit pincode"
                  />
                  {formErrors.pincode && touched.pincode && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.pincode}
                    </p>
                  )}
                </div>

                {/* Address Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Address Type
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "home", label: "Home", icon: Home },
                      { value: "work", label: "Work", icon: Briefcase },
                      { value: "other", label: "Other", icon: MapPin },
                    ].map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              addressType: type.value as any,
                            })
                          }
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm ${
                            formData.addressType === type.value
                              ? "border-[#5D5FEF] bg-[#5D5FEF]/10 text-[#5D5FEF]"
                              : "border-gray-200 hover:border-gray-300 text-gray-600"
                          }`}
                        >
                          <Icon size={14} />
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Set as Default Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#5D5FEF] focus:ring-[#5D5FEF]"
                  />
                  <span className="text-sm text-gray-600">
                    Set as default address
                  </span>
                </label>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={operationLoading}
                    className="flex-1 py-2 bg-[#5D5FEF] text-white rounded-lg font-medium hover:bg-[#4B4DC9] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {operationLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        {editingAddress ? "Updating..." : "Saving..."}
                      </>
                    ) : editingAddress ? (
                      "Update Address"
                    ) : (
                      "Save Address"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column  */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl p-5 sticky top-24">
          <h3 className="font-bold text-[#1B2559] text-lg mb-4">
            Delivery Details
          </h3>

          {selectedAddressId ? (
            <div className="space-y-4">
              {addresses
                .filter((a) => a._id === selectedAddressId)
                .map((address) => (
                  <div key={address._id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getAddressTypeColor(address.addressType)}`}
                      >
                        {getAddressTypeIcon(address.addressType)}
                        {address.addressType}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-[#1B2559]">
                        {address.fullName}
                      </p>
                      <p className="text-gray-600">{address.phoneNumber}</p>
                      <p className="text-gray-600">
                        {address.houseNumber}, {address.street}
                      </p>
                      <p className="text-gray-600">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No address selected</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 mt-6">
            <button
              onClick={() => {
                const address = addresses.find(
                  (a) => a._id === selectedAddressId,
                );
                if (address) {
                  onProceed(address);
                }
              }}
              disabled={!selectedAddressId}
              className="w-full bg-[#5D5FEF] text-white py-3 rounded-xl font-semibold hover:bg-[#4B4DC9] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deliver Here
            </button>

            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95"
            >
              <ChevronLeft size={16} />
              Back to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div
              className="absolute inset-0"
              onClick={() => setDeleteModal({ show: false, addressId: null })}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[#1B2559] mb-2">
                  Delete Address
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this address?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDeleteModal({ show: false, addressId: null })
                    }
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={operationLoading}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {operationLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
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
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50"
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
