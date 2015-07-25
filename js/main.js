onCreate();
function onCreate() {
    // Configure the view
    setupCamera();
    setupControls();

    // Display initial objects in the view
    displayObjects();

    // Render all above objects and start
    setupRender();
}

function displayObjects() {
    addSkybox();
    addLighting();

    setupSun();
    setupEarth();
    setupMoon();
}

function addLighting() {
    var color = new THREE.Color("rgb(255,255,255)");
    point = new THREE.PointLight(color, 0, 0);
    scene.add(point);

    //direct = new THREE.DirectionalLight(0xffffff);
    //direct.position.set(0, , 0);
    //scene.add(direct);

    //ambient = new THREE.AmbientLight(0xffffff, 0.5);
    //ambient.intensity = 0.001;
    //scene.add(ambient);

}

function setupSunGlow() {
    //var geometry = new THREE.SphereGeometry(sun.radius + 0.003, sun.segment, sun.segment);
    //var material = new THREE.MeshPhongMaterial({
    //    map: THREE.ImageUtils.loadTexture('res/yellow.jpg'),
    //    transparent: true,
    //    opacity: 0.5
    //});
    //
    //glow = new THREE.Mesh(geometry, material);
    //sun.add(glow);

    //var geometry	= sun.geometry.clone();
    //THREEx.dilateGeometry(geometry, 0.15);
    //var material	= THREEx.createAtmosphereMaterial();
    //var meshHalo	= new THREE.Mesh(geometry, material );
    //scene.add( meshHalo );

    var ground = new THREE.Color("255,0,0");
    var sky = new THREE.Color("255, 0, 0");
    hemiLight = new THREE.HemisphereLight(ground, sky, 0.6);
    sun.add(hemiLight);


    //var dirLight = new THREE.SpotLight( 0xffffff, 1);
    //dirLight.position.set(0, 0, 0);
    //dirLight.position.multiplyScalar( 50);
    // dirLight.shadowCameraVisible = true;
}

function setupEarth() {
    var radius = sun.radius * 0.43, segment = 32;
    var geometry = new THREE.SphereGeometry(radius, segment, segment);
    var material = new THREE.MeshPhongMaterial({
        map:          new THREE.ImageUtils.loadTexture("res/earth_landscape.jpg"),
        specularMap:  THREE.ImageUtils.loadTexture('res/earth_specular.jpg'),
        bumpMap:      THREE.ImageUtils.loadTexture('res/earth_bump.jpg'),
        specular:     new THREE.Color('grey'),
        bumpScale:    0.05,
        shininess:    5
    });

    earth = new THREE.Mesh(geometry, material);
    earth.overdraw = true;
    earth.segment = segment;
    earth.radius = radius;
    earth.spin = 0.002;
    earth.position.x = -3.5;

    sun.add(earth);

    setupClouds();
}


function setupSun() {
    var radius = 1, segment = 32;
    var geometry = new THREE.SphereGeometry(radius, segment, segment);
    var material = new THREE.MeshPhongMaterial({
        map:          new THREE.ImageUtils.loadTexture("res/sun_map.jpg"),
        specular:     new THREE.Color('red'),
        bumpScale:    0.05,
        shininess:    5
    });

    sun = new THREE.Mesh(geometry, material);
    sun.overdraw = true;
    sun.segment = segment;
    sun.radius = radius;
    sun.spin = 0.001;
    scene.add(sun);

    setupSunGlow();
}

// Radius to scale of earth (~27% smaller)
function setupMoon() {
    var radius = earth.radius * 0.27264165751, segment = 32;
    var geometry = new THREE.SphereGeometry(radius, segment, segment);
    var material = new THREE.MeshPhongMaterial({
        map:          new THREE.ImageUtils.loadTexture("res/moon_specular.jpg"),
        shininess:    5
    });

    moon = new THREE.Mesh(geometry, material);
    moon.overdraw = true;
    moon.segment = segment;
    moon.radius = radius;
    moon.spin = earth.spin * 0.87841300051;
    moon.position.x = -1.2;
    earth.add(moon);
}

