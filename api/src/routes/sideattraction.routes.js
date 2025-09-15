const express = require("express");
const { Router } = express;
const BUSINESS_SECTORS = require("../models/enums/business.sectors.json");

// derive SECTORS from JSON keys
const SECTORS = Object.keys(BUSINESS_SECTORS);

module.exports = () => {
  const api = new Router();

  // ------------------------------
  // Get all sectors
  // ------------------------------
  api.get("/sectors", (req, res) => {
    try {
      if (!SECTORS || SECTORS.length === 0) {
        return res.status(404).json({ ok: false, message: "No sectors found" });
      }
      res.status(200).json({ ok: true, sectors: SECTORS });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, message: "Internal Server Error" });
    }
  });

  // ------------------------------
  // Get industries by sector
  // ------------------------------
  api.get("/industries/:sector", (req, res) => {
    try {
      const { sector } = req.params;

      // Match ignoring case
      const matchedSector = SECTORS.find(
        (s) => s.toLowerCase() === sector.trim().toLowerCase()
      );

      if (!matchedSector) {
        return res
          .status(400)
          .json({ ok: false, message: `Invalid sector: ${sector}` });
      }

      const industries = BUSINESS_SECTORS[matchedSector] || [];
      res.status(200).json({ ok: true, sector: matchedSector, industries });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, message: "Internal Server Error" });
    }
  });

  return api;
};
