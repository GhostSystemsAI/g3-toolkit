export {
  validateShacl,
  summarizeValidation,
  ShaclValidator,
} from "./shacl-validator";
export type {
  ShaclShape,
  ShaclPropertyConstraint,
  ShaclViolation,
  ShaclValidationResult,
} from "./shacl-validator";
// propertyRowText, cardinalitySuffix and valueConstraintCount moved to
// @g3t/core/internal (2026-08-14). They format row
// LABELS, so keeping them here would put a rendering opinion under the
// 1.0 semver contract. See packages/core/src/internal/index.ts.
export {
  shaclShapesToStructural,
  closedShapeIds,
  shaclRowSeverities,
  shaclRowId,
} from "./shacl-to-structural";
export type { ShaclToStructuralOptions } from "./shacl-to-structural";
// severityOverlayId moved to @g3t/core/internal with the three row-text
// formatters above; it mints an overlay id string, which is the same
// class of rendering detail. severityOverlays (plural) stays: it returns
// the overlay DOCUMENTS, which are a versioned integration channel.
export {
  parseShaclReport,
  reportFromValidationResults,
  severityOverlays,
  shaclResultDrivers,
  reportFocusNodes,
  resultsForShape,
} from "./shacl-report";
export type {
  ShaclReportDocument,
  ShaclReportResult,
  ShaclSeverity,
} from "./shacl-report";
export {
  resultTargets,
  resultSelectionIds,
  resultDetail,
  resultsForFocusNode,
} from "./shacl-links";
export type { ShaclResultTargets, ShaclResultDetail } from "./shacl-links";
