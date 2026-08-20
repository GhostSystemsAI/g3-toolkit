/**
 * A small SysML-flavored model for the satellite MBSE shell, structured the
 * way Cameo/MagicDraw organizes a project: a containment tree of packages
 * that own model elements (blocks, constraint blocks, requirements) and
 * diagrams. A diagram is a typed VIEW (bdd / ibd / par / req) over a subset
 * of the model; selecting it in the tree projects that subset into a
 * StructuralGraphInput (see diagrams.ts) and loads it into the linked graph
 * view. Membership is explicit per diagram (not inferred) so a diagram shows
 * exactly what its author put on it, as in a real tool.
 *
 * This is example data, not a general SysML metamodel: it carries only the
 * fields the four diagram projections need.
 */

import type { StructuralGraphInput } from "@g3t/core";

export type DiagramType = "bdd" | "ibd" | "par" | "req" | "act";

/** A value property (attribute) on a block: `name: Type [mult]`. */
export interface ValueProperty {
  id: string;
  name: string;
  type: string;
  multiplicity?: string;
}

/** A flow/standard port on a block or part. */
export interface FlowPort {
  id: string;
  name: string;
  direction: "in" | "out" | "inout";
  /** Carried item (e.g. "Power", "TelemetryFrame"). */
  type?: string;
  /** LR-18: SysML multiplicity for the port (e.g. "1", "0..*"). */
  multiplicity?: string;
  /** Preferred side on the owning box; the router still owns final routing. */
  side?: "NORTH" | "SOUTH" | "EAST" | "WEST";
}

/** A part property inside an IBD: an instance role typed by a block. */
export interface PartProperty {
  id: string;
  name: string;
  /** Block id this part is typed by. */
  type: string;
  ports: FlowPort[];
}

export interface Block {
  id: string;
  kind: "block" | "constraint";
  name: string;
  /** Overrides the default stereotype («block» / «constraint»). */
  stereotype?: string;
  values?: ValueProperty[];
  operations?: string[];
  /** IBD context blocks own parts (typed by other blocks). */
  parts?: PartProperty[];
  /** Boundary ports (BDD flow ports, IBD delegation). */
  ports?: FlowPort[];
  /** Constraint blocks own parameters and an equation. */
  parameters?: ValueProperty[];
  constraint?: string;
}

export interface Requirement {
  id: string;
  reqId: string;
  name: string;
  text: string;
  children?: Requirement[];
}

export type RelationshipKind =
  | "composition"
  | "aggregation"
  | "generalization"
  | "dependency"
  | "association";

export interface Relationship {
  id: string;
  kind: RelationshipKind;
  source: string;
  target: string;
  /** e.g. «satisfy», «deriveReqt», «verify»; drives the edge label. */
  stereotype?: string;
  label?: string;
}

/** An IBD connector between two part ports. */
export interface Connector {
  id: string;
  sourcePart: string;
  sourcePort: string;
  targetPart: string;
  targetPort: string;
  label?: string;
}

/** A parametric binding: a value property bound to a constraint parameter. */
export interface Binding {
  id: string;
  /** Display label of the bound value ("PowerSubsystem.solarArrayPower"). */
  value: string;
  /** "constraintBlockId.parameterId". */
  param: string;
}

export interface Diagram {
  id: string;
  name: string;
  type: DiagramType;
  /** Owning element: a block id (bdd/ibd/par) or the requirements package. */
  context: string;
  blocks?: string[];
  relationships?: string[];
  connectors?: string[];
  bindings?: string[];
  /** Root requirement ids (req diagrams). */
  requirements?: string[];
  /**
   * Activity (act) diagrams carry a pre-built structural graph directly
   * instead of projecting a SysML subset: the flowchart IS the authored
   * document. projectACT returns this verbatim. Nodes use the plain-node
   * `shape` field for UML activity glyphs (diamond decisions, terminals).
   */
  activityGraph?: StructuralGraphInput;
}

