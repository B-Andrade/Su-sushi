const real = valor => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function esc(texto) {
    return String(texto).replace(/[&<>"']/g, c =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}


function iniciarModal() {
    const modal = document.getElementById("meuModal");
    const btnAbrir = document.getElementById("openModal");
    const btnFechar = document.getElementById("closeModal");

    if (!modal || !btnAbrir || !btnFechar) return;

    btnAbrir.addEventListener("click", () => modal.showModal());
    btnFechar.addEventListener("click", () => modal.close());
}


function iniciarCategorias() {
    const categorias = document.querySelectorAll(".categoria");

    categorias.forEach(botao => botao.addEventListener("click", () => {
        categorias.forEach(c => c.classList.remove("ativa"));
        botao.classList.add("ativa");
    }));
}


function iniciarCadastro() {
    const form = document.getElementById("cadastro");

    if (!form) return;

    const campos = {
        nome: document.getElementById("nome"),
        email: document.getElementById("email"),
        telefone: document.getElementById("telefone"),
        senha: document.getElementById("senha"),
        confirmar: document.getElementById("confirmar"),
        termos: document.getElementById("termos")
    };

    function mostrarErro(campo, mensagem) {
        campo.closest(".campo").classList.add("invalido");
        campo.setAttribute("aria-invalid", "true");
        document.getElementById("erro-" + campo.id).textContent = mensagem;
    }

    function limparErro(campo) {
        campo.closest(".campo").classList.remove("invalido");
        campo.removeAttribute("aria-invalid");
        document.getElementById("erro-" + campo.id).textContent = "";
    }

    const validadores = {
        nome(v) {
            if (v.trim().split(/\s+/).length < 2) return "Digite nome e sobrenome.";
        },
        email(v) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()))
                return "Digite um e-mail válido, como voce@email.com.";
        },
        telefone(v) {
            const n = v.replace(/\D/g, "");
            if (n.length < 10 || n.length > 11) return "Digite o telefone com DDD.";
        },
        senha(v) {
            if (v.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
        },
        confirmar(v) {
            if (v !== campos.senha.value) return "As senhas não são iguais.";
        },
        termos() {
            if (!campos.termos.checked) return "Aceite os termos para continuar.";
        }
    };

    function validarCampo(nome) {
        const campo = campos[nome];
        const mensagem = validadores[nome](campo.value);
        mensagem ? mostrarErro(campo, mensagem) : limparErro(campo);
        return !mensagem;
    }

    Object.keys(campos).forEach(nome => {
        const campo = campos[nome];

        campo.addEventListener(nome === "termos" ? "change" : "blur", () => validarCampo(nome));

        campo.addEventListener("input", () => {
            if (campo.closest(".campo").classList.contains("invalido")) validarCampo(nome);
        });
    });

    campos.telefone.addEventListener("input", e => {
        let n = e.target.value.replace(/\D/g, "").slice(0, 11);

        if (n.length > 10)     n = n.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        else if (n.length > 6) n = n.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        else if (n.length > 2) n = n.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        else if (n.length > 0) n = n.replace(/^(\d{0,2})/, "($1");

        e.target.value = n;
    });

    document.querySelectorAll(".btn-olho").forEach(botao => {
        botao.addEventListener("click", () => {
            const input = document.getElementById(botao.dataset.alvo);
            const estavaVisivel = input.type === "text";
            const acao = estavaVisivel ? "Mostrar" : "Ocultar";

            input.type = estavaVisivel ? "password" : "text";
            botao.textContent = acao;
            botao.setAttribute(
                "aria-label",
                acao + (botao.dataset.alvo === "senha" ? " senha" : " confirmação de senha")
            );
        });
    });

    const forca = document.getElementById("forca");
    const forcaTexto = document.getElementById("forca-texto");
    const rotulos = ["", "fraca", "razoável", "boa", "forte"];

    campos.senha.addEventListener("input", () => {
        const v = campos.senha.value;
        let nivel = 0;

        if (v) {
            if (v.length >= 6) nivel++;
            if (v.length >= 10) nivel++;
            if (/[A-Z]/.test(v) && /[a-z]/.test(v)) nivel++;
            if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) nivel++;
        }

        forca.dataset.nivel = nivel;
        forcaTexto.textContent = nivel ? "Senha " + rotulos[nivel] : "";

        if (campos.confirmar.value) validarCampo("confirmar");
    });

    async function fazerCadastro(event) {
        event.preventDefault();

        const tudoCerto = Object.keys(campos).map(validarCampo).every(Boolean);

        if (!tudoCerto) {
            form.querySelector("[aria-invalid]")?.focus();
            return;
        }

        const botao = document.getElementById("btn-cadastrar");
        botao.disabled = true;
        botao.textContent = "Criando conta...";

        const dados = {
            nome: campos.nome.value.trim(),
            email: campos.email.value.trim().toLowerCase(),
            telefone: campos.telefone.value.replace(/\D/g, ""),
            senha: campos.senha.value
        };

        try {
            await new Promise(r => setTimeout(r, 600));

            document.getElementById("form-cadastro").classList.add("escondido");
            document.getElementById("nome-sucesso").textContent = dados.nome.split(" ")[0];
            document.getElementById("sucesso").classList.remove("escondido");
        } catch (erro) {
            botao.disabled = false;
            botao.textContent = "Criar conta";
            mostrarErro(campos.email, "Não foi possível criar a conta. Tente novamente.");
        }
    }

    form.addEventListener("submit", fazerCadastro);
}


