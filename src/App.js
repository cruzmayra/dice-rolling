import React from 'react'
import './App.css'
import * as CANNON from 'cannon';
import * as THREE from 'three'
// import { Stats } from 'three-stats';
// import { DiceD6, DiceManager } from 'threejs-dice';
import {DiceD6Custom, DiceManager} from './helpers/customCube'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      colors: ['#F7819F', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'],
      faceTexts: [
        [' ', '0', 'Transparencia', 'Improvement', 'Durabilidad', 'Transformación', 'Aptitud térmica', 'Conversación', '7', '8','9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
        [' ', '0', 'Portabilidad', 'Extensión de uso', 'Estética', 'Ludicidad', 'Almacenabilidad', '---', '7', '8','9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
      ],
      diceNumber: 2,
      dice: []
    }
  }
  
  componentDidMount() {
    this.sceneSetup()
    this.buildSceneObjects()
    this.worldSetup()
    this.animate()
    window.addEventListener('keydown', this.handleThrow);
  }

  componentWillMount() {
    window.removeEventListener('keydown', this.handleThrow)
  }

  sceneSetup = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.01, 20000 );
    this.scene.add(this.camera);
    this.camera.position.set(0, 40, 10);
	  this.camera.rotation.x = -1.35;

    this.renderer = new THREE.WebGLRenderer( {antialias:true} );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.el.appendChild( this.renderer.domElement );
  }

  buildSceneObjects = () => {
    const ambient = new THREE.AmbientLight('#ffffff', 0.3);

    const directionalLight = new THREE.DirectionalLight('#ffffff', 0.5);
    directionalLight.position.x = -1000;
    directionalLight.position.y = 1000;
    directionalLight.position.z = 1000;

    const light = new THREE.SpotLight(0xefdfd5, 0.6);
    light.position.y = 100;
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.camera.near = 50;
    light.shadow.camera.far = 110;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    const floorMaterial = new THREE.MeshPhongMaterial( { color: 0xF6E3CE, side: THREE.DoubleSide } );
    const floorGeometry = new THREE.PlaneGeometry(30, 30, 10, 10);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow  = true;
    floor.rotation.x = Math.PI / 2;

    // const wallMaterial = new THREE.MeshBasicMaterial({ color: '#222222', side: THREE.DoubleSide, transparent: true });
    const wallMaterial = new THREE.MeshPhongMaterial( { 
      side: THREE.DoubleSide,
      color: 0xCCCCCC, 
      transparent: true, 
      opacity: 0.25,
      depthWrite: false
    } )
    const wallGeometry = new THREE.PlaneGeometry(30, 5, 10, 10);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.receiveShadow = true;
    wall.rotation.y = Math.PI / 2;
    wall.translateZ(15);
    wall.translateY(2.5);
    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall2.receiveShadow = true;
    wall2.translateZ(15);
    wall2.translateY(2.5);

    // SKYBOX/FOG
    const skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
    const skyBoxMaterial = new THREE.MeshPhongMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    const skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    this.scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
    
    this.scene.add( ambient,directionalLight,light,floor,skyBox,wall, wall2 );
  }

  // Setup your cannonjs world
  worldSetup = () => {   
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82 * 20, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 16;
    
    DiceManager.setWorld(this.world);

    // Floor
    const floorBody = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: DiceManager.floorBodyMaterial});
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.add(floorBody);

    const wallShape = new CANNON.Box(new CANNON.Vec3(2, 5, 30));
    const wallBody = new CANNON.Body({ mass: 0 });
    wallBody.addShape(wallShape);
    wallBody.position.set(17, 0, 0);
    this.world.addBody(wallBody);

    const wallShape2 = new CANNON.Box(new CANNON.Vec3(30, 5, 2));
    const wallBody2 = new CANNON.Body({ mass: 0 });
    wallBody2.addShape(wallShape2);
    wallBody2.position.set(0, 0, 17);
    this.world.addBody(wallBody2);

    // Dices
    const { colors, faceTexts, diceNumber } = this.state
    let dice = []
    for (let i = 0; i < diceNumber; i++) {
      let die = new DiceD6Custom({
        size: 4, 
        backColor: colors[i],
        faceTexts: faceTexts[i]
      });
      this.scene.add(die.getObject());
      dice.push(die);
      this.setState({
        dice
      })
    }
  }

  animate = () => {
    this.updatePhysics();
    this.renderScene();
    window.requestAnimationFrame( this.animate );
  }

  updatePhysics = () => {
    const { dice } = this.state
    this.world.step(1.0 / 30.0);
    for (var i in dice) {
        dice[i].updateMeshFromBody();
    }
  }

  renderScene = () => {
    this.renderer.render( this.scene, this.camera );
  }

  handleThrow = (e) => {
     if( e.keyCode === 32) {
       this.randomDiceThrow()
     } else {
       return
     }
  }

  randomDiceThrow = () => {
    const { dice } = this.state
    let diceValues = [];
    for (let i = 0; i < dice.length; i++) {
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
  }

  render () {
    return (
      <div className="App" ref={ref => (this.el = ref)}></div>
    )
  }
}

export default App;