export interface Package {
  id: string;
  name: string;
  packages?: Package[];
  blocks?: string[];
  requirements?: string[];
  diagrams?: string[];
}

export interface SysMLModel {
  root: Package;
  blocks: Record<string, Block>;
  requirements: Record<string, Requirement>;
  relationships: Record<string, Relationship>;
  connectors: Record<string, Connector>;
  bindings: Record<string, Binding>;
  diagrams: Record<string, Diagram>;
}

// ── Satellite fixture ────────────────────────────────────────────────────
// A small Earth-observation smallsat: five subsystems, an internal block
// diagram of power/data/RF flow, a power-budget parametric, and a mission
// requirement breakdown with satisfy links.

const blocks: Record<string, Block> = {
  smallsat: {
    id: "smallsat",
    kind: "block",
    name: "SmallSat",
    values: [
      { id: "smallsat.mass", name: "mass", type: "kg", multiplicity: "1" },
      { id: "smallsat.orbit", name: "orbitAltitude", type: "km" },
    ],
    parts: [
      {
        id: "p.power",
        name: "power",
        type: "eps",
        ports: [
          {
            id: "p.power.pout",
            name: "pwrOut",
            direction: "out",
            type: "Power",
            side: "EAST",
            multiplicity: "1..3", // LR-18: one bus, several loads
          },
        ],
      },
      {
        id: "p.adcs",
        name: "adcs",
        type: "adcs",
        ports: [
          {
            id: "p.adcs.din",
            name: "dataIn",
            direction: "in",
            type: "Cmd",
            side: "WEST",
            multiplicity: "1",
          },
          {
            id: "p.adcs.pin",
            name: "pwrIn",
            direction: "in",
            type: "Power",
            side: "SOUTH",
          },
        ],
      },
      {
        id: "p.obc",
        name: "obc",
        type: "obc",
        ports: [
          {
            id: "p.obc.bus",
            name: "dataBus",
            direction: "inout",
            type: "Data",
            side: "EAST",
          },
          {
            id: "p.obc.pin",
            name: "pwrIn",
            direction: "in",
            type: "Power",
            side: "SOUTH",
          },
        ],
      },
      {
        id: "p.comms",
        name: "comms",
        type: "comms",
        ports: [
          {
            id: "p.comms.din",
            name: "dataIn",
            direction: "in",
            type: "Data",
            side: "WEST",
          },
          {
            id: "p.comms.rf",
            name: "rfOut",
            direction: "out",
            type: "RF",
            side: "EAST",
          },
          {
            id: "p.comms.pin",
            name: "pwrIn",
            direction: "in",
            type: "Power",
            side: "SOUTH",
          },
        ],
      },
      {
        id: "p.payload",
        name: "payload",
        type: "imager",
        ports: [
          {
            id: "p.payload.dout",
            name: "imgOut",
            direction: "out",
            type: "Data",
            side: "WEST",
          },
          {
            id: "p.payload.pin",
            name: "pwrIn",
            direction: "in",
            type: "Power",
            side: "SOUTH",
          },
        ],
      },
    ],
  },
  eps: {
    id: "eps",
    kind: "block",
    name: "PowerSubsystem",
    stereotype: "block",
    values: [
      { id: "eps.cap", name: "batteryCapacity", type: "Wh" },
      { id: "eps.gen", name: "solarArrayPower", type: "W" },
    ],
    ports: [
      {
        id: "eps.pout",
        name: "pwrOut",
        direction: "out",
        type: "Power",
        side: "EAST",
      },
    ],
  },
  adcs: {
    id: "adcs",
    kind: "block",
    name: "ADCS",
    values: [{ id: "adcs.point", name: "pointingError", type: "deg" }],
    operations: ["detumble()", "pointAt(target)"],
    ports: [
      {
        id: "adcs.din",
        name: "cmdIn",
        direction: "in",
        type: "Cmd",
        side: "WEST",
      },
    ],
  },
  obc: {
    id: "obc",
    kind: "block",
    name: "OBC",
    values: [{ id: "obc.cpu", name: "throughput", type: "MIPS" }],
    ports: [
      {
        id: "obc.bus",
        name: "dataBus",
        direction: "inout",
        type: "Data",
        side: "EAST",
      },
    ],
  },
  comms: {
    id: "comms",
    kind: "block",
    name: "CommsSubsystem",
    values: [
      { id: "comms.eirp", name: "eirp", type: "dBW" },
      { id: "comms.rate", name: "downlinkRate", type: "Mbps" },
    ],
    ports: [
      {
        id: "comms.rf",
        name: "rfOut",
        direction: "out",
        type: "RF",
        side: "EAST",
      },
    ],
  },
  imager: {
    id: "imager",
    kind: "block",
    name: "Payload",
    stereotype: "block",
    values: [
      { id: "imager.gsd", name: "groundSampleDist", type: "m" },
      { id: "imager.draw", name: "powerDraw", type: "W" },
    ],
    ports: [
      {
        id: "imager.dout",
        name: "imgOut",
        direction: "out",
        type: "Data",
        side: "WEST",
      },
    ],
  },
  powerBudget: {
    id: "powerBudget",
    kind: "constraint",
    name: "PowerBudget",
    constraint: "margin = generated - consumed",
    parameters: [
      { id: "powerBudget.generated", name: "generated", type: "W" },
      { id: "powerBudget.consumed", name: "consumed", type: "W" },
      { id: "powerBudget.margin", name: "margin", type: "W" },
    ],
  },
};

