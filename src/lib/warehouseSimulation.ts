// Copy your entire Three.js code here and export it
export const warehouseSimulationCode = `
  class WarehouseSimulation {
    constructor() {
      // Scene setup
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);

      // Camera position
      this.camera.position.set(20, 20, 20);
      this.camera.lookAt(0, 0, 0);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(10, 10, 10);
      this.scene.add(directionalLight);

      // Controls setup
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

      // Warehouse properties
      this.warehouse = this.createWarehouse();
      this.zones = this.createZones();
      this.truck = this.createTruck();
      
      // Create zone labels
      this.zoneLabels = [];
      this.createZoneLabels();
      
      // Product types and their properties
      this.products = {
        'wheel': { color: 0x444444, size: 1 },
        'door': { color: 0x666666, size: 2 },
        'headlight': { color: 0xcccccc, size: 0.5 }
      };

      // Storage management
      this.inventory = new Map();
      this.currentProductType = 'wheel';
      this.selectedZone = 0;
      
      // GUI setup
      this.setupGUI();
      
      // Start animation loop
      this.animate();
    }

    createWarehouse() {
      const warehouse = new THREE.Group();
      
      // Floor
      const floorGeometry = new THREE.PlaneGeometry(40, 30);
      const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      warehouse.add(floor);

      // Walls
      const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      const wallGeometry = new THREE.BoxGeometry(40, 10, 0.2);
      
      const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
      backWall.position.set(0, 5, -15);
      warehouse.add(backWall);

      const sideWall1 = new THREE.Mesh(wallGeometry, wallMaterial);
      sideWall1.rotation.y = Math.PI / 2;
      sideWall1.position.set(-20, 5, 0);
      warehouse.add(sideWall1);

      const sideWall2 = new THREE.Mesh(wallGeometry, wallMaterial);
      sideWall2.rotation.y = Math.PI / 2;
      sideWall2.position.set(20, 5, 0);
      warehouse.add(sideWall2);

      this.scene.add(warehouse);
      return warehouse;
    }

    createZones() {
      const zonesGroup = new THREE.Group();
      
      for (let i = 0; i < 5; i++) {
        const zoneUnit = this.createZoneUnit();
        zoneUnit.position.set(-16 + i * 8, 0, -12);
        zonesGroup.add(zoneUnit);
      }

      this.scene.add(zonesGroup);
      return zonesGroup;
    }

    createZoneUnit() {
      const zoneUnit = new THREE.Group();
      const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

      // Create vertical supports
      const supportGeometry = new THREE.BoxGeometry(0.2, 8, 0.2);
      for (let i = 0; i < 4; i++) {
        const support = new THREE.Mesh(supportGeometry, shelfMaterial);
        support.position.set(i < 2 ? -1 : 1, 4, i % 2 ? -1 : 1);
        zoneUnit.add(support);
      }

      // Create horizontal shelves
      const shelfGeometry = new THREE.BoxGeometry(2.2, 0.2, 2.2);
      for (let i = 0; i < 4; i++) {
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(0, i * 2.5, 0);
        zoneUnit.add(shelf);
      }

      return zoneUnit;
    }

    createZoneLabels() {
      this.zoneLabels.forEach(label => {
        if (label.parentElement) {
          label.parentElement.removeChild(label);
        }
      });
      this.zoneLabels = [];

      for (let i = 0; i < 5; i++) {
        const label = document.createElement('div');
        label.className = 'zone-label';
        label.textContent = \`Zone \${i + 1}\`;
        document.body.appendChild(label);
        this.zoneLabels.push(label);
      }
    }

    updateZoneLabels() {
      this.zones.children.forEach((zone, index) => {
        const position = new THREE.Vector3();
        position.setFromMatrixPosition(zone.matrixWorld);
        position.y += 8;

        const screenPosition = position.project(this.camera);
        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight;

        if (this.zoneLabels[index]) {
          this.zoneLabels[index].style.transform = \`translate(-50%, -50%) translate(\${x}px, \${y}px)\`;
        }
      });
    }

    createTruck() {
      const truck = new THREE.Group();

      // Truck body
      const bodyGeometry = new THREE.BoxGeometry(4, 3, 6);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2244cc });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 2;
      truck.add(body);

      // Cab
      const cabGeometry = new THREE.BoxGeometry(4, 2, 2);
      const cab = new THREE.Mesh(cabGeometry, bodyMaterial);
      cab.position.set(0, 2.5, -4);
      truck.add(cab);

      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
      const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
      
      const wheelPositions = [
        [-1.5, 0.5, -3],
        [1.5, 0.5, -3],
        [-1.5, 0.5, 2],
        [1.5, 0.5, 2]
      ];

      wheelPositions.forEach(position => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...position);
        truck.add(wheel);
      });

      truck.position.set(10, 0, 8);
      this.scene.add(truck);
      return truck;
    }

    createProduct(type) {
      const productInfo = this.products[type];
      let geometry;
      
      switch(type) {
        case 'wheel':
          geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
          break;
        case 'door':
          geometry = new THREE.BoxGeometry(1.5, 2, 0.1);
          break;
        case 'headlight':
          geometry = new THREE.SphereGeometry(0.3, 16, 16);
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      const material = new THREE.MeshStandardMaterial({ color: productInfo.color });
      return new THREE.Mesh(geometry, material);
    }

    setupGUI() {
      const gui = new dat.GUI();
      
      const params = {
        productType: 'wheel',
        zone: 0,
        addProduct: () => this.addProductToZone(),
        loadInTruck: () => this.removeProductFromZone(),
        startTruck: () => this.startTruck()
      };

      gui.add(params, 'productType', Object.keys(this.products))
        .onChange(value => this.currentProductType = value);
      
      const zoneOptions = {};
      for (let i = 1; i <= 5; i++) {
        zoneOptions[\`Zone \${i}\`] = i - 1;
      }
      gui.add(params, 'zone', zoneOptions)
        .onChange(value => this.selectedZone = value);
      
      gui.add(params, 'addProduct');
      gui.add(params, 'loadInTruck');
      gui.add(params, 'startTruck');
    }

    addProductToZone() {
      const product = this.createProduct(this.currentProductType);
      product.position.set(0, 10, 0);
      this.scene.add(product);

      const zonePosition = this.zones.children[this.selectedZone].position.clone();
      zonePosition.y += 2;

      new TWEEN.Tween(product.position)
        .to({ x: zonePosition.x, y: zonePosition.y, z: zonePosition.z }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      if (!this.inventory.has(this.selectedZone)) {
        this.inventory.set(this.selectedZone, []);
      }
      this.inventory.get(this.selectedZone).push(product);
    }

    removeProductFromZone() {
      const zoneProducts = this.inventory.get(this.selectedZone);
      if (zoneProducts && zoneProducts.length > 0) {
        const product = zoneProducts.pop();
        new TWEEN.Tween(product.position)
          .to({ x: 10, y: 2, z: 8 }, 1000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onComplete(() => this.scene.remove(product))
          .start();
      }
    }

    startTruck() {
      new TWEEN.Tween(this.truck.position)
        .to({ x: 20, y: 0, z: 8 }, 2000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
          this.truck.position.set(10, 0, 8);
        })
        .start();
    }

    animate() {
      requestAnimationFrame(() => this.animate());
      TWEEN.update();
      this.controls.update();
      this.updateZoneLabels();
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Initialize the simulation when the page loads
  let simulation;
  window.addEventListener('DOMContentLoaded', () => {
    simulation = new WarehouseSimulation();
  });

  // Handle window resizing
  window.addEventListener('resize', () => {
    if (simulation) {
      simulation.camera.aspect = window.innerWidth / window.innerHeight;
      simulation.camera.updateProjectionMatrix();
      simulation.renderer.setSize(window.innerWidth, window.innerHeight);
      simulation.createZoneLabels();
    }
  });
`; 