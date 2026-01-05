import mongoose from "mongoose";

const ScopeItemSchema = new mongoose.Schema(
  {
    description: { type: String, default: "" },
    price: { type: String, default: "" },
  },
  { _id: false }
);

const ProposalSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    filename: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },

    rawText: { type: String, default: "" },
    extracted: {
      company: { type: String, default: "" },
      contact: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },

    scope: { type: [ScopeItemSchema], default: [] },
  },
  { timestamps: true }
);

export const Proposal = mongoose.model("Proposal", ProposalSchema);
