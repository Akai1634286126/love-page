/* =========================================================
   心海流光 · 音乐驱动版
   ========================================================= */


/* =========================================================
   DOM
   ========================================================= */

const introScreen = document.getElementById("introScreen");
const startBtn = document.getElementById("startBtn");

const musicBtn = document.getElementById("musicBtn");
const musicIcon = document.getElementById("musicIcon");
const musicText = document.getElementById("musicText");

const finalBtn = document.getElementById("finalBtn");
const finalOverlay = document.getElementById("finalOverlay");

const bgMusic = document.getElementById("bgMusic");

const photoList = document.getElementById("photoList");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

const visualizerStatus =
    document.getElementById("visualizerStatus");


/* =========================================================
   Canvas
   ========================================================= */

const lightCanvas =
    document.getElementById("lightCanvas");

const particleCanvas =
    document.getElementById("particleCanvas");

const fireworkCanvas =
    document.getElementById("fireworkCanvas");

const visualizerCanvas =
    document.getElementById("visualizerCanvas");


const lightCtx =
    lightCanvas.getContext("2d");

const particleCtx =
    particleCanvas.getContext("2d");

const fireworkCtx =
    fireworkCanvas.getContext("2d");

const visualizerCtx =
    visualizerCanvas.getContext("2d");


let width = window.innerWidth;
let height = window.innerHeight;

let dpr = Math.min(
    window.devicePixelRatio || 1,
    2
);


/* =========================================================
   Canvas 尺寸
   ========================================================= */

function resizeCanvas(canvas, ctx) {

    const rect = canvas.getBoundingClientRect();

    const w =
        rect.width ||
        window.innerWidth;

    const h =
        rect.height ||
        window.innerHeight;

    canvas.width =
        Math.floor(w * dpr);

    canvas.height =
        Math.floor(h * dpr);

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}


function resizeAll() {

    width = window.innerWidth;
    height = window.innerHeight;

    dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    resizeCanvas(
        lightCanvas,
        lightCtx
    );

    resizeCanvas(
        particleCanvas,
        particleCtx
    );

    resizeCanvas(
        fireworkCanvas,
        fireworkCtx
    );

    resizeCanvas(
        visualizerCanvas,
        visualizerCtx
    );

    createHeartParticles();
}


window.addEventListener(
    "resize",
    resizeAll
);

resizeAll();


/* =========================================================
   音乐系统
   ========================================================= */

let audioContext = null;
let analyser = null;
let sourceNode = null;
let frequencyData = null;

let audioReady = false;
let musicPlaying = false;


/* 创建 Web Audio */

function createAudioSystem() {

    if (audioContext) {
        return;
    }

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) {

        console.warn(
            "当前浏览器不支持 Web Audio API"
        );

        return;
    }

    audioContext =
        new AudioContext();

    analyser =
        audioContext.createAnalyser();

    analyser.fftSize = 256;

    analyser.smoothingTimeConstant = 0.78;

    frequencyData =
        new Uint8Array(
            analyser.frequencyBinCount
        );

    sourceNode =
        audioContext.createMediaElementSource(
            bgMusic
        );

    sourceNode.connect(analyser);

    analyser.connect(
        audioContext.destination
    );

    audioReady = true;
}


/* =========================================================
   获取音乐能量
   ========================================================= */

function getAudioEnergy() {

    if (
        !analyser ||
        !frequencyData
    ) {
        return 0;
    }

    analyser.getByteFrequencyData(
        frequencyData
    );

    let total = 0;

    for (
        let i = 0;
        i < frequencyData.length;
        i++
    ) {

        total +=
            frequencyData[i];
    }

    return (
        total /
        frequencyData.length /
        255
    );
}


/* 获取低频 */

function getBassEnergy() {

    if (
        !analyser ||
        !frequencyData
    ) {
        return 0;
    }

    let total = 0;

    const end =
        Math.floor(
            frequencyData.length * 0.15
        );

    for (
        let i = 0;
        i < end;
        i++
    ) {

        total +=
            frequencyData[i];
    }

    return (
        total /
        end /
        255
    );
}


/* 获取中频 */

function getMidEnergy() {

    if (
        !analyser ||
        !frequencyData
    ) {
        return 0;
    }

    let total = 0;

    const start =
        Math.floor(
            frequencyData.length * 0.15
        );

    const end =
        Math.floor(
            frequencyData.length * 0.55
        );

    const count =
        Math.max(
            1,
            end - start
        );

    for (
        let i = start;
        i < end;
        i++
    ) {

        total +=
            frequencyData[i];
    }

    return (
        total /
        count /
        255
    );
}


