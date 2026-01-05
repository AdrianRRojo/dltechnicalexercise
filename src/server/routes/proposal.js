import express from "express";
import multer from "multer";
import { extractPDFText } from "../extract/extractPDFText.js";
import { extractFields } from "../extract/extractFields.js";

const router = express.Router();
const upload = multer();

export default function proposalRoutes(db) {
  router.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const buffer = req.file.buffer;

      const parsed = await extractPDFText(buffer);
      const extracted = extractFields(parsed);

      const result = await db.collection("proposals").insertOne({
        filename: req.file.originalname,
        uploadedAt: new Date(),
        rawText: parsed.text,
        extracted,
        status: "extracted"
      });

      res.json({
        proposalId: result.insertedId,
        extracted
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to process proposal" });
    }
  });

  return router;
}
