/**
 * The Interactive 3D World (8 Locations)
 * Location 8: The Cultural Archive (The Library & The Cinema)
 * Three.js Spatial Engine
 * Sanchayan Saha Portfolio
 */

export class World3D {
  constructor(options = {}) {
    this.container = options.container || document.querySelector("#world-3d-root");
    this.archiveController = options.archiveController || null;
    this.booksData = options.books || [];
    this.filmsData = options.films || [];

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.animId = null;

    // Interaction & Raycasting
    this.raycaster = null;
    this.mouse = null;
    this.interactiveObjects = [];
    this.hoveredObject = null;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotate = false;
    this.isTransitioning = false;

    // Camera Waypoints for the 8 Locations
    this.activeLocationIndex = 7; // Default to Location 8 (Cultural Archive)
    this.culturalSubMode = "library"; // "library" or "cinema"

    this.locations = [
      {
        id: "loc-1",
        title: "1. The Grand Atrium",
        subtitle: "The Intellectual Nexus",
        description: "Minimalist Swiss foyer of ideas—monumental stone pylons, central light well, and foundational clarity.",
        camPos: { x: 0, y: 12, z: 28 },
        targetPos: { x: 0, y: 4, z: 0 }
      },
      {
        id: "loc-2",
        title: "2. The Observatory",
        subtitle: "Scientific Rigor & Analysis",
        description: "Celestial coordinate sphere and precision measurement plinth—rigor, empirical reasoning, and structural proof.",
        camPos: { x: -35, y: 14, z: 15 },
        targetPos: { x: -35, y: 5, z: 0 }
      },
      {
        id: "loc-3",
        title: "3. The Writer's Studio",
        subtitle: "Editorial Craft & Prose",
        description: "Drafting pedestals, floating sentence scrolls, and warm study light—where thoughts are arranged with discipline.",
        camPos: { x: -25, y: 10, z: -25 },
        targetPos: { x: -25, y: 3, z: -35 }
      },
      {
        id: "loc-4",
        title: "4. The Systems Lab",
        subtitle: "Technical & Code Fluency",
        description: "Holographic logic pillars and digital matrix structure—translating systems and algorithmic architectures into clear language.",
        camPos: { x: 0, y: 14, z: -35 },
        targetPos: { x: 0, y: 4, z: -45 }
      },
      {
        id: "loc-5",
        title: "5. The Strategy Chamber",
        subtitle: "Argumentation & Public Reasoning",
        description: "Dialectic podiums and acoustic geometry—holding multiple variables, comparative debate, and persuasive structure.",
        camPos: { x: 25, y: 12, z: -25 },
        targetPos: { x: 25, y: 4, z: -35 }
      },
      {
        id: "loc-6",
        title: "6. The Gallery of Thinkers",
        subtitle: "Foundational Influences",
        description: "Honoring Dostoevsky, Kafka, Camus, and Satyajit Ray—moral gravity, psychological depth, and visual economy.",
        camPos: { x: 35, y: 12, z: 15 },
        targetPos: { x: 35, y: 4, z: 0 }
      },
      {
        id: "loc-7",
        title: "7. The Collaboration Pavilion",
        subtitle: "Dialogue & Future Vision",
        description: "Open panoramic glass terrace overlooking cosmic horizon—available for serious writing collaborations and research briefs.",
        camPos: { x: 0, y: 8, z: 45 },
        targetPos: { x: 0, y: 2, z: 35 }
      },
      {
        id: "loc-8",
        title: "8. The Cultural Archive",
        subtitle: "Literature, Cinema & Human Experience",
        description: "Monumental twin sanctuaries: The Monumental Library and The Atmospheric Screening Room.",
        camPos: { x: 0, y: 8, z: -10 },
        targetPos: { x: 0, y: 4, z: -18 },
        libraryWaypoint: {
          camPos: { x: -8, y: 5.5, z: -14 },
          targetPos: { x: -14, y: 4, z: -20 }
        },
        cinemaWaypoint: {
          camPos: { x: 8, y: 5.5, z: -14 },
          targetPos: { x: 14, y: 4, z: -20 }
        }
      }
    ];

    // Camera target vector
    this.currentTarget = { x: 0, y: 4, z: -18 };
  }

  async init() {
    if (!this.container) return;

    // Ensure Three.js is available
    if (typeof window.THREE === "undefined") {
      await this.loadThreeScript();
    }

    this.setupDOM();
    this.initScene();
    this.buildWorld();
    this.bindEvents();
    this.animate();

    // Transition to default location (Location 8: The Cultural Archive - The Library)
    this.goToLocation(7, "library");
  }

