let camera, scene, renderer, controls;
let riverFrameCamera, riverFrameScene, riverRenderTarget;
let cubesCamera, cubesScene, cubesRenderTarget;
let bubblesCamera, bubblesScene, bubblesRenderTarget;
let tunnelCamera, tunnelScene, tunnelRenderTarget, uniforms;

const spheres = [];
let duration = 5000; // ms
let currentTime, now = Date.now();
// let 
let sounds =[];

let musicGroup;
let right = true;
let left = false;

let drops = [];
let count =0;
let paused = true;
let objects = [];
let blocker,  instructions, frame;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();
let velocity, direction;

let floorUrl = "./js/assets/floor.jpg";
let models = [];
function createWalls(scene){
    let wallTexture = "./js/assets/wall_texture.jpg";
    let texture = new THREE.TextureLoader().load(wallTexture);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 1);

    const geometry = new THREE.PlaneGeometry( 1020, 180, 32 );
    const material = new THREE.MeshPhongMaterial({ map: texture, color: 0xffffff, side:THREE.DoubleSide});
    const footerGeometry = new THREE.PlaneGeometry( 1000, 10, 32 );
    let map = new THREE.TextureLoader().load(floorUrl);
    let wall = new THREE.Mesh(geometry, material);
    let footer = new THREE.Mesh(footerGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));

    // front
    wall.position.x = 0;
    wall.position.y = 60;
    wall.position.z = -500.3;
    scene.add(wall);
    footer.position.x = 0;
    footer.position.y = 2;
    footer.position.z = -500.2;
    scene.add(footer);

    // back
    wall = new THREE.Mesh(geometry, material);
    wall.position.x = 0;
    wall.position.y = 60;
    wall.position.z = 500.3;
    scene.add(wall);
    footer = new THREE.Mesh(footerGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    footer.position.x = 0;
    footer.position.y = 2;
    footer.position.z = 500.2;
    scene.add(footer);
    // right
    wall = new THREE.Mesh(geometry, material);
    wall.position.x = 499;
    wall.position.y = 60;
    wall.position.z = 0;
    wall.rotation.y = Math.PI/2;

    scene.add(wall);
    footer = new THREE.Mesh(footerGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    footer.position.x = 498.9;
    footer.position.y = 2;
    footer.position.z = 0;
    footer.rotation.y = Math.PI/2;
    scene.add(footer);

    // left
    wall = new THREE.Mesh(geometry, material);
    wall.position.x = -499;
    wall.position.y = 60;
    wall.position.z = 0;
    wall.rotation.y = Math.PI/2;

    scene.add(wall);
    footer = new THREE.Mesh(footerGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    footer.position.x = -498.9;
    footer.position.y = 2;
    footer.position.z = 0;
    footer.rotation.y = Math.PI/2;
    scene.add(footer);



}
//https://codepen.io/yitliu/pen/bJoQLw
function createRiverFrame(scene){
    const rtWidth = 512;
    const rtHeight = 700;
    riverRenderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
    
    const aspectRatio = rtWidth / rtHeight,
        fieldOfView = 25,
        nearPlane = 1,
        farPlane = 1000; 
    riverFrameCamera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane);

    riverFrameCamera.position.set(-5,6,8);
    riverFrameCamera.lookAt(new THREE.Vector3(0,0,0));

    riverFrameScene = new THREE.Scene();

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
    riverFrameScene.background = new THREE.Color('#000729');
  
    //Ambient light
    let light = new THREE.AmbientLight( 0xffffff ,.5);
    
    let shadowLight = new THREE.DirectionalLight(0xffffff, .3);
    shadowLight.position.set(2000, 2000, 2000);
    shadowLight.castShadow = true;
    
    let backLight = new THREE.DirectionalLight(0xffffff, .1);
    backLight.position.set(-100, 200, 50);
    backLight.castShadow = true;
    riverFrameScene.add(backLight);
    riverFrameScene.add(light);
    riverFrameScene.add(shadowLight);

    
    // grassland left
    let geometry_left = new THREE.BoxGeometry( 2, 3, 5.3 );
    let material_grass = new THREE.MeshLambertMaterial( { color: Colors.greenLight } );
    let ground_left = new THREE.Mesh( geometry_left, material_grass );
    ground_left.position.set(-1,-1.33,-1.64);
    riverFrameScene.add( ground_left );
    customizeShadow(ground_left,.25) // mess, opacity
    
    //river
    let geometry_river = new THREE.BoxGeometry( 1, .1, 8 );
    let material_river = new THREE.MeshLambertMaterial( { color: Colors.blue } );
    let river = new THREE.Mesh( geometry_river, material_river );
    river.position.set(.5,.1,-3);
    riverFrameScene.add( river );
    customizeShadow(river,.08) // mess, opacity
    
    //river bed
    let geometry_bed = new THREE.BoxGeometry( 1, 3.2, 2 );
    let material_mud = new THREE.MeshLambertMaterial( { color: Colors.brownDark } );
    let bed = new THREE.Mesh( geometry_bed , material_mud );
    bed.position.set(.5,-1.53,0);
    riverFrameScene.add( bed );
    
    //grassland right
    let geometry_right = new THREE.BoxGeometry( 2.5, 4, 10 );
    let ground_right = new THREE.Mesh( geometry_right, material_grass );
    ground_right.position.set(2.3,-1.77,-4);
    riverFrameScene.add( ground_right );
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
        riverFrameScene.add( trunk );
        
        //leaves
        let geometry_leaves = new THREE.BoxGeometry( .25, .4, .25 );
        let material_leaves = new THREE.MeshLambertMaterial({ color: Colors.green});
        let leaves = new THREE.Mesh( geometry_leaves, material_leaves );
        leaves.position.set(this.x,.2+.15+.4/2,this.z);
        leaves.castShadow = true;
        customizeShadow(leaves,.25) // mess, opacity
        riverFrameScene.add( leaves );
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
        riverFrameScene.add( mesh_shadow );
    }
    
    
    let material_wood = new THREE.MeshLambertMaterial({ color: Colors.brown  });
    
    //bridge - wood block
    for (let i=0;i<6;i++){
        let geometry_block = new THREE.BoxGeometry( .15, .02, .4 );
        let block = new THREE.Mesh( geometry_block, material_wood );
        block.position.set(0+.2*i,.21,.2);
        block.castShadow = true;
        block.receiveShadow = true;
        riverFrameScene.add( block );
    }
    //bridge - rail
    let geometry_rail_v = new THREE.BoxGeometry( .04,.3,.04 );
    let rail_1 = new THREE.Mesh( geometry_rail_v, material_wood );
    rail_1.position.set(-.1,.35,.4);
    rail_1.castShadow = true;
    customizeShadow(rail_1,.2);
    riverFrameScene.add( rail_1 );
    
    let rail_2 = new THREE.Mesh( geometry_rail_v, material_wood );
    rail_2.position.set(1.1,.35,.4);
    rail_2.castShadow = true;
    customizeShadow(rail_2,.2);
    riverFrameScene.add( rail_2 );
    
    let rail_3 = new THREE.Mesh( geometry_rail_v, material_wood );
    rail_3.position.set(-.1,.35,0);
    rail_3.castShadow = true;
    customizeShadow(rail_3,.2);
    riverFrameScene.add( rail_3 );
    
    let rail_4 = new THREE.Mesh( geometry_rail_v, material_wood );
    rail_4.position.set(1.1,.35,0);
    rail_4.castShadow = true;
    customizeShadow(rail_4,.2);
    riverFrameScene.add( rail_4 );
    
    let geometry_rail_h = new THREE.BoxGeometry( 1.2,.04,.04 );
    let rail_h1 = new THREE.Mesh( geometry_rail_h, material_wood );
    rail_h1.position.set(0.5,.42,.4);
    rail_h1.castShadow = true;
    customizeShadow(rail_h1,.2);
    riverFrameScene.add( rail_h1 );
    
    let rail_h2 = new THREE.Mesh( geometry_rail_h, material_wood );
    rail_h2.position.set(0.5,.42,0);
    rail_h2.castShadow = true;
    customizeShadow(rail_h2,.2);
    riverFrameScene.add( rail_h2 );

    createMusicFrame(scene, riverRenderTarget, -300, 70, -500, './Objects/music/waterfall.mp3', 6, 70, 90);


}
class Drop {
    constructor(){
        this.geometry = new THREE.BoxGeometry(.1, .1, .1 );
        this.material_river = new THREE.MeshLambertMaterial( { color: 0x6BC6FF} );

        this.drop= new THREE.Mesh( this.geometry, this.material_river );
        this.drop.position.set(Math.random(.1,.9),0.1,1+(Math.random()-.5)*.1);
        riverFrameScene.add( this.drop );
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
function cubesFrame(scene){

    const rtWidth = 512;
    const rtHeight = 700;
    cubesRenderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
    
    const aspectRatio = rtWidth / rtHeight,
        fieldOfView = 45,
        nearPlane = .1,
        farPlane = 10000; 
    cubesCamera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane);

    cubesCamera.lookAt(new THREE.Vector3(0,0,0));

    cubesScene = new THREE.Scene();

    // camera
    cubesCamera.position.y = 600;
    cubesCamera.position.z = 600;
    cubesCamera.position.x = 600;
    cubesCamera.updateProjectionMatrix();
    cubesCamera.lookAt(cubesScene.position);
    
    // lights    
    let backLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
    backLight.position.set( -400, 1000, 200 );
    cubesScene.add(backLight);
    // Add a directional light to show off the object
    let light = new THREE.DirectionalLight( 0xffffff, 1);

    // Position the light out from the scene, pointing at the origin
    light.position.set(.5, 0, 1);
    cubesScene.add( light );
    light = new THREE.AmbientLight ( 0xaaccbb, 0.3 );
    cubesScene.add(light);
    
    // floor
    let thisgeometry = new THREE.PlaneGeometry( 5000, 5000, 1, 1 );
    let thismaterial = new THREE.MeshBasicMaterial( { color: "white" } );
    let floor = new THREE.Mesh( thisgeometry, thismaterial );
    floor.material.side = THREE.DoubleSide;
    floor.position.y =-100;
    floor.rotation.x = 90*Math.PI/180;
    floor.rotation.y = 0;
    floor.rotation.z = 0;
    floor.doubleSided = true;
    floor.receiveShadow = true;
    cubesScene.add(floor);
    
    // cube 
    let myArray = new THREE.Group();
    cubesScene.add(myArray);
    const createCube = (x, z, group, colour) => {
        let cubeGeometry = new THREE.BoxGeometry( 100, 100, 100 );
        let cubeMaterial = new THREE.MeshLambertMaterial({color : colour, flatShading: THREE.FlatShading});
        let shape = new THREE.Mesh(cubeGeometry, cubeMaterial);
        shape.castShadow = true;
        shape.receiveShadow = true;
        shape.position.x = x;
        shape.position.z = z;

        let tl = new TimelineMax({repeat: -1 ,repeatDelay:0.5});
        tl.to(shape.scale, 0.5, {x: 2, ease: Expo.easeOut});
        tl.to(shape.scale, 0.5, {z: 2, ease: Expo.easeOut});
        tl.to(shape.scale, 1, {y: 2, ease: Elastic.easeOut});
        tl.to(shape.scale, 0.7, {z: 1,x:1,y:1, ease: Expo.easeOut});
        tl.to(shape.rotation, 0.7, {y:-Math.PI, ease: Elastic.easeOut},"=-0.7");
        group.add(shape);

    }

    {
    createCube(500, 250, myArray, '#64DFDF');
    createCube(250, 500, myArray, '#64DFDF');
    createCube(0, 500, myArray, '#64DFDF');
    createCube(500, 0, myArray, '#64DFDF');
    createCube(250, 250, myArray, '#56CFE1');
    createCube(250, -250, myArray, '#4EA8DE');
    createCube(-250, 250, myArray, '#4EA8DE');
    createCube(250, 0, myArray, '#56CFE1');
    createCube(0, 250, myArray, '#56CFE1');
    createCube(0, 0, myArray, '#4EA8DE');
    createCube(-250, 0, myArray, '#4EA8DE');
    createCube(0, -250, myArray, '#4EA8DE');
    createCube(-250, -250, myArray, '#48BFE3');
    createCube(0, -500, myArray, '#5E60CE');
    createCube(-500, 0, myArray, '#5E60CE');
    createCube(-250, -500, myArray, '#5E60CE');
    createCube(-500, -250, myArray, '#5E60CE');
    createCube(-500, -500, myArray, '#6930C3');
    createCube(-750, -250, myArray, '#6930C3');
    createCube(-250, -750, myArray, '#6930C3');
    createCube(-500, -750, myArray, '#6930C3');
    createCube(-750, -500, myArray, '#6930C3');
    createCube(-750, -750, myArray, '#7400B8');
    createCube(-1000, -250, myArray, '#6930C3');
    createCube(-1000, -500, myArray, '#7400B8');
    createCube(-1000, -750, myArray, '#7400B8');
    createCube(-250, -1000, myArray, '#6930C3');
    createCube(-500, -1000, myArray, '#7400B8');
    createCube(-750, -1000, myArray, '#7400B8');
    createCube(-1000, -1000, myArray, '#7400B8');
    createCube(-1250, -250, myArray, '#7400B8');
    createCube(-1250, -500, myArray, '#7400B8');
    createCube(-1250, -750, myArray, '#7400B8');
    createCube(-1250, -1000, myArray, '#7400B8');
    createCube(-250, -1250, myArray, '#7400B8');
    createCube(-500, -1250, myArray, '#7400B8');
    createCube(-750, -1250, myArray, '#7400B8');
    createCube(-1000, -1250, myArray, '#7400B8');
    createCube(-1250, -1250, myArray, '#7400B8');
    createCube(-1500, -500, myArray, '#7400B8');
    createCube(-1500, -750, myArray, '#7400B8');
    createCube(-1500, -1000, myArray, '#7400B8');
    createCube(-500, -1500, myArray, '#7400B8');
    createCube(-750, -1500, myArray, '#7400B8');
    createCube(-1000, -1500, myArray, '#7400B8');
    }
    createMusicFrame(scene, cubesRenderTarget, -100, 70, -500, './Objects/music/cello_suit1.mp3', 5, 70, 90);

}

function bubblesFrame(scene){
    const rtWidth = 700;
    const rtHeight = 900;
    bubblesRenderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
    
    const aspectRatio = rtWidth / rtHeight,
        fieldOfView = 45,
        nearPlane = .01,
        farPlane = 10000; 
    bubblesCamera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane);