function iniciarFiltroCardapio() {
    const botoesFiltro = document.querySelectorAll(".filtro");
    const pratos = document.querySelectorAll(".prato");

    if (!pratos.length) return;

    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", () => {
            const filtro = botao.dataset.filtro;

            botoesFiltro.forEach(b => b.classList.toggle("ativo", b === botao));

            pratos.forEach(prato => {
                prato.hidden = filtro !== "todos" && prato.dataset.categoria !== filtro;
            });
        });
    });
}


function iniciarPedidos() {
    const grade = document.getElementById("grade-pedidos");
    const vazio = document.getElementById("vazio");
    const botoesFiltro = document.querySelectorAll(".filtro");

    if (!grade || !vazio) return;

    const ETAPAS = ["Recebido", "Preparando", "A caminho", "Entregue"];
    const SITUACOES = {
        andamento: "Em andamento",
        entregue: "Entregue",
        cancelado: "Cancelado"
    };

    const pedidos = [
        {
            numero: 1042,
            data: "Hoje, 19:42",
            situacao: "andamento",
            etapa: 2,
            previsao: "20:15",
            endereco: "Rua das Flores, 123 - Centro",
            itens: [
                { qtd: 1, nome: "Combinado Su", preco: 79.90 },
                { qtd: 1, nome: "Temaki de salmão", preco: 27.90 }
            ]
        },
        {
            numero: 1038,
            data: "08/11/2026, 20:10",
            situacao: "entregue",
            etapa: 3,
            endereco: "Rua das Flores, 123 - Centro",
            itens: [
                { qtd: 2, nome: "Hot roll", preco: 34.90 },
                { qtd: 1, nome: "Nigiri de salmão", preco: 18.90 }
            ]
        },
        {
            numero: 1031,
            data: "01/11/2026, 12:35",
            situacao: "entregue",
            etapa: 3,
            endereco: "Av. Brasil, 450 - Apto 32",
            itens: [
                { qtd: 1, nome: "Uramaki de salmão", preco: 32.90 },
                { qtd: 1, nome: "Sashimi de salmão", preco: 36.90 }
            ]
        },
        {
            numero: 1027,
            data: "25/10/2026, 21:05",
            situacao: "cancelado",
            etapa: 0,
            endereco: "Rua das Flores, 123 - Centro",
            itens: [
                { qtd: 1, nome: "Combinado Su", preco: 79.90 }
            ]
        }
    ];

    function montarCard(p) {
        const total = p.itens.reduce((soma, i) => soma + i.qtd * i.preco, 0);

        const etapas = p.situacao === "cancelado" ? "" : `
            <ol class="etapas" aria-label="Etapas da entrega">
                ${ETAPAS.map((nome, i) => `
                    <li class="etapa ${i <= p.etapa ? "feita" : ""} ${i === p.etapa && p.situacao === "andamento" ? "atual" : ""}">
                        <span class="ponto"></span>${nome}
                    </li>`).join("")}
            </ol>`;

        const itens = p.itens.map(i => `
            <li><span>${i.qtd}x ${esc(i.nome)}</span><span>${real(i.qtd * i.preco)}</span></li>`).join("");

        const previsao = p.previsao ? ` Previsão de entrega: ${esc(p.previsao)}.` : "";

        const botao = p.situacao === "andamento"
            ? `<button type="button" class="btn-add" data-acompanhar="${p.numero}">Acompanhar</button>`
            : `<a href="cardapio.html" class="btn-add">Pedir de novo</a>`;

        return `
            <article class="pedido">
                <header class="pedido-topo">
                    <div>
                        <h2>Pedido #${p.numero}</h2>
                        <span class="pedido-data">${esc(p.data)}</span>
                    </div>
                    <span class="selo selo-${p.situacao}">${SITUACOES[p.situacao]}</span>
                </header>
                ${etapas}
                <ul class="pedido-itens">${itens}</ul>
                <p class="pedido-endereco">Entrega em ${esc(p.endereco)}.${previsao}</p>
                <div class="prato-rodape">
                    <div>
                        <span class="total-rotulo">Total</span>
                        <span class="preco">${real(total)}</span>
                    </div>
                    ${botao}
                </div>
            </article>`;
    }

    function mostrar(filtro) {
        const lista = pedidos.filter(p => filtro === "todos" || p.situacao === filtro);

        grade.innerHTML = lista.map(montarCard).join("");
        vazio.hidden = lista.length > 0;
    }

    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesFiltro.forEach(b => b.classList.toggle("ativo", b === botao));
            mostrar(botao.dataset.filtro);
        });
    });

    mostrar("todos");
}


