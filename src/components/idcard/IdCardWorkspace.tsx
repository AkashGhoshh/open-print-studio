import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Printer,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { templateRegistry } from "../../services/crop/template-registry";
import type { IdCardTemplate } from "../../services/crop/template-types";
import {
  processIdCardDocument,
  type ProcessedIdCardSides,
} from "../../services/idcard/id-card-processor";
import {
  pdfLoader,
  PdfPasswordRequiredError,
  PdfWrongPasswordError,
} from "../../services/pdf/pdf-loader";
import { TemplateSelector } from "./TemplateSelector";
import { EnhancementToolbar } from "./EnhancementToolbar";
import { CardPreviewPane } from "./CardPreviewPane";
import { PasswordDialog } from "./PasswordDialog";
import { SheetWorkspace } from "../sheets/SheetWorkspace";
import type { RotationAngle } from "@ops/core";

export const IdCardWorkspace: React.FC = () => {
  const { t } = useTranslation();

  // Template state
  const templates = templateRegistry.getAll();
  const [selectedTemplate, setSelectedTemplate] = useState<IdCardTemplate>(
    templateRegistry.getDefault()
  );

  // File and document state
  const [currentFile, setCurrentFile] = useState<{
    name: string;
    buffer: ArrayBuffer;
    isPdf: boolean;
  } | null>(null);
  const [renderedSource, setRenderedSource] = useState<{
    image: CanvasImageSource;
    width: number;
    height: number;
  } | null>(null);

  // Processing settings
  const [frontRotation, setFrontRotation] = useState<RotationAngle>(0);
  const [backRotation, setBackRotation] = useState<RotationAngle>(0);
  const [textBoldLevel, setTextBoldLevel] = useState<number>(0);
  const [cleanDisclaimer, setCleanDisclaimer] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Output cards
  const [processedSides, setProcessedSides] = useState<ProcessedIdCardSides | null>(null);
  const [viewMode, setViewMode] = useState<"crop" | "print">("crop");

  // Loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password challenge state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const pendingBufferRef = useRef<ArrayBuffer | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-process when template, rotations, bolding, or cleaner changes
  useEffect(() => {
    if (!renderedSource) return;

    try {
      const result = processIdCardDocument(
        renderedSource.image,
        renderedSource.width,
        renderedSource.height,
        {
          template: selectedTemplate,
          frontRotation,
          backRotation,
          textBoldLevel,
          cleanDisclaimer,
        }
      );
      setProcessedSides(result);
    } catch (err: any) {
      console.error("Card processing error:", err);
      setErrorMessage("Failed to process card boundaries.");
    }
  }, [
    renderedSource,
    selectedTemplate,
    frontRotation,
    backRotation,
    textBoldLevel,
    cleanDisclaimer,
  ]);

  // When template changes, reset rotations to template defaults
  const handleTemplateSelect = (tmpl: IdCardTemplate) => {
    setSelectedTemplate(tmpl);
    setFrontRotation(tmpl.front.defaultRotation ?? 0);
    setBackRotation(tmpl.back?.defaultRotation ?? 0);
  };

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        pendingBufferRef.current = buffer;
        await loadPdfBuffer(buffer);
      } else {
        // Image file (PNG, JPG)
        const blob = new Blob([buffer]);
        const img = new Image();
        const url = URL.createObjectURL(blob);

        img.onload = () => {
          URL.revokeObjectURL(url);
          setRenderedSource({
            image: img,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          setCurrentFile({ name: file.name, buffer, isPdf: false });
          setIsLoading(false);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          setIsLoading(false);
          setErrorMessage("Failed to read image file.");
        };

        img.src = url;
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Failed to load document.");
    }
  };

  const loadPdfBuffer = async (buffer: ArrayBuffer, password?: string) => {
    try {
      const renderRes = await pdfLoader.renderPage(buffer, {
        password,
        targetDpi: 300,
      });

      setRenderedSource({
        image: renderRes.bitmap,
        width: renderRes.width,
        height: renderRes.height,
      });

      setCurrentFile({ name: "Document.pdf", buffer, isPdf: true });
      setIsPasswordModalOpen(false);
      setPasswordError(undefined);
      pendingBufferRef.current = null;
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      if (err instanceof PdfPasswordRequiredError) {
        setIsPasswordModalOpen(true);
        setPasswordError(undefined);
      } else if (err instanceof PdfWrongPasswordError) {
        setIsPasswordModalOpen(true);
        setPasswordError("Incorrect password. Please try again.");
      } else {
        setErrorMessage(err.message || "Failed to render PDF document.");
      }
    }
  };

  const handlePasswordSubmit = (password: string) => {
    if (!pendingBufferRef.current) return;
    setIsLoading(true);
    loadPdfBuffer(pendingBufferRef.current, password);
  };

  // Synthetic Specimen Generator for fast testing
  const loadSyntheticSpecimen = () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Create synthetic A4 e-Aadhaar canvas in memory
    const canvas = document.createElement("canvas");
    canvas.width = 2480;
    canvas.height = 3508;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Front Card Box: relX: 0.05, relY: 0.68, relW: 0.42, relH: 0.28
    const fx = 0.05 * canvas.width;
    const fy = 0.68 * canvas.height;
    const fw = 0.42 * canvas.width;
    const fh = 0.28 * canvas.height;
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(fx, fy, fw, fh);
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 4;
    ctx.strokeRect(fx, fy, fw, fh);

    // Front Text & Photo
    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("SPECIMEN GOVERNMENT CARD", fx + 30, fy + 50);

    ctx.fillStyle = "#CBD5E1";
    ctx.fillRect(fx + 30, fy + 80, 220, 280);
    ctx.fillStyle = "#475569";
    ctx.font = "20px sans-serif";
    ctx.fillText("SPECIMEN PHOTO", fx + 50, fy + 220);

    ctx.fillStyle = "#0F172A";
    ctx.font = "26px sans-serif";
    ctx.fillText("Name: SURESH KUMAR", fx + 280, fy + 120);
    ctx.fillText("DOB: 15/08/1985", fx + 280, fy + 170);
    ctx.fillText("Gender: MALE", fx + 280, fy + 220);

    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 32px monospace";
    ctx.fillText("XXXX XXXX 1234", fx + 280, fy + 290);

    // Back Card Box: relX: 0.53, relY: 0.68, relW: 0.42, relH: 0.28
    const bx = 0.53 * canvas.width;
    const by = 0.68 * canvas.height;
    const bw = 0.42 * canvas.width;
    const bh = 0.28 * canvas.height;
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 4;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("SPECIMEN BACK ADDRESS", bx + 30, fy + 50);

    ctx.fillStyle = "#0F172A";
    ctx.font = "22px sans-serif";
    ctx.fillText("Address: S/O R. Kumar, House 42, Market Road,", bx + 30, by + 110);
    ctx.fillText("Sector 15, New Delhi, Pin: 110001", bx + 30, by + 150);

    // QR Code dummy
    ctx.fillStyle = "#000000";
    ctx.fillRect(bx + bw - 260, by + 180, 200, 200);

    // Disclaimer
    const dx = 0.05 * canvas.width;
    const dy = 0.93 * canvas.height;
    const dw = 0.90 * canvas.width;
    const dh = 0.06 * canvas.height;
    ctx.fillStyle = "#FEF3C7";
    ctx.fillRect(dx, dy, dw, dh);
    ctx.fillStyle = "#92400E";
    ctx.font = "20px sans-serif";
    ctx.fillText("UIDAI Disclaimer: Aadhaar is proof of identity, not citizenship. (SPECIMEN)", dx + 30, dy + 40);

    setRenderedSource({
      image: canvas,
      width: canvas.width,
      height: canvas.height,
    });
    setCurrentFile({ name: "Synthetic_eAadhaar_Specimen.png", buffer: new ArrayBuffer(0), isPdf: false });
    setIsLoading(false);
  };

  if (viewMode === "print") {
    return (
      <SheetWorkspace
        cardPairs={
          processedSides
            ? [{ front: processedSides.frontCanvas, back: processedSides.backCanvas }]
            : []
        }
        onBackToCard={() => setViewMode("crop")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            {t("nav.idCard", "ID Card Processing")}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic CR-80 dual-side cropping, faint-text enhancement, and offline in-memory PDF decryption.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSyntheticSpecimen}
            className="ops-btn text-xs flex items-center gap-1.5"
            style={{
              backgroundColor: "rgba(37, 99, 235, 0.15)",
              color: "#93C5FD",
              border: "1px solid rgba(37, 99, 235, 0.4)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Load Specimen ID</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="ops-btn ops-btn-primary flex items-center gap-2 text-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Select PDF or Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>

      {/* Template Preset Selector */}
      <div
        className="p-3.5 rounded-xl border"
        style={{
          backgroundColor: "var(--ops-bg-card)",
          borderColor: "var(--ops-border)",
        }}
      >
        <TemplateSelector
          templates={templates}
          selectedTemplateId={selectedTemplate.id}
          onSelect={handleTemplateSelect}
        />
      </div>

      {/* Enhancement Toolbar */}
      <EnhancementToolbar
        boldLevel={textBoldLevel}
        onBoldLevelChange={setTextBoldLevel}
        cleanDisclaimer={cleanDisclaimer}
        onCleanDisclaimerChange={setCleanDisclaimer}
        hasDisclaimerRegion={Boolean(selectedTemplate.disclaimerRegion)}
        isFlipped={isFlipped}
        onFlipChange={setIsFlipped}
      />

      {/* Error Alert */}
      {errorMessage && (
        <div
          className="p-3 rounded-lg text-xs flex items-center gap-2 text-red-300"
          style={{ backgroundColor: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.4)" }}
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dual-Side Preview Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CardPreviewPane
          sideTitle="Front Card"
          canvas={processedSides?.frontCanvas ?? null}
          rotation={frontRotation}
          onRotate={setFrontRotation}
          isFlipped={isFlipped}
        />

        {selectedTemplate.back ? (
          <CardPreviewPane
            sideTitle="Back Card"
            canvas={processedSides?.backCanvas ?? null}
            rotation={backRotation}
            onRotate={setBackRotation}
            isFlipped={isFlipped}
          />
        ) : (
          <div
            className="flex-1 rounded-xl p-8 flex flex-col items-center justify-center border text-center"
            style={{
              backgroundColor: "var(--ops-bg-card)",
              borderColor: "var(--ops-border)",
            }}
          >
            <CreditCard className="w-12 h-12 text-slate-600 mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">Single-Sided Document</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              The selected template ({selectedTemplate.name}) is single-sided. Only the front CR-80 card will be printed.
            </p>
          </div>
        )}
      </div>

      {/* Proceed to Sheet Printing Action */}
      {processedSides && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setViewMode("print")}
            className="ops-btn ops-btn-primary flex items-center gap-2 text-sm font-semibold px-6 py-3"
          >
            <Printer className="w-4 h-4" />
            <span>Proceed to Sheet Printing (A4 / 4×6 / PVC Tray)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Password Modal */}
      <PasswordDialog
        isOpen={isPasswordModalOpen}
        errorMessage={passwordError}
        onSubmit={handlePasswordSubmit}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          setPasswordError(undefined);
          pendingBufferRef.current = null;
        }}
      />
    </div>
  );
};
