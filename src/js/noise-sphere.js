
import Clock from './clock';
import { throttle, debounce } from './throttle';
import * as THREE from 'three';
import noise from "./noise";
import Inertia from './inertia';

import Bezier from "./bezier";

var TimingFunctions = {
    ease: Bezier(.25, .1, .25, 1),
    easeIn: Bezier(.42, 0, 1, 1),
    easeOut: Bezier(0, 0, .58, 1),
    easeInOut: Bezier(.42, 0, .58, 1)
}

const ease = TimingFunctions.easeInOut

const interpolate = (low, high, percentage) => high * percentage + low * (1 - percentage);

function lights() {
    const L1 = new THREE.PointLight(0xffffff, 0.6);
    L1.position.z = 100;
    L1.position.y = 100;
    L1.position.x = 100;

    const L2 = new THREE.PointLight(0xffffff, 0.4);
    L2.position.z = 200;
    L2.position.y = 50;
    L2.position.x = -100;

    return [L1, L2]
}

function NoiseSphere(element) {
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    var camera = new THREE.PerspectiveCamera(75, element.getBoundingClientRect().width / element.getBoundingClientRect().height, 0.1, 10000);
    var scene = new THREE.Scene();

    var ro = new ResizeObserver(entries => {
        for (let entry of entries) {
            const cr = entry.contentRect;
            camera.aspect = cr.width / cr.height;
            camera.updateProjectionMatrix();
            renderer.setSize(cr.width, cr.height);
        }
    });

    ro.observe(element);

    scene.background = new THREE.Color("rgb(10, 27, 45)");

    scene.add(camera);
    renderer.setSize(element.getBoundingClientRect().width, element.getBoundingClientRect().height);
    element.appendChild(renderer.domElement);

    const cameraPositionRange = {
        x: [0, -100],
        y: [0, 0],
        z: [220, 100]
    }

    const fovRange = [75, 50];
    const opacityRange = [1, .5];

    camera.position.x = cameraPositionRange.x[0];
    camera.position.y = cameraPositionRange.y[0];
    camera.position.z = cameraPositionRange.z[0];

    const scrollDist = 500;

    const scrollHandler = (event) => {
        const y = window.scrollY;

        if (y >= scrollDist) {
            camera.position.x = cameraPositionRange.x[1];
            camera.position.y = cameraPositionRange.y[1];
            camera.position.z = cameraPositionRange.z[1];

            renderer.domElement.style.opacity = opacityRange[1];

            camera.fov = fovRange[1];
            camera.updateProjectionMatrix();
        } else {
            const scrollPercentage = y / scrollDist;

            camera.position.x = interpolate(...cameraPositionRange.x, ease(scrollPercentage));
            camera.position.y = interpolate(...cameraPositionRange.y, ease(scrollPercentage));
            camera.position.z = interpolate(...cameraPositionRange.z, ease(scrollPercentage));

            renderer.domElement.style.opacity = interpolate(...opacityRange, ease(scrollPercentage));

            camera.fov = interpolate(...fovRange, ease(scrollPercentage));

            camera.updateProjectionMatrix();
        }
    }

    // document.addEventListener("scroll", scrollHandler);

    lights().forEach(L => camera.add(L));

    const group = new THREE.Group();

    var geometry = new THREE.IcosahedronGeometry(90, 3);

    const position = geometry.attributes.position;
    const vector = new THREE.Vector3();

    const originalVectors = []

    for (let i = 0, l = position.count; i < l; i++) {
        vector.fromBufferAttribute(position, i);
        const { x, y, z } = vector;
        originalVectors.push({ x, y, z });
    }

    const scaleRange = [0.15, 0.3];
    const speedRange = [.5, .75];

    const scale = new Inertia(scaleRange[0], .1);
    const speed = new Inertia(speedRange[0], .1);

    var mouseDown = 0;
    var mouseDistPercentage = 0;

    document.body.onmousedown = function () {
        ++mouseDown;

        const newSpeed = interpolate(...speedRange, mouseDistPercentage);
        const newScale = interpolate(...scaleRange, mouseDistPercentage);

        scale.set(mouseDown ? newScale * 1.25 : newScale);
        speed.set(mouseDown ? newSpeed * 4 : newSpeed);
    }

    document.body.onmouseup = function () {
        --mouseDown;

        const newSpeed = interpolate(...speedRange, mouseDistPercentage);
        const newScale = interpolate(...scaleRange, mouseDistPercentage);

        scale.set(mouseDown ? newScale * 1.25 : newScale);
        speed.set(mouseDown ? newSpeed * 4 : newSpeed);
    }

    function updateBlob(a) {
        for (let i = 0, l = position.count; i < l; i++) {
            var { x, y, z } = originalVectors[i];

            const perlin = noise.simplex3(
                (x * 0.01) + (a * 0.0003),
                (y * 0.01) + (a * 0.0003),
                (z * 0.01)
            );

            const ratio = (perlin * scale.value) + 1
            const newVector = new THREE.Vector3(x, y, z)
            newVector.multiplyScalar(ratio);

            var { x, y, z } = newVector;

            position.setXYZ(i, x, y, z);
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    const lineMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgba(135, 117, 0, .5)"),
        wireframe: true
    });

    const meshMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgb(226, 124, 35)"),
        emissive: new THREE.Color("rgb(219, 182, 20)"),
        specular: new THREE.Color("rgb(255,155,255)"),
        polygonOffset: true,
        polygonOffsetFactor: 10,
        side: THREE.DoubleSide,
        flatShading: true,
        shininess: 5
    });

    group.add(new THREE.LineSegments(geometry, lineMaterial));
    group.add(new THREE.Mesh(geometry, meshMaterial));

    scene.add(group);

    const angle = {
        x: new Inertia(0),
        y: new Inertia(0)
    }

    document.addEventListener('mousemove', throttle(function (event) {
        const mouse = {
            x: event.pageX,
            y: event.pageY
        };

        const size = {
            x: renderer.domElement.width,
            y: renderer.domElement.height
        }

        const elOffset = {
            x: renderer.domElement.getBoundingClientRect().left,
            y: renderer.domElement.getBoundingClientRect().top
        }

        const offset = {
            x: mouse.x - (elOffset.x + size.x / 2),
            y: mouse.y - (elOffset.y + size.y / 2)
        };

        const vec = new THREE.Vector3();

        vec.set(offset.x, offset.y, 0);

        vec.unproject(camera);

        const newAngle = {
            x: Math.atan((vec.y - group.position.y) / (vec.z - group.position.z)),
            y: Math.atan((vec.x - group.position.x) / (vec.z - group.position.z))
        }

        angle.x.set(newAngle.x);
        angle.y.set(newAngle.y);

        angle = newAngle;

        const length = (x, y) => Math.sqrt(x ** 2 + y ** 2)

        const dist = length(offset.x, offset.y);

        mouseDistPercentage = 1 - Math.min(dist / 800, 1);

        const newSpeed = interpolate(...speedRange, mouseDistPercentage);
        const newScale = interpolate(...scaleRange, mouseDistPercentage);

        scale.set(mouseDown ? newScale * 1.25 : newScale);
        speed.set(mouseDown ? newSpeed * 4 : newSpeed);
    }, 20));

    var time = 0;

    function animate(frames, delta, now) {
        // group.rotation.x += speed.value * delta * angularVelocity.x.value;
        // group.rotation.y += speed.value * delta * angularVelocity.y.value;
        // group.rotation.z += speed.value * delta * angularVelocity.z.value;

        group.rotation.x = angle.x.value;
        group.rotation.y = angle.y.value;

        time += delta * speed.value;

        updateBlob(time);
        renderer.render(scene, camera);
    };

    new Clock(animate, 120).start();
}

export default NoiseSphere;