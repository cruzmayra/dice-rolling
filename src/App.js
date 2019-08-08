import React from 'react'
import './App.css'
import * as CANNON from 'cannon';
import * as THREE from 'three'
// import { Stats } from 'three-stats';
import { DiceD6, DiceManager } from 'threejs-dice';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      colors: ['#F7819F', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'],
      diceNumber: 2,
      dice: []
    }
  }
  componentDidMount() {
    this.sceneSetup()
    this.buildSceneObjects()
    this.setupWorld()
    this.animate()
    window.addEventListener('keydown', this.handleThrow);
  }

  componentWillMount() {
    window.removeEventListener('keydown', this.handleThrow)
  }

  sceneSetup = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 20000 );
    this.scene.add(this.camera);
    this.camera.position.set(10, 50, 30);
	  this.camera.rotation.x = -0.95;

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

    const light = new THREE.SpotLight(0xefdfd5, 1.3);
    light.position.y = 100;
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.camera.near = 50;
    light.shadow.camera.far = 110;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    const floorMaterial = new THREE.MeshPhongMaterial( { color: '#F6E3CE', side: THREE.DoubleSide } );
    const floorGeometry = new THREE.PlaneGeometry(30, 30, 30, 30);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow  = true;
    floor.rotation.x = Math.PI / 2;

    // SKYBOX/FOG
    const skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
    const skyBoxMaterial = new THREE.MeshPhongMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    const skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    this.scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
    
    this.scene.add( ambient,directionalLight,light,floor,skyBox );
  }

  // Setup your cannonjs world
  setupWorld = () => {   
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82 * 20, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 16;
    
    DiceManager.setWorld(this.world);

    // Floor
    const floorBody = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: DiceManager.floorBodyMaterial});
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.add(floorBody);

    // Dices
    const { colors,diceNumber } = this.state
    let dice = []
    for (let i = 0; i < diceNumber; i++) {
      let die = new DiceD6({size: 1.5, backColor: colors[i]});
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
    this.world.step(1.0 / 60.0);
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
