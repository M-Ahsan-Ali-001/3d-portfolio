import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, ScrollControls, useScroll } from '@react-three/drei';
import { AnimationMixer,TextureLoader  } from 'three';
import model from '../components/compressed (2).glb';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


import { Sphere, Environment } from '@react-three/drei';



const DRACO_DECODER_URL = '/draco/';

function Model() {
  const group = useRef();
  const mixer = useRef();
  const actions = useRef([]);
  const scroll = useScroll();
  const { camera } = useThree();
  const { scene, animations, cameras } = useGLTF(model);
  // const { scene, animations, cameras } = useGLTF(model, true, (loader) => {
  //   const dracoLoader = new DRACOLoader();
  //   dracoLoader.setDecoderPath(DRACO_DECODER_URL);
  //   loader.setDRACOLoader(dracoLoader); 
  // });
  useEffect(() => {
    if (scene) {
      console.log('Model loaded:', scene);
    }
    if (animations && animations.length) {
      mixer.current = new AnimationMixer(scene);
      actions.current = animations.map((clip, index) => {
        const action = mixer.current.clipAction(clip);
        action.play();
        console.log(`Action ${index}:`, action);
        return action;
      });
    }

    if (cameras && cameras.length) {
      const glbCamera = cameras[0];
     
      camera.position.copy(glbCamera.position);
      camera.rotation.copy(glbCamera.rotation);
      camera.fov = 40
      camera.far = 70
      camera.updateProjectionMatrix();
    }
  }, [animations, scene, cameras, camera]);

  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
      const scrollValue = scroll?.offset || 0; 
      actions.current.forEach(action => {
        action.paused = true;
        action.time = action.getClip().duration * (scrollValue ); 
      });

      if (cameras && cameras.length) {
        const glbCamera = cameras[0];
        camera.position.copy(glbCamera.position);
        camera.rotation.copy(glbCamera.rotation);
        camera.updateProjectionMatrix();
      }
    }
  });

  return (
    <primitive 
      ref={group} 
      object={scene} 
      scale={[1, 1, 1]}
    />
  );
}


function Sky() {



  const loader = require('../components/alpha.hdr') 
  return (
    <Environment background={true} files={loader} />
  );
}



export default function ObjectThree() {
  const style = {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  return (
    <div className="holdCanvas example" style={{ overflowX: "hidden" }}>
      <Canvas className="cnv" style={{ width: '100vw', height: '100vh', backgroundColor: 'red' }}>
        <ScrollControls pages={1} id="scrollit" className="scrollControls" style={style}>
          <ambientLight intensity={1} />
          <directionalLight position={[1, 1, 1]} intensity={9} />
          <Sky/>
          <Model />
      
        </ScrollControls>
      </Canvas>
    </div>
  );
}