const testCases: Record<string, Block> = {
  "tc.imaging": {
    id: "tc.imaging",
    kind: "block",
    name: "ImagingAcceptanceTest",
    stereotype: "testCase",
    operations: ["captureReferenceScene()", "assessGSD()"],
  },
};

const requirements: Record<string, Requirement> = {
  mission: {
    id: "mission",
    reqId: "R1",
    name: "Mission",
    text: "The satellite shall image designated ground targets and downlink imagery.",
    children: [
      {
        id: "req.power",
        reqId: "R1.1",
        name: "Power",
        text: "The EPS shall supply positive power margin across all mission modes.",
      },
      {
        id: "req.point",
        reqId: "R1.2",
        name: "Pointing",
        text: "The ADCS shall hold pointing error below 0.1 deg during imaging.",
      },
      {
        id: "req.downlink",
        reqId: "R1.3",
        name: "Downlink",
        text: "The comms subsystem shall downlink at >= 50 Mbps to a ground station.",
      },
      {
        id: "req.image",
        reqId: "R1.4",
        name: "Imaging",
        text: "The payload shall achieve <= 3 m ground sample distance.",
      },
    ],
  },
};

const relationships: Record<string, Relationship> = {
  // BDD composition: SmallSat is composed of its five subsystems.
  "c.power": {
    id: "c.power",
    kind: "composition",
    source: "smallsat",
    target: "eps",
  },
  "c.adcs": {
    id: "c.adcs",
    kind: "composition",
    source: "smallsat",
    target: "adcs",
  },
  "c.obc": {
    id: "c.obc",
    kind: "composition",
    source: "smallsat",
    target: "obc",
  },
  "c.comms": {
    id: "c.comms",
    kind: "composition",
    source: "smallsat",
    target: "comms",
  },
  "c.payload": {
    id: "c.payload",
    kind: "composition",
    source: "smallsat",
    target: "imager",
  },
  // Requirement satisfy links: subsystem blocks satisfy leaf requirements.
  "s.power": {
    id: "s.power",
    kind: "dependency",
    source: "eps",
    target: "req.power",
    stereotype: "satisfy",
  },
  "s.point": {
    id: "s.point",
    kind: "dependency",
    source: "adcs",
    target: "req.point",
    stereotype: "satisfy",
  },
  "s.downlink": {
    id: "s.downlink",
    kind: "dependency",
    source: "comms",
    target: "req.downlink",
    stereotype: "satisfy",
  },
  "s.image": {
    id: "s.image",
    kind: "dependency",
    source: "imager",
    target: "req.image",
    stereotype: "satisfy",
  },
  // Review 6.5: verification traceability. The imaging acceptance
  // test VERIFIES the imaging requirement; the power-budget
  // constraint block SATISFIES the power requirement analytically
  // (its binding is the satisfaction argument).
  "v.image": {
    id: "v.image",
    kind: "dependency",
    source: "tc.imaging",
    target: "req.image",
    stereotype: "verify",
  },
  "s.budget": {
    id: "s.budget",
    kind: "dependency",
    source: "powerBudget",
    target: "req.power",
    stereotype: "satisfy",
  },
};