    bubblesCamera.lookAt(new THREE.Vector3(1,1,1));

    bubblesScene = new THREE.Scene();

    // camera
    bubblesCamera.position.z = 3;
    bubblesCamera.focalLength = 5;
    bubblesCamera.updateProjectionMatrix();
    bubblesCamera.lookAt(bubblesScene.position);
    const path = "./js/assets/blue/";
    const format = '.png';
    const urls = [
        path + 'blue_left' + format, path + 'blue_right' + format,
        path + 'blue_front' + format, path + 'blue_back' + format,
        path + 'blue_down' + format, path + 'back' + format,

    ];

    const textureCube = new THREE.CubeTextureLoader().load( urls );

    bubblesScene.background = textureCube;

    const geometry = new THREE.SphereBufferGeometry( 0.1, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );

    for ( let i = 0; i < 500; i ++ ) {

        const mesh = new THREE.Mesh( geometry, material );

        mesh.position.x = Math.random() * 5 - 3;
        mesh.position.y = Math.random() * 5 - 3;
        mesh.position.z = Math.random() * 5 - 3;

        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

        bubblesScene.add( mesh );

        spheres.push( mesh );

    }

    createMusicFrame(scene, bubblesRenderTarget, 100, 70, -500, './Objects/music/bubbles.mp3', 1, 130, 90);

}