function setupClouds() {
    var geometry = new THREE.SphereGeometry(earth.radius + 0.003, earth.segment, earth.segment);
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('res/lightclouds.png'),
        transparent: true
    });

    clouds = new THREE.Mesh(geometry, material);
    clouds.spin = earth.spin * 0.2;
    earth.add(clouds);
}

function setupRender() {
    renderer = new THREE.WebGLRenderer( { antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    vrMode = false;
    effect = new THREE.StereoEffect(renderer); // Setup VR mode toggle
    effect.setSize(window.innerWidth, window.innerHeight);

    render(); // start render loop
}

// Render loop for frames
function render() {
    spinPlanets();

    controls.update();
    requestAnimationFrame(render);

    // Triggered by VR view toggle
    if (resize) {
        onWindowResize();
        resize = false;
    }

    if (vrMode)
        effect.render(scene, camera);
    else
        renderer.render(scene, camera);
}

function spinPlanets() {
    earth.rotation.y += earth.spin;
    clouds.rotation.y += clouds.spin;

    moon.rotation.y += moon.spin;

    sun.rotation.y += sun.spin;

    skybox.rotation.y -= 0.001;
}

function setupCamera() {
    var WIDTH = window.innerWidth - 30,
        HEIGHT = window.innerHeight - 30;
    var angle = 45,
        aspect = WIDTH / HEIGHT,
        near = 0.01,
        far = 1000;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
    camera.position.z = 14;
    camera.position.y = 4;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    resize = false;
}

function addSkybox() {
    var texture = THREE.ImageUtils.loadTexture('res/skybox.jpg');
    texture.minFilter = THREE.LinearFilter;

    skybox = new THREE.Mesh(
        new THREE.SphereGeometry(25, 50, 50),
        new THREE.MeshBasicMaterial({
            map: texture
        })
    );

    skybox.scale.x = -1;
    scene.add(skybox);
}

function setupControls() {
    window.addEventListener('resize', onWindowResize, false );
    window.addEventListener('keydown', onDocumentKeyDown, false);
    window.addEventListener('mousewheel', onMouseWheel, false);
    window.addEventListener('DOMMouseScroll', onMouseWheel, false);


    controls = new THREE.TrackballControls(camera);
}

// Zoom by scrolling
function onMouseWheel(event) {
    if (event.wheelDeltaY) { // WebKit
        camera.fov -= event.wheelDeltaY * 0.05;
    } else if (event.wheelDelta) { // Opera / IE9
        camera.fov -= event.wheelDelta * 0.05;
    } else if (event.detail) { // Firefox
        camera.fov += event.detail * 1.0;
    }
    updateFOV();
}

// Update the field of view for the camera.
// Uses camera parameters to update itself on the scene.
function updateFOV() {
    camera.fov = Math.max(40, Math.min(100, camera.fov));
    camera.updateProjectionMatrix();
}

// Assigns key strokes to actions
function onDocumentKeyDown(event) {
    switch(event.which) {
        case 37: // Arrow left
            camera.position.x -= 1;
            break;
        case 38: // Arrow up
            camera.position.y += 1;
            break;
        case 39: // Arrow right
            //camera.position.x += 1;

            var tween = new TWEEN.Tween(camera.position).to( {
                x: camera.position.x +1,
                y: camera.position.y,
                z: camera.position.z
            }, 600).easing( TWEEN.Easing.Sinusoidal.EaseInOut).start();
            tween.start();

            camera.position.x += 1;

            break;
        case 40: // Arrow down
            camera.position.y -= 1;
            break;
        case 97: // "a"
            camera.fov += 20;
            updateFOV();
            break;
        case 115: // "s"
            camera.fox -= 20;
            updateFOV();
            break;
        case 86: // "v"
            vrMode = vrMode ? false : true;
            resize = true;
            break;
    }
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    effect.setSize(window.innerWidth, window.innerHeight);
}
