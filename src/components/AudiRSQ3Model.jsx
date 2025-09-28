// src/components/AudiRSQ3Model.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AudiRSQ3Model = ({ faultCodes = [], liveData = {}, onPartClick }) => {
  const { scene, nodes, materials } = useGLTF('/models/audi-rsq3.glb');
  const modelRef = useRef();
  const [hoveredPart, setHoveredPart] = useState(null);

  // Define clickable parts and their corresponding diagnostic areas
  const diagnosticParts = {
    engine: {
      position: [0, 0.5, 1.2],
      faultCodes: ['P0420', 'P0171', 'P0174'],
      color: '#ff4444'
    },
    frontWheels: {
      position: [-0.8, -0.5, 0.8],
      faultCodes: ['C0035', 'C0040'],
      color: '#ff8844'
    },
    rearWheels: {
      position: [-0.8, -0.5, -0.8],
      faultCodes: ['C0055', 'C0060'],
      color: '#ff8844'
    },
    transmission: {
      position: [0, -0.2, 0],
      faultCodes: ['P0700', 'P0750'],
      color: '#ffaa44'
    },
    exhaust: {
      position: [0, -0.5, -1.5],
      faultCodes: ['P0420', 'P0430'],
      color: '#44ff44'
    }
  };

  // Create diagnostic hotspots
  const DiagnosticHotspot = ({ part, partKey }) => {
    const meshRef = useRef();
    const [isActive, setIsActive] = useState(false);
    
    // Check if this part has active fault codes
    const hasActiveFaults = part.faultCodes.some(code => 
      faultCodes.some(fault => fault.code === code)
    );

    useFrame(() => {
      if (meshRef.current && hasActiveFaults) {
        meshRef.current.material.emissive.setHex(0xff0000);
        meshRef.current.material.emissiveIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.3;
      }
    });

    return (
      <mesh
        ref={meshRef}
        position={part.position}
        onClick={(e) => {
          e.stopPropagation();
          onPartClick?.(partKey, part);
        }}
        onPointerEnter={() => {
          setHoveredPart(partKey);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHoveredPart(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={hasActiveFaults ? '#ff0000' : part.color}
          transparent
          opacity={hoveredPart === partKey ? 0.8 : 0.6}
          emissive={hasActiveFaults ? '#ff0000' : '#000000'}
        />
      </mesh>
    );
  };

  // Apply materials based on diagnostic status
  useEffect(() => {
    if (materials && faultCodes.length > 0) {
      Object.values(materials).forEach(material => {
        if (material.isMeshStandardMaterial) {
          // Reset to original state
          material.emissive = new THREE.Color(0x000000);
          material.emissiveIntensity = 0;
        }
      });

      // Highlight parts with faults
      faultCodes.forEach(fault => {
        const partKey = Object.keys(diagnosticParts).find(key =>
          diagnosticParts[key].faultCodes.includes(fault.code)
        );
        
        if (partKey && materials) {
          // This would need to be mapped to actual material names in your model
          // You'll need to inspect your model to get the correct material names
          const materialName = getMaterialNameForPart(partKey);
          if (materials[materialName]) {
            materials[materialName].emissive = new THREE.Color(0xff0000);
            materials[materialName].emissiveIntensity = 0.3;
          }
        }
      });
    }
  }, [faultCodes, materials]);

  // Helper function to map diagnostic parts to actual material names
  // You'll need to customize this based on your actual model structure
  const getMaterialNameForPart = (partKey) => {
    const materialMap = {
      engine: 'Engine_Material',
      frontWheels: 'Wheel_Material',
      rearWheels: 'Wheel_Material',
      transmission: 'Transmission_Material',
      exhaust: 'Exhaust_Material'
    };
    return materialMap[partKey];
  };

  return (
    <group ref={modelRef}>
      {/* Main vehicle model */}
      <primitive object={scene} scale={[1, 1, 1]} />
      
      {/* Diagnostic hotspots */}
      {Object.entries(diagnosticParts).map(([key, part]) => (
        <DiagnosticHotspot key={key} part={part} partKey={key} />
      ))}
      
      {/* Environment and lighting */}
      <Environment preset="studio" />
      <ContactShadows
        opacity={0.4}
        scale={10}
        blur={1}
        far={10}
        resolution={256}
        color="#000000"
      />
      
      {/* Orbit controls for user interaction */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </group>
  );
};

// Preload the model
useGLTF.preload('/models/audi-rsq3.glb');

export default AudiRSQ3Model;