function tunnelFrame(scene){

    const rtWidth = 512;
    const rtHeight = 700;
    tunnelRenderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
    
    const aspectRatio = rtWidth / rtHeight,
        fieldOfView = 45,
        nearPlane = .01,
        farPlane = 10000; 
    tunnelCamera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane);
    tunnelCamera.position.z = 3.5;

    tunnelScene = new THREE.Scene();

    const tunnelGeometry = new THREE.PlaneBufferGeometry( 2, 2 );

    uniforms = {
        time: { value: 1.0 }
    };

    const tunnelMaterial = new THREE.ShaderMaterial( {

        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent

    } );

    const mesh = new THREE.Mesh( tunnelGeometry, tunnelMaterial );
    tunnelScene.add( mesh );

    createMusicFrame(scene, tunnelRenderTarget, 300, 70, -500, './Objects/music/tunnel.wav', 2.5, 90, 120);
};

function createFrame(scene, riverRenderTarget, x, y, z, xSize, ySize)
{    
    const geometry = new THREE.PlaneGeometry( xSize, ySize, 32 );
    
    const material = new THREE.MeshPhongMaterial({
        map: riverRenderTarget.texture,
        side: THREE.DoubleSide
    });
    frame = new THREE.Mesh(geometry, material);
    frame.position.x = x;
    frame.position.y = y;
    frame.position.z = z;

    scene.add(frame);
}
function createMusicFrame(scene, riverRenderTarget, x, y, z, songRoute, volume, xSize, ySize)
{    
    const geometry = new THREE.PlaneGeometry( xSize, ySize, 32 );
    
    const material = new THREE.MeshPhongMaterial({
        map: riverRenderTarget.texture,
        side: THREE.DoubleSide
    });
    const listener = new THREE.AudioListener();
    camera.add( listener );
    let sound = new THREE.PositionalAudio( listener );
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( songRoute, function( buffer ) {
        sound.setBuffer( buffer );
        sound.setRefDistance( .2 );
        sound.setLoop(true);
        sound.setVolume(volume);
        sound.play();
    }); 

    sounds.push(sound)
    frame = new THREE.Mesh(geometry, material);
    frame.position.x = x;
    frame.position.y = y;
    frame.position.z = z;

    frame.add( sound );

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
        let model = gltf.scene
        model.scale.set(scale,scale,scale) // scale here
        model.position.x = x; // once rescaled, position the model where needed
        model.position.z = z;
        model.position.y = y; // once rescaled, position the model where needed
        models.push(model);
        scene.add(model);

    }, undefined, function ( error ) {

        console.error( error );

    } );
    console.log(models);
}


