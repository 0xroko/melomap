import { colors } from "@/lib/const";
import { map } from "@/lib/map";
import { useAppState } from "@/lib/store";

import { CSS2DRenderer } from "@/lib/three/CSS2dRenderer";
import { ExtendedGraphData, Link, Node } from "@/lib/types";
import { useEffect, useRef } from "react";
import ForceGraph3D, { ForceGraphMethods } from "react-force-graph-3d";
import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

const DEFAULT_LINK_OPACITY = 0.05;
const ACTIVE_LINK_OPACITY = 0.2;
const INACTIVE_LINK_OPACITY = 0.02;

const DEFAULT_NODE_OPACITY = "1.0";
const ACTIVE_NODE_OPACITY = "1.0";
const INACTIVE_NODE_OPACITY = "0.4";

const isMobile = window.innerWidth < 768;
let ZOOM_MIN = 0.0025 * (isMobile ? 1.5 : 1.0);
const ZOOM_MAX = 0.014;

// extend
interface NodeThreeObject extends CSS2DObject {
  __graphObjType: "node";
  __data: Node;
}

interface LinkThreeObject extends THREE.Object3D {
  __graphObjType: "link";
  material: THREE.MeshBasicMaterial;
  __data: {
    source: Node;
    target: Node;
    type: Link["type"];
  };
}

const baseMaterialProps = {
  transparent: true,
  depthWrite: false,
  fog: false,
  depthTest: false,
} as THREE.MeshBasicMaterialParameters;

const materials = {
  highlighted: {
    related: new THREE.MeshBasicMaterial({
      color: colors.link.related,
      opacity: ACTIVE_LINK_OPACITY,
      ...baseMaterialProps,
    }),
    colab: new THREE.MeshBasicMaterial({
      color: colors.link.colab,
      opacity: ACTIVE_LINK_OPACITY,
      ...baseMaterialProps,
    }),
    both: new THREE.MeshBasicMaterial({
      color: colors.link.both,
      opacity: ACTIVE_LINK_OPACITY,
      ...baseMaterialProps,
    }),
  },
  nonHighlighted: {
    related: new THREE.MeshBasicMaterial({
      color: colors.link.related,
      opacity: INACTIVE_LINK_OPACITY,
      ...baseMaterialProps,
    }),
    colab: new THREE.MeshBasicMaterial({
      color: colors.link.colab,
      opacity: INACTIVE_LINK_OPACITY,
      ...baseMaterialProps,
    }),
    both: new THREE.MeshBasicMaterial({
      color: colors.link.both,
      opacity: INACTIVE_LINK_OPACITY,
      ...baseMaterialProps,
    }),
  },
  regular: {
    related: new THREE.MeshBasicMaterial({
      color: colors.link.related,
      opacity: DEFAULT_LINK_OPACITY,
      ...baseMaterialProps,
    }),
    colab: new THREE.MeshBasicMaterial({
      color: colors.link.colab,
      opacity: DEFAULT_LINK_OPACITY,
      ...baseMaterialProps,
    }),
    both: new THREE.MeshBasicMaterial({
      color: colors.link.both,
      opacity: DEFAULT_LINK_OPACITY,
      ...baseMaterialProps,
    }),
  },
};

const nodeOpacity = (zoom: number) => {
  return map(zoom, ZOOM_MIN, ZOOM_MAX, 0.3, 1, true);
};

const nodeVisibility = (zoom: number) => {
  return 1 / map(zoom, ZOOM_MIN, ZOOM_MAX / 1.5, 0.6, 1, true);
};

