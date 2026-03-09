"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Briefcase,
  MapPin,
  Phone,
  User,
  Star,
  X,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addAddress, updateAddress } from "@/lib/redux/features/address/addressSlice";

interface AddressFormProps {
  user: any;
  editingAddress: any | null;
  onClose: () => void;
  isVisible: boolean;
  onSuccess?: () => void;
}

interface AddressFormValues {
  fullName: string;
  phoneNumber: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  addressType: "home" | "work" | "other";
}

const addressValidationSchema = Yup.object<AddressFormValues>({
  fullName: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  
  houseNumber: Yup.string()
    .required("House/Flat number is required")
    .min(2, "House/Flat number must be at least 2 characters")
    .max(50, "House/Flat number must be less than 50 characters"),
  
  street: Yup.string()
    .required("Street address is required")
    .min(5, "Street address must be at least 5 characters")
    .max(100, "Street address must be less than 100 characters"),
  
  city: Yup.string()
    .required("City is required")
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters"),
  
  state: Yup.string()
    .required("State is required")
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be less than 50 characters"),
  
  pincode: Yup.string()
    .required("Pincode is required")
    .matches(/^[0-9]{6}$/, "Enter a valid 6-digit pincode"),
  
  addressType: Yup.string()
    .oneOf(["home", "work", "other"], "Invalid address type")
    .required("Address type is required"),
  
  isDefault: Yup.boolean(),
});

export default function AddressForm({ user, editingAddress, onClose, isVisible, onSuccess }: AddressFormProps) {
  const dispatch = useAppDispatch();
  const { operationLoading } = useAppSelector((state) => state.address);

  const userName = user?.name || user?.displayName || "";

  const formik = useFormik<AddressFormValues>({
    initialValues: {
      fullName: "",
      phoneNumber: "",
      houseNumber: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
      addressType: "home",
    },
    validationSchema: addressValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      if (editingAddress) {
        await dispatch(
          updateAddress({
            addressId: editingAddress._id,
            addressData: values,
          })
        );
        onClose();
      } else {
        await dispatch(addAddress(values));
        resetForm({
          values: {
            fullName: userName, 
            phoneNumber: "",
            houseNumber: "",
            street: "",
            city: "",
            state: "",
            pincode: "",
            isDefault: false,
            addressType: "home",
          },
        });
        if (onSuccess) {
          onSuccess();
        }
      }
    },
  });

  useEffect(() => {
    if (isVisible) {
      if (editingAddress) {
        formik.setValues({
          fullName: editingAddress.fullName,
          phoneNumber: editingAddress.phoneNumber,
          houseNumber: editingAddress.houseNumber,
          street: editingAddress.street,
          city: editingAddress.city,
          state: editingAddress.state,
          pincode: editingAddress.pincode,
          isDefault: editingAddress.isDefault,
          addressType: editingAddress.addressType,
        });
      } else {
        formik.setValues({
          fullName: userName,
          phoneNumber: "",
          houseNumber: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
          addressType: "home",
        });
      }
      formik.setTouched({});
      formik.setErrors({});
    }
  }, [isVisible, editingAddress, userName]);

  const handleClose = () => {
    if (!editingAddress) {
      formik.setValues({
        fullName: userName, 
        phoneNumber: "",
        houseNumber: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
        addressType: "home",
      });
    }
    formik.setTouched({});
    formik.setErrors({});
    onClose();
  };

  const isFieldTouched = (fieldName: keyof AddressFormValues): boolean => {
    return formik.touched[fieldName] || false;
  };

  const getFieldError = (fieldName: keyof AddressFormValues): string | undefined => {
    return formik.errors[fieldName];
  };

  const inputClasses = (fieldName: keyof AddressFormValues) => `
    w-full px-3 py-2.5 bg-white border rounded-lg focus:outline-none transition-all text-sm 
    ${isFieldTouched(fieldName) && getFieldError(fieldName)
      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      : "border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20"
    }
  `;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg sticky top-24"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1B2559]">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${inputClasses("fullName")} pl-10`}
                placeholder="Your full name"
              />
            </div>
            {isFieldTouched("fullName") && getFieldError("fullName") && (
              <p className="text-xs text-red-500 mt-1">{getFieldError("fullName")}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phoneNumber"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                maxLength={10}
                className={`${inputClasses("phoneNumber")} pl-10`}
                placeholder="10-digit mobile number"
              />
            </div>
            {isFieldTouched("phoneNumber") && getFieldError("phoneNumber") && (
              <p className="text-xs text-red-500 mt-1">{getFieldError("phoneNumber")}</p>
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
              value={formik.values.houseNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClasses("houseNumber")}
              placeholder="e.g., Flat 101, Building A"
            />
            {isFieldTouched("houseNumber") && getFieldError("houseNumber") && (
              <p className="text-xs text-red-500 mt-1">{getFieldError("houseNumber")}</p>
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
              value={formik.values.street}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClasses("street")}
              placeholder="Street name, area, landmark"
            />
            {isFieldTouched("street") && getFieldError("street") && (
              <p className="text-xs text-red-500 mt-1">{getFieldError("street")}</p>
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
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClasses("city")}
                placeholder="City"
              />
              {isFieldTouched("city") && getFieldError("city") && (
                <p className="text-xs text-red-500 mt-1">{getFieldError("city")}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClasses("state")}
                placeholder="State"
              />
              {isFieldTouched("state") && getFieldError("state") && (
                <p className="text-xs text-red-500 mt-1">{getFieldError("state")}</p>
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
              value={formik.values.pincode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              maxLength={6}
              className={inputClasses("pincode")}
              placeholder="6-digit pincode"
            />
            {isFieldTouched("pincode") && getFieldError("pincode") && (
              <p className="text-xs text-red-500 mt-1">{getFieldError("pincode")}</p>
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
                    onClick={() => formik.setFieldValue("addressType", type.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm ${
                      formik.values.addressType === type.value
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
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formik.values.isDefault}
              onChange={formik.handleChange}
              className="w-4 h-4 rounded border-gray-300 text-[#5D5FEF] focus:ring-[#5D5FEF]"
            />
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Star size={14} className="text-gray-400" />
              Set as default address
            </span>
          </label>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={operationLoading}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all active:scale-95 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={operationLoading}
              className="flex-1 py-2.5 bg-[#5D5FEF] text-white rounded-lg font-medium hover:bg-[#4B4DC9] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {operationLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {editingAddress ? "Updating..." : "Saving..."}
                </>
              ) : (
                editingAddress ? "Update Address" : "Save Address"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}