/* 获取高频 */

function getHighEnergy() {

    if (
        !analyser ||
        !frequencyData
    ) {
        return 0;
    }

    let total = 0;

    const start =
        Math.floor(
            frequencyData.length * 0.55
        );

    const count =
        frequencyData.length -
        start;

    for (
        let i = start;
        i < frequencyData.length;
        i++
    ) {

        total +=
            frequencyData[i];
    }

    return (
        total /
        Math.max(1, count) /
        255
    );
}


/* =========================================================
   启动音乐
   ========================================================= */

async function startMusic() {

    try {

        createAudioSystem();

        if (
            audioContext &&
            audioContext.state === "suspended"
        ) {

            await audioContext.resume();
        }

        await bgMusic.play();

        musicPlaying = true;

        musicIcon.textContent = "Ⅱ";
        musicText.textContent = "暂停";

        visualizerStatus.textContent =
            "MUSIC IS ALIVE";

    } catch (error) {

        console.error(
            "音乐播放失败：",
            error
        );

        visualizerStatus.textContent =
            "TAP AGAIN TO PLAY";
    }
}


/* =========================================================
   暂停音乐
   ========================================================= */

function pauseMusic() {

    bgMusic.pause();

    musicPlaying = false;

    musicIcon.textContent = "♫";
    musicText.textContent = "音乐";

    visualizerStatus.textContent =
        "MUSIC PAUSED";
}


/* =========================================================
   开场按钮
   ========================================================= */

startBtn.addEventListener(
    "click",
    async () => {

        introScreen.classList.add("hide");

        await startMusic();
    }
);


/* =========================================================
   顶部音乐按钮
   ========================================================= */

musicBtn.addEventListener(
    "click",
    async () => {

        if (musicPlaying) {

            pauseMusic();

        } else {

            await startMusic();
        }
    }
);


/* =========================================================
   页面离开时
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            musicPlaying
        ) {

            bgMusic.pause();

        } else if (
            !document.hidden &&
            musicPlaying
        ) {

            bgMusic.play().catch(
                () => {}
            );
        }
    }
);


/* =========================================================
   照片配置
   =========================================================

   你只需要修改这里。

   photo1.jpg
   photo2.jpg
   ...

   可以增加到 10 张甚至更多。
   ========================================================= */

const photos = [

    {
        src: "assets/images/photo1.jpg",
        title: "故事的第一页",
        text: "有些遇见，本身就是一件很浪漫的事。"
    },

    {
        src: "assets/images/photo2.jpg",
        title: "第一次记住你",
        text: "那一天之后，很多事情开始有了意义。"
    },

    {
        src: "assets/images/photo3.jpg",
        title: "我们一起走过",
        text: "平凡的日子，因为有你变得不再普通。"
    },

    {
        src: "assets/images/photo4.jpg",
        title: "偷偷收藏的瞬间",
        text: "我把关于你的每一个瞬间都认真保存。"
    },

    {
        src: "assets/images/photo5.jpg",
        title: "我喜欢的你",
        text: "不需要很完美，只要是你就很好。"
    },

    {
        src: "assets/images/photo6.jpg",
        title: "以后也要一起",
        text: "希望故事不会停在这里。"
    }

];


/* =========================================================
   创建照片
   ========================================================= */

function renderPhotos() {

    photoList.innerHTML = "";

    photos.forEach(
        (photo, index) => {

            const card =
                document.createElement("article");

            card.className =
                "photo-card";

            card.innerHTML = `

                <img
                    src="${photo.src}"
                    alt="${photo.title}"
                    loading="lazy"
                >

                <div class="photo-overlay">

                    <div class="photo-title">
                        ${photo.title}
                    </div>

                    <div class="photo-text">
                        ${photo.text}
                    </div>

                </div>

            `;

            card.addEventListener(
                "click",
                () => {

                    lightboxImage.src =
                        photo.src;

                    lightboxCaption.textContent =
                        photo.title +
                        " · " +
                        photo.text;

                    lightbox.classList.add(
                        "show"
                    );
                }
            );

            photoList.appendChild(card);
        }
    );
}

renderPhotos();


/* =========================================================
   图片放大关闭
   ========================================================= */

lightboxClose.addEventListener(
    "click",
    () => {

        lightbox.classList.remove(
            "show"
        );
    }
);


