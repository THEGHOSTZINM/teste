// Gabarito e textos
let gabarito  = { q1: "A", q2: "C", q3: "B" };
let textos    = { q1: "Fórmula química do quartzo", q2: "Classificação química", q3: "Dureza na Escala de Mohs" };
let corretas  = { q1: "A) SiO₂", q2: "C) Óxido", q3: "B) 7" };

document.querySelector("#btnEnviar").addEventListener("click", corrigir);
document.querySelector("#btnReiniciar").addEventListener("click", reiniciar);

function corrigir() {
    let acertos = 0;
    let html = "";

    for (let q in gabarito) {
        let marcado = document.querySelector(`input[name="${q}"]:checked`);
        let divQ    = document.querySelector(`#${q}`);

        if (!marcado) {
            alert("Responda todas as questões antes de enviar.");
            return;
        }

        if (marcado.value === gabarito[q]) {
            acertos++;
            divQ.classList.add("certa");
            html += `<div class="resultado__item resultado__item--certo">
                        ✅ Questão ${q.replace("q","")}: ${textos[q]} — <strong>Correta!</strong>
                     </div>`;
        } else {
            divQ.classList.add("errada");
            html += `<div class="resultado__item resultado__item--errado">
                        ❌ Questão ${q.replace("q","")}: ${textos[q]} — Errada. 
                        Resposta correta: <strong>${corretas[q]}</strong>
                     </div>`;
        }

        document.querySelectorAll(`input[name="${q}"]`).forEach(i => i.disabled = true);
    }

    let nota = (acertos / 3 * 10).toFixed(1);
    let resultado = document.querySelector("#resultado");
    resultado.innerHTML = `<p class="resultado__nota">Você acertou ${acertos} de 3 — Nota: ${nota}</p>${html}`;
    resultado.classList.add("visivel");

    document.querySelector("#btnEnviar").style.display = "none";
    document.querySelector("#btnReiniciar").style.display = "inline-block";
}

function reiniciar() {
    document.querySelectorAll("input[type='radio']").forEach(i => {
        i.checked = false;
        i.disabled = false;
    });

    document.querySelectorAll(".questao").forEach(q => {
        q.classList.remove("certa", "errada");
    });

    let resultado = document.querySelector("#resultado");
    resultado.innerHTML = "";
    resultado.classList.remove("visivel");

    document.querySelector("#btnEnviar").style.display = "inline-block";
    document.querySelector("#btnReiniciar").style.display = "none";
}
