"use client";

import { useCallback, useMemo } from "react";
import { DiagramModel, DefaultLinkModel, DefaultNodeModel, type DiagramEngine } from "@projectstorm/react-diagrams";
import type { PortModel } from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
import { DiagramViewport } from "@/components/diagram-viewport";
import { useDiagramEngine } from "@/lib/diagram/use-diagram-engine";
import type { DiagramBlueprint, DiagramLinkBlueprint, DiagramNodeBlueprint } from "@/lib/types/diagram";

interface JourneyDiagramProps {
  blueprint: DiagramBlueprint;
}

function createNode(definition: DiagramNodeBlueprint) {
  const node = new DefaultNodeModel({ name: definition.label, color: definition.color });
  definition.inPorts?.forEach((label) => node.addInPort(label));
  definition.outPorts?.forEach((label) => node.addOutPort(label));
  node.setPosition(definition.position.x, definition.position.y);
  node.setLocked(definition.locked ?? true);
  node.setSelected(false);
  Object.values(node.getPorts()).forEach((port) => port.setLocked(true));
  return node;
}

function resolvePort(node: DefaultNodeModel, preferred: string | undefined, fallback: () => PortModel | undefined): PortModel | null {
  if (preferred) {
    const byName = node.getPort(preferred);
    if (byName) {
      return byName;
    }
  }
  const candidate = fallback();
  return candidate ?? null;
}

function connectLink(
  definition: DiagramLinkBlueprint,
  nodes: Map<string, DefaultNodeModel>,
  defaults: { color: string; width: number; curvyness: number },
) {
  const from = nodes.get(definition.from);
  const to = nodes.get(definition.to);
  if (!from || !to) {
    return null;
  }

  const source = resolvePort(from, definition.fromPort, () => from.getOutPorts()[0]);
  const target = resolvePort(to, definition.toPort, () => to.getInPorts()[0]);

  if (!source || !target) {
    return null;
  }

  const link = (source as DefaultPortModel).link(target as DefaultPortModel) as DefaultLinkModel;
  link.setColor(definition.color ?? defaults.color);
  link.setWidth(definition.width ?? defaults.width);
  link.getOptions().curvyness = definition.curvyness ?? defaults.curvyness;
  if (definition.label) {
    link.addLabel(definition.label);
  }
  link.setLocked(definition.locked ?? true);
  return link;
}

export function JourneyDiagram({ blueprint }: JourneyDiagramProps) {

  const surfaceStyle = useMemo(() => {

    const canvasHeight = blueprint.canvas?.height ?? 720;

    const responsiveHeight = Math.max(canvasHeight + 120, 840);

    return {

      height: `clamp(480px, 100vh, ${responsiveHeight}px)`,

      minHeight: "480px",

    } as const;

  }, [blueprint]);



  const buildModel = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (engine: DiagramEngine) => {

      const model = new DiagramModel();



      const nodeMap = new Map<string, DefaultNodeModel>();

      const nodeModels = blueprint.nodes.map((nodeDef) => {

        const node = createNode(nodeDef);

        nodeMap.set(nodeDef.id, node);

        return node;

      });



      const defaults = {

        color: blueprint.defaultLinkColor ?? "#38bdf8",

        width: blueprint.defaultLinkWidth ?? 2,

        curvyness: blueprint.defaultCurvyness ?? 50,

      };



      const linkModels = blueprint.links

        .map((linkDef) => connectLink(linkDef, nodeMap, defaults))

        .filter((link): link is DefaultLinkModel => Boolean(link));



      model.addAll(...nodeModels, ...linkModels);

      model.setLocked(blueprint.lockDiagram ?? true);



      return model;

    },

    [blueprint],

  );



  const { engine, fitMargin } = useDiagramEngine(buildModel, [blueprint], {

    zoomToFit: true,

    fitMargin: 120,

  });



  return (

    <DiagramViewport

      engine={engine}

      height="none"

      surfaceStyle={surfaceStyle}

      fitMargin={fitMargin}


      emptyMessage="Preparando blueprint de journey..."

    />

  );

}