  loadThreeScript() {
    return new Promise((resolve, reject) => {
      // First try local vendor file, then CDN
      const script = document.createElement("script");
      script.src = "./assets/vendor/three.min.js";
      script.onload = () => resolve();
      script.onerror = () => {
        const cdnScript = document.createElement("script");
        cdnScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        cdnScript.onload = () => resolve();
        cdnScript.onerror = () => reject(new Error("Failed to load Three.js"));
        document.head.appendChild(cdnScript);
      };
      document.head.appendChild(script);
    });
  }

  setupDOM() {
    this.container.innerHTML = `
      <div class="world-3d-wrapper">
        <canvas id="world-3d-canvas"></canvas>

        <!-- 3D HUD Topbar -->
        <header class="world-hud-top glass">
          <div class="hud-brand">
            <span class="hud-badge">Interactive 3D World</span>
            <strong id="hud-location-title">8. The Cultural Archive</strong>
          </div>

          <!-- Location 8 Sub-Environment Switcher -->
          <div class="hud-subenv-switcher" id="hud-subenv-switcher">
            <button class="subenv-btn active" id="btn-subenv-library">The Library</button>
            <button class="subenv-btn" id="btn-subenv-cinema">The Cinema</button>
          </div>

          <div class="hud-top-actions">
            <button class="hud-btn" id="btn-reset-cam" title="Reset Camera View">⟲ Reset</button>
            <button class="hud-btn" id="btn-toggle-orbit" title="Toggle Auto-Orbit">⟳ Orbit: Off</button>
            <a href="#cultural-archive" class="hud-btn hud-btn-accent" id="btn-back-2d">View in 2D Archive →</a>
          </div>
        </header>

        <!-- Hover Tooltip -->
        <div class="world-tooltip glass" id="world-tooltip" style="display: none;">
          <strong id="tooltip-title"></strong>
          <span id="tooltip-action">Click to inspect</span>
        </div>

        <!-- Location Navigator Pill Strip -->
        <nav class="world-location-nav glass" aria-label="3D World Locations">
          <div class="location-pills-scroll">
            ${this.locations.map((loc, idx) => `
              <button class="location-nav-pill ${idx === this.activeLocationIndex ? 'active' : ''}" data-loc-idx="${idx}">
                <span class="pill-number">${idx + 1}</span>
                <span class="pill-title">${loc.title.replace(/^\d+\.\s*/, '')}</span>
              </button>
            `).join("")}
          </div>
        </nav>

        <!-- Bottom Description Bar -->
        <footer class="world-hud-footer glass">
          <div class="hud-desc-wrap">
            <span class="eyebrow" id="hud-location-subtitle">Literature, Cinema & Human Experience</span>
            <p id="hud-location-desc">${this.locations[7].description}</p>
          </div>
          <div class="hud-tip">
            <span class="badge subtle-badge">Tip</span>
            <span>Drag to look around. Click floating book covers or film posters to inspect archival details.</span>
          </div>
        </footer>
      </div>
    `;

    this.canvas = document.querySelector("#world-3d-canvas");
  }

