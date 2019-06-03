export default function() {
  try {
    const renderingContext = WebGLRenderingContext;
    const canvasWebgl = document.createElement('canvas');
    const canvasWebg2 = document.createElement('canvas');
    const webgl2Context = canvasWebg2.getContext('webgl2');
    const webglContext =
      canvasWebgl.getContext('webgl') ||
      canvasWebgl.getContext('experimental-webgl');
    if (renderingContext === undefined) {
      return false;
    }
    return {
      webgl: !!webglContext,
      webgl2: !!webgl2Context
    };
  } catch (error) {
    return false;
  }
}
