import {Component, OnInit} from '@angular/core';
import * as THREE from 'three';
import { ColladaLoader } from '../libs/Colladaloader';
import { OrbitControls} from '../libs/OrbitControls';
import { MTLLoader } from '../libs/MTLLoader';
import { OBJLoader } from '../libs/OBJLoader';
import { StandardFrame } from '../Model/StandardFrame';
import {TestBlock, TestBlockType} from '../Model/TestBlock';

@Component({
  selector: 'app-three-test',
  templateUrl: './three-test.component.html',
  styleUrls: ['./three-test.component.css']
})


// @ts-ignore
export class ThreeTestComponent implements  OnInit {

  blockTypes = ['100mm',
    '150mm',
    'cylinder'];
  scene = null;
  camera = null;
  renderer = null;
  control = null;
  frame = null;
  frameNumber = null;
  frameOffsetX = null;
  frameOffsetZ = null;
  cube = null
  blockType = null;
  blockLayer = null;
  blockIndex = null;
  frameNumberAdb = null;
  frameModels = new Array<StandardFrame>();
constructor() {
  }

  ngOnInit() {
    this.initGL();
    this.setControl();
    this.loadFrame('assets/framework.mtl', 'assets/framework.obj', 'assets/');
    this.loadCube('assets/block.mtl', 'assets/block.obj', 'assets/');
    this.animate();
  }

  initGL(): void {
    console.log('执行了')
    const container = document.getElementById('container')
    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera = new THREE.PerspectiveCamera(45, 1920 / 1080, 0.1, 2000)
    this.camera.position.set(0, 80, 80)
    this.camera.lookAt(0, -1, -1)
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xffffff)
    const al = new THREE.AmbientLight();
    al.color = new THREE.Color(0xffffe0);
    const keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0)
    keyLight.position.set(-100, 0, 100)

    const fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75)
    fillLight.position.set(100, 0, 100)

    const backLight = new THREE.DirectionalLight(0x404040, 1.0)
    backLight.position.set(100, 0, -100).normalize()
    const helper = new THREE.GridHelper(1200, 60, 0xFF4444, 0x404040)
    this.scene.add(helper);
    this.scene.add(al);
    // this.scene.add(keyLight);
    // this.scene.add(fillLight);
    // this.scene.add(backLight);
    container.appendChild(this.renderer.domElement);
  }


  loadFrame(mtlPath, objPath, texturePath): void {
    const ml = new MTLLoader();
     ml.setTexturePath(texturePath)
    const led = ( obj ) => {
      this.frame = obj;
      };
    ml.load(mtlPath, function (materials) {
      materials.preload();
      materials.materialsArray.forEach((v, i , a ) => {
        v.flatShading = true;
        v.opacity = 1;
        v.transparent = false;
      })
      const ol = new OBJLoader()
      ol.setMaterials(materials)
      ol.load(objPath, led);
    });
  }

  loadCube(mtlPath, objPath, texturePath): void {
    const ml = new MTLLoader();
    ml.setTexturePath(texturePath)
    const led = ( obj ) => {
      obj.scale.set(0.7, 0.7, 0.7);
      this.cube = obj;
    };
    ml.load(mtlPath, function (materials) {
      materials.preload();
      materials.materialsArray.forEach((v, i , a ) => {
        v.flatShading = true;
        v.opacity = 1;
        v.transparent = false;
      })
      const ol = new OBJLoader()
      ol.setMaterials(materials)
      ol.load(objPath, led);
    });
  }
  setControl() {
    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    // 控制焦点
    this.control.target = new THREE.Vector3(0, 0, 0);
    // 将自动旋转关闭
    this.control.autoRotate = false;
    this.control.enabled = true;
    this.control.enableRotate = true;
    this.control.enableZoom = true;
  }
  animate () {
    const ud = () => {
      requestAnimationFrame( ud);
      this.control.update();
      this.renderer.render( this.scene, this.camera );
    };
    ud();
  }

  addFrame() {
      this.frame.rotateY(- Math.PI / 2)
      const frame = this.frame.clone();
      const model = new StandardFrame();
      model.Number = this.frameNumber;
      model.OffsetX = this.frameOffsetX;
      model.OffsetZ = this.frameOffsetZ;
      model.FrameObj3D = frame;
      frame.position.set(this.frameOffsetX, 0, this.frameOffsetZ);
      this.frameModels.push(model);
      this.scene.add(frame);
      console.log('添加了编号' +  this.frameNumber);
  }

  addTestBlock() {
    console.log('添加了试块' + this.frameNumberAdb)
    console.log('添加了试块' + this.blockIndex)
    console.log('添加了试块' + this.blockType)
    console.log('添加了试块' + this.blockLayer);
    const block = this.cube.clone();
    block.translateX(-7);
    block.translateY(7);
    block.translateZ(-4);
    // // block.scale.set(100,  100, 100)
    const model = new TestBlock();
    model.Index = this.blockIndex;
    model.Type = this.blockType;
    model.Layer = this.blockLayer;
    model.Obj3D = block;
    this.frameModels.forEach((value, index, obj) => {
      console.log('发现标养架' + value.Number);
      if (value.Number === this.frameNumberAdb) {
        console.log('试块加入到' + value.Number);
        value.FrameObj3D.add(block);
      }
    });
  }
}
