(function () {
    var canvas = $('#canvas');

    if (!canvas[0].getContext) {
        $("#error").show();
        return false;
    }

    // Dimensiones base del canvas (resolución interna)
    var baseWidth = 1100;
    var baseHeight = 680;
    
    // Establecer resolución interna del canvas
    canvas.attr("width", baseWidth);
    canvas.attr("height", baseHeight);
    
    // El CSS maneja el escalado visual con aspect-ratio
    var isMobile = $(window).width() < 1200;

    var opts = {
        seed: {
            x: baseWidth / 2 - 20,
            color: "rgb(190, 26, 37)",
            scale: 4
        },
        branch: [
            [535, 680, 570, 250, 500, 200, 30, 100, [
                [540, 500, 455, 417, 340, 400, 13, 100, [
                    [450, 435, 434, 430, 394, 395, 2, 40]
                ]],
                [550, 445, 600, 356, 680, 345, 12, 100, [
                    [578, 400, 648, 409, 661, 426, 3, 80]
                ]],
                [539, 281, 537, 248, 534, 217, 3, 40],
                [546, 397, 413, 247, 328, 244, 9, 80, [
                    [427, 286, 383, 253, 371, 205, 2, 40],
                    [498, 345, 435, 315, 395, 330, 4, 60]
                ]],
                [546, 357, 608, 252, 678, 221, 6, 100, [
                    [590, 293, 646, 277, 648, 271, 2, 80]
                ]]
            ]]
        ],
        bloom: {
            num: 700,
            width: 1080,
            height: 650,
        },
        footer: {
            width: 1200,
            height: 0,
            speed: 10,
        }
    }

    var tree = new Tree(canvas[0], baseWidth, baseHeight, opts);
    var seed = tree.seed;
    var foot = tree.footer;
    var hold = 1;

    // Función para escalar coordenadas del clic al tamaño base del canvas
    function scaleCoords(pageX, pageY) {
        var offset = canvas.offset();
        var displayWidth = canvas.width();
        var displayHeight = canvas.height();
        var x = (pageX - offset.left) * (baseWidth / displayWidth);
        var y = (pageY - offset.top) * (baseHeight / displayHeight);
        return { x: x, y: y };
    }

    canvas.click(function (e) {
        var coords = scaleCoords(e.pageX, e.pageY);
        if (seed.hover(coords.x, coords.y)) {
            hold = 0;
            canvas.unbind("click");
            canvas.unbind("mousemove");
            canvas.removeClass('hand');
        }
    }).mousemove(function (e) {
        var coords = scaleCoords(e.pageX, e.pageY);
        canvas.toggleClass('hand', seed.hover(coords.x, coords.y));
    });
    
    // Soporte táctil para móviles
    canvas[0].addEventListener('touchstart', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        var coords = scaleCoords(touch.pageX, touch.pageY);
        if (seed.hover(coords.x, coords.y)) {
            hold = 0;
            canvas.unbind("click");
            canvas.unbind("mousemove");
            canvas.removeClass('hand');
        }
    }, { passive: false });

     // --- PEGA EL CÓDIGO NUEVO AQUÍ ---
    $(document).keydown(function(e) {
        if (e.keyCode == 13) {
            if (hold) {
                hold = 0;
                canvas.unbind("click");
                canvas.unbind("mousemove");
                canvas.removeClass('hand');
            }
        }
    });


    var seedAnimate = eval(Jscex.compile("async", function () {
        seed.draw();
        while (hold) {
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canScale()) {
            seed.scale(0.95);
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canMove()) {
            seed.move(0, 2);
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
    }));

    var growAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.grow();
            $await(Jscex.Async.sleep(10));
        } while (tree.canGrow());
    }));

    var flowAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.flower(2);
            $await(Jscex.Async.sleep(10));
        } while (tree.canFlower());
    }));

    var moveAnimate = eval(Jscex.compile("async", function () {
        if (!isMobile) {
            tree.snapshot("p1", 240, 0, 610, 680);
            while (tree.move("p1", 500, 0)) {
                foot.draw();
                $await(Jscex.Async.sleep(10));
            }
            foot.draw();
            tree.snapshot("p2", 500, 0, 610, 680);

            var bgImage = tree.toDataURL('image/png');
            canvas.parent().css({
                "background-image": "url(" + bgImage + ")",
                "background-size": "contain",
                "background-repeat": "no-repeat",
                "background-position": "center top"
            });
            canvas.css("background", "#F5E8DC");
            $await(Jscex.Async.sleep(300));
            canvas.css("background", "none");
        } else {
            tree.snapshot("p2", 0, 0, baseWidth, baseHeight);
        }
    }));

    var jumpAnimate = eval(Jscex.compile("async", function () {
        var ctx = tree.ctx;
        while (true) {
            tree.ctx.clearRect(0, 0, baseWidth, baseHeight);
            if (isMobile) {
                tree.draw("p2");
            }
            tree.jump();
            $await(Jscex.Async.sleep(25));
        }
    }));

    var textAnimate = eval(Jscex.compile("async", function () {
        var together = new Date();
        together.setFullYear(2025, 1, 14);
        together.setHours(0);
        together.setMinutes(0);
        together.setSeconds(0);
        together.setMilliseconds(0);

        $("#code").show().typewriter();
        $("#clock-box").fadeIn(500);
        while (true) {
            timeElapse(together);
            $await(Jscex.Async.sleep(1000));
        }
    }));

    var runAsync = eval(Jscex.compile("async", function () {
        $await(seedAnimate());
        $await(growAnimate());
        $await(flowAnimate());
        $await(moveAnimate());

        textAnimate().start();

        $await(jumpAnimate());
    }));

    runAsync().start();
})();


   