lightbox.addEventListener(
    "click",
    event => {

        if (
            event.target === lightbox
        ) {

            lightbox.classList.remove(
                "show"
            );
        }
    }
);


/* =========================================================
   滚动显示照片
   ========================================================= */

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );
                    }
                }
            );

        },
        {
            threshold: 0.15
        }
    );


function observePhotos() {

    document
        .querySelectorAll(".photo-card")
        .forEach(
            card => observer.observe(card)
        );
}

setTimeout(
    observePhotos,
    100
);


/* =========================================================
   心形数学公式
   ========================================================= */

function heartPoint(
    t,
    scale,
    centerX,
    centerY
) {

    const x =
        16 *
        Math.pow(
            Math.sin(t),
            3
        );

    const y =
        13 *
            Math.cos(t)
        - 5 *
            Math.cos(2 * t)
        - 2 *
            Math.cos(3 * t)
        - Math.cos(4 * t);

    return {

        x:
            centerX +
            x * scale,

        y:
            centerY -
            y * scale
    };
}


/* =========================================================
   心形粒子
   ========================================================= */

let heartParticles = [];


function createHeartParticles() {

    heartParticles = [];

    const count =
        width < 700
            ? 260
            : 430;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        heartParticles.push({

            t:
                Math.random() *
                Math.PI *
                2,

            speed:
                0.0015 +
                Math.random() *
                0.004,

            size:
                0.5 +
                Math.random() *
                2.2,

            alpha:
                0.2 +
                Math.random() *
                0.7,

            offset:
                Math.random() * 12

        });
    }
}


/* =========================================================
   绘制心形粒子
   ========================================================= */

function drawHeartParticles(
    time
) {

    const bass =
        getBassEnergy();

    const mid =
        getMidEnergy();

    const scale =
        Math.min(
            width,
            height
        ) *
        0.0125;

    const centerX =
        width / 2;

    const centerY =
        height * 0.52;

    particleCtx.save();

    particleCtx.globalCompositeOperation =
        "lighter";

    for (
        const p of heartParticles
    ) {

        p.t +=
            p.speed *
            (1 + mid * 5);

        if (
            p.t >
            Math.PI * 2
        ) {

            p.t -=
                Math.PI * 2;
        }

        const point =
            heartPoint(
                p.t,
                scale +
                    bass * 0.003,
                centerX,
                centerY
            );

        const glow =
            particleCtx.createRadialGradient(
                point.x,
                point.y,
                0,
                point.x,
                point.y,
                p.size * 5
            );

        glow.addColorStop(
            0,
            `rgba(255,130,190,${p.alpha})`
        );

        glow.addColorStop(
            1,
            "rgba(255,80,160,0)"
        );

        particleCtx.fillStyle =
            glow;

        particleCtx.beginPath();

        particleCtx.arc(
            point.x,
            point.y,
            p.size * 5,
            0,
            Math.PI * 2
        );

        particleCtx.fill();


        particleCtx.fillStyle =
            `rgba(255,220,240,${p.alpha})`;

        particleCtx.beginPath();

        particleCtx.arc(
            point.x,
            point.y,
            p.size,
            0,
            Math.PI * 2
        );

        particleCtx.fill();
    }

    particleCtx.restore();
}


/* =========================================================
   心海背景
   ========================================================= */

const oceanStars =
    [];


function createOceanStars() {

    oceanStars.length = 0;

    const count =
        width < 700
            ? 100
            : 180;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        oceanStars.push({

            x:
                Math.random() *
                width,

            y:
                Math.random() *
                height,

            size:
                Math.random() *
                1.7 +
                0.3,

            speed:
                Math.random() *
                0.25 +
                0.05,

            phase:
                Math.random() *
                Math.PI *
                2

        });
    }
}

createOceanStars();


/* =========================================================
   心海流光
   ========================================================= */

