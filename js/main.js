let camera, scene, renderer, controls;
let rtCamera, rtScene, renderTarget, rtframes;
let drops = [];
let count =0;
let objects = [];
let blocker,  instructions, frame;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();
let velocity, direction;

let floorUrl = "./js/assets/floor.jpg";

function createRiverFrame(scene){
    const rtWidth = 512;
    const rtHeight = 700;
    renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
    
    const aspectRatio = rtWidth / rtHeight,
        fieldOfView = 25,
        nearPlane = 1,
        farPlane = 1000; 
    rtCamera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane);

    rtCamera.position.set(-5,6,8);
    rtCamera.lookAt(new THREE.Vector3(0,0,0));

    rtScene = new THREE.Scene();

    // Color palette for the river
    let Colors = {
        cyan: 0x248079,
        brown: 0xA98F78,
        brownDark: 0x9A6169,
        green: 0x65BB61,
        greenLight: 0xABD66A,
        blue:0x6BC6FF
    };
  
    // bg color
    rtScene.background = new THREE.Color('#000729');
  
    //Ambient light
    let light = new THREE.AmbientLight( 0xffffff ,.2);
    
    let shadowLight = new THREE.DirectionalLight(0xffffff, .3);
    shadowLight.position.set(2000, 2000, 2000);
    shadowLight.castShadow = true;
    
    let backLight = new THREE.DirectionalLight(0xffffff, .1);
    backLight.position.set(-100, 200, 50);
    backLight.castShadow = true;
    rtScene.add(backLight);
    rtScene.add(light);
    rtScene.add(shadowLight);

    
    // grassland left
    let geometry_left = new THREE.BoxGeometry( 2, 3, 5.3 );
    let material_grass = new THREE.MeshLambertMaterial( { color: Colors.greenLight } );
    let ground_left = new THREE.Mesh( geometry_left, material_grass );
    ground_left.position.set(-1,-1.33,-1.64);
    rtScene.add( ground_left );
    customizeShadow(ground_left,.25) // mess, opacity
    
    //river
    let geometry_river = new THREE.BoxGeometry( 1, .1, 8 );
    let material_river = new THREE.MeshLambertMaterial( { color: Colors.blue } );
    let river = new THREE.Mesh( geometry_river, material_river );
    river.position.set(.5,.1,-3);
    rtScene.add( river );
    customizeShadow(river,.08) // mess, opacity
    
    //river bed
    let geometry_bed = new THREE.BoxGeometry( 1, 3.2, 2 );
    let material_mud = new THREE.MeshLambertMaterial( { color: Colors.brownDark } );
    let bed = new THREE.Mesh( geometry_bed , material_mud );
    bed.position.set(.5,-1.53,0);
    rtScene.add( bed );
    
    //grassland right
    let geometry_right = new THREE.BoxGeometry( 2.5, 4, 10 );
    let ground_right = new THREE.Mesh( geometry_right, material_grass );
    ground_right.position.set(2.3,-1.77,-4);
    rtScene.add( ground_right );
    customizeShadow(ground_right,.25) // mess, opacity
    
    
    let tree=function(x,z){
        this.x=x;
        this.z=z;
        
        //trunk
        let material_trunk = new THREE.MeshLambertMaterial({ color: Colors.brownDark  });
        let geometry_trunk = new THREE.BoxGeometry( .15, .15, .15 );
        let trunk = new THREE.Mesh( geometry_trunk, material_trunk );
        trunk.position.set(this.x,.275,this.z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        rtScene.add( trunk );
        
        //leaves
        let geometry_leaves = new THREE.BoxGeometry( .25, .4, .25 );
        let material_leaves = new THREE.MeshLambertMaterial({ color: Colors.green});
        let leaves = new THREE.Mesh( geometry_leaves, material_leaves );
        leaves.position.set(this.x,.2+.15+.4/2,this.z);
        leaves.castShadow = true;
        customizeShadow(leaves,.25) // mess, opacity
        rtScene.add( leaves );
    }
    
    //left
    tree(-1.75,-.85);
    tree(2,-3);
    tree(2.5,-2.4);
    tree(1.6,-2);
    tree(1.2,-4);
    tree(3,-4);
    tree(2,-3.8);
    tree(2,-5);
    tree(1.2,-5);
    tree(1.2,-2.6);
    tree(2.6,-1);
    tree(2.6,-2);
    tree(2.6,-4.5);
    tree(-1.75,-.15);
    tree(-1.5,-.5);
    tree(-1.5,.4);
    tree(-1.25,-.85);
    tree(-1.25,.75);
    tree(-.75,-.85);
    tree(-.75,-.25);
    tree(-.25,-.85);
    //right
    tree(1.25,-.85);
    tree(1.25,.75);
    tree(-.6,-1.7);
    tree(-.64,-2.2);
    tree(1.5,-.5);
    tree(1.75,-.85);
    tree(1.75,.35);
    
    function customizeShadow(t,a){ //opacity, target mesh
        let material_shadow = new THREE.ShadowMaterial({opacity:a});
        let mesh_shadow = new THREE.Mesh( t.geometry, material_shadow );
        mesh_shadow.position.set(t.position.x,t.position.y,t.position.z);
        mesh_shadow.receiveShadow = true;
        rtScene.add( mesh_shadow );
    }
    
    
    let material_wood = new THREE.MeshLambertMaterial({ color: Colors.brown  });
    
    //bridge - wood block
    for (let i=0;i<6;i++){
        let geometry_block = new THREE.BoxGeometry( .15, .02, .4 );
        let block = new THREE.Mesh( geometry_block, material_wood );
        block.position.set(0+.2*i,.21,.2);
        block.castShadow = true;
        block.receiveShadow = true;
        rtScene.add( block );
    }
    //bridge - rail
    let geometry_rail_v = new THREE.BoxGeometry( .04,.3,.04 );
    let rail_1 = new THREE.Mesh( geometry_rail_v, material_wood );
    rail_1.position.set(-.1,.35,.4);
    rail_1.castShadow = true;
    customizeShadow(rail_1,.2);
    rtScene.add( rail_1 );
    
    let rail_2 = new THREE.Mesh( geometry_rail_v, material_wood );
    rail_2.position.set(1.1,.35,.4);
    rail_2.castShadow = true;
    customizeShadow(rail_2,.2);
    rtScene.add( rail_2 );
    
    let rail_3 = new THREE.Mesh( geometry_rail_v, material_wood );
    rail_3.position.set(-.1,.35,0);
    rail_3.castShadow = true;
    customizeShadow(rail_3,.2);
    rtScene.add( rail_3 );
    
    let rail_4 = new THREE.Mesh( geometry_rail_v, material_wood );
    rail_4.position.set(1.1,.35,0);
    rail_4.castShadow = true;
    customizeShadow(rail_4,.2);
    rtScene.add( rail_4 );
    
    let geometry_rail_h = new THREE.BoxGeometry( 1.2,.04,.04 );
    let rail_h1 = new THREE.Mesh( geometry_rail_h, material_wood );
    rail_h1.position.set(0.5,.42,.4);
    rail_h1.castShadow = true;
    customizeShadow(rail_h1,.2);
    rtScene.add( rail_h1 );
    
    let rail_h2 = new THREE.Mesh( geometry_rail_h, material_wood );
    rail_h2.position.set(0.5,.42,0);
    rail_h2.castShadow = true;
    customizeShadow(rail_h2,.2);
    rtScene.add( rail_h2 );

    createFrame(scene, renderTarget);

}
class Drop {
    constructor(){
this.geometry = new THREE.BoxGeometry(.1, .1, .1 );
this.material_river = new THREE.MeshLambertMaterial( { color: 0x6BC6FF} );

this.drop= new THREE.Mesh( this.geometry, this.material_river );
this.drop.position.set(Math.random(.1,.9),0.1,1+(Math.random()-.5)*.1);
rtScene.add( this.drop );
this.speed=0;
this.lifespan=(Math.random()*50)+50;

this.update=function(){
    this.speed+=.0007;
    this.lifespan--;
    this.drop.position.x+=(.5-this.drop.position.x)/100;
    this.drop.position.y-=this.speed;
}
}
}

