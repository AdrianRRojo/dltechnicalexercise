import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import { extractText, extractFields } from "./extract/index.js";
import { Company } from "./models/Company.js";
import { Proposal } from "./models/Proposal.js";
import { normalizeCompanyName } from "./utils/normalizeCompanyName.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.REACT_APP_DB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const upload = multer({ storage: multer.memoryStorage() });

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/proposals/extract", upload.single("file"), async (req, res) => {
  try {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const text = await extractText(req.file);
    const extracted = extractFields(text);

    res.json({ extracted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Extraction failed", message: err.message });
  }
});
app.post("/api/proposals/confirm", upload.single("file"), async (req, res) => {
  try {
    // console.log("CONFIRM hit");
    // console.log("req.file exists:", !!req.file);
    // console.log("req.body keys:", Object.keys(req.body || {}));
    // console.log("req.body.payload:", req.body?.payload);

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const payloadRaw = req.body?.payload;
    if (!payloadRaw) return res.status(400).json({ error: "Missing payload" });

    let payload;
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      return res.status(400).json({ error: "Invalid payload JSON" });
    }

    const company = (payload.company || "").trim();
    const contact = (payload.contact || "").trim();
    const email = (payload.email || "").trim();
    const phone = (payload.phone || "").trim();
    const scope = Array.isArray(payload.scope) ? payload.scope : [];

    if (!company || company.toLowerCase() === "not found") {
      return res.status(422).json({ error: "Company is required" });
    }

    const text = await extractText(req.file);

    const normalizedName = normalizeCompanyName(company);

    const companyUpdate = {
      $setOnInsert: { name: company, normalizedName },
      $set: { lastUpdatedAt: new Date() },
    };

    if (contact && contact.toLowerCase() !== "not found")
      companyUpdate.$set.contact = contact;
    if (email && email.toLowerCase() !== "not found")
      companyUpdate.$set.email = email;
    if (phone && phone.toLowerCase() !== "not found")
      companyUpdate.$set.phone = phone;

    const companyDoc = await Company.findOneAndUpdate(
      { normalizedName },
      companyUpdate,
      { new: true, upsert: true }
    );

    const proposal = await Proposal.create({
      companyId: companyDoc._id,
      filename: req.file.originalname,
      uploadedAt: new Date(),
      rawText: text,
      extracted: { company, contact, email, phone },
      scope,
    });

    return res.json({
      companyId: companyDoc._id,
      proposalId: proposal._id,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Confirm failed", message: err.message });
  }
});




app.post("/api/proposals/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const text = await extractText(req.file);
    const extracted = extractFields(text);

    const companyName = extracted.company || "Not found";
    if (!companyName || companyName === "Not found") {
      return res.status(422).json({
        error: "Could not determine company name",
        extracted,
      });
    }

    const normalizedName = normalizeCompanyName(companyName);
    const companyUpdate = {
      $setOnInsert: { name: companyName, normalizedName },
      $set: { lastUpdatedAt: new Date() },
    };

    if (extracted.contact && extracted.contact !== "Not found") {
      companyUpdate.$set.contact = extracted.contact;
    }
    if (extracted.email && extracted.email !== "Not found") {
      companyUpdate.$set.email = extracted.email;
    }
    if (extracted.phone && extracted.phone !== "Not found") {
      companyUpdate.$set.phone = extracted.phone;
    }

    const companyDoc = await Company.findOneAndUpdate(
      { normalizedName },
      companyUpdate,
      { new: true, upsert: true }
    );

    const proposal = await Proposal.create({
      companyId: companyDoc._id,
      filename: req.file.originalname,
      uploadedAt: new Date(),
      rawText: text,
      extracted: {
        company: extracted.company || "",
        contact: extracted.contact || "",
        email: extracted.email || "",
        phone: extracted.phone || "",
      },
      scope: Array.isArray(extracted.scope) ? extracted.scope : [],
    });

    res.json({
      companyId: companyDoc._id,
      proposalId: proposal._id,
      company: {
        name: companyDoc.name,
        contact: companyDoc.contact,
        email: companyDoc.email,
        phone: companyDoc.phone,
      },
      proposal: {
        filename: proposal.filename,
        scope: proposal.scope,
      },
      extracted,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ error: "Company already exists (duplicate key)" });
    }

    console.error(err);
    res.status(500).json({ error: "Processing failed", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
