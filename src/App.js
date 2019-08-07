import React from 'react';
import './App.css';
import * as CANNON from 'cannon';
import * as THREE from 'three';
// import { Stats } from 'three-stats';
import { DiceD6, DiceManager } from 'threejs-dice';

class App extends React.Component {
  componentDidMount() {
    var container, scene, camera, renderer, controls, stats, world, dice = [];

    // Setup your threejs scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 20000 );
    scene.add(camera);
    camera.position.set(10, 50, 30);
	  camera.rotation.x = -0.95;

    renderer = new THREE.WebGLRenderer( {antialias:true} );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container = document.querySelector( '.App' );
    container.appendChild( renderer.domElement );
    
    let ambient = new THREE.AmbientLight('#ffffff', 0.3);
    scene.add(ambient);

    let directionalLight = new THREE.DirectionalLight('#ffffff', 0.5);
    directionalLight.position.x = -1000;
    directionalLight.position.y = 1000;
    directionalLight.position.z = 1000;
    scene.add(directionalLight);
    let light = new THREE.SpotLight(0xefdfd5, 1.3);
    light.position.y = 100;
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.camera.near = 50;
    light.shadow.camera.far = 110;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add(light);
    
    // Setup your cannonjs world
    world = new CANNON.World();
    world.gravity.set(0, -9.82 * 20, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 16;
    // ...
    
    DiceManager.setWorld(world);

    //Floor
    let floorBody = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: DiceManager.floorBodyMaterial});
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.add(floorBody);
    //Walls
    var colors = ['#F7819F', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'];
    for (var i = 0; i < 2; i++) {
        var die = new DiceD6({size: 1.5, backColor: colors[i]});
        scene.add(die.getObject());
        dice.push(die);
    }
    
    function randomDiceThrow() {
      var diceValues = [];
      for (var i = 0; i < dice.length; i++) {
          let yRand = Math.random() * 20
          dice[i].getObject().position.x = -15 - (i % 3) * 1.5;
          dice[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.5;
          dice[i].getObject().position.z = -15 + (i % 3) * 1.5;
          dice[i].getObject().quaternion.x = (Math.random()*90-45) * Math.PI / 180;
          dice[i].getObject().quaternion.z = (Math.random()*90-45) * Math.PI / 180;
          dice[i].updateBodyFromMesh();
          let rand = Math.random() * 5;
          dice[i].getObject().body.velocity.set(25 + rand, 40 + yRand, 15 + rand);
          dice[i].getObject().body.angularVelocity.set(20 * Math.random() -10, 20 * Math.random() -10, 20 * Math.random() -10);
          diceValues.push({dice: dice[i], value: i + 1});
      }
      // DiceManager.prepareValues(diceValues);
    }

    setInterval(randomDiceThrow, 3000);
    randomDiceThrow();
    requestAnimationFrame( animate );

    function animate() {
      updatePhysics();
      render();
      // update();
        requestAnimationFrame( animate );
    }

    function updatePhysics() {
      world.step(1.0 / 60.0);
      for (var i in dice) {
          dice[i].updateMeshFromBody();
      }
    }

    function update(){
      controls.update();
      stats.update();
    }
    
    function render() {
      renderer.render( scene, camera );
    }

  }

  render () {
    return (
      <div className="App"></div>
    )
  }
}

export default App;
