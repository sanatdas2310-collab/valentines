// ... [Keep your existing requestAnimationFrame and isDevice checks at the top] ...

var loaded = false;
var init = function () {
    if (loaded) return;
    loaded = true;
    
    // Canvas & Context Setup
    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');
    var koef = window.isDevice ? 0.5 : 1;
    var width = canvas.width = koef * innerWidth;
    var height = canvas.height = koef * innerHeight;
    var rand = Math.random;

    // --- TYPING ANIMATION LOGIC ---
    const textElement = document.getElementById('valentine-text');
    const fullText = "To the person who stayed when things got loud and held my hand when things got quiet. We’ve faced the weight of the world together and we’re still standing stronger than ever. \n\nYou are my greatest win. Happy Valentine’s Day";
    let charIndex = 0;

    function typeWriter() {
        if (charIndex < fullText.length) {
            textElement.innerHTML += fullText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 70); // Adjust typing speed here
        } else {
            textElement.classList.add('typing-finished');
            // Wait 3 seconds after finishing, then shatter
            setTimeout(shatterText, 3000);
        }
    }

    // Start typing after a short delay
    setTimeout(typeWriter, 1500);

    function shatterText() {
        textElement.classList.add('shatter-out');
        // This triggers the particles in the loop to stop forming a heart 
        // and instead fly off into the distance
        config.shatterMode = true;
    }

    // --- HEART & PARTICLE LOGIC ---
    var heartPosition = function (rad) {
        return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
    };

    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    var pointsOrigin = [];
    var dr = window.isDevice ? 0.3 : 0.1;
    for (var i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    for (var i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    
    var heartPointsCount = pointsOrigin.length;
    var targetPoints = [];
    var config = { traceK: 0.4, timeDelta: 0.01, shatterMode: false };

    var pulse = function (kx, ky) {
        for (var i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
            targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
        }
    };

    var e = [];
    for (var i = 0; i < heartPointsCount; i++) {
        e[i] = {
            vx: 0, vy: 0, R: 2, speed: rand() + 5,
            q: ~~(rand() * heartPointsCount),
            D: 2 * (i % 2) - 1, force: 0.2 * rand() + 0.7,
            f: "hsla(340," + ~~(40 * rand() + 60) + "%," + ~~(60 * rand() + 20) + "%,.3)",
            trace: []
        };
        for (var k = 0; k < 50; k++) e[i].trace[k] = { x: rand() * width, y: rand() * height };
    }

    var time = 0;
    var loop = function () {
        var n = -Math.cos(time);
        pulse((1 + n) * .5, (1 + n) * .5);
        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * config.timeDelta;
        
        ctx.fillStyle = "rgba(0,0,0,.1)";
        ctx.fillRect(0, 0, width, height);

        for (var i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];
            
            // If shatterMode is on, particles fly away from the center instead of toward the heart
            if (config.shatterMode) {
                u.vx += (rand() - 0.5) * 2;
                u.vy += (rand() - 0.5) * 2;
                u.speed += 0.1;
            }

            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);
            
            if (10 > length && !config.shatterMode) {
                if (0.95 < rand()) u.q = ~~(rand() * heartPointsCount);
                else {
                    if (0.99 < rand()) u.D *= -1;
                    u.q = (u.q + u.D + heartPointsCount) % heartPointsCount;
                }
            }

            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;
            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;
            u.vx *= u.force;
            u.vy *= u.force;

            for (var k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }

            ctx.fillStyle = u.f;
            for (var k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }
        window.requestAnimationFrame(loop, canvas);
    };
    loop();
};

var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);