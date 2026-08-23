import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const container = document.getElementById("three-container");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 25;

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(window.devicePixelRatio);

container.appendChild(renderer.domElement);

const particlesGeometry = new THREE.BufferGeometry();

const particleCount = 2500;

const positions = new Float32Array(
    particleCount * 3
);

for(let i = 0; i < particleCount * 3; i++){

    positions[i] = (Math.random() - 0.5) * 100;

}

particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        positions,
        3
    )
);

const particlesMaterial =
new THREE.PointsMaterial({
    color: "#49d6d0",
    size: 0.15,
    transparent: true,
    opacity: 0.8
});

const particles =
new THREE.Points(
    particlesGeometry,
    particlesMaterial
);

scene.add(particles);

function animate(){

    requestAnimationFrame(animate);

    particles.rotation.x += 0.0003;
    particles.rotation.y += 0.0008;

    renderer.render(scene,camera);

}

animate();

window.addEventListener(
    "resize",
    ()=>{

        camera.aspect =
        window.innerWidth /
        window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);