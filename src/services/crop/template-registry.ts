/**
 * Open Print Studio — ID Card Template Registry
 * Loads and validates document crop configurations.
 */

import cropTemplatesData from "../../data/crop-templates.json";
import type { IdCardTemplate, CropTemplateFileSchema } from "./template-types";

class TemplateRegistry {
  private templates: Map<string, IdCardTemplate> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    const data = cropTemplatesData as CropTemplateFileSchema;
    if (Array.isArray(data.templates)) {
      for (const t of data.templates) {
        this.templates.set(t.id, t);
      }
    }
  }

  public getAll(): IdCardTemplate[] {
    return Array.from(this.templates.values());
  }

  public getById(id: string): IdCardTemplate | undefined {
    return this.templates.get(id);
  }

  public getDefault(): IdCardTemplate {
    return this.templates.get("eaadhaar-standard") ?? this.getAll()[0];
  }

  public validate(t: any): boolean {
    if (!t || typeof t !== "object") return false;
    if (typeof t.id !== "string" || !t.id) return false;
    if (typeof t.name !== "string" || !t.name) return false;
    if (!t.front || typeof t.front.relX !== "number" || typeof t.front.relY !== "number") return false;
    return true;
  }
}

export const templateRegistry = new TemplateRegistry();
