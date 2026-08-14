// localPart and castLiteral are NOT exported (removed 2026-08-14 audit
// follow-up). Both are generic RDF plumbing: an IRI/CURIE shortener and
// an xsd-datatype literal caster. Every RDF-shaped consumer already has
// equivalents, they differentiate nothing, and castLiteral in particular
// is an open-ended support obligation (each uncovered XSD datatype
// becomes an issue against a symbol that is incidental to this library's
// purpose). They remain exported from ./pipeline for use inside core.
export { ProjectionPipeline, RDF } from "./pipeline";
export type {
  RDFTriple,
  RDFGraph,
  RDFObjectType,
  ProjectionStep,
  ProjectionStepConfig,
} from "./pipeline";

export {
  typeCollapse,
  literalCollapse,
  blankNodeCollapse,
  listCollapse,
  reificationCollapse,
} from "./transforms";

export { createPresetPipeline, checkRenderPermission } from "./presets";
export type {
  PresetName,
  HolonicProjectionPipeline,
  ViewTarget,
  RenderRequest,
} from "./presets";
