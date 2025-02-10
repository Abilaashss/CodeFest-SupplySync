import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import TWEEN from '@tweenjs/tween.js'

interface ProductInfo {
  color: number;
  size: number;
}

interface ZoneStats {
  count: number;
  status: string;
}

export class WarehouseSimulation {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls: OrbitControls
  private warehouse: THREE.Group
  private zones: THREE.Group
  private zoneLabels: HTMLDivElement[]
  private gui: GUI
  private inventory: Map<number, THREE.Mesh[]>
  private currentProductType: string
  private selectedZone: number
  private products: Record<string, ProductInfo>
  private maxZoneCapacity: number = 10;
  private targetZone: number = 0;
  private truck: THREE.Group

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.inventory = new Map()
    this.zoneLabels = []
    this.currentProductType = 'wheel'
    this.selectedZone = 0

    // Product types and their properties
    this.products = {
      'wheel': { color: 0x444444, size: 1 },
      'door': { color: 0x666666, size: 2 },
      'headlight': { color: 0xcccccc, size: 0.5 }
    }

    // Setup controls
    this.controls = new OrbitControls(camera, renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(10, 10, 10)
    scene.add(directionalLight)

    // Create warehouse elements
    this.warehouse = this.createWarehouse()
    this.zones = this.createZones()
    this.truck = this.createTruck()
    this.createZoneLabels()

    // Setup GUI
    this.gui = new GUI()
    this.setupGUI()

    // Create stats container
    this.createStatsContainer();
    
    // Update initial stats
    this.updateStats();
  }

