'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import TWEEN from '@tweenjs/tween.js'
import { WarehouseSimulation } from './WarehouseSimulation'

export function WarehouseVisualization() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x333333)
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(20, 20, 20)
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false
    })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)

    // Add info div
    const info = document.createElement('div')
    info.id = 'info'
    info.textContent = 'Warehouse Optimization Simulator'
    containerRef.current.appendChild(info)

    // Initialize the simulation
    const simulation = new WarehouseSimulation(scene, camera, renderer)

    // Animation loop
    function animate() {
      requestAnimationFrame(animate)
      simulation.animate()
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      simulation.createZoneLabels()
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      simulation.dispose()
      renderer.dispose()
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return <div ref={containerRef} className="warehouse-3d" />
} 