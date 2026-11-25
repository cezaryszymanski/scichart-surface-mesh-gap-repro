import {
    EAutoRange,
    EDrawMeshAs,
    GradientColorPalette,
    MouseWheelZoomModifier3D,
    NumberRange,
    NumericAxis3D,
    OrbitModifier3D,
    SciChart3DSurface,
    SurfaceMeshRenderableSeries3D,
    UniformGridDataSeries3D,
    Vector3,
} from "scichart";

// Two surfaces placed next to each other: x 1000..2000 and x 2000..3000.
// With xAxis.visibleRange.min = 0 they touch. With visibleRange.min = 500 each one
// is drawn 500 units too short, so a gap appears between them.
const X_MIN = Number(new URLSearchParams(location.search).get("xMin") ?? 500);
const X_STEP = 10;
const X_SIZE = 101;
const Z_SIZE = 10;

const makeYValues = (seed: number) =>
    Array.from({ length: Z_SIZE }, (_, z) =>
        Array.from({ length: X_SIZE }, (_, x) => 50 + 20 * Math.sin(x * 0.2 + z * 0.5 + seed)),
    );

export const drawExample = async (rootElement: string, status: HTMLElement) => {
    const { sciChart3DSurface, wasmContext } = await SciChart3DSurface.create(rootElement, {
        cameraOptions: { position: new Vector3(0, 400, -600), target: new Vector3(0, 0, 0) },
    });

    sciChart3DSurface.xAxis = new NumericAxis3D(wasmContext, {
        axisTitle: "X",
        autoRange: EAutoRange.Never,
        visibleRange: new NumberRange(X_MIN, 3000),
    });
    sciChart3DSurface.yAxis = new NumericAxis3D(wasmContext, {
        axisTitle: "Y",
        autoRange: EAutoRange.Never,
        visibleRange: new NumberRange(0, 100),
    });
    sciChart3DSurface.zAxis = new NumericAxis3D(wasmContext, {
        axisTitle: "Z",
        autoRange: EAutoRange.Never,
        visibleRange: new NumberRange(0, Z_SIZE - 1),
    });

    [
        { xStart: 1000, color: "#ff0000" },
        { xStart: 2000, color: "#00ff00" },
    ].forEach(({ xStart, color }, i) => {
        const dataSeries = new UniformGridDataSeries3D(wasmContext, {
            xStart,
            xStep: X_STEP,
            zStart: 0,
            zStep: 1,
            yValues: makeYValues(i),
        });
        sciChart3DSurface.renderableSeries.add(
            new SurfaceMeshRenderableSeries3D(wasmContext, {
                dataSeries,
                minimum: 0,
                maximum: 100,
                drawMeshAs: EDrawMeshAs.SOLID_MESH,
                meshColorPalette: new GradientColorPalette(wasmContext, {
                    gradientStops: [
                        { offset: 0, color },
                        { offset: 1, color },
                    ],
                }),
            }),
        );
        console.log(`surface ${i} xRange`, dataSeries.xRange.toString());
    });

    sciChart3DSurface.chartModifiers.add(new OrbitModifier3D(), new MouseWheelZoomModifier3D());

    status.textContent =
        `xAxis.visibleRange = [${X_MIN}, 3000]. ` +
        `Red should span x 1000..2000, green x 2000..3000.`;

    return { sciChart3DSurface };
};