  private createWarehouse(): THREE.Group {
    const warehouse = new THREE.Group()
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(40, 30)
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    warehouse.add(floor)

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc })
    const wallGeometry = new THREE.BoxGeometry(40, 10, 0.2)
    
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial)
    backWall.position.set(0, 5, -15)
    warehouse.add(backWall)

    const sideWall1 = new THREE.Mesh(wallGeometry, wallMaterial)
    sideWall1.rotation.y = Math.PI / 2
    sideWall1.position.set(-20, 5, 0)
    warehouse.add(sideWall1)

    const sideWall2 = new THREE.Mesh(wallGeometry, wallMaterial)
    sideWall2.rotation.y = Math.PI / 2
    sideWall2.position.set(20, 5, 0)
    warehouse.add(sideWall2)

    this.scene.add(warehouse)
    return warehouse
  }

  private createZones(): THREE.Group {
    const zonesGroup = new THREE.Group()
    
    // Create 5 zone units
    for (let i = 0; i < 5; i++) {
      const zoneUnit = this.createZoneUnit()
      zoneUnit.position.set(-16 + i * 8, 0, -12)
      zonesGroup.add(zoneUnit)
    }

    this.scene.add(zonesGroup)
    return zonesGroup
  }

  private createZoneUnit(): THREE.Group {
    const zoneUnit = new THREE.Group()
    const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })

    // Create vertical supports
    const supportGeometry = new THREE.BoxGeometry(0.2, 8, 0.2)
    for (let i = 0; i < 4; i++) {
      const support = new THREE.Mesh(supportGeometry, shelfMaterial)
      support.position.set(i < 2 ? -1 : 1, 4, i % 2 ? -1 : 1)
      zoneUnit.add(support)
    }

    // Create horizontal shelves
    const shelfGeometry = new THREE.BoxGeometry(2.2, 0.2, 2.2)
    for (let i = 0; i < 4; i++) {
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial)
      shelf.position.set(0, i * 2.5, 0)
      zoneUnit.add(shelf)
    }

    return zoneUnit
  }

  createZoneLabels() {
    this.zoneLabels.forEach(label => {
      if (label.parentElement) {
        label.parentElement.removeChild(label)
      }
    })
    this.zoneLabels = []

    for (let i = 0; i < 5; i++) {
      const label = document.createElement('div')
      label.className = 'zone-label'
      label.textContent = `Zone ${i + 1}`
      document.body.appendChild(label)
      this.zoneLabels.push(label)
    }
  }

  updateZoneLabels() {
    this.zones.children.forEach((zone, index) => {
      const position = new THREE.Vector3()
      position.setFromMatrixPosition(zone.matrixWorld)
      position.y += 8

      const screenPosition = position.project(this.camera)

      const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth
      const y = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight

      if (this.zoneLabels[index]) {
        this.zoneLabels[index].style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
      }
    })
  }

  private createStatsContainer() {
    const statsContainer = document.createElement('div')
    statsContainer.id = 'stats'
    statsContainer.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      color: white;
      font-family: Arial, sans-serif;
      background: rgba(0,0,0,0.7);
      padding: 10px;
      border-radius: 5px;
      width: 200px;
      z-index: 1000;
    `
    
    const title = document.createElement('h3')
    title.textContent = 'Zone Stats'
    statsContainer.appendChild(title)

    const statsContent = document.createElement('div')
    statsContent.id = 'zone-stats'
    statsContainer.appendChild(statsContent)

    document.body.appendChild(statsContainer)
  }

  setupGUI() {
    const params = {
      productType: 'wheel',
      zone: 0,
      targetZone: 0,
      addProduct: () => this.addProductToZone(),
      moveProduct: () => this.moveProductToZone(),
      loadInTruck: () => this.removeProductFromZone(),
      startTruck: () => this.startTruck()
    }

    // Position GUI on the left side
    this.gui.domElement.style.position = 'absolute'
    this.gui.domElement.style.left = '10px'
    this.gui.domElement.style.top = '50px'

    this.gui.add(params, 'productType', Object.keys(this.products))
      .onChange(value => this.currentProductType = value)
    
    const zoneOptions: Record<string, number> = {}
    for (let i = 1; i <= 5; i++) {
      zoneOptions[`Zone ${i}`] = i - 1
    }
    this.gui.add(params, 'zone', zoneOptions)
      .onChange(value => this.selectedZone = value)
    this.gui.add(params, 'targetZone', zoneOptions)
      .name('Move to Zone')
      .onChange(value => this.targetZone = value)
    
    this.gui.add(params, 'addProduct').name('Add Product')
    this.gui.add(params, 'moveProduct').name('Move Product')
    this.gui.add(params, 'loadInTruck').name('Load in Truck')
    this.gui.add(params, 'startTruck').name('Start Truck')
  }

  moveProductToZone() {
    const sourceZoneProducts = this.inventory.get(this.selectedZone) || []
    const targetZoneProducts = this.inventory.get(this.targetZone) || []

    if (sourceZoneProducts.length === 0) {
      this.updateStats()
      return
    }

    if (targetZoneProducts.length >= this.maxZoneCapacity) {
      this.updateStats()
      return
    }

    const product = sourceZoneProducts.pop()
    if (!product) return

    const targetZonePosition = this.zones.children[this.targetZone].position.clone()
    targetZonePosition.y += 2

    new TWEEN.Tween(product.position)
      .to({ x: targetZonePosition.x, y: targetZonePosition.y, z: targetZonePosition.z }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()

    this.inventory.set(this.selectedZone, sourceZoneProducts)
    this.inventory.set(this.targetZone, [...targetZoneProducts, product])
    this.updateStats()
  }

  private getZoneStatus(count: number): string {
    if (count === 0) return 'Empty'
    if (count < this.maxZoneCapacity / 3) return 'Low Stock'
    if (count === this.maxZoneCapacity) return 'Full'
    return 'Good Stock'
  }

  private updateStats() {
    const statsElement = document.getElementById('zone-stats')
    if (!statsElement) return

    statsElement.innerHTML = ''
    for (let i = 0; i < 5; i++) {
      const zoneProducts = this.inventory.get(i) || []
      const count = zoneProducts.length
      const status = this.getZoneStatus(count)
      
      const zoneDiv = document.createElement('div')
      zoneDiv.style.margin = '5px 0'
      zoneDiv.innerHTML = `Zone ${i + 1}: ${count} items (${status})`
      statsElement.appendChild(zoneDiv)
    }
  }

  addProductToZone() {
    const zoneProducts = this.inventory.get(this.selectedZone) || []
    if (zoneProducts.length >= this.maxZoneCapacity) {
      console.warn(`Zone ${this.selectedZone + 1} is at full capacity!`)
      this.updateStats()
      return
    }

    const product = this.createProduct(this.currentProductType)
    product.position.set(0, 15, 0) // Start higher above the warehouse
    this.scene.add(product)

    const zonePosition = this.zones.children[this.selectedZone].position.clone()
    // Calculate y position based on current items in zone
    const yOffset = 2 + (zoneProducts.length * 0.5)
    zonePosition.y = yOffset

    // Add drop animation
    new TWEEN.Tween(product.position)
      .to({ 
        x: zonePosition.x, 
        y: zonePosition.y, 
        z: zonePosition.z 
      }, 1500)
      .easing(TWEEN.Easing.Bounce.Out) // Add bounce effect
      .start()

    if (!this.inventory.has(this.selectedZone)) {
      this.inventory.set(this.selectedZone, [])
    }
    this.inventory.get(this.selectedZone)?.push(product)
    this.updateStats()
  }

  private createProduct(type: string): THREE.Mesh {
    const productInfo = this.products[type]
    let geometry: THREE.BufferGeometry

    switch(type) {
      case 'wheel':
        geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32)
        break
      case 'door':
        geometry = new THREE.BoxGeometry(1.5, 2, 0.1)
        break
      case 'headlight':
        geometry = new THREE.SphereGeometry(0.3, 16, 16)
        break
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1)
    }

    const material = new THREE.MeshStandardMaterial({ color: productInfo.color })
    const product = new THREE.Mesh(geometry, material)
    product.castShadow = true
    return product
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    this.controls.update()
    this.updateZoneLabels()
    TWEEN.update()
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.gui.destroy()
    this.zoneLabels.forEach(label => {
      if (label.parentElement) {
        label.parentElement.removeChild(label)
      }
    })
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (object.material instanceof THREE.Material) {
          object.material.dispose()
        }
      }
    })
    this.inventory.clear()
    const statsContainer = document.getElementById('stats')
    if (statsContainer?.parentElement) {
      statsContainer.parentElement.removeChild(statsContainer)
    }
  }

  private createTruck(): THREE.Group {
    const truck = new THREE.Group()

    // Truck body
    const bodyGeometry = new THREE.BoxGeometry(4, 3, 6)
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2244cc })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 2
    truck.add(body)

    // Cab
    const cabGeometry = new THREE.BoxGeometry(4, 2, 2)
    const cab = new THREE.Mesh(cabGeometry, bodyMaterial)
    cab.position.set(0, 2.5, -4)
    truck.add(cab)

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16)
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 })
    
    const wheelPositions = [
      [-1.5, 0.5, -3],
      [1.5, 0.5, -3],
      [-1.5, 0.5, 2],
      [1.5, 0.5, 2]
    ]

    wheelPositions.forEach(position => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(...position)
      truck.add(wheel)
    })

    truck.position.set(10, 0, 8)
    this.scene.add(truck)
    return truck
  }

  removeProductFromZone() {
    const zoneProducts = this.inventory.get(this.selectedZone) || []
    if (zoneProducts.length === 0) {
      console.warn(`No products in Zone ${this.selectedZone + 1}`)
      this.updateStats()
      return
    }

    const product = zoneProducts.pop()
    if (product) {
      // First move up
      new TWEEN.Tween(product.position)
        .to({ 
          x: product.position.x,
          y: product.position.y + 2,
          z: product.position.z 
        }, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
          // Then move to truck
          new TWEEN.Tween(product.position)
            .to({ 
              x: this.truck.position.x, 
              y: 3, // Slightly above truck bed
              z: this.truck.position.z 
            }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => {
              // Drop into truck
              new TWEEN.Tween(product.position)
                .to({ y: 2 }, 300)
                .easing(TWEEN.Easing.Bounce.Out)
                .onComplete(() => {
                  setTimeout(() => {
                    this.scene.remove(product)
                  }, 200)
                })
                .start()
            })
            .start()
        })
        .start()

      this.inventory.set(this.selectedZone, zoneProducts)
      this.updateStats()
    }
  }

  startTruck() {
    // First move forward
    new TWEEN.Tween(this.truck.position)
      .to({ x: this.truck.position.x, y: 0, z: 15 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        // Then turn and drive away
        new TWEEN.Tween(this.truck.position)
          .to({ x: 30, y: 0, z: 15 }, 1500)
          .easing(TWEEN.Easing.Quadratic.In)
          .onComplete(() => {
            // Reset truck position after a delay
            setTimeout(() => {
              this.truck.position.set(10, 0, 8)
            }, 500)
          })
          .start()
      })
      .start()

    // Add truck rotation
    new TWEEN.Tween(this.truck.rotation)
      .to({ y: Math.PI / 2 }, 1500)
      .delay(1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        setTimeout(() => {
          this.truck.rotation.y = 0
        }, 500)
      })
      .start()
  }
}