import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const GlbModelScene = ({ url }) => {
  const { scene, animations } = useGLTF(url);
  const { camera } = useThree();
  const controls = useThree((state) => state.controls);
  const mixerRef = useRef(null);

  useEffect(() => {
    if (!scene) return;
    const animClips =
      animations && animations.length > 0 ? animations : scene.animations || [];
    if (!animClips || animClips.length === 0) {
      if (mixerRef.current) {
        try {
          mixerRef.current.stopAllAction();
          mixerRef.current.uncacheRoot(scene);
        } catch {}
        mixerRef.current = null;
      }
      return;
    }

    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.frustumCulled = false;
      }
    });

    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;

    // Filter overlapping tracks so distinct full-body clips don't fight each other
    const targetedProperties = new Set();
    const clipsToPlay = [];

    for (const clip of animClips) {
      if (!clip || !Array.isArray(clip.tracks) || clip.tracks.length === 0)
        continue;
      let hasConflict = false;
      const currentClipProps = new Set();
      for (const track of clip.tracks) {
        const propKey = track.name;
        if (targetedProperties.has(propKey)) {
          hasConflict = true;
          break;
        }
        currentClipProps.add(propKey);
      }

      if (clipsToPlay.length === 0 || !hasConflict) {
        clipsToPlay.push(clip);
        currentClipProps.forEach((p) => targetedProperties.add(p));
      }
    }

    clipsToPlay.forEach((clip) => {
      try {
        const action = mixer.clipAction(clip);
        action.reset();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(1);
        action.play();
      } catch (e) {
        console.warn("[InteractionPanel] Error playing clip:", clip.name, e);
      }
    });

    return () => {
      try {
        mixer.stopAllAction();
        mixer.uncacheRoot(scene);
      } catch {}
      mixerRef.current = null;
    };
  }, [scene, animations]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      const safeDelta = Math.min(delta, 0.1);
      mixerRef.current.update(safeDelta);
    }
  });

  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const sizeVec = new THREE.Vector3();
    box.getSize(sizeVec);
    const radius = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) / 2;
    const fovRad = ((camera.fov || 50) * Math.PI) / 360;
    const dist = (radius / Math.sin(fovRad)) * 1.1; // 1.1 for 70-80% coverage

    // Do NOT use Math.max(dist, 0.1) here, it forces small models to be viewed from far away!
    camera.position.set(0, 0, dist);
    camera.near = dist / 100;
    camera.far = dist * 100;
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }, [scene, camera, controls]);

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, -10, -10]} intensity={0.3} />
      <Center>
        <primitive object={scene} />
      </Center>
    </>
  );
};

export const GlbModel = ({ url }) => {
  return (
    <Canvas
      camera={{ fov: 50, position: [0, 0, 5] }}
      gl={{ powerPreference: 'high-performance', preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        const el = gl.domElement;
        if (el) {
          el.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[GlbModel] WebGL context lost prevented.');
          }, false);
          el.addEventListener('webglcontextrestored', () => {
            console.log('[GlbModel] WebGL context restored.');
            gl.renderLists?.dispose?.();
          }, false);
        }
      }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <React.Suspense fallback={null}>
        <GlbModelScene url={url} />
      </React.Suspense>
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
      />
    </Canvas>
  );
};

export const GlbThumbnail = ({ dataUrl }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!dataUrl) return;
    let active = true;
    let url = null;

    // Convert base64 data URL to Blob URL to prevent memory leaks and parsing issues in useGLTF
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch(() => {
        if (active) setBlobUrl(dataUrl);
      });

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [dataUrl]);

  if (!blobUrl)
    return (
      <div className="w-full h-full flex items-center justify-center text-[0.7vw] text-[#5145F6] font-medium animate-pulse">
        Loading...
      </div>
    );
  return (
    <React.Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center text-[0.7vw] text-[#5145F6] font-medium animate-pulse">
          Rendering...
        </div>
      }
    >
      <GlbModel url={blobUrl} />
    </React.Suspense>
  );
};
