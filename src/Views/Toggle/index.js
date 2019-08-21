import React from 'react'
import * as CANNON from 'cannon';
import * as THREE from 'three'
import {DiceD6Custom, DiceManager} from './../../helpers/customCube'

class Toggle extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      layers: [],
      dice: []
    }
  }

  componentDidMount () {
    this.setState({
      layers: [
        {id: 'producto', color: '#ff2164', faceText: [' ', '0', 'Transparencia', 'Improvement', 'Durabilidad', 'Transformación', 'Amplitud térmica', 'Conversación']},
        {id:'consumidor', color: '#ffdb00', faceText: [' ', '0', 'Portabilidad', 'Extensión de uso', 'Estética', 'Ludicidad', 'Almacenabilidad', '🤡']},
        {id:'sociedad', color: '#0686cf', faceText: [' ', '0', 'Alianzas', '🤡', 'Beneficios sociales', '🤡', '🤡', '🤡']},
        {id:'planeta', color: '#70a83b', faceText: [' ', '0', 'Reutilización - Reciclabilidad', '🤡', '🤡', 'Impacto en el ecosistema', '🤡', '🤡']}
      ]
    })

    this.sceneSetup()
    this.buildSceneObjects()
    this.worldSetup()
    this.animate()
    window.addEventListener('keydown', this.handleThrow);
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
    let container = document.getElementById( 'toggle' );
    container.appendChild( this.renderer.domElement );
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
    const floorGeometry = new THREE.PlaneGeometry(50, 30, 10, 10);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow  = true;
    floor.rotation.x = Math.PI / 2;

    const wallMaterial = new THREE.MeshPhongMaterial( { 
      side: THREE.DoubleSide,
      color: 0xCCCCCC, 
      transparent: true, 
      opacity: 0.25,
      depthWrite: false
    } )

    const wallGeometry1 = new THREE.PlaneGeometry(50, 20, 10, 15);
    const wallGeometry2 = new THREE.PlaneGeometry(30, 20, 10, 15);
    const wallGeometry3 = new THREE.PlaneGeometry(50, 20, 10, 15);
    const wallGeometry4 = new THREE.PlaneGeometry(30, 20, 10, 15);
    
    const wall1 = new THREE.Mesh(wallGeometry1, wallMaterial);
    wall1.receiveShadow = true;
    wall1.translateZ(-15);
    wall1.translateY(2);

    const wall2 = new THREE.Mesh(wallGeometry2, wallMaterial);
    wall2.receiveShadow = true;
    wall2.rotation.y = Math.PI / 2;
    wall2.translateZ(25);
    wall2.translateY(2.5);

    const wall3 = new THREE.Mesh(wallGeometry3, wallMaterial);
    wall3.receiveShadow = true;
    wall3.translateZ(15);
    wall3.translateY(2.5);

    const wall4 = new THREE.Mesh(wallGeometry4, wallMaterial);
    wall4.receiveShadow = true;
    wall4.rotation.y = Math.PI / 2;
    wall4.translateZ(-25);
    wall4.translateY(2.5);

    // SKYBOX/FOG
    const skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
    const skyBoxMaterial = new THREE.MeshPhongMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    const skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    this.scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
    
    this.scene.add( ambient,directionalLight,light,floor,skyBox,wall1, wall2, wall3, wall4 );
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

    const wallShape1 = new CANNON.Box(new CANNON.Vec3(50, 20, 2));
    const wallBody1 = new CANNON.Body({ mass: 0 });
    wallBody1.addShape(wallShape1);
    wallBody1.position.set(0, 0, -17);
    this.world.addBody(wallBody1);

    const wallShape2 = new CANNON.Box(new CANNON.Vec3(2, 20, 30));
    const wallBody2 = new CANNON.Body({ mass: 0 });
    wallBody2.addShape(wallShape2);
    wallBody2.position.set(27, 0, 0);
    this.world.addBody(wallBody2);

    const wallShape3 = new CANNON.Box(new CANNON.Vec3(50, 20, 2));
    const wallBody3 = new CANNON.Body({ mass: 0 });
    wallBody3.addShape(wallShape3);
    wallBody3.position.set(0, 0, 17);
    this.world.addBody(wallBody3);

    const wallShape4 = new CANNON.Box(new CANNON.Vec3(2, 20, 30));
    const wallBody4 = new CANNON.Body({ mass: 0 });
    wallBody4.addShape(wallShape4);
    wallBody4.position.set(-27, 0, 0);
    this.world.addBody(wallBody4);
  }

  animate = () => {
    this.updatePhysics();
    this.renderer.render( this.scene, this.camera )
    window.requestAnimationFrame( this.animate );
  }

  updatePhysics = () => {
    const { dice } = this.state
    this.world.step(1.0 / 50.0);
    for (var i in dice) {
      dice[i].updateMeshFromBody();
    }
  }

  handleThrow = (e) => {
    switch (e.keyCode) {
      case 32:
        this.randomDiceThrow()
      break
      case 37:
        this.validateDice('#ff2164')
      break
      case 38:
        this.validateDice('#ffdb00')
      break
      case 39:
        this.validateDice('#0686cf')
      break
      case 40:
        this.validateDice('#70a83b')
      break
      default:
      break
    }
  }

  validateDice = (color) => {
    const { dice } = this.state
    let filtro = dice.filter(d => {
      return d['diceColor'] === color
    })
    let indx = dice.indexOf(filtro[0])

    if (filtro.length === 0) {
      this.singleDiceSetup(color)
    } else {
      this.singleDiceRemove(indx)
    }
  }

  singleDiceSetup = (color) => {
    const { layers, dice } = this.state
    let layer = layers.filter(layer => {
      return layer.color === color
    })

    let die = new DiceD6Custom({
      size: 4,
      backColor: layer[0].color,
      faceTexts: layer[0].faceText
    })

    this.scene.add(die.getObject());
    this.setState({
      dice: [...dice,die]
    })

    this.updatePhysics()
  }

  singleDiceRemove = ( indx ) => {
    const { dice } = this.state
    this.scene.remove(dice[indx].getObject())
    dice.splice(indx, 1)
    this.setState({
      dice
    })
    this.updatePhysics();
  }

  randomDiceThrow = () => {
    const { dice } = this.state
    let diceValues = [];
    if(!dice) {
      return
    } else {
      for (let i = 0; i < dice.length; i++) {
        let yRand = Math.random() * 20
        dice[i].getObject().position.x = -15 - (i % 3) * 1.5;
        dice[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.5;
        dice[i].getObject().position.z = -10 + (i % 3) * 1.5;
        dice[i].getObject().quaternion.x = (Math.random()*90-45) * Math.PI / 180;
        dice[i].getObject().quaternion.z = (Math.random()*90-45) * Math.PI / 180;
        dice[i].updateBodyFromMesh();
        let rand = Math.random() * 5;
        dice[i].getObject().body.velocity.set(25 + rand, 40 + yRand, 15 + rand);
        dice[i].getObject().body.angularVelocity.set(20 * Math.random() -10, 20 * Math.random() -10, 20 * Math.random() -10);
        diceValues.push({dice: dice[i], value: i + 1});
      }
    }
  }

  render () {
    return (
      <section id="toggle" ref={ref => (this.el = ref)}></section>
    )
  }
}

export default Toggle