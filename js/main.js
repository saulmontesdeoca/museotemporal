let camera, scene, renderer, controls;

let objects = [];
let blocker,  instructions;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();
let velocity, direction;

let floorUrl = "./js/assets/floor.jpg";

function initPointerLock()
{
    blocker = document.getElementById( 'blocker' );
    instructions = document.getElementById( 'instructions' );

    controls = new THREE.PointerLockControls( camera, document.body );

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    } );
    
    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    } );

    instructions.addEventListener( 'click', function () {
        controls.lock();
    }, false );

    scene.add( controls.getObject() );
}

function onKeyDown ( event )
{
    switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true; 
            break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;
    }

}

function onKeyUp( event ) {

    switch( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = false;
            break;

        case 37: // left
        case 65: // a
            moveLeft = false;
            break;

        case 40: // down
        case 83: // s
            moveBackward = false;
            break;

        case 39: // right
        case 68: // d
            moveRight = false;
            break;

    }
}
function createObject(path,x,y,z,scale){
    const objLoader = new THREE.OBJLoader();
    objLoader.load(path, (object) => {
        object.position.set(x,y,z);
        object.scale.set(scale,scale,scale);
        scene.add(object);
    });
}

function createMTLObject(mtlpath,path,x,y,z,scale){
    const mtlLoader = new THREE.MTLLoader();
    const objLoader = new THREE.OBJLoader();

    mtlLoader.load(mtlpath, (materials) => {
        materials.preload()
        objLoader.setMaterials(materials)
        objLoader.load(path, (object) => {
        object.position.set(x,y,z);
        object.scale.set(scale,scale,scale);
          scene.add(object)
        })
      })
}
function createObjectGLTF(path){
    const loader = new THREE.GLTFLoader();
    loader.load( path, function ( gltf ) {
        //gltf.scene.scale.set(4,4,4) // scale here
        gltf.scene.position.x = 100; // once rescaled, position the model where needed
        gltf.scene.position.z = -100;
        gltf.scene.position.y = 30; // once rescaled, position the model where needed
        scene.add( gltf.scene );

    }, undefined, function ( error ) {

        console.error( error );

    } );
}


function createScene(canvas) 
{    
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.addEventListener( 'resize', onWindowResize, false );

    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 64;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 1000 );

    let light = new THREE.AmbientLight(0XE5E5C6,2);
    //light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    // floor
    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(32, 32);

    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    let floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    scene.add( floor );
    
    createObject('./Objects/Tree/source/Tree/Temple_MESH.obj',0,0,20,0.5);
    createObject('./Objects/mountain.obj',-200,0,20,1.5,);
    createObject('./Objects/elephant.obj',-300,10,20,10);
    createMTLObject('./Objects/eiffel.mtl','./Objects/eiffel.obj',-100,0,20,1.5);
    createMTLObject('./Objects/sea.mtl','./Objects/sea.obj',100,15,20,2);
    createMTLObject('./Objects/Human/Object/human.mtl','./Objects/Human/Object/human.obj',200,0,20,0.3);
    createObjectGLTF('./Objects/obj5/scene.gltf')

    initPointerLock();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function run() 
{
    requestAnimationFrame( run );

    if ( controls.isLocked === true ) 
    {
        let time = performance.now();
        let delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );

        direction.normalize(); // this ensures consistent movements in all directions
        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        prevTime = time;
    }

    renderer.render( scene, camera );

}