function createFrame(scene, renderTarget, x, y, z)
{    
    const geometry = new THREE.PlaneGeometry( 30, 45, 32 );
    
    const material = new THREE.MeshPhongMaterial({
        map: renderTarget.texture,
        side: THREE.DoubleSide
    });
    frame = new THREE.Mesh(geometry, material);
    frame.position.y = 60;
    frame.position.z = -35;

    scene.add(frame);
}

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
function createObjectGLTF(path, x, y ,z , scale){
    const loader = new THREE.GLTFLoader();
    loader.load( path, function ( gltf ) {
        gltf.scene.scale.set(scale,scale,scale) // scale here
        gltf.scene.position.x = x; // once rescaled, position the model where needed
        gltf.scene.position.z = z;
        gltf.scene.position.y = y; // once rescaled, position the model where needed
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
    // Frames
    // River Frame
    createRiverFrame(scene);
    // createObject('./Objects/Tree/source/Tree/Temple_MESH.obj',0,0,20,0.5);
    // createObject('./Objects/mountain.obj',-200,0,20,1.5,);
    // createObject('./Objects/elephant.obj',-300,10,20,10);
    // createMTLObject('./Objects/eiffel.mtl','./Objects/eiffel.obj',-100,0,20,1.5);
    // createMTLObject('./Objects/sea.mtl','./Objects/sea.obj',100,15,20,2);
    // createMTLObject('./Objects/Human/Object/human.mtl','./Objects/Human/Object/human.obj',200,0,20,0.3);
    // createObjectGLTF('./Objects/obj5/scene.gltf', 100, 30, -100, 1);
    // createObjectGLTF('./Objects/obj2/scene.gltf', -150, 50, -100, 5);
    // createObjectGLTF('./Objects/obj3/scene.gltf', -100, 50, -100, 0.5);
    // createObjectGLTF('./Objects/op1/scene.gltf', 10, 100, -100, 2);
    // createObjectGLTF('./Objects/Dino/scene.gltf', 10, 20, 100, 4);
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

        // River animation
        if(count%2==0){
            for(let i=0;i<5;i++){
                drops.push(new Drop());
            }
        }
        count++;
        for(let i=0;i<drops.length;i++){
            console.log(drops.lenght);
            drops[i].update();
            if(drops[i].lifespan<0){
                rtScene.remove(rtScene.getObjectById(drops[i].drop.id));
                drops.splice(i,1);
            }
        }


    }

    //  draw render target scene to render target
    // this is for the frames (cuadros)
    renderer.setRenderTarget(renderTarget);
    renderer.render(rtScene, rtCamera);
    renderer.setRenderTarget(null);

    renderer.render( scene, camera );

}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
    renderer.setSize(width, height, false);
    }
    return needResize;
}