interface ForceGraph2dProps {
  graphData: ExtendedGraphData;
}
export const ForceGraph2d = ({ graphData }: ForceGraph2dProps) => {
  const initDone = useRef(false);

  const setArtist = useAppState((state) => state.setSelectedArtist);

  const selectedLabelRef = useRef<HTMLElement | null>();
  const selectedLabelId = useRef<string | null>(null);

  const pointerDownEvent = useRef<PointerEvent>();
  const lastZoom = useRef(ZOOM_MIN);

  const graphRef = useRef<ForceGraphMethods<any, any> | undefined>();
  const labelRendererRef = useRef<CSS2DRenderer>(new CSS2DRenderer());

  // force-graph package was patched to give us control over the rendering
  const threejsRender = () => {
    const scene = graphRef?.current?.scene();
    const camera = graphRef?.current?.camera();
    if (!scene || !camera) return;
    graphRef?.current?.renderer().render(scene, camera);
    labelRendererRef.current.render(scene, camera);
  };

  const getSceneObjects = (type: "node" | "link") => {
    return graphRef?.current
      ?.scene()
      .getObjectsByProperty("__graphObjType", type) as any;
  };

  useEffect(() => {
    threejsRender();
  }, [graphData]);

  useEffect(() => {
    const threejsinit = async () => {
      if (initDone.current) return;
      initDone.current = true;

      const sceneContainer = document.getElementsByClassName(
        "scene-container",
      )?.[0] as HTMLElement;

      sceneContainer.addEventListener("pointerdown", (e) => {
        pointerDownEvent.current = e;
      });

      sceneContainer.addEventListener("pointerup", (e) => {
        if (!pointerDownEvent.current) return;
        if (e.timeStamp - pointerDownEvent.current!.timeStamp < 200) {
          const targetElement = pointerDownEvent.current!.target as HTMLElement;

          // if id is empty string, it means the user clicked on the background
          const id = targetElement.id === "" ? null : targetElement.id;

          setArtist(id);

          selectedLabelRef.current?.classList.remove("graph-text-selcted");
          selectedLabelRef.current = targetElement;
          if (id) selectedLabelRef.current?.classList.add("graph-text-selcted");
          selectedLabelId.current = id;
          updateOpacity();
          threejsRender();
        }
      });

      if (graphRef.current) {
        graphRef.current.renderer().debug.checkShaderErrors = false;
        graphRef.current?.d3Force("charge")?.strength(-2).distanceMax(80);
        graphRef.current?.d3Force("center")?.strength(0);

        // disable rotation controls
        (graphRef.current?.controls() as any).enableRotate = false;

        const controls = graphRef?.current?.controls() as any;

        controls.maxZoom = ZOOM_MAX;
        controls.minZoom = ZOOM_MIN;
        controls.zoomToCursor = true;
        controls.zoomSpeed = 2.1;

        controls.mouseButtons = {
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        };

        controls.touches = {
          ONE: THREE.TOUCH.PAN,
          TWO: THREE.TOUCH.DOLLY_PAN,
        };

        const updateOpacityOnZoom = () => {
          const zoom = (graphRef.current?.camera() as THREE.OrthographicCamera)
            .zoom;
          if (zoom !== lastZoom.current) {
            lastZoom.current = zoom;
            updateOpacity(true);
          }
        };

        controls.addEventListener("change", () => {
          updateOpacityOnZoom();
          threejsRender();
        });

        const camera = graphRef.current?.camera() as THREE.OrthographicCamera;
        if (!camera) return;
        camera.zoom = controls.minZoom;

        // console.log(camera);
      }
    };

    threejsinit();

    return () => {
      document.removeEventListener("pointerdown", () => {});
      document.removeEventListener("pointerup", () => {});
    };
  }, []);

  const updateOpacity = (nodeOnly = false) => {
    if (!nodeOnly)
      getSceneObjects("link")?.forEach((link: LinkThreeObject) => {
        const sourceId = link.__data.source.id;
        const targetId = link.__data.target.id;
        const type = link.__data.type;

        if (selectedLabelRef.current?.id === null) {
          link.material = materials.regular[type];
          return;
        }

        if (
          sourceId === selectedLabelId.current ||
          targetId === selectedLabelId.current
        ) {
          link.material = materials.highlighted[type];
        } else {
          link.material = materials.nonHighlighted[type];
        }
      });

    const op = nodeOpacity(lastZoom.current);
    const zoom = nodeVisibility(lastZoom.current);

    getSceneObjects("node")?.forEach((nodeGroup: NodeThreeObject) => {
      const node = nodeGroup;
      const id = nodeGroup.__data.id;

      if (node.__data.size < zoom) {
        node.visible = false;
      } else {
        node.visible = true;
      }

      if (selectedLabelId.current === null) {
        node.element.style.opacity = op.toString();
        return;
      }

      if (
        id === selectedLabelId.current ||
        graphData.nodeRelationsMap.get(id)?.includes(selectedLabelId.current)
      ) {
        node.element.style.opacity = ACTIVE_NODE_OPACITY;
      } else {
        node.element.style.opacity = INACTIVE_NODE_OPACITY;
      }
    });
  };

  const threePerfOptimize = () => {
    if (!graphRef.current) return;
    graphRef.current.scene().matrixWorldNeedsUpdate = false;
    graphRef.current.scene().matrixAutoUpdate = false;
    graphRef.current.scene().matrixWorldAutoUpdate = false;
    graphRef.current.renderer().setPixelRatio(1);
    graphRef.current
      .scene()
      .getObjectsByProperty("__graphObjType", "node")
      .forEach((node) => {
        node.matrixWorldNeedsUpdate = false;
        node.matrixAutoUpdate = false;

        node.updateMatrix();
        node.updateMatrixWorld();
      });

    graphRef.current
      .scene()
      .getObjectsByProperty("__graphObjType", "link")
      .forEach((link) => {
        link.matrixWorldNeedsUpdate = false;
        link.matrixAutoUpdate = false;

        link.updateMatrix();
        link.updateMatrixWorld();
      });

    if (graphRef.current) {
      graphRef.current
        .scene()
        .remove(
          graphRef.current
            .scene()
            .getObjectsByProperty("type", "AmbientLight")[0],
        );

      graphRef.current
        .scene()
        .remove(
          graphRef.current
            .scene()
            .getObjectsByProperty("type", "DirectionalLight")[0],
        );
    }

    updateOpacity();
    threejsRender();
    graphRef.current.pauseAnimation();
  };

  return (
    <ForceGraph3D<Node, Link>
      showNavInfo={false}
      nodeRelSize={1}
      nodeThreeObject={(node) => {
        const type = node.type;
        const BASE_FONT_SIZE = 21;

        const text = new CSS2DObject(document.createElement("div"));
        text.element.className = "graph-text";
        text.element.style.opacity = nodeOpacity(lastZoom.current).toString();
        text.element.style.fontSize = `${(node.size / 2) * BASE_FONT_SIZE}px`;

        text.element.innerHTML = node.label;
        text.element.id = node.id;
        text.element.style.color = colors.node[type];

        const zoom = nodeVisibility(lastZoom.current);

        if (node.size < zoom) {
          text.visible = false;
        } else {
          text.visible = true;
        }

        return text;
      }}
      rendererConfig={{
        antialias: true,
        depth: false,

        precision: "lowp",
      }}
      controlType="orbit"
      linkThreeObject={(l) => {
        const obj = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1, 1, 1),
          materials.regular[l.type],
        );
        return obj;
      }}
      backgroundColor="#090909"
      linkResolution={2}
      nodeResolution={0}
      linkWidth={0.4}
      numDimensions={2}
      ref={graphRef}
      extraRenderers={[labelRendererRef.current as any]}
      // @ts-ignore
      nodeLabel={(node) => {
        return undefined;
      }}
      cooldownTime={3000}
      warmupTicks={0}
      enableNodeDrag={false}
      enablePointerInteraction={false}
      graphData={graphData}
      onEngineStop={() => {
        threePerfOptimize();
      }}
      onEngineTick={() => {
        threejsRender();
      }}
    />
  );
};
