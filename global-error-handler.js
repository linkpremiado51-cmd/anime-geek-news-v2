// global-error-handler.js
(function() {
    // ========================
    // Configurações iniciais
    // ========================
    const padroesErro = [
        /NOT_FOUND gru1::/i, // erro que você mencionou
        /404/i,               // outros erros 404 comuns
        /erro/i               // outros textos genéricos de erro
    ];

    // Armazenamento de módulos registrados {id: 'nome do módulo'}
    const modulos = {};

    // Armazenamento de erros detectados
    let errosDetectados = [];

    // ========================
    // Função para registrar módulos
    // ========================
    window.registerModule = function(id, nome) {
        modulos[id] = nome || id;
        console.log(`Módulo registrado: [${id}] ${nome || ''}`);
    };

    // ========================
    // Função para verificar e esconder elementos de erro
    // ========================
    function verificarElemento(el) {
        if (!el || !el.innerText) return;

        for (let padrao of padroesErro) {
            if (padrao.test(el.innerText)) {
                el.style.display = 'none'; // Esconde o elemento
                console.warn('Erro escondido detectado em elemento:', el);
                errosDetectados.push({
                    texto: el.innerText,
                    elemento: el,
                    timestamp: Date.now()
                });
                break;
            }
        }
    }

    // Varre todos os elementos do body
    function varrerDOM() {
        const todosElementos = document.body.getElementsByTagName('*');
        for (let el of todosElementos) {
            verificarElemento(el);
        }
    }

    // ========================
    // Observer para detectar elementos adicionados depois
    // ========================
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // apenas elementos
                    verificarElemento(node);
                    // também verifica filhos do nó
                    node.querySelectorAll('*').forEach(verificarElemento);
                }
            });
        }
    });

    // ========================
    // Inicialização
    // ========================
    document.addEventListener('DOMContentLoaded', () => {
        varrerDOM(); // primeira varredura
        observer.observe(document.body, { childList: true, subtree: true }); // observa mudanças
        console.log('Global Error Handler iniciado.');
    });

    // Para o observer após 15s para não gastar recursos
    setTimeout(() => observer.disconnect(), 15000);

})();