function createScene(canvas) 
{    
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.addEventListener( 'resize', onWindowResize, false );

    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.y = 60;
    camera.position.z = -200;


    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    let light = new THREE.AmbientLight(0xffffff, 1);
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff, .3 );
    light.position.set( 0, 1000, 0 );
    scene.add( light );

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    // floor
    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(32, 32);

    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    let floor = new THREE.Mesh(floorGeometry, new THREE.MeshStandardMaterial({color:0xffffff, map:map, side:THREE.DoubleSide, roughness: 0, metalness: 0}));
    floor.rotation.x = -Math.PI / 2;
    scene.add( floor );
    
    // Frames
    cubesFrame(scene);
    createRiverFrame(scene);
    bubblesFrame(scene);
    tunnelFrame(scene);

    // Creating walls
    createWalls(scene);

    let eiffel= createMTLObject('./Objects/eiffel.mtl','./Objects/eiffel.obj',-250,33,450,2);
    let streets = createObjectGLTF('./Objects/cafeteria.glb',-430,0,325,1.5);
    let humano = createMTLObject('./Objects/Human/Object/human.mtl','./Objects/Human/Object/human.obj',400,0.1,425,0.5);
    let cubicle = createObjectGLTF('./Objects/cubicle.glb',400,0.1,490,70);
    let pTriangule = createObjectGLTF('./Objects/penrosetriangule.glb',150,0.1,375,1.5);

    createObjectGLTF('./Objects/obj5/scene.gltf', 100, 30, -100, 1);
    createObjectGLTF('./Objects/obj2/scene.gltf', -150, 50, -100, 5);
    createObjectGLTF('./Objects/obj3/scene.gltf', -100, 50, -100, 0.5);
    createObjectGLTF('./Objects/op1/scene.gltf', 10, 100, -100, 2);
    createObjectGLTF('./Objects/Dino/scene.gltf', 10, 20, 100, 4);
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
    if (models[0]) models[0].rotation.x += 0.01;
    if (models[1]) models[1].rotation.x += 0.04;
    if (models[2]){
        console.log("right", right, "left", left)
        if(right){
            models[2].rotation.y += 0.02;
            if(models[2].rotation.y  > 2.5){
                right = false;
                left = true;
            }
        }
        else if(left){
            models[2].rotation.y -= 0.02;
            if(models[2].rotation.y < 1){
                left = false;
                right = true;
            }
        }
        console.log(models[2].rotation.y);
        
    } 
    if (models[3]) models[3].rotation.x += 0.09;
    if (models[4]) models[4].rotation.x += 0.1;
    if ( controls.isLocked === true ) 
    {
        // for every sound in the frames
        if(paused){
            sounds.forEach(sound => {
                sound.play();
            });
            paused = false
        }
        let time = performance.now();
        let delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 2 * delta;
        velocity.z -= velocity.z * 2 * delta;

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
            drops[i].update();
            if(drops[i].lifespan<0){
                riverFrameScene.remove(riverFrameScene.getObjectById(drops[i].drop.id));
                drops.splice(i,1);
            }
        }
        // bubbles motion
        for ( let i = 0, il = spheres.length; i < il; i ++ ) {

            const sphere = spheres[ i ];

            sphere.position.x = 3 * Math.cos( time/3000 + i );
            sphere.position.y = 3 * Math.sin( time/3000 + i * 1.1 );

        }
        //shader
        uniforms[ 'time' ].value = performance.now() / 1000;

    }
    else{
        sounds.forEach(sound => {
            sound.pause();
        });
        paused = true;
    }
    //  draw render target scene to render target

    // River frame render target scene to render targeth
    renderer.setRenderTarget(riverRenderTarget);
    renderer.render(riverFrameScene, riverFrameCamera);
    renderer.setRenderTarget(null);

    // Cubes frame render target scene to render targeth
    renderer.setRenderTarget(cubesRenderTarget);
    renderer.render(cubesScene, cubesCamera);
    renderer.setRenderTarget(null);

    // Bubbles frame render target scene to render targeth
    renderer.setRenderTarget(bubblesRenderTarget);
    renderer.render(bubblesScene, bubblesCamera);
    renderer.setRenderTarget(null);

    // Tunnel frame render target scene to render targeth
    renderer.setRenderTarget(tunnelRenderTarget);
    renderer.render(tunnelScene, tunnelCamera);
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