  initScene() {
    const THREE = window.THREE;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || (window.innerHeight * 0.85);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040810);
    this.scene.fog = new THREE.FogExp2(0x040810, 0.015);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 10, 25);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
      precision: "mediump"
    });
    this.renderer.setSize(width, height);
    // Optimized pixel ratio to prevent retina fill-rate lagging
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.shadowMap.enabled = false;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xd5e3f8, 0.45);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff6e8, 0.7);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    // Warm Architectural Spotlight
    const spotLight = new THREE.SpotLight(0xcfb27b, 1.2, 80, Math.PI / 4, 0.5, 1);
    spotLight.position.set(0, 30, -10);
    this.scene.add(spotLight);
  }

  buildWorld() {
    const THREE = window.THREE;

    // 1. Monumental Architectural Floor Grid
    const floorGeo = new THREE.PlaneGeometry(160, 160, 40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x08101e,
      roughness: 0.25,
      metalness: 0.65
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Decorative grid rings
    const gridHelper = new THREE.GridHelper(160, 40, 0x1d3557, 0x0e1b2e);
    gridHelper.position.y = 0.02;
    this.scene.add(gridHelper);

    // 2. Central Nexus: Location 1 - The Grand Atrium
    this.buildAtrium();

    // 3. Location 2 - The Observatory
    this.buildObservatory();

    // 4. Location 3 - The Writer's Studio
    this.buildWriterStudio();

    // 5. Location 4 - The Systems Lab
    this.buildSystemsLab();

    // 6. Location 5 - The Strategy Chamber
    this.buildStrategyChamber();

    // 7. Location 6 - The Gallery of Thinkers
    this.buildGalleryOfThinkers();

    // 8. Location 7 - The Collaboration Pavilion
    this.buildCollaborationPavilion();

    // 9. LOCATION 8 — THE CULTURAL ARCHIVE (Monumental Library & Atmospheric Cinema)
    this.buildCulturalArchiveLocation();

    // 10. Ambient Atmospheric Dust / Motes
    this.buildAtmosphericParticles();
  }

  buildAtrium() {
    const THREE = window.THREE;
    const atriumGroup = new THREE.Group();
    atriumGroup.position.set(0, 0, 0);

    // Central marble ring
    const ringGeo = new THREE.CylinderGeometry(6, 6.2, 0.4, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x182436, roughness: 0.3, metalness: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.2;
    atriumGroup.add(ring);

    // Four monumental minimalist pillars
    const pillarGeo = new THREE.BoxGeometry(0.8, 16, 0.8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xd8e3f2, roughness: 0.1, metalness: 0.2 });
    const coords = [[-4, 4], [4, 4], [-4, -4], [4, -4]];
    coords.forEach(([px, pz]) => {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(px, 8, pz);
      atriumGroup.add(p);
    });

    // Central floating beacon prism
    const prismGeo = new THREE.OctahedronGeometry(1.4, 0);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0x9ec8ff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x193a8a,
      emissiveIntensity: 0.6
    });
    const prism = new THREE.Mesh(prismGeo, prismMat);
    prism.position.set(0, 6, 0);
    atriumGroup.add(prism);
    this.atriumPrism = prism;

    this.scene.add(atriumGroup);
  }

  buildObservatory() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    group.position.set(-35, 0, 0);

    // Gyroscope ring
    const torusGeo = new THREE.TorusGeometry(3.5, 0.12, 16, 64);
    const torusMat = new THREE.MeshStandardMaterial({ color: 0xcfb27b, metalness: 0.8, roughness: 0.2 });
    const torus1 = new THREE.Mesh(torusGeo, torusMat);
    torus1.position.y = 5;
    group.add(torus1);

    const torus2 = new THREE.Mesh(torusGeo, torusMat);
    torus2.position.y = 5;
    torus2.rotation.x = Math.PI / 2;
    group.add(torus2);

    const pedGeo = new THREE.CylinderGeometry(2, 2.5, 1.8, 16);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x101a28, roughness: 0.5 });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.y = 0.9;
    group.add(ped);

    this.observatoryTorus = torus1;
    this.scene.add(group);
  }

  buildWriterStudio() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    group.position.set(-25, 0, -35);

    // Minimalist walnut drafting desk
    const deskGeo = new THREE.BoxGeometry(7, 0.3, 4);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.4 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 2.8, 0);
    group.add(desk);

    // Desk legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.8, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    [[-3, -1.6], [3, -1.6], [-3, 1.6], [3, 1.6]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 1.4, lz);
      group.add(leg);
    });

    // Amber lamp
    const lampLight = new THREE.PointLight(0xffb74d, 1.5, 12);
    lampLight.position.set(-2, 4.2, 0);
    group.add(lampLight);

    this.scene.add(group);
  }

  buildSystemsLab() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    group.position.set(0, 0, -45);

    // Vertical holographic data pillars
    for (let i = -3; i <= 3; i += 2) {
      const colGeo = new THREE.BoxGeometry(0.5, 10, 0.5);
      const colMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.4
      });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(i * 2.2, 5, 0);
      group.add(col);
    }

    this.scene.add(group);
  }

  buildStrategyChamber() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    group.position.set(25, 0, -35);

    // Dialectic podiums facing each other
    [-3, 3].forEach(px => {
      const podGeo = new THREE.CylinderGeometry(0.8, 1.2, 3.2, 6);
      const podMat = new THREE.MeshStandardMaterial({ color: 0x1a2638, roughness: 0.3 });
      const pod = new THREE.Mesh(podGeo, podMat);
      pod.position.set(px, 1.6, 0);
      group.add(pod);
    });

    this.scene.add(group);
  }

  buildGalleryOfThinkers() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    group.position.set(35, 0, 0);

    // Pedestals in semicircular arch
    const thinkers = ["Dostoevsky", "Kafka", "Camus", "Ray"];
    thinkers.forEach((name, i) => {
      const angle = (i / (thinkers.length - 1)) * Math.PI - Math.PI / 2;
      const x = Math.cos(angle) * 5;
      const z = Math.sin(angle) * 5;

      const pGeo = new THREE.BoxGeometry(1.2, 3.5, 1.2);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xdde6ed, roughness: 0.2 });
      const ped = new THREE.Mesh(pGeo, pMat);
      ped.position.set(x, 1.75, z);
      group.add(ped);

      // Sphere token representing thinker's mind
      const sGeo = new THREE.SphereGeometry(0.45, 16, 16);
      const sMat = new THREE.MeshStandardMaterial({ color: 0xcfb27b, metalness: 0.8, roughness: 0.2 });
      const sphere = new THREE.Mesh(sGeo, sMat);
      sphere.position.set(x, 4.1, z);
      group.add(sphere);
    });

    this.scene.add(group);
  }

  buildCollaborationPavilion() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    group.position.set(0, 0, 40);

    // Glass terrace platform
    const platformGeo = new THREE.CylinderGeometry(8, 8.5, 0.5, 32);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x0a1626, roughness: 0.1, metalness: 0.8 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.25;
    group.add(platform);

    this.scene.add(group);
  }

  /**
   * LOCATION 8: THE CULTURAL ARCHIVE
   * Interconnected Monumental Library & Atmospheric Cinema
   */
  buildCulturalArchiveLocation() {
    const THREE = window.THREE;
    const archiveMaster = new THREE.Group();
    archiveMaster.position.set(0, 0, -20);

    // Grand Portal Archway separating the two wings
    const archMat = new THREE.MeshStandardMaterial({ color: 0x0d1829, roughness: 0.3, metalness: 0.6 });
    const portalLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 0.8), archMat);
    portalLeft.position.set(-1.8, 6, 0);
    archiveMaster.add(portalLeft);

    const portalRight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 0.8), archMat);
    portalRight.position.set(1.8, 6, 0);
    archiveMaster.add(portalRight);

    const portalBeam = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.8, 0.8), archMat);
    portalBeam.position.set(0, 11.6, 0);
    archiveMaster.add(portalBeam);

    // Golden Archival Crest
    const crestGeo = new THREE.OctahedronGeometry(0.6, 0);
    const crestMat = new THREE.MeshStandardMaterial({ color: 0xcfb27b, metalness: 0.9, roughness: 0.1 });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.position.set(0, 12.6, 0);
    archiveMaster.add(crest);

    // -------------------------------------------------------------
    // ENVIRONMENT A: THE LIBRARY (West Wing, x = -14)
    // -------------------------------------------------------------
    const libraryGroup = new THREE.Group();
    libraryGroup.position.set(-14, 0, 0);

    // Warm Library Lighting
    const libLamp = new THREE.PointLight(0xffdfa9, 1.8, 25);
    libLamp.position.set(0, 8, 0);
    libraryGroup.add(libLamp);

    // Monumental Bookshelf Walls (Back and Side)
    this.createBookshelfWall(libraryGroup, { x: 0, y: 5.5, z: -7 }, { w: 16, h: 11, d: 1.2 }, 0);
    this.createBookshelfWall(libraryGroup, { x: -8, y: 5.5, z: 0 }, { w: 14, h: 11, d: 1.2 }, Math.PI / 2);

    // Reading Lounge Table & Lamp
    const tableGeo = new THREE.BoxGeometry(6, 0.25, 2.8);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x2c1d11, roughness: 0.3 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 2.5, 0);
    libraryGroup.add(table);

    // Reading area lamps on table
    const tableLamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.2 })
    );
    tableLamp.position.set(0, 3, 0);
    libraryGroup.add(tableLamp);

    // Interactive Library Archive Terminal
    const libTerminal = this.createInteractiveTerminal("terminal-library", "The Library Archive Terminal", "Literature & Philosophy");
    libTerminal.position.set(0, 3.4, 0);
    libraryGroup.add(libTerminal);

    // Floating Interactive Book Covers in Library
    const coreBooks = [
      { id: "pather-panchali", title: "Pather Panchali", author: "Bibhutibhushan", color: 0x059669 },
      { id: "gora", title: "Gora", author: "Tagore", color: 0xd97706 },
      { id: "crime-and-punishment", title: "Crime & Punishment", author: "Dostoevsky", color: 0x991b1b },
      { id: "the-trial", title: "The Trial", author: "Kafka", color: 0x374151 },
      { id: "aranyak", title: "Aranyak", author: "Bibhutibhushan", color: 0x065f46 },
      { id: "the-stranger", title: "The Stranger", author: "Camus", color: 0xb45309 }
    ];

    coreBooks.forEach((b, idx) => {
      const angle = (idx / coreBooks.length) * Math.PI * 1.5 - Math.PI * 0.75;
      const bx = Math.sin(angle) * 4.2;
      const bz = Math.cos(angle) * 3 - 1;
      const bookMesh = this.createInteractiveBook(b);
      bookMesh.position.set(bx, 4.2 + (idx % 2) * 0.6, bz);
      bookMesh.rotation.y = -angle + Math.PI;
      libraryGroup.add(bookMesh);
    });

    archiveMaster.add(libraryGroup);

    // -------------------------------------------------------------
    // ENVIRONMENT B: THE CINEMA (East Wing, x = +14)
    // -------------------------------------------------------------
    const cinemaGroup = new THREE.Group();
    cinemaGroup.position.set(14, 0, 0);

    // Cool Cinematic Phosphor Lighting
    const cinemaLight = new THREE.PointLight(0x7dd3fc, 1.2, 30);
    cinemaLight.position.set(0, 7, 0);
    cinemaGroup.add(cinemaLight);

    // Grand Cinematic Projection Screen
    const screenGeo = new THREE.PlaneGeometry(12, 6.75); // 16:9 Aspect Ratio
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.5
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 5.5, -6.5);
    cinemaGroup.add(screen);
    this.cinemaScreen = screen;

    // Cinematic Projection Cone / Volumetric Beam
    const coneGeo = new THREE.ConeGeometry(5.8, 14, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(coneGeo, coneMat);
    beam.rotation.x = Math.PI / 2;
    beam.position.set(0, 5.5, 0.5);
    cinemaGroup.add(beam);

    // Tiered Cinema Seating Rows
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.6 }); // Deep velvet red
    for (let row = 0; row < 3; row++) {
      const rowZ = row * 2.2;
      const rowY = 0.6 + row * 0.45;
      const benchGeo = new THREE.BoxGeometry(8, 0.5, 1.2);
      const bench = new THREE.Mesh(benchGeo, seatMat);
      bench.position.set(0, rowY, rowZ);
      cinemaGroup.add(bench);
    }

    // Interactive Cinema Terminal
    const cinTerminal = this.createInteractiveTerminal("terminal-cinema", "The Cinema Archive Terminal", "Films & Reflections");
    cinTerminal.position.set(0, 1.5, 5);
    cinemaGroup.add(cinTerminal);

    // Floating Interactive Film Posters
    const coreFilms = [
      { id: "the-lunchbox", title: "The Lunchbox", director: "Ritesh Batra", color: 0xb45309 },
      { id: "twelve-angry-men", title: "12 Angry Men", director: "Sidney Lumet", color: 0x1f2937 },
      { id: "maqbool", title: "Maqbool", director: "Vishal Bhardwaj", color: 0x7f1d1d },
      { id: "past-lives", title: "Past Lives", director: "Celine Song", color: 0x6b21a8 },
      { id: "wall-e", title: "WALL-E", director: "Andrew Stanton", color: 0x0369a1 }
    ];

    coreFilms.forEach((f, idx) => {
      const angle = (idx / (coreFilms.length - 1)) * Math.PI * 0.9 - Math.PI * 0.45;
      const fx = Math.sin(angle) * 5.8;
      const fz = Math.cos(angle) * 2 - 3;
      const posterMesh = this.createInteractivePoster(f);
      posterMesh.position.set(fx, 4.2 + (idx % 2) * 0.4, fz);
      posterMesh.rotation.y = -angle + Math.PI;
      cinemaGroup.add(posterMesh);
    });

    archiveMaster.add(cinemaGroup);
    this.scene.add(archiveMaster);
  }

  createBookshelfWall(parent, pos, size, rotY) {
    const THREE = window.THREE;
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(pos.x, pos.y, pos.z);
    shelfGroup.rotation.y = rotY;

    // Wood frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.5 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(size.w, size.h, size.d), frameMat);
    shelfGroup.add(frame);

    // Procedural glowing book rows
    const rows = 5;
    for (let r = 0; r < rows; r++) {
      const yOffset = -size.h / 2 + 1.2 + (r * (size.h / rows));
      const rowGeo = new THREE.BoxGeometry(size.w - 0.8, 0.12, size.d + 0.1);
      const rowShelf = new THREE.Mesh(rowGeo, frameMat);
      rowShelf.position.set(0, yOffset, 0.1);
      shelfGroup.add(rowShelf);

      // Book spines strip
      const spinesGeo = new THREE.BoxGeometry(size.w - 1.2, 1.4, 0.4);
      const spineColor = (r % 2 === 0) ? 0x2e384d : 0x4a3b32;
      const spinesMat = new THREE.MeshStandardMaterial({
        color: spineColor,
        roughness: 0.6,
        metalness: 0.1
      });
      const spines = new THREE.Mesh(spinesGeo, spinesMat);
      spines.position.set(0, yOffset + 0.75, 0.4);
      shelfGroup.add(spines);
    }

    parent.add(shelfGroup);
  }

  createInteractiveBook(bookData) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    group.userData = {
      type: "book",
      id: bookData.id,
      title: bookData.title,
      author: bookData.author,
      data: bookData
    };

    // 3D Hardcover Book Mesh
    const bookGeo = new THREE.BoxGeometry(1.2, 1.7, 0.3);
    const bookMat = new THREE.MeshStandardMaterial({
      color: bookData.color,
      roughness: 0.3,
      metalness: 0.2,
      emissive: bookData.color,
      emissiveIntensity: 0.15
    });
    const bookMesh = new THREE.Mesh(bookGeo, bookMat);
    group.add(bookMesh);

    // Paper edge
    const pagesGeo = new THREE.BoxGeometry(1.1, 1.6, 0.24);
    const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfbf6ea, roughness: 0.8 });
    const pages = new THREE.Mesh(pagesGeo, pagesMat);
    pages.position.x = 0.06;
    group.add(pages);

    // Floating aura ring
    const ringGeo = new THREE.RingGeometry(0.9, 1.05, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xcfb27b,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.1;
    group.add(ring);

    this.interactiveObjects.push(group);
    return group;
  }

  createInteractivePoster(filmData) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    group.userData = {
      type: "film",
      id: filmData.id,
      title: filmData.title,
      director: filmData.director,
      data: filmData
    };

    // Film poster card (vertical ratio ~ 2:3)
    const posterGeo = new THREE.BoxGeometry(1.3, 1.9, 0.08);
    const posterMat = new THREE.MeshStandardMaterial({
      color: filmData.color,
      roughness: 0.2,
      metalness: 0.4,
      emissive: filmData.color,
      emissiveIntensity: 0.2
    });
    const posterMesh = new THREE.Mesh(posterGeo, posterMat);
    group.add(posterMesh);

    // Sleek cinematic border frame
    const frameGeo = new THREE.BoxGeometry(1.4, 2.0, 0.04);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -0.03;
    group.add(frame);

    // Aura ring beneath
    const ringGeo = new THREE.RingGeometry(0.9, 1.05, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.2;
    group.add(ring);

    this.interactiveObjects.push(group);
    return group;
  }

  createInteractiveTerminal(id, title, category) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    group.userData = {
      type: "terminal",
      id: id,
      title: title,
      category: category
    };

    // Sleek pedestal
    const pedGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.2, 16);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x111c2e, roughness: 0.2, metalness: 0.8 });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    group.add(ped);

    // Holographic terminal screen
    const screenGeo = new THREE.PlaneGeometry(0.9, 0.6);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.6,
      side: THREE.DoubleSide
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.9, 0);
    screen.rotation.x = -Math.PI / 6;
    group.add(screen);

    this.interactiveObjects.push(group);
    return group;
  }

  buildAtmosphericParticles() {
    const THREE = window.THREE;
    const particleCount = 90;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = Math.random() * 22;
      positions[i + 2] = (Math.random() - 0.5) * 80;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xcfb27b,
      size: 0.15,
      transparent: true,
      opacity: 0.35
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  bindEvents() {
    // Window Resize
    window.addEventListener("resize", () => this.onResize());

    // Mouse / Touch Interaction for Navigation & Raycasting
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mouseup", () => this.onMouseUp());
    this.canvas.addEventListener("click", (e) => this.onClick(e));

    // Touch support
    this.canvas.addEventListener("touchstart", (e) => this.onTouchStart(e), { passive: true });
    this.canvas.addEventListener("touchmove", (e) => this.onTouchMove(e), { passive: true });
    this.canvas.addEventListener("touchend", () => this.onMouseUp());

    // Location navigator button clicks
    document.querySelectorAll(".location-nav-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.locIdx, 10);
        this.goToLocation(idx);
      });
    });

    // Location 8 Sub-environment switcher
    const btnLib = document.querySelector("#btn-subenv-library");
    const btnCin = document.querySelector("#btn-subenv-cinema");
    if (btnLib) {
      btnLib.addEventListener("click", () => this.goToCulturalSubEnvironment("library"));
    }
    if (btnCin) {
      btnCin.addEventListener("click", () => this.goToCulturalSubEnvironment("cinema"));
    }

    // Camera control buttons
    const btnReset = document.querySelector("#btn-reset-cam");
    if (btnReset) {
      btnReset.addEventListener("click", () => this.goToLocation(this.activeLocationIndex, this.culturalSubMode));
    }

    const btnOrbit = document.querySelector("#btn-toggle-orbit");
    if (btnOrbit) {
      btnOrbit.addEventListener("click", () => {
        this.autoRotate = !this.autoRotate;
        btnOrbit.textContent = `⟳ Orbit: ${this.autoRotate ? 'On' : 'Off'}`;
      });
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || (window.innerHeight * 0.85);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (this.isDragging) {
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      // Orbit around current target
      const angle = deltaX * 0.005;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const dx = this.camera.position.x - this.currentTarget.x;
      const dz = this.camera.position.z - this.currentTarget.z;

      this.camera.position.x = this.currentTarget.x + (dx * cosA - dz * sinA);
      this.camera.position.z = this.currentTarget.z + (dx * sinA + dz * cosA);
      this.camera.position.y = Math.max(2, this.camera.position.y - deltaY * 0.02);

      this.camera.lookAt(this.currentTarget.x, this.currentTarget.y, this.currentTarget.z);
    }

    this.previousMousePosition = { x: e.clientX, y: e.clientY };

    // Throttled raycast hover check for buttery smooth 60fps
    const now = performance.now();
    if (!this.lastRaycastTime || now - this.lastRaycastTime > 32) {
      this.lastRaycastTime = now;
      this.checkRaycastHover(e.clientX, e.clientY);
    }
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  onTouchMove(e) {
    if (this.isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.previousMousePosition.x;
      const deltaY = touch.clientY - this.previousMousePosition.y;

      const angle = deltaX * 0.006;
      const dx = this.camera.position.x - this.currentTarget.x;
      const dz = this.camera.position.z - this.currentTarget.z;

      this.camera.position.x = this.currentTarget.x + (dx * Math.cos(angle) - dz * Math.sin(angle));
      this.camera.position.z = this.currentTarget.z + (dx * Math.sin(angle) + dz * Math.cos(angle));
      this.camera.position.y = Math.max(2, this.camera.position.y - deltaY * 0.03);

      this.camera.lookAt(this.currentTarget.x, this.currentTarget.y, this.currentTarget.z);
      this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
    }
  }

  checkRaycastHover(clientX, clientY) {
    if (!this.raycaster || !this.camera) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    const tooltip = document.querySelector("#world-tooltip");
    const titleEl = document.querySelector("#tooltip-title");
    const actionEl = document.querySelector("#tooltip-action");

    if (intersects.length > 0) {
      // Find top parent in interactiveObjects
      let topObj = intersects[0].object;
      while (topObj.parent && !this.interactiveObjects.includes(topObj)) {
        topObj = topObj.parent;
      }

      this.canvas.style.cursor = "pointer";
      this.hoveredObject = topObj;

      if (tooltip && topObj.userData) {
        tooltip.style.display = "block";
        tooltip.style.left = `${clientX + 16}px`;
        tooltip.style.top = `${clientY + 16}px`;

        if (topObj.userData.type === "book") {
          titleEl.textContent = `Book: ${topObj.userData.title}`;
          actionEl.textContent = `By ${topObj.userData.author} • Click to read archival notes`;
        } else if (topObj.userData.type === "film") {
          titleEl.textContent = `Film: ${topObj.userData.title}`;
          actionEl.textContent = `Dir. ${topObj.userData.director} • Click for scene & theme study`;
        } else if (topObj.userData.type === "terminal") {
          titleEl.textContent = topObj.userData.title;
          actionEl.textContent = `Click to open ${topObj.userData.category} portal`;
        }
      }
    } else {
      this.canvas.style.cursor = "default";
      this.hoveredObject = null;
      if (tooltip) tooltip.style.display = "none";
    }
  }

  onClick(e) {
    if (!this.hoveredObject) return;
    const data = this.hoveredObject.userData;

    if (data.type === "book") {
      const book = (this.booksData || []).find(b => b.id === data.id);
      if (book && this.archiveController) {
        this.archiveController.openBookModal(book);
      }
    } else if (data.type === "film") {
      const film = (this.filmsData || []).find(f => f.id === data.id);
      if (film && this.archiveController) {
        this.archiveController.openFilmModal(film);
      }
    } else if (data.type === "terminal") {
      // Jump directly to corresponding 2D tab
      const targetTab = data.id === "terminal-library" ? "literature" : "cinema";
      if (this.archiveController) {
        this.archiveController.activeTab = targetTab;
        this.archiveController.render();
      }
      window.location.hash = "#cultural-archive";
    }
  }

  goToLocation(index, submode = null) {
    if (index < 0 || index >= this.locations.length) return;
    this.activeLocationIndex = index;
    const loc = this.locations[index];

    // Update HUD
    const titleEl = document.querySelector("#hud-location-title");
    const subTitleEl = document.querySelector("#hud-location-subtitle");
    const descEl = document.querySelector("#hud-location-desc");
    const subenvSwitcher = document.querySelector("#hud-subenv-switcher");

    if (titleEl) titleEl.textContent = loc.title;
    if (subTitleEl) subTitleEl.textContent = loc.subtitle;
    if (descEl) descEl.textContent = loc.description;

    // Show/hide sub-environment switcher for Location 8
    if (subenvSwitcher) {
      subenvSwitcher.style.display = (index === 7) ? "flex" : "none";
    }

    // Update active nav pill
    document.querySelectorAll(".location-nav-pill").forEach((pill, i) => {
      pill.classList.toggle("active", i === index);
    });

    let targetCamPos = loc.camPos;
    let targetLookPos = loc.targetPos;

    if (index === 7 && submode) {
      this.culturalSubMode = submode;
      const subWaypoint = submode === "cinema" ? loc.cinemaWaypoint : loc.libraryWaypoint;
      targetCamPos = subWaypoint.camPos;
      targetLookPos = subWaypoint.targetPos;

      document.querySelector("#btn-subenv-library")?.classList.toggle("active", submode === "library");
      document.querySelector("#btn-subenv-cinema")?.classList.toggle("active", submode === "cinema");
    }

    this.smoothTransitionCamera(targetCamPos, targetLookPos);
  }

  goToCulturalSubEnvironment(submode) {
    this.culturalSubMode = submode;
    this.goToLocation(7, submode);
  }

  smoothTransitionCamera(camEnd, targetEnd, duration = 1200) {
    const startTime = performance.now();
    const camStart = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };
    const targetStart = {
      x: this.currentTarget.x,
      y: this.currentTarget.y,
      z: this.currentTarget.z
    };

    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      this.camera.position.x = camStart.x + (camEnd.x - camStart.x) * ease;
      this.camera.position.y = camStart.y + (camEnd.y - camStart.y) * ease;
      this.camera.position.z = camStart.z + (camEnd.z - camStart.z) * ease;

      this.currentTarget.x = targetStart.x + (targetEnd.x - targetStart.x) * ease;
      this.currentTarget.y = targetStart.y + (targetEnd.y - targetStart.y) * ease;
      this.currentTarget.z = targetStart.z + (targetEnd.z - targetStart.z) * ease;

      this.camera.lookAt(this.currentTarget.x, this.currentTarget.y, this.currentTarget.z);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // Gentle float on interactive items
    this.interactiveObjects.forEach((obj, idx) => {
      obj.position.y += Math.sin(time * 2 + idx) * 0.0025;
      if (obj.userData.type === "book" || obj.userData.type === "film") {
        obj.rotation.y += 0.004;
      }
    });

    // Animate central prism
    if (this.atriumPrism) {
      this.atriumPrism.rotation.x = time * 0.5;
      this.atriumPrism.rotation.y = time * 0.8;
    }

    // Animate observatory rings
    if (this.observatoryTorus) {
      this.observatoryTorus.rotation.z = time * 0.3;
    }

    // Gentle projection light oscillation on cinema screen
    if (this.cinemaScreen && this.cinemaScreen.material) {
      this.cinemaScreen.material.emissiveIntensity = 0.45 + Math.sin(time * 4) * 0.08;
    }

    // Dust particles drift
    if (this.particles) {
      this.particles.rotation.y = time * 0.02;
    }

    // Auto-orbit around target if enabled
    if (this.autoRotate && !this.isDragging) {
      const angle = 0.003;
      const dx = this.camera.position.x - this.currentTarget.x;
      const dz = this.camera.position.z - this.currentTarget.z;
      this.camera.position.x = this.currentTarget.x + (dx * Math.cos(angle) - dz * Math.sin(angle));
      this.camera.position.z = this.currentTarget.z + (dx * Math.sin(angle) + dz * Math.cos(angle));
      this.camera.lookAt(this.currentTarget.x, this.currentTarget.y, this.currentTarget.z);
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", () => this.onResize());
    if (this.renderer) this.renderer.dispose();
  }
}
