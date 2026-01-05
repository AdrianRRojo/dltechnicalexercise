import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    normalizedName: { type: String, required: true, unique: true, index: true },

    name: { type: String, required: true },

    contact: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },

    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", CompanySchema);
