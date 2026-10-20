import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  calculateScaleFactor,
  calculateOffset,
  isWithinTolerance,
  CR80_TOLERANCE_WIDTH_MM,
} from "@ops/core";
import {
  Sliders,
  Printer,
  Download,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { drawCalibrationSheet } from "../../services/print/calibration-sheet.js";
import { indexedDbService, PrinterProfileRecord } from "../../services/storage/indexeddb-service.js";

export const CalibrationWizard: React.FC = () => {
  const { t } = useTranslation();

  // Wizard state
  const [measuredX, setMeasuredX] = useState<number>(100.0);
  const [measuredY, setMeasuredY] = useState<number>(100.0);
  const [measuredOriginX, setMeasuredOriginX] = useState<number>(30.0);
  const [measuredOriginY, setMeasuredOriginY] = useState<number>(55.0);
  const [profileName, setProfileName] = useState<string>("Default Printer Profile");
  const [paperType, setPaperType] = useState<"A4" | "4x6" | "PVC_TRAY">("A4");
  const [savedProfiles, setSavedProfiles] = useState<PrinterProfileRecord[]>([]);
  const [statusText, setStatusText] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render calibration sheet canvas on load
  useEffect(() => {
    if (canvasRef.current) {
      drawCalibrationSheet(canvasRef.current, 300);
    }
  }, []);

  // Load saved printer profiles from IndexedDB
  const loadProfiles = async () => {
    try {
      const profiles = await indexedDbService.getPrinterProfiles();
      setSavedProfiles(profiles);
    } catch {
      // Ignored in offline fallback
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // Mathematical calibration calculations
  const scaleX = measuredX > 0 ? calculateScaleFactor(100.0, measuredX) : 1.0;
  const scaleY = measuredY > 0 ? calculateScaleFactor(100.0, measuredY) : 1.0;
  const offsetX = calculateOffset(30.0, measuredOriginX);
  const offsetY = calculateOffset(55.0, measuredOriginY);

  const isXCompliant = isWithinTolerance(measuredX, 100.0, CR80_TOLERANCE_WIDTH_MM);
  const isYCompliant = isWithinTolerance(measuredY, 100.0, CR80_TOLERANCE_WIDTH_MM);

  const handlePrintSheet = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setStatusText(t("status.printing"));
      const bridge = (window as any).opsBridge;

      if (bridge && typeof bridge.printSheet === "function") {
        const res = await bridge.printSheet({
          silent: false,
          pageSize: "A4",
          landscape: false,
          scaleFactor: 100, // 100% scale is strictly mandatory
        });
        if (res.ok) {
          setStatusText("Calibration sheet spooled at 100% scale.");
        } else {
          setStatusText(t("error.printer_error"));
        }
      } else {
        window.print();
        setStatusText("Calibration sheet printed.");
      }
    } catch {
      setStatusText(t("error.printer_error"));
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return;

    const profile: PrinterProfileRecord = {
      id: `profile_${Date.now()}`,
      name: profileName,
      paperType,
      offsetX,
      offsetY,
      cardScale: Number(((scaleX + scaleY) / 2).toFixed(4)),
      gapX: 4.0,
      gapY: 2.5,
    };

    try {
      await indexedDbService.savePrinterProfile(profile);
      await loadProfiles();
      setStatusText(`Saved profile '${profileName}' successfully.`);
    } catch {
      setStatusText("Failed to save profile.");
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await indexedDbService.deletePrinterProfile(id);
      await loadProfiles();
      setStatusText("Deleted profile.");
    } catch {
      setStatusText("Failed to delete profile.");
    }
  };

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)", padding: "16px 24px" }}>
      {/* Left Configuration Panel */}
      <div style={{
        width: 440,
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--border-radius-lg)",
        padding: 20,
        border: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflowY: "auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sliders size={22} color="var(--accent-primary)" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("nav.calibration")}</h2>
        </div>

        {/* Step 1: Print Test Sheet */}
        <div style={{ backgroundColor: "var(--bg-app)", padding: 12, borderRadius: "var(--border-radius-md)" }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: 4 }}>
            Step 1: Print Calibration Target Sheet
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 10 }}>
            Prints exact 100 mm reference lines and CR-80 card outline at 100% scale without page scaling.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", padding: "10px 14px" }}
            onClick={handlePrintSheet}
          >
            <Printer size={16} />
            <span>{t("action.test_print")}</span>
          </button>
        </div>

        {/* Step 2: Enter Measurements */}
        <div style={{ backgroundColor: "var(--bg-app)", padding: 12, borderRadius: "var(--border-radius-md)" }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: 4 }}>
            Step 2: Caliper Measurements
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 10 }}>
            Measure the printed lines with digital calipers and enter the values below:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Horizontal Line (Target: 100.0mm)
              </label>
              <input
                type="number"
                step="0.1"
                className="input-text"
                value={measuredX}
                onChange={(e) => setMeasuredX(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Vertical Line (Target: 100.0mm)
              </label>
              <input
                type="number"
                step="0.1"
                className="input-text"
                value={measuredY}
                onChange={(e) => setMeasuredY(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Solved Coefficients */}
        <div style={{ backgroundColor: "var(--bg-app)", padding: 12, borderRadius: "var(--border-radius-md)" }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: 6 }}>
            Step 3: Computed Mathematical Correction
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.8125rem" }}>
            <div style={{ padding: 8, backgroundColor: "var(--bg-surface)", borderRadius: 6 }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Scale X Factor</div>
              <div style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{scaleX.toFixed(4)}x</div>
            </div>
            <div style={{ padding: 8, backgroundColor: "var(--bg-surface)", borderRadius: 6 }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Scale Y Factor</div>
              <div style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{scaleY.toFixed(4)}x</div>
            </div>
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem" }}>
            {isXCompliant && isYCompliant ? (
              <>
                <CheckCircle2 size={16} color="#10B981" />
                <span style={{ color: "#10B981", fontWeight: 600 }}>Within ±0.40 mm tolerance</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} color="#F59E0B" />
                <span style={{ color: "#F59E0B", fontWeight: 600 }}>Adjustment applied to reach ±0.40 mm accuracy</span>
              </>
            )}
          </div>
        </div>

        {/* Step 4: Save Printer Profile */}
        <div>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
            Step 4: Save Named Printer Profile
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              className="input-text"
              placeholder="e.g. Epson L805 (A4 Mode)"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveProfile}
              style={{ padding: "0 14px" }}
            >
              <Save size={16} />
              <span>{t("action.save")}</span>
            </button>
          </div>
        </div>

        {/* Saved Profiles List */}
        {savedProfiles.length > 0 && (
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Saved Printer Profiles ({savedProfiles.length})
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {savedProfiles.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    backgroundColor: "var(--bg-app)",
                    borderRadius: 6,
                    fontSize: "0.8125rem"
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: "0.75rem" }}>
                      ({p.paperType}, {p.cardScale}x)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    title="Delete profile"
                    onClick={() => handleDeleteProfile(p.id)}
                    style={{ padding: 4 }}
                  >
                    <Trash2 size={14} color="#EF4444" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {statusText && (
          <div style={{ fontSize: "0.8125rem", color: "var(--accent-primary)", textAlign: "center", marginTop: "auto" }}>
            {statusText}
          </div>
        )}
      </div>

      {/* Right Canvas Preview */}
      <div style={{
        flex: 1,
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--border-radius-lg)",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: 24
      }}>
        <div style={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--border-strong)",
          maxHeight: "100%",
          display: "flex"
        }}>
          <canvas
            ref={canvasRef}
            style={{
              maxHeight: "calc(100vh - 180px)",
              maxWidth: "100%",
              objectFit: "contain",
              display: "block"
            }}
          />
        </div>
      </div>
    </div>
  );
};