const connectors: Record<string, Connector> = {
  // IBD: power distribution + data path + RF downlink.
  "n.pwr.adcs": {
    id: "n.pwr.adcs",
    sourcePart: "p.power",
    sourcePort: "p.power.pout",
    targetPart: "p.adcs",
    targetPort: "p.adcs.pin",
    label: "Power",
  },
  "n.pwr.obc": {
    id: "n.pwr.obc",
    sourcePart: "p.power",
    sourcePort: "p.power.pout",
    targetPart: "p.obc",
    targetPort: "p.obc.pin",
    label: "Power",
  },
  "n.pwr.comms": {
    id: "n.pwr.comms",
    sourcePart: "p.power",
    sourcePort: "p.power.pout",
    targetPart: "p.comms",
    targetPort: "p.comms.pin",
    label: "Power",
  },
  "n.pwr.payload": {
    id: "n.pwr.payload",
    sourcePart: "p.power",
    sourcePort: "p.power.pout",
    targetPart: "p.payload",
    targetPort: "p.payload.pin",
    label: "Power",
  },
  "n.img.obc": {
    id: "n.img.obc",
    sourcePart: "p.payload",
    sourcePort: "p.payload.dout",
    targetPart: "p.obc",
    targetPort: "p.obc.bus",
    label: "Imagery",
  },
  "n.data.comms": {
    id: "n.data.comms",
    sourcePart: "p.obc",
    sourcePort: "p.obc.bus",
    targetPart: "p.comms",
    targetPort: "p.comms.din",
    label: "Frames",
  },
  "n.cmd.adcs": {
    id: "n.cmd.adcs",
    sourcePart: "p.obc",
    sourcePort: "p.obc.bus",
    targetPart: "p.adcs",
    targetPort: "p.adcs.din",
    label: "Cmd",
  },
};

const bindings: Record<string, Binding> = {
  "b.gen": {
    id: "b.gen",
    value: "power.solarArrayPower",
    param: "powerBudget.generated",
  },
  "b.con": {
    id: "b.con",
    value: "payload.powerDraw",
    param: "powerBudget.consumed",
  },
};

// ── Routing-engine activity diagrams ─────────────────────────────────────
// Two flowcharts of the library's OWN edge routers, authored directly as
// StructuralGraphInput (plain nodes carrying UML activity `shape` glyphs;
// guard-labelled control-flow edges). They are the self-documenting demo of
// the "act" diagram type: the toolkit modeling its internals inside the
// workbench it ships. Faithful to the code at pipeline-stage granularity
// (packages/core/src/route/route-scene-edges.ts and
// packages/core/src/layout/g3t-engine/g3t-routing.ts).

const sceneRouterGraph: StructuralGraphInput = {
  nodes: [
    { id: "sr.start", header: { name: "edge" }, shape: "initial" },
    {
      id: "sr.self",
      header: { name: "source === target?" },
      shape: "diamond",
      width: 150,
      height: 80,
    },
    { id: "sr.skip", header: { name: "pass through (skip)" }, shape: "final" },
    {
      id: "sr.sides",
      header: { name: "infer terminal sides" },
      shape: "ellipse",
    },
    {
      id: "sr.obst",
      header: { name: "gather near obstacles" },
      shape: "ellipse",
    },
    {
      id: "sr.inset",
      header: { name: "inset boxes by grazeTolerance" },
      shape: "ellipse",
      width: 190,
    },
    {
      id: "sr.cross",
      header: { name: "straight shot crosses a box?" },
      shape: "diamond",
      width: 190,
      height: 90,
    },
    {
      id: "sr.bezier",
      header: { name: "keep straight (bezier)" },
      shape: "ellipse",
    },
    {
      id: "sr.ortho",
      header: { name: "routeOrthogonal detour" },
      shape: "ellipse",
    },
    { id: "sr.emit", header: { name: "emit polyline" }, shape: "final" },
  ],
  edges: [
    { id: "sr.e1", source: "sr.start", target: "sr.self" },
    { id: "sr.e2", source: "sr.self", target: "sr.skip", label: "yes" },
    { id: "sr.e3", source: "sr.self", target: "sr.sides", label: "no" },
    { id: "sr.e4", source: "sr.sides", target: "sr.obst" },
    { id: "sr.e5", source: "sr.obst", target: "sr.inset" },
    { id: "sr.e6", source: "sr.inset", target: "sr.cross" },
    { id: "sr.e7", source: "sr.cross", target: "sr.bezier", label: "no" },
    { id: "sr.e8", source: "sr.cross", target: "sr.ortho", label: "yes" },
    { id: "sr.e9", source: "sr.bezier", target: "sr.emit" },
    { id: "sr.e10", source: "sr.ortho", target: "sr.emit" },
  ],
};

const structuralRouterGraph: StructuralGraphInput = {
  nodes: [
    { id: "st.start", header: { name: "edge" }, shape: "initial" },
    {
      id: "st.fan",
      header: { name: "fan + anchor assignment" },
      shape: "ellipse",
      width: 180,
    },
    {
      id: "st.anchor",
      header: { name: "anchorOf (port or exposed border)" },
      shape: "ellipse",
      width: 210,
    },
    {
      id: "st.snap",
      header: { name: "snap passes (box/port/mixed)" },
      shape: "ellipse",
      width: 200,
    },
    {
      id: "st.stub",
      header: { name: "side-aware stub exit" },
      shape: "ellipse",
      width: 170,
    },
    {
      id: "st.channel",
      header: { name: "channel router enabled?" },
      shape: "diamond",
      width: 190,
      height: 90,
    },
    {
      id: "st.channelroute",
      header: { name: "route through channel plan" },
      shape: "ellipse",
      width: 200,
    },
    {
      id: "st.simple",
      header: { name: "gap simple route (jog at midline)" },
      shape: "ellipse",
      width: 220,
    },
    {
      id: "st.near",
      header: { name: "build near-obstacle set" },
      shape: "ellipse",
      width: 180,
    },
    {
      id: "st.perim",
      header: { name: "near ≥ longEdgePerimeter?" },
      shape: "diamond",
      width: 200,
      height: 90,
    },
    {
      id: "st.detour",
      header: { name: "VR-9 perimeter detour (VR-10 band)" },
      shape: "ellipse",
      width: 220,
    },
    {
      id: "st.seed",
      header: { name: "seed LAY-005 bend hints" },
      shape: "ellipse",
      width: 180,
    },
    {
      id: "st.accept",
      header: { name: "simple route clear?" },
      shape: "diamond",
      width: 170,
      height: 90,
    },
    {
      id: "st.escalate",
      header: { name: "escalation ladder (3 tries, 80ms)" },
      shape: "ellipse",
      width: 220,
    },
    {
      id: "st.fallback",
      header: { name: "honest fallback + stagger" },
      shape: "ellipse",
      width: 190,
    },
    {
      id: "st.nudge",
      header: { name: "nudge post-pass (track separation)" },
      shape: "ellipse",
      width: 230,
    },
    { id: "st.emit", header: { name: "emit routes" }, shape: "final" },
  ],
  edges: [
    { id: "st.e1", source: "st.start", target: "st.fan" },
    { id: "st.e2", source: "st.fan", target: "st.anchor" },
    { id: "st.e3", source: "st.anchor", target: "st.snap" },
    { id: "st.e4", source: "st.snap", target: "st.stub" },
    { id: "st.e5", source: "st.stub", target: "st.channel" },
    {
      id: "st.e6",
      source: "st.channel",
      target: "st.channelroute",
      label: "yes",
    },
    { id: "st.e7", source: "st.channel", target: "st.simple", label: "no" },
    { id: "st.e8", source: "st.channelroute", target: "st.nudge" },
    { id: "st.e9", source: "st.simple", target: "st.near" },
    { id: "st.e10", source: "st.near", target: "st.perim" },
    { id: "st.e11", source: "st.perim", target: "st.detour", label: "yes" },
    { id: "st.e12", source: "st.perim", target: "st.seed", label: "no" },
    { id: "st.e13", source: "st.detour", target: "st.nudge" },
    { id: "st.e14", source: "st.seed", target: "st.accept" },
    { id: "st.e15", source: "st.accept", target: "st.nudge", label: "clear" },
    {
      id: "st.e16",
      source: "st.accept",
      target: "st.escalate",
      label: "crosses",
    },
    { id: "st.e17", source: "st.escalate", target: "st.nudge", label: "found" },
    {
      id: "st.e18",
      source: "st.escalate",
      target: "st.fallback",
      label: "budget out",
    },
    { id: "st.e19", source: "st.fallback", target: "st.nudge" },
    { id: "st.e20", source: "st.nudge", target: "st.emit" },
  ],
};

const diagrams: Record<string, Diagram> = {
  "dg.bdd": {
    id: "dg.bdd",
    name: "SmallSat Structure",
    type: "bdd",
    context: "smallsat",
    blocks: ["smallsat", "eps", "adcs", "obc", "comms", "imager"],
    relationships: ["c.power", "c.adcs", "c.obc", "c.comms", "c.payload"],
  },
  "dg.ibd": {
    id: "dg.ibd",
    name: "SmallSat Internal",
    type: "ibd",
    context: "smallsat",
    connectors: [
      "n.pwr.adcs",
      "n.pwr.obc",
      "n.pwr.comms",
      "n.pwr.payload",
      "n.img.obc",
      "n.data.comms",
      "n.cmd.adcs",
    ],
  },
  "dg.par": {
    id: "dg.par",
    name: "Power Budget",
    type: "par",
    context: "powerBudget",
    bindings: ["b.gen", "b.con"],
  },
  "dg.req": {
    id: "dg.req",
    name: "Requirements",
    type: "req",
    context: "requirements",
    requirements: ["mission"],
    relationships: [
      "s.power",
      "s.point",
      "s.downlink",
      "s.image",
      "v.image",
      "s.budget",
    ],
  },
  "dg.act.scene": {
    id: "dg.act.scene",
    name: "Scene Router",
    type: "act",
    context: "routingEngine",
    activityGraph: sceneRouterGraph,
  },
  "dg.act.structural": {
    id: "dg.act.structural",
    name: "Structural Router",
    type: "act",
    context: "routingEngine",
    activityGraph: structuralRouterGraph,
  },
};

const root: Package = {
  id: "pkg.root",
  name: "Satellite System",
  packages: [
    {
      id: "pkg.structure",
      name: "Structure",
      blocks: ["smallsat", "eps", "adcs", "obc", "comms", "imager"],
      diagrams: ["dg.bdd", "dg.ibd"],
    },
    {
      id: "pkg.analysis",
      name: "Analysis",
      blocks: ["powerBudget"],
      diagrams: ["dg.par"],
    },
    {
      id: "pkg.requirements",
      name: "Requirements",
      requirements: ["mission"],
      diagrams: ["dg.req"],
    },
    {
      id: "pkg.routing",
      name: "Routing Engine",
      diagrams: ["dg.act.scene", "dg.act.structural"],
    },
  ],
};

export const satelliteModel: SysMLModel = {
  root,
  blocks: { ...blocks, ...testCases },
  requirements,
  relationships,
  connectors,
  bindings,
  diagrams,
};