iniciarModal();
iniciarCategorias();
iniciarCadastro();
iniciarFiltroCardapio();
iniciarPedidos();

{
  "usuarios" [
    {
      "id": 1,
      "nome": "Ana Silva",
      "email": "ana.silva@email.com",
      "senha": "****",
      "endereco": "Rua das Flores, 123 - Centro"
    },
    {
      "id": 2,
      "nome": "Carlos Mendes",
      "email": "carlos.mendes@email.com",
      "senha": "****",
      "endereco": "Av. Paulista, 1000, Apto 42 - Bela Vista"
    },
    {
      "id": 3,
      "nome": "Mariana Costa",
      "email": "mariana.costa@email.com",
      "senha": "****",
      "endereco": null
    }
  ],
  "produtos" [
    {
      "id": 1,
      "nome": "X-Bacon Artesanal",
      "preco": 32.90,
      "categoria": "Lanches"
    },
    {
      "id": 2,
      "nome": "Pizza Calabresa Grande",
      "preco": 54.00,
      "categoria": "Pizzas"
    },
    {
      "id": 3,
      "nome": "Refrigerante Lata 350ml",
      "preco": 6.50,
      "categoria": "Bebidas"
    },
    {
      "id": 4,
      "nome": "Petit Gâteau com Sorvete",
      "preco": 22.00,
      "categoria": "Sobremesas"
    }
  ],
  "pedidos" [
    {
      "id": 1,
      "codigo_pedido": "PED-2026001",
      "nome_cliente": "Ana Silva",
      "total": 39.40,
      "status": "Entregue"
    },
    {
      "id": 2,
      "codigo_pedido": "PED-2026002",
      "nome_cliente": "Carlos Mendes",
      "total": 54.00,
      "status": "Em preparo"
    },
    {
      "id": 3,
      "codigo_pedido": "PED-2026003",
      "nome_cliente": "Mariana Costa",
      "total": 61.40,
      "status": "Aguardando pagamento"
    }
  ]
}