function drawOcean(
    time
) {

    const energy =
        getAudioEnergy();

    const mid =
        getMidEnergy();

    const high =
        getHighEnergy();

    lightCtx.clearRect(
        0,
        0,
        width,
        height
    );


    /* 深色背景 */

    const bg =
        lightCtx.createRadialGradient(
            width / 2,
            height * 0.5,
            0,
            width / 2,
            height * 0.5,
            Math.max(
                width,
                height
            ) * 0.7
        );

    bg.addColorStop(
        0,
        "rgba(70,20,85,0.18)"
    );

    bg.addColorStop(
        0.5,
        "rgba(18,5,35,0.12)"
    );

    bg.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    lightCtx.fillStyle =
        bg;

    lightCtx.fillRect(
        0,
        0,
        width,
        height
    );


    /* 星光 */

    lightCtx.save();

    lightCtx.globalCompositeOperation =
        "lighter";

    for (
        const star of oceanStars
    ) {

        star.y -=
            star.speed;

        if (
            star.y < -10
        ) {

            star.y =
                height + 10;

            star.x =
                Math.random() *
                width;
        }

        const twinkle =
            0.25 +
            (
                Math.sin(
                    time * 0.002 +
                    star.phase
                ) + 1
            ) *
            0.25;

        const highBoost =
            high * 1.5;

        lightCtx.fillStyle =
            `rgba(255,190,225,${Math.min(
                1,
                twinkle +
                highBoost
            )})`;

        lightCtx.beginPath();

        lightCtx.arc(
            star.x,
            star.y,
            star.size +
                high * 1.5,
            0,
            Math.PI * 2
        );

        lightCtx.fill();
    }


    /* 流光 */

    for (
        let line = 0;
        line < 6;
        line++
    ) {

        lightCtx.beginPath();

        const baseY =
            height *
            (
                0.28 +
                line *
                0.095
            );

        for (
            let x = -30;
            x <= width + 30;
            x += 8
        ) {

            const wave =
                Math.sin(
                    x * 0.008 +
                    time * 0.0012 +
                    line
                ) *
                (
                    25 +
                    mid * 120
                );

            const wave2 =
                Math.sin(
                    x * 0.015 -
                    time * 0.001 +
                    line * 2
                ) *
                (
                    10 +
                    energy * 40
                );

            const y =
                baseY +
                wave +
                wave2;

            if (
                x === -30
            ) {

                lightCtx.moveTo(
                    x,
                    y
                );

            } else {

                lightCtx.lineTo(
                    x,
                    y
                );
            }
        }

        const gradient =
            lightCtx.createLinearGradient(
                0,
                0,
                width,
                0
            );

        gradient.addColorStop(
            0,
            "rgba(255,80,170,0)"
        );

        gradient.addColorStop(
            0.25,
            `rgba(255,110,185,${0.08 + mid * 0.35})`
        );

        gradient.addColorStop(
            0.5,
            `rgba(180,110,255,${0.12 + energy * 0.4})`
        );

        gradient.addColorStop(
            0.75,
            `rgba(255,110,190,${0.08 + high * 0.3})`
        );

        gradient.addColorStop(
            1,
            "rgba(255,80,170,0)"
        );

        lightCtx.strokeStyle =
            gradient;

        lightCtx.lineWidth =
            1.2 +
            energy * 3;

        lightCtx.shadowBlur =
            10 +
            energy * 20;

        lightCtx.shadowColor =
            "rgba(255,80,170,0.5)";

        lightCtx.stroke();
    }

    lightCtx.restore();
}


/* =========================================================
   音乐可视化
   ========================================================= */

