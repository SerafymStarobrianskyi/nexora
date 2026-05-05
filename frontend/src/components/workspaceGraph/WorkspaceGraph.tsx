import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import fromKapsule from "react-kapsule";
import ForceGraph2DKapsule from "force-graph";
import type { Folder, Note, Workspace } from "../../api/projects";
import { useProjectsStore } from "../../store/projectsStore";

type WorkspaceGraphProps = {
  workspace: Workspace;
  folders: Folder[];
  notes: Note[];
};

type GraphNodeKind = "workspace" | "folder" | "note";

type GraphNode = {
  id: string;
  kind: GraphNodeKind;
  label: string;
  color: string;
  val: number;
};

type GraphLink = {
  source: string;
  target: string;
  kind: "contains" | "references";
};

type ForceGraph2DProps = {
  graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  width: number;
  height: number;
  backgroundColor: string;
  nodeLabel: (node: GraphNode) => string;
  nodeVal: (node: GraphNode) => number;
  nodeColor: (node: GraphNode) => string;
  nodeCanvasObjectMode: () => "replace";
  nodeCanvasObject: (
    node: GraphNode & { x?: number; y?: number },
    canvasContext: CanvasRenderingContext2D,
    globalScale: number,
  ) => void;
  nodePointerAreaPaint: (
    node: GraphNode & { x?: number; y?: number },
    paintColor: string,
    canvasContext: CanvasRenderingContext2D,
  ) => void;
  linkColor: (link: GraphLink) => string;
  linkDirectionalArrowLength: (link: GraphLink) => number;
  linkDirectionalArrowRelPos: number;
  linkLineDash: (link: GraphLink) => number[] | null;
  linkWidth: (link: GraphLink) => number;
  cooldownTicks: number;
  onNodeClick: (node: GraphNode) => void;
  showPointerCursor: (item?: GraphNode | GraphLink) => boolean;
};

const ForceGraph2D = fromKapsule(ForceGraph2DKapsule as never, {
  methodNames: [
    "emitParticle",
    "d3Force",
    "d3ReheatSimulation",
    "stopAnimation",
    "pauseAnimation",
    "resumeAnimation",
    "centerAt",
    "zoom",
    "zoomToFit",
    "getGraphBbox",
    "screen2GraphCoords",
    "graph2ScreenCoords",
  ],
}) as ComponentType<ForceGraph2DProps>;

const normalizeLinkTarget = (value: string) => {
  const decoded = decodeURIComponent(value.trim());
  const withoutHash = decoded.split("#")[0] ?? decoded;
  const lastSegment = withoutHash.split(/[\\/]/).filter(Boolean).pop() ?? "";

  return lastSegment
    .replace(/\.(md|markdown|txt)$/i, "")
    .trim()
    .toLowerCase();
};

const getLinkedNoteIds = (note: Note, notes: Note[]) => {
  const byTitle = new Map(
    notes.map((item) => [item.title.toLowerCase(), item.id]),
  );
  const bySlug = new Map(
    notes.map((item) => [item.slug.toLowerCase(), item.id]),
  );
  const links = new Set<string>();
  const markdownLinks = /\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g;
  const wikiLinks = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;

  for (const match of note.content.matchAll(markdownLinks)) {
    const target = normalizeLinkTarget(match[1] ?? "");
    const noteId = bySlug.get(target) ?? byTitle.get(target);

    if (noteId && noteId !== note.id) {
      links.add(noteId);
    }
  }

  for (const match of note.content.matchAll(wikiLinks)) {
    const target = normalizeLinkTarget(match[1] ?? "");
    const noteId = bySlug.get(target) ?? byTitle.get(target);

    if (noteId && noteId !== note.id) {
      links.add(noteId);
    }
  }

  return [...links];
};

const getNodeRadius = (node: GraphNode) => {
  if (node.kind === "workspace") {
    return 6.5;
  }

  if (node.kind === "folder") {
    return 5.2;
  }

  return 4.2;
};

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height,
  );
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
};

