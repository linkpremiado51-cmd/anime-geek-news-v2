// global-error-handler.js
(function() {
    // ========================
    // Configurações iniciais
    // ========================
    const padroesErro = [
        /NOT_FOUND gru1::/i,
        /404/i,
        /erro/i
    ];

    const modulos = {}; // módulos registrados
    const errosDetectados = []; // histórico de erros

    // ========================
    // Registro de módulos
    // ========================
    window.registerModule = function(id, nome) {
        modulos[id] = nome || id;
        atualizarPainel();
        console.log(`Módulo registrado: [${id}] ${nome || ''}`);
    };

    // ========================
    // Função para registrar erros
    // ========================
    function registrarErro({texto, elemento=null, modulo=null, arquivo=null}) {
        errosDetectados.push({
            texto,
            elemento,
            modulo: modulo || 'desconhecido',
            arquivo: arquivo || 'desconhecido',
            timestamp: new Date().toLocaleString()
        });
        atualizarPainel();
        console.warn('Erro detectado:', texto, 'Módulo:', modulo, 'Arquivo:', arquivo);
    }

    // ========================
    // Função para verificar elementos do DOM
    // ========================
    function verificarElemento(el) {
        if (!el || !el.innerText) return;

        for (let padrao of padroesErro) {
            if (padrao.test(el.innerText)) {
                // tenta associar a um módulo pelo container ou dataset
                let moduloAssociado = el.closest('[data-modulo]')?.dataset?.modulo
                                     || el.id
                                     || 'desconhecido';
                registrarErro({
                    texto: el.innerText,
                    elemento: el,
                    modulo: moduloAssociado
                });
                break;
            }
        }
    }

    function varrerDOM() {
        const todosElementos = document.body.getElementsByTagName('*');
        for (let el of todosElementos) verificarElemento(el);
    }

    // ========================
    // Observer para DOM
    // ========================
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    verificarElemento(node);
                    node.querySelectorAll('*').forEach(verificarElemento);
                }
            });
        }
    });

    // ========================
    // Captura erros de script
    // ========================
    window.addEventListener('error', (e) => {
        registrarErro({
            texto: e.message || e.error?.message || 'Erro de script desconhecido',
            modulo: e.filename ? e.filename.split('/').pop() : 'desconhecido',
            arquivo: e.filename || 'desconhecido'
        });
    });

    window.addEventListener('unhandledrejection', (e) => {
        registrarErro({
            texto: e.reason?.message || e.reason || 'Promise rejeitada sem tratamento',
            modulo: 'Promise',
            arquivo: 'desconhecido'
        });
    });

    // ========================
    // Painel visual
    // ========================
    const painel = document.createElement('div');
    painel.id = 'painel-global-erros';
    painel.style.position = 'fixed';
    painel.style.bottom = '10px';
    painel.style.right = '10px';
    painel.style.width = '350px';
    painel.style.maxHeight = '450px';
    painel.style.overflowY = 'auto';
    painel.style.backgroundColor = 'rgba(0,0,0,0.9)';
    painel.style.color = '#fff';
    painel.style.fontSize = '12px';
    painel.style.fontFamily = 'monospace';
    painel.style.padding = '10px';
    painel.style.borderRadius = '8px';
    painel.style.zIndex = '999999';
    painel.style.boxShadow = '0 0 12px rgba(0,0,0,0.6)';
    painel.style.display = 'none';
    painel.style.cursor = 'pointer';
    painel.title = 'Clique para alternar visibilidade';
    document.body.appendChild(painel);

    painel.addEventListener('click', () => {
        painel.style.height = painel.style.height === 'auto' ? '450px' : 'auto';
    });

    function atualizarPainel() {
        if (!painel) return;

        let html = '<b>Módulos Registrados:</b><br>';
        for (let id in modulos) {
            html += `- [${id}] ${modulos[id]}<br>`;
        }

        html += '<hr><b>Erros Detectados (últimos 20):</b><br>';
        if (errosDetectados.length === 0) {
            html += 'Nenhum erro detectado';
        } else {
            errosDetectados.slice(-20).forEach(e => {
                html += `<div style="margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:2px;">
                            <b>Modulo:</b> ${e.modulo}<br>
                            <b>Arquivo:</b> ${e.arquivo}<br>
                            <b>Mensagem:</b> ${e.texto.slice(0, 100)}${e.texto.length>100?'...':''}<br>
                            <b>Hora:</b> ${e.timestamp}
                         </div>`;
            });
        }

        painel.innerHTML = html;
        painel.style.display = 'block';
    }

    // ========================
    // Inicialização
    // ========================
    document.addEventListener('DOMContentLoaded', () => {
        varrerDOM();
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('Global Error Handler inteligente iniciado.');
    });

})();