function drawVisualizer() {

    const rect =
        visualizerCanvas.getBoundingClientRect();

    const w =
        rect.width;

    const h =
        rect.height;

    visualizerCtx.clearRect(
        0,
        0,
        w,
        h
    );

    const cx =
        w / 2;

    const cy =
        h / 2;

    let energy =
        getAudioEnergy();

    let bass =
        getBassEnergy();

    let high =
        getHighEnergy();


    /* 没有音乐时 */

    if (!musicPlaying) {

        energy *= 0.15;
        bass *= 0.1;
        high *= 0.1;
    }


    /* 外圈 */

    visualizerCtx.save();

    visualizerCtx.globalCompositeOperation =
        "lighter";


    const bars =
        80;

    const radius =
        Math.min(w, h) *
        0.26;


    for (
        let i = 0;
        i < bars;
        i++
    ) {

        let value = 0;

        if (
            frequencyData
        ) {

            const index =
                Math.floor(
                    i /
                    bars *
                    frequencyData.length
                );

            value =
                frequencyData[index] /
                255;
        }

        const angle =
            (
                i /
                bars
            ) *
            Math.PI *
            2;

        const length =
            8 +
            value *
            Math.min(w, h) *
            0.22;

        const r1 =
            radius;

        const r2 =
            radius +
            length;


        const x1 =
            cx +
            Math.cos(angle) *
            r1;

        const y1 =
            cy +
            Math.sin(angle) *
            r1;

        const x2 =
            cx +
            Math.cos(angle) *
            r2;

        const y2 =
            cy +
            Math.sin(angle) *
            r2;


        visualizerCtx.beginPath();

        visualizerCtx.moveTo(
            x1,
            y1
        );

        visualizerCtx.lineTo(
            x2,
            y2
        );


        visualizerCtx.strokeStyle =
            `hsla(
                ${315 + i * 0.4},
                100%,
                ${70 + value * 20}%,
                ${0.2 + value * 0.8}
            )`;

        visualizerCtx.lineWidth =
            1 +
            value * 3;

        visualizerCtx.lineCap =
            "round";

        visualizerCtx.shadowBlur =
            10 +
            value * 20;

        visualizerCtx.shadowColor =
            "#ff66aa";

        visualizerCtx.stroke();
    }


    /* 中间光圈 */

    const glowRadius =
        radius *
        (
            0.8 +
            bass * 0.5
        );

    const glow =
        visualizerCtx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            glowRadius
        );

    glow.addColorStop(
        0,
        `rgba(
            255,
            100,
            175,
            ${0.04 + bass * 0.16}
        )`
    );

    glow.addColorStop(
        1,
        "rgba(255,80,160,0)"
    );

    visualizerCtx.fillStyle =
        glow;

    visualizerCtx.beginPath();

    visualizerCtx.arc(
        cx,
        cy,
        glowRadius,
        0,
        Math.PI * 2
    );

    visualizerCtx.fill();

    visualizerCtx.restore();
}


/* =========================================================
   最终烟花系统
   ========================================================= */

let finaleStarted = false;

let rockets = [];

let explosionParticles = [];

let targetPoints = [];

let targetIndex = 0;

let lastRocketTime = 0;


/* 创建爱心目标点 */

function createHeartTargets() {

    targetPoints = [];

    const count =
        width < 700
            ? 90
            : 150;

    const scale =
        Math.min(
            width,
            height
        ) *
        0.020;

    const cx =
        width / 2;

    const cy =
        height * 0.46;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const t =
            (
                i /
                count
            ) *
            Math.PI *
            2;

        targetPoints.push(
            heartPoint(
                t,
                scale,
                cx,
                cy
            )
        );
    }
}


/* 启动烟花 */

function startFinale() {

    if (finaleStarted) {
        return;
    }

    finaleStarted = true;

    createHeartTargets();

    rockets = [];

    explosionParticles = [];

    targetIndex = 0;

    lastRocketTime = 0;

    finalOverlay.classList.add(
        "show"
    );

    /* 音乐继续播放 */

    if (!musicPlaying) {
        startMusic();
    }
}


/* 发射火箭 */

function launchRocket(
    target
) {

    rockets.push({

        x:
            width / 2,

        y:
            height * 1.05,

        targetX:
            target.x,

        targetY:
            target.y,

        progress:
            0,

        speed:
            0.025 +
            Math.random() *
            0.02,

        trail: []

    });
}


/* 爆炸 */

function explodeRocket(
    rocket
) {

    const amount =
        9 +
        Math.floor(
            Math.random() *
            10
        );

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            0.7 +
            Math.random() *
            2.6;

        explosionParticles.push({

            x:
                rocket.targetX,

            y:
                rocket.targetY,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                1,

            decay:
                0.012 +
                Math.random() *
                0.025,

            size:
                0.8 +
                Math.random() *
                2.2

        });
    }
}


/* 更新烟花 */