export default function WorkspaceGraph({
  workspace,
  folders,
  notes,
}: WorkspaceGraphProps) {
  const graphRef = useRef<HTMLDivElement>(null);
  const [graphWidth, setGraphWidth] = useState(720);
  const openFolder = useProjectsStore((state) => state.openFolder);
  const openNote = useProjectsStore((state) => state.openNote);

  useEffect(() => {
    const element = graphRef.current;

    if (!element) {
      return;
    }

    const updateWidth = () => {
      setGraphWidth(Math.max(320, element.clientWidth));
    };
    const observer = new ResizeObserver(updateWidth);

    updateWidth();
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [
      {
        id: `workspace:${workspace.id}`,
        kind: "workspace",
        label: workspace.name,
        color: "#22242a",
        val: 7,
      },
      ...folders.map((folder) => ({
        id: `folder:${folder.id}`,
        kind: "folder" as const,
        label: folder.name,
        color: folder.color ?? "#8b85ff",
        val: 4.4,
      })),
      ...notes.map((note) => ({
        id: `note:${note.id}`,
        kind: "note" as const,
        label: note.title,
        color: "#2f7d6d",
        val: 3.2,
      })),
    ];

    const links: GraphLink[] = [
      ...folders.map((folder) => ({
        source: folder.parent_id
          ? `folder:${folder.parent_id}`
          : `workspace:${workspace.id}`,
        target: `folder:${folder.id}`,
        kind: "contains" as const,
      })),
      ...notes.map((note) => ({
        source: note.folder_id
          ? `folder:${note.folder_id}`
          : `workspace:${workspace.id}`,
        target: `note:${note.id}`,
        kind: "contains" as const,
      })),
    ];

    for (const note of notes) {
      for (const targetNoteId of getLinkedNoteIds(note, notes)) {
        links.push({
          source: `note:${note.id}`,
          target: `note:${targetNoteId}`,
          kind: "references",
        });
      }
    }

    return { nodes, links };
  }, [folders, notes, workspace.id, workspace.name]);

  const referenceCount = graphData.links.filter(
    (link) => link.kind === "references",
  ).length;

  return (
    <section className="workspace-graph" aria-label="Workspace file graph">
      <div className="workspace-graph__summary">
        <span>{graphData.nodes.length} nodes</span>
        <span>{graphData.links.length} links</span>
        <span>{referenceCount} file references</span>
      </div>

      <div ref={graphRef} className="workspace-graph__canvas">
        <ForceGraph2D
          graphData={graphData}
          width={graphWidth}
          height={520}
          backgroundColor="#ffffff"
          nodeLabel={(node) => node.label}
          nodeVal={(node) => node.val}
          nodeColor={(node) => node.color}
          nodeCanvasObjectMode={() => "replace"}
          nodeCanvasObject={(node, context, globalScale) => {
            if (node.x === undefined || node.y === undefined) {
              return;
            }

            const radius = getNodeRadius(node);
            const fontSize = node.kind === "workspace" ? 13 : 11;
            const scaledFontSize = fontSize / globalScale;
            const label = node.label;
            const labelX = node.x + radius + 4 / globalScale;
            const labelY = node.y + scaledFontSize * 0.36;
            const paddingX = 5 / globalScale;
            const paddingY = 3 / globalScale;

            context.save();
            context.beginPath();
            context.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            context.fillStyle = node.color;
            context.fill();
            context.lineWidth = 1.5 / globalScale;
            context.strokeStyle = "#ffffff";
            context.stroke();

            context.font = `${node.kind === "workspace" ? "700" : "600"} ${scaledFontSize}px Inter, Arial, sans-serif`;
            const textWidth = context.measureText(label).width;
            const backgroundWidth = textWidth + paddingX * 2;
            const backgroundHeight = scaledFontSize + paddingY * 2;
            const backgroundX = labelX - paddingX;
            const backgroundY = labelY - scaledFontSize * 0.78 - paddingY;

            drawRoundedRect(
              context,
              backgroundX,
              backgroundY,
              backgroundWidth,
              backgroundHeight,
              5 / globalScale,
            );
            context.fillStyle = "rgba(255, 255, 255, 0.88)";
            context.fill();

            context.fillStyle =
              node.kind === "workspace" ? "#15171c" : "#30343d";
            context.textAlign = "left";
            context.textBaseline = "middle";
            context.fillText(label, labelX, labelY);
            context.restore();
          }}
          nodePointerAreaPaint={(node, paintColor, context) => {
            if (node.x === undefined || node.y === undefined) {
              return;
            }

            const radius = getNodeRadius(node) + 4;

            context.fillStyle = paintColor;
            context.beginPath();
            context.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            context.fill();
          }}
          linkColor={(link) =>
            link.kind === "references" ? "#4f46e5" : "#c6ccd8"
          }
          linkDirectionalArrowLength={(link) =>
            link.kind === "references" ? 4 : 0
          }
          linkDirectionalArrowRelPos={1}
          linkLineDash={(link) => (link.kind === "references" ? [4, 4] : null)}
          linkWidth={(link) => (link.kind === "references" ? 1.6 : 1)}
          cooldownTicks={80}
          onNodeClick={(node) => {
            if (node.kind === "note") {
              openNote(node.id.replace("note:", ""));
            }

            if (node.kind === "folder") {
              openFolder(node.id.replace("folder:", ""));
            }
          }}
          showPointerCursor={(item) =>
            Boolean(item && "kind" in item && item.kind !== "workspace")
          }
        />
      </div>
    </section>
  );
}
