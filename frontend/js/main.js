window.addEventListener("load",()=>{

    gsap.from(".navbar",{
        y:-100,
        duration:1,
        opacity:0
    });

    gsap.from(".hero h1",{
        y:80,
        duration:1.2,
        opacity:0
    });

    gsap.from(".hero p",{
        y:80,
        duration:1.5,
        opacity:0
    });

    gsap.from(".hero-buttons .btn",{
        y:50,
        duration:1,
        opacity:0,
        stagger:0.2
    });

});

const cards =
document.querySelectorAll(".service-card");

cards.forEach(card=>{

    card.addEventListener(
        "mouseenter",
        ()=>{

            gsap.to(card,{
                scale:1.05,
                duration:0.3
            });

        }
    );

    card.addEventListener(
        "mouseleave",
        ()=>{

            gsap.to(card,{
                scale:1,
                duration:0.3
            });

        }
    );

});
const loader =
document.getElementById("loader");

window.addEventListener(
    "load",
    ()=>{

        setTimeout(()=>{

            loader.style.display="none";

        },1500);

    }
);