function updateFinale(
    time
) {

    fireworkCtx.clearRect(
        0,
        0,
        width,
        height
    );


    if (
        finaleStarted &&
        targetIndex <
        targetPoints.length
    ) {

        if (
            time -
            lastRocketTime >
            38
        ) {

            launchRocket(
                targetPoints[
                    targetIndex
                ]
            );

            targetIndex++;

            lastRocketTime =
                time;
        }
    }


    /* 火箭 */

    for (
        let i =
            rockets.length - 1;
        i >= 0;
        i--
    ) {

        const rocket =
            rockets[i];

        rocket.progress +=
            rocket.speed;


        rocket.trail.push({
            x: rocket.x,
            y: rocket.y
        });


        if (
            rocket.trail.length >
            8
        ) {

            rocket.trail.shift();
        }


        rocket.x =
            rocket.x +
            (
                rocket.targetX -
                rocket.x
            ) *
            0.06;

        rocket.y =
            rocket.y +
            (
                rocket.targetY -
                rocket.y
            ) *
            0.06;


        fireworkCtx.save();

        fireworkCtx.globalCompositeOperation =
            "lighter";

        fireworkCtx.fillStyle =
            "rgba(255,210,235,0.95)";

        fireworkCtx.shadowBlur =
            18;

        fireworkCtx.shadowColor =
            "#ff72b5";

        fireworkCtx.beginPath();

        fireworkCtx.arc(
            rocket.x,
            rocket.y,
            2.5,
            0,
            Math.PI * 2
        );

        fireworkCtx.fill();


        fireworkCtx.restore();


        if (
            Math.abs(
                rocket.x -
                rocket.targetX
            ) < 5 &&
            Math.abs(
                rocket.y -
                rocket.targetY
            ) < 5
        ) {

            explodeRocket(
                rocket
            );

            rockets.splice(
                i,
                1
            );
        }
    }


    /* 爆炸粒子 */

    for (
        let i =
            explosionParticles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            explosionParticles[i];

        p.x += p.vx;

        p.y += p.vy;

        p.vx *= 0.985;

        p.vy *= 0.985;

        p.vy += 0.015;

        p.life -= p.decay;


        if (
            p.life <= 0
        ) {

            explosionParticles.splice(
                i,
                1
            );

            continue;
        }


        fireworkCtx.save();

        fireworkCtx.globalCompositeOperation =
            "lighter";

        fireworkCtx.fillStyle =
            `rgba(
                255,
                ${150 + Math.random() * 80},
                ${190 + Math.random() * 60},
                ${p.life}
            )`;

        fireworkCtx.shadowBlur =
            15;

        fireworkCtx.shadowColor =
            "#ff70b3";


        fireworkCtx.beginPath();

        fireworkCtx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        fireworkCtx.fill();

        fireworkCtx.restore();
    }


    /* 最终爱心轮廓 */

    if (
        finaleStarted &&
        targetIndex >=
        targetPoints.length
    ) {

        const opacity =
            0.15 +
            Math.sin(
                time * 0.005
            ) *
            0.08;


        fireworkCtx.save();

        fireworkCtx.strokeStyle =
            `rgba(
                255,
                110,
                180,
                ${opacity}
            )`;

        fireworkCtx.lineWidth = 1;

        fireworkCtx.shadowBlur = 25;

        fireworkCtx.shadowColor =
            "#ff70b5";

        fireworkCtx.beginPath();

        targetPoints.forEach(
            (point, index) => {

                if (
                    index === 0
                ) {

                    fireworkCtx.moveTo(
                        point.x,
                        point.y
                    );

                } else {

                    fireworkCtx.lineTo(
                        point.x,
                        point.y
                    );
                }
            }
        );

        fireworkCtx.closePath();

        fireworkCtx.stroke();

        fireworkCtx.restore();
    }
}


/* =========================================================
   最终按钮
   ========================================================= */

finalBtn.addEventListener(
    "click",
    () => {

        startFinale();

        window.scrollTo({
            top:
                document.body.scrollHeight,
            behavior:
                "smooth"
        });
    }
);


/* =========================================================
   主动画循环
   ========================================================= */

let lastTime = 0;


function animationLoop(
    time
) {

    const delta =
        time -
        lastTime;

    lastTime =
        time;


    /* 音乐驱动背景 */

    drawOcean(
        time
    );


    /* 心形粒子 */

    particleCtx.clearRect(
        0,
        0,
        width,
        height
    );

    drawHeartParticles(
        time
    );


    /* 音乐可视化 */

    drawVisualizer();


    /* 烟花 */

    updateFinale(
        time
    );


    requestAnimationFrame(
        animationLoop
    );
}


requestAnimationFrame(
    animationLoop
);


/* =========================================================
   初始化
   ========================================================= */

createHeartParticles();


/* =========================================================
   监听音乐结束
   ========================================================= */

bgMusic.addEventListener(
    "play",
    () => {

        musicPlaying = true;

        musicIcon.textContent =
            "Ⅱ";

        musicText.textContent =
            "暂停";

        visualizerStatus.textContent =
            "MUSIC IS ALIVE";
    }
);


bgMusic.addEventListener(
    "pause",
    () => {

        musicPlaying = false;

        musicIcon.textContent =
            "♫";

        musicText.textContent =
            "音乐";
    }
);