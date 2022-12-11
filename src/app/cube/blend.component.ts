import {
  Component,
  AfterViewInit,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

@Component({
  selector: 'app-blend',
  templateUrl: './blend.component.html',
  styleUrls: ['./blend.component.css'],
})
export class CubeComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  private bigR!: number;
  private bigG!: number;
  private bigB!: number;

  private littleSphereThreeBB!: THREE.Sphere;
  private littleSphereTwoBB!: THREE.Sphere;
  private littleSphereOneBB!: THREE.Sphere;
  private bigSphereBB!: THREE.Sphere;
  private whiteSphereBB!: THREE.Sphere;

  private oneCollisionLock: boolean = false;
  private twoCollisionLock: boolean = false;
  private threeCollisionLock: boolean = false;

  private goUp: boolean = true;

  @Input() public rotationSpeedX: number = 0.01;
  @Input() public rotationSpeedY: number = 0.015;
  @Input() public size: number = 200;
  @Input() public texture: string = '../../assets/map.jpg';

  @Input() public cameraZ: number = 600;
  @Input() public fieldOfView: number = 1;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 1000;

  private camera!: THREE.PerspectiveCamera;
  private getCanvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private whiteSphere: THREE.Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.3),
    new THREE.MeshMatcapMaterial({
      color: new THREE.Color(0xffffff),
    })
  );

  private bigSphere: THREE.Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.5),
    new THREE.MeshLambertMaterial({
      color: new THREE.Color(0xffffff),
      bumpMap: new THREE.TextureLoader().load(this.texture),
      bumpScale: 0.5,
      emissive: new THREE.Color(0x0fff00),
      emissiveIntensity: 0.05,
    })
  );

  private littleSphereOne: THREE.Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.6),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff0000),
    })
  );
  private littleSphereTwo: THREE.Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.6),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00ff00),
    })
  );
  private littleSphereThree: THREE.Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.6),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x0000ff),
    })
  );

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  private createScene() {
    //this.setupSphereColor();
    this.scene = new THREE.Scene();
    //this.scene.background = new THREE.Color(0x000000);

    const skyColor = new THREE.Color('rgb(250,250,250)');
    const groundColor = new THREE.Color('rgb(150,150,150)');
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    light.position.set(0, 5, 15);
    this.scene.add(light);

    this.bigSphere.position.set(0, 2, 0);
    this.bigSphereBB = new THREE.Sphere(this.bigSphere.position, 1.5);

    this.scene.add(this.bigSphere);

    this.whiteSphere.position.set(3, 2, 0);

    this.whiteSphereBB = new THREE.Sphere(this.whiteSphere.position, 0.3);

    this.scene.add(this.whiteSphere);

    this.littleSphereOne.position.set(0, -2.5, 0);
    this.littleSphereOneBB = new THREE.Sphere(
      this.littleSphereOne.position,
      0.6
    );

    this.scene.add(this.littleSphereOne);

    this.littleSphereTwo.position.set(5, -2.5, 0);
    this.littleSphereTwoBB = new THREE.Sphere(
      this.littleSphereTwo.position,
      0.6
    );

    this.scene.add(this.littleSphereTwo);

    this.littleSphereThree.position.set(-5, -2.5, 0);
    this.littleSphereThreeBB = new THREE.Sphere(
      this.littleSphereThree.position,
      0.6
    );

    this.scene.add(this.littleSphereThree);

    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    );
    this.camera.position.z = this.cameraZ;

    //const controls = new OrbitControls(this.camera, this.getCanvas());
    //controls.target.set(0, 0, 0);
    //controls.update();
  }
  private getAspectRatio() {
    return this.getCanvas().clientWidth / this.getCanvas().clientHeight;
  }
  private animateBigSphere() {
    this.littleSphereOneBB.set(this.littleSphereOne.position, 0.6);

    this.littleSphereTwoBB.set(this.littleSphereTwo.position, 0.6);

    this.littleSphereThreeBB.set(this.littleSphereThree.position, 0.6);

    this.bigSphere.rotation.x += this.rotationSpeedX;
    this.bigSphere.rotation.y += this.rotationSpeedY;

    if (this.bigSphere.position.y <= 2.5 && this.goUp) {
      this.bigSphere.position.y += 0.015;
    } else if (this.bigSphere.position.y >= 2) {
      if (this.bigSphere.position.y == 2) {
        this.goUp = true;
      } else {
        this.goUp = false;
      }

      this.bigSphere.position.y -= 0.015;
    }

    this.checkCollision();
  }

  private checkWhite(): Boolean {
    return (
      (<any>this.bigSphere.material).color.r == 1 &&
      (<any>this.bigSphere.material).color.g == 1 &&
      (<any>this.bigSphere.material).color.b == 1
    );
  }

  private checkCollision() {
    if (this.whiteSphereBB.intersectsSphere(this.bigSphereBB)) {
      (<any>this.bigSphere.material).color = new THREE.Color(0xffffff);
      this.twoCollisionLock = false;
      this.threeCollisionLock = false;
      this.oneCollisionLock = false;
    }

    if (this.littleSphereOneBB.intersectsSphere(this.bigSphereBB)) {
      if (!this.oneCollisionLock) {
        console.log(
          (<any>this.bigSphere.material).color,
          new THREE.Color(0xffffff)
        );
        if (this.checkWhite()) {
          (<any>this.bigSphere.material).color = (<any>(
            this.littleSphereOne.material
          )).color;
        } else {
          this.bigR = (<any>this.bigSphere.material).color.r * 255;
          this.bigG = (<any>this.bigSphere.material).color.g * 255;
          this.bigB = (<any>this.bigSphere.material).color.b * 255;

          const lR = (<any>this.littleSphereOne.material).color.r * 255;
          const lG = (<any>this.littleSphereOne.material).color.g * 255;
          const lB = (<any>this.littleSphereOne.material).color.b * 255;

          const newR = this.bigR + lR <= 255 ? this.bigR + lR : 255;

          const newG =
            this.bigG == 255 && this.bigR == 255 ? this.bigG / 2 : this.bigG;

          const newB =
            this.bigB == 255 && this.bigR == 255 ? this.bigB / 2 : this.bigB;

          console.log(this.bigR, this.bigG, this.bigB);
          console.log(newR, newG, newB);

          console.log('rgb(' + newR + ',' + newG + ',' + newB + ')');

          (<any>this.bigSphere.material).color = new THREE.Color(
            'rgb(' +
              Math.round(newR) +
              ',' +
              Math.round(newG) +
              ',' +
              Math.round(newB) +
              ')'
          );
        }

        this.oneCollisionLock = !this.oneCollisionLock;

        this.twoCollisionLock = false;
        this.threeCollisionLock = false;
      }
    }

    if (this.littleSphereTwoBB.intersectsSphere(this.bigSphereBB)) {
      if (!this.twoCollisionLock) {
        if (this.checkWhite()) {
          (<any>this.bigSphere.material).color = (<any>(
            this.littleSphereTwo.material
          )).color;
        } else {
          this.bigR = (<any>this.bigSphere.material).color.r * 255;
          this.bigG = (<any>this.bigSphere.material).color.g * 255;
          this.bigB = (<any>this.bigSphere.material).color.b * 255;

          const lR = (<any>this.littleSphereTwo.material).color.r * 255;
          const lG = (<any>this.littleSphereTwo.material).color.g * 255;
          const lB = (<any>this.littleSphereTwo.material).color.b * 255;

          const newR =
            this.bigR == 255 && this.bigG == 255 ? this.bigR / 2 : this.bigR;

          const newG = this.bigG + lG <= 255 ? this.bigG + lG : 255;

          const newB =
            this.bigB == 255 && this.bigG == 255 ? this.bigB / 2 : this.bigB;

          console.log(this.bigR, this.bigG, this.bigB);
          console.log(newR, newG, newB);

          console.log('rgb(' + newR + ',' + newG + ',' + newB + ')');

          (<any>this.bigSphere.material).color = new THREE.Color(
            'rgb(' +
              Math.round(newR) +
              ',' +
              Math.round(newG) +
              ',' +
              Math.round(newB) +
              ')'
          );
        }

        this.twoCollisionLock = !this.twoCollisionLock;

        this.oneCollisionLock = false;
        this.threeCollisionLock = false;
      }
    }

    if (this.littleSphereThreeBB.intersectsSphere(this.bigSphereBB)) {
      if (!this.threeCollisionLock) {
        if (this.checkWhite()) {
          (<any>this.bigSphere.material).color = (<any>(
            this.littleSphereThree.material
          )).color;
        } else {
          this.bigR = (<any>this.bigSphere.material).color.r * 255;
          this.bigG = (<any>this.bigSphere.material).color.g * 255;
          this.bigB = (<any>this.bigSphere.material).color.b * 255;

          const lR = (<any>this.littleSphereThree.material).color.r * 255;
          const lG = (<any>this.littleSphereThree.material).color.g * 255;
          const lB = (<any>this.littleSphereThree.material).color.b * 255;

          const newR =
            this.bigR == 255 && this.bigB == 255 ? this.bigR / 2 : this.bigR;

          const newG =
            this.bigG == 255 && this.bigB == 255 ? this.bigG / 2 : this.bigG;

          const newB = this.bigB + lB <= 255 ? this.bigB + lB : 255;

          console.log(this.bigR, this.bigG, this.bigB);
          console.log(newR, newG, newB);

          console.log('rgb(' + newR + ',' + newG + ',' + newB + ')');

          (<any>this.bigSphere.material).color = new THREE.Color(
            'rgb(' +
              Math.round(newR) +
              ',' +
              Math.round(newG) +
              ',' +
              Math.round(newB) +
              ')'
          );
        }
        this.threeCollisionLock = !this.threeCollisionLock;

        this.oneCollisionLock = false;
        this.twoCollisionLock = false;
      }
    }

    //console.log((<any>this.bigSphere.material).color);
  }

  private setupSphereColor() {
    (<any>this.bigSphere.material).color.r = 1;
    (<any>this.bigSphere.material).color.g = 1;
    (<any>this.bigSphere.material).color.b = 1;

    (<any>this.littleSphereOne.material).color.r = 1;
    (<any>this.littleSphereOne.material).color.g = 0;
    (<any>this.littleSphereOne.material).color.b = 0;

    (<any>this.littleSphereTwo.material).color.r = 0;
    (<any>this.littleSphereTwo.material).color.g = 1;
    (<any>this.littleSphereTwo.material).color.b = 0;

    (<any>this.littleSphereThree.material).color.r = 0;
    (<any>this.littleSphereThree.material).color.g = 0;
    (<any>this.littleSphereThree.material).color.b = 1;
  }

  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.getCanvas(),
      alpha: true,
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(
      this.getCanvas().clientWidth,
      this.getCanvas().clientHeight
    );

    let component: CubeComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animateBigSphere();
      component.renderer.render(component.scene, component.camera);
    })();
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.createScene();
    this.startRenderingLoop();
    this.addControls();
  }

  private addControls() {
    const littleSpheres = [
      this.littleSphereOne,
      this.littleSphereTwo,
      this.littleSphereThree,
      this.whiteSphere,
    ];
    const controls = new DragControls(
      littleSpheres,
      this.camera,
      this.renderer.domElement
    );
  }
}
