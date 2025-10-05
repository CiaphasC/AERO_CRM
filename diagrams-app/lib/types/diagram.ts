export interface DiagramNodeBlueprint {
  id: string;
  label: string;
  color: string;
  position: { x: number; y: number };
  inPorts?: string[];
  outPorts?: string[];
  locked?: boolean;
}

export interface DiagramLinkBlueprint {
  id: string;
  from: string;
  to: string;
  label: string;
  color?: string;
  width?: number;
  fromPort?: string;
  toPort?: string;
  locked?: boolean;
  curvyness?: number;
}

export interface DiagramBlueprint {
  id: string;
  nodes: DiagramNodeBlueprint[];
  links: DiagramLinkBlueprint[];
  lockDiagram?: boolean;
  defaultLinkWidth?: number;
  defaultCurvyness?: number;
  defaultLinkColor?: string;
  canvas?: {
    height?: number;